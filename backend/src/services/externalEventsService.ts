import axios from 'axios';
import { UnifiedEvent, EventbriteEvent, EventbriteResponse } from '../types/externalEvents';

/**
 * Récupère les événements depuis Eventbrite API
 */
export async function fetchEventbriteEvents(
  location: string,
  category: string,
  eventType: string
): Promise<UnifiedEvent[]> {
  const eventbriteApiKey = process.env.EVENTBRITE_API_KEY;
  if (!eventbriteApiKey) return [];

  try {
    const eventbriteUrl = 'https://www.eventbriteapi.com/v3/events/search/';
    const params: any = {
      'location.address': location,
      'location.within': '50km',
      'start_date.keyword': 'this_month',
      'expand': 'venue,logo',
      'status': 'live',
      'order_by': 'start_asc',
      'page_size': 50,
    };
    
    if (category) params.categories = category;
    if (eventType) params.q = eventType;
    
    const response = await axios.get<EventbriteResponse>(eventbriteUrl, {
      params,
      headers: { 'Authorization': `Bearer ${eventbriteApiKey}` },
    });
    
    const events = response.data?.events || [];
    console.log(`✅ Eventbrite: ${events.length} événements trouvés`);
    
    return events.map((event): UnifiedEvent => ({
      id: event.id,
      title: event.name?.text || event.name?.html || 'Événement',
      description: event.description?.text || event.description?.html || '',
      startDate: event.start?.local || '',
      endDate: event.end?.local,
      location: event.venue?.address ? 
        `${event.venue.address.address_1 || ''}, ${event.venue.address.city || ''}`.trim() :
        event.venue?.name || 'Paris, France',
      venueName: event.venue?.name,
      coverImage: event.logo?.original?.url || event.logo?.url,
      isFree: event.is_free || false,
      price: event.ticket_availability?.minimum_ticket_price?.value,
      source: 'eventbrite',
    }));
  } catch (error: any) {
    console.warn('❌ Eventbrite API error:', error?.message);
    return [];
  }
}

/**
 * Récupère les événements depuis Ticketmaster API
 */
export async function fetchTicketmasterEvents(
  location: string,
  category: string
): Promise<UnifiedEvent[]> {
  const ticketmasterApiKey = process.env.TICKETMASTER_API_KEY;
  if (!ticketmasterApiKey) return [];

  try {
    const city = location.split(',')[0].trim();
    
    const ticketmasterUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';
    const params: any = {
      apikey: ticketmasterApiKey,
      city: city,
      size: 50,
      sort: 'date,asc',
      classificationName: category || undefined,
    };
    
    const response = await axios.get(ticketmasterUrl, { params });
    const events = response.data?._embedded?.events || [];
    console.log(`✅ Ticketmaster: ${events.length} événements trouvés`);
    
    return events.map((event: any): UnifiedEvent => ({
      id: event.id,
      title: event.name || 'Événement',
      description: event.info || event.description || '',
      startDate: event.dates?.start?.localDate + 'T' + (event.dates?.start?.localTime || '00:00:00'),
      endDate: event.dates?.end?.localDate ? event.dates.end.localDate + 'T' + (event.dates.end.localTime || '23:59:59') : undefined,
      location: event._embedded?.venues?.[0]?.address?.line1 
        ? `${event._embedded.venues[0].address.line1}, ${event._embedded.venues[0].city?.name || ''}`.trim()
        : event._embedded?.venues?.[0]?.name || city,
      venueName: event._embedded?.venues?.[0]?.name,
      coverImage: event.images?.find((img: any) => img.ratio === '16_9' && img.width > 1000)?.url || 
                  event.images?.[0]?.url,
      isFree: event.priceRanges?.[0]?.min === 0 || false,
      price: event.priceRanges?.[0]?.min,
      source: 'ticketmaster',
    }));
  } catch (error: any) {
    console.warn('❌ Ticketmaster API error:', error?.message);
    return [];
  }
}

/**
 * Récupère les événements depuis SeatGeek API
 */
export async function fetchSeatGeekEvents(
  location: string,
  eventType: string
): Promise<UnifiedEvent[]> {
  const seatgeekClientId = process.env.SEATGEEK_CLIENT_ID;
  if (!seatgeekClientId) return [];

  try {
    const city = location.split(',')[0].trim();
    const seatgeekUrl = 'https://api.seatgeek.com/2/events';
    const params: any = {
      client_id: seatgeekClientId,
      'venue.city': city,
      per_page: 50,
      sort: 'datetime_local.asc',
    };
    
    if (eventType) {
      params.q = eventType;
    }
    
    const response = await axios.get(seatgeekUrl, { params });
    const events = response.data?.events || [];
    console.log(`✅ SeatGeek: ${events.length} événements trouvés`);
    
    return events.map((event: any): UnifiedEvent => ({
      id: event.id.toString(),
      title: event.title || 'Événement',
      description: event.description || '',
      startDate: event.datetime_local || '',
      endDate: event.enddatetime_local,
      location: event.venue?.address 
        ? `${event.venue.address}, ${event.venue.city || ''}`.trim()
        : event.venue?.name || city,
      venueName: event.venue?.name,
      coverImage: event.performers?.[0]?.image || event.performers?.[0]?.images?.huge,
      isFree: event.stats?.lowest_price === 0 || false,
      price: event.stats?.lowest_price,
      source: 'seatgeek',
    }));
  } catch (error: any) {
    console.warn('❌ SeatGeek API error:', error?.message);
    return [];
  }
}
