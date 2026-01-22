import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { firebaseDb } from '../config/firebaseAdmin';
import { fetchEventbriteEvents, fetchTicketmasterEvents, fetchSeatGeekEvents } from '../services/externalEventsService';
import { getImageFromUnsplash, getImageSearchQuery } from '../services/imageService';
import { UnifiedEvent } from '../types/externalEvents';

/**
 * Synchronise les événements depuis les APIs externes (Eventbrite, Ticketmaster, SeatGeek)
 */
export const syncExternalEvents = async (req: Request, res: Response) => {
  try {
    // Vérifier qu'au moins une API est configurée
    const hasEventbrite = !!process.env.EVENTBRITE_API_KEY;
    const hasTicketmaster = !!process.env.TICKETMASTER_API_KEY;
    const hasSeatGeek = !!process.env.SEATGEEK_CLIENT_ID;
    
    if (!hasEventbrite && !hasTicketmaster && !hasSeatGeek) {
      return res.status(400).json({ 
        message: 'Au moins une clé API est requise. Configurez EVENTBRITE_API_KEY, TICKETMASTER_API_KEY ou SEATGEEK_CLIENT_ID dans votre fichier .env',
        error: 'Missing API keys',
        available_apis: {
          eventbrite: 'https://www.eventbrite.com/platform/api-keys/',
          ticketmaster: 'https://developer.ticketmaster.com/',
          seatgeek: 'https://seatgeek.com/account/develop',
        },
      });
    }
    
    const location = req.query.location as string || 'Paris,France';
    const category = req.query.category as string || '';
    const eventType = req.query.type as string || '';
    const preferredApi = req.query.api as string || '';
    
    console.log(`🔍 Recherche d'événements à ${location}...`);
    
    // Récupérer les événements depuis toutes les APIs disponibles (ou celle spécifiée)
    let allEvents: UnifiedEvent[] = [];
    const sources: string[] = [];
    
    if (!preferredApi || preferredApi === 'eventbrite') {
      const eventbriteEvents = await fetchEventbriteEvents(location, category, eventType);
      allEvents.push(...eventbriteEvents);
      if (eventbriteEvents.length > 0) sources.push('eventbrite');
    }
    
    if (!preferredApi || preferredApi === 'ticketmaster') {
      const ticketmasterEvents = await fetchTicketmasterEvents(location, category);
      allEvents.push(...ticketmasterEvents);
      if (ticketmasterEvents.length > 0) sources.push('ticketmaster');
    }
    
    if (!preferredApi || preferredApi === 'seatgeek') {
      const seatgeekEvents = await fetchSeatGeekEvents(location, eventType);
      allEvents.push(...seatgeekEvents);
      if (seatgeekEvents.length > 0) sources.push('seatgeek');
    }

    if (!allEvents.length) {
      return res.status(200).json({ 
        message: 'Aucun événement externe trouvé', 
        imported: 0,
        sources: sources.length > 0 ? sources : 'none',
      });
    }

    // Traiter et sauvegarder les événements
    const batch = firebaseDb.batch();
    let importedCount = 0;
    const now = new Date();
    const eventCounts: { [key: string]: number } = {};

    for (const event of allEvents) {
      // Dates - convertir en Timestamp Firestore
      let startDate: admin.firestore.Timestamp | undefined;
      let endDate: admin.firestore.Timestamp | undefined;
      
      if (event.startDate) {
        const start = new Date(event.startDate);
        // Filtrer seulement les événements futurs
        if (start >= now) {
          startDate = admin.firestore.Timestamp.fromDate(start);
        } else {
          continue; // Ignorer les événements passés
        }
      } else {
        continue; // Pas de date de début = skip
      }
      
      if (event.endDate) {
        endDate = admin.firestore.Timestamp.fromDate(new Date(event.endDate));
      }

      // Image : Priorité 1 = Image de l'API, Priorité 2 = Unsplash API, Priorité 3 = Image par défaut
      let coverImage: string | undefined = event.coverImage;
      
      // Si pas d'image, utiliser Unsplash API
      if (!coverImage) {
        const searchQuery = getImageSearchQuery(event.title);
        const unsplashImage = await getImageFromUnsplash(searchQuery);
        if (unsplashImage) {
          coverImage = unsplashImage;
        }
      }
      
      // Fallback vers une image par défaut
      if (!coverImage) {
        coverImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop';
      }

      // Nettoyer la description
      let description = event.description || '';
      if (description) {
        description = description
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 500);
      }

      // ID stable basé sur l'ID de l'événement et la source
      const externalId = `${event.source}_${event.id}`;
      const docRef = firebaseDb.collection('events').doc(externalId);

      // Construire l'objet
      const eventData: any = {
        title: event.title,
        location: event.location || 'Paris, France',
        description,
        isFree: typeof event.isFree === 'boolean' ? event.isFree : true,
        organizerName: event.venueName || 'Organisateur externe',
        organizerUid: null,
        source: event.source,
        externalRecordId: event.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Ajouter les champs optionnels
      if (coverImage) eventData.coverImage = coverImage;
      if (startDate) eventData.startDate = startDate;
      if (endDate) eventData.endDate = endDate;
      if (event.price !== undefined) eventData.price = event.price;

      batch.set(docRef, eventData, { merge: true });
      importedCount += 1;
      eventCounts[event.source] = (eventCounts[event.source] || 0) + 1;
    }

    await batch.commit();

    return res.status(200).json({
      message: `Événements synchronisés avec succès depuis ${sources.join(', ')}`,
      imported: importedCount,
      sources: sources,
      breakdown: eventCounts,
    });
  } catch (error: any) {
    console.error('Sync external events error:', error?.message || error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      stack: error?.stack?.split('\n').slice(0, 5),
    });
    return res.status(500).json({ 
      message: 'Failed to sync external events',
      error: error?.message || 'Unknown error',
    });
  }
};

/**
 * Route de debug pour vérifier la configuration et les événements
 */
export const debugEvents = async (req: Request, res: Response) => {
  try {
    // Vérifier les clés API configurées
    const hasEventbrite = !!process.env.EVENTBRITE_API_KEY;
    const hasTicketmaster = !!process.env.TICKETMASTER_API_KEY;
    const hasSeatGeek = !!process.env.SEATGEEK_CLIENT_ID;
    
    // Compter les événements dans Firestore
    const eventsSnapshot = await firebaseDb.collection('events').get();
    const totalEvents = eventsSnapshot.size;
    
    // Compter par source
    const eventsBySource: { [key: string]: number } = {};
    eventsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const source = data.source || 'unknown';
      eventsBySource[source] = (eventsBySource[source] || 0) + 1;
    });
    
    // Compter les événements futurs
    const now = new Date();
    let futureEvents = 0;
    eventsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.startDate) {
        const startDate = data.startDate.toDate();
        if (startDate >= now) {
          futureEvents++;
        }
      }
    });
    
    return res.status(200).json({
      apis_configured: {
        eventbrite: hasEventbrite,
        ticketmaster: hasTicketmaster,
        seatgeek: hasSeatGeek,
        total: (hasEventbrite ? 1 : 0) + (hasTicketmaster ? 1 : 0) + (hasSeatGeek ? 1 : 0),
      },
      events_in_database: {
        total: totalEvents,
        by_source: eventsBySource,
        future_events: futureEvents,
      },
      message: hasEventbrite || hasTicketmaster || hasSeatGeek 
        ? 'APIs configurées. Utilisez POST /api/events/sync/external pour synchroniser.'
        : 'Aucune API configurée. Configurez au moins une clé API dans .env',
    });
  } catch (error: any) {
    return res.status(500).json({ 
      message: 'Error checking configuration',
      error: error?.message || 'Unknown error',
    });
  }
};

/**
 * Supprime les anciens événements de Paris Open Data
 */
export const deleteParisOpenDataEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('🗑️ Suppression des événements Paris Open Data...');
    
    // Récupérer tous les événements avec source 'paris_opendata'
    const eventsRef = firebaseDb.collection('events');
    const snapshot = await eventsRef.where('source', '==', 'paris_opendata').get();
    
    if (snapshot.empty) {
      return res.status(200).json({ 
        message: 'Aucun événement Paris Open Data trouvé',
        deleted: 0,
      });
    }

    const batch = firebaseDb.batch();
    let deletedCount = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    await batch.commit();

    console.log(`✅ ${deletedCount} événements Paris Open Data supprimés`);

    return res.status(200).json({
      message: `Événements Paris Open Data supprimés avec succès`,
      deleted: deletedCount,
    });
  } catch (error: any) {
    console.error('Delete Paris Open Data events error:', error?.message || error);
    return res.status(500).json({ 
      message: 'Failed to delete Paris Open Data events',
      error: error?.message || 'Unknown error',
    });
  }
};
