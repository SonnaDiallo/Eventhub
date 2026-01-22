import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList, EventData } from '../../navigation/AuthNavigator';

import type { QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { Timestamp, collection, onSnapshot, orderBy, query as fsQuery } from 'firebase/firestore';

import { db } from '../../services/firebase';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'HomeParticipant'>;

const HomeParticipantScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    setLoading(true);
    // Exclure les événements de Paris Open Data (source: 'paris_opendata')
    const q = fsQuery(
      collection(db, 'events'), 
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        const now = new Date();
        const mapped = snap.docs
          .filter((d: QueryDocumentSnapshot) => {
            const data: any = d.data();
            // Filtrer les événements de Paris Open Data
            if (data.source === 'paris_opendata' || 
                data.organizerName?.includes('Ville de Paris - Que faire à Paris')) {
              return false;
            }
            // Filtrer les événements passés
            if (data.startDate) {
              const startDate = data.startDate instanceof Timestamp 
                ? data.startDate.toDate() 
                : new Date(data.startDate);
              if (startDate < now) {
                return false;
              }
            }
            return true;
          })
          .map((d: QueryDocumentSnapshot) => {
          const data: any = d.data();
          const start: Date | undefined = data.startDate instanceof Timestamp ? data.startDate.toDate() : undefined;
          const end: Date | undefined = data.endDate instanceof Timestamp ? data.endDate.toDate() : undefined;

          const pad = (n: number) => String(n).padStart(2, '0');
          const formatDate = (dt?: Date) => {
            if (!dt) return '';
            return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
          };
          const formatTime = (a?: Date, b?: Date) => {
            if (!a) return '';
            const aa = `${pad(a.getHours())}:${pad(a.getMinutes())}`;
            const bb = b ? `${pad(b.getHours())}:${pad(b.getMinutes())}` : '';
            return bb ? `${aa} - ${bb}` : aa;
          };

          const isFree = !!data.isFree;
          const price = typeof data.price === 'number' ? data.price : 0;

          return {
            id: d.id,
            title: data.title || 'Sans titre',
            coverImage:
              data.coverImage ||
              'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
            date: formatDate(start),
            time: formatTime(start, end),
            location: data.location || '',
            address: data.location || '',
            organizer: data.organizerName || 'Organisateur',
            description: data.description || '',
            price,
            isFree,
          } as EventData;
        });
        setEvents(mapped);
        setLoading(false);
      },
      (err: any) => {
        console.error('Firestore events error', err?.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          backgroundColor: theme.header,
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: theme.text, fontWeight: '900', fontSize: 18 }}>Événements</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings' as never)}
              style={{
                padding: 8,
                borderRadius: 20,
              }}
            >
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('MyTickets')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(123, 92, 255, 0.15)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="ticket-outline" size={16} color={theme.primary} />
              <Text style={{ color: theme.primary, fontWeight: '700', marginLeft: 6, fontSize: 13 }}>Mes billets</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{ color: theme.textMuted, marginTop: 6 }}>Trouve et rejoins les meilleurs événements.</Text>

        <View
          style={{
            marginTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.inputBackground,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.border,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un événement..."
            placeholderTextColor={theme.inputPlaceholder}
            style={{ color: theme.text, flex: 1, marginLeft: 10 }}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 22 }}
        renderItem={({ item }) => {
          const priceLabel = item.isFree ? 'Gratuit' : `${item.price.toFixed(2)} €`;
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('EventDetails', { event: item })}
              style={{
                backgroundColor: theme.card,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 14,
                overflow: 'hidden',
              }}
            >
              <Image source={{ uri: item.coverImage }} style={{ width: '100%', height: 160 }} />

              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.text, fontWeight: '900', fontSize: 16, flex: 1, paddingRight: 12 }}>
                    {item.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: `${theme.primary}26`,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: theme.border,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{priceLabel}</Text>
                  </View>
                </View>

                <View style={{ height: 10 }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                  <Text style={{ color: theme.textSecondary }}>{item.date} · {item.time}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Ionicons name="location-outline" size={16} color={theme.primary} />
                  <Text style={{ color: theme.textSecondary }}>{item.location}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Ionicons name="person-outline" size={16} color={theme.primary} />
                  <Text style={{ color: theme.textMuted }}>Organisé par {item.organizer}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: theme.textMuted, marginTop: 16 }}>Chargement des événements...</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 32 }}>
              <Ionicons name="calendar-outline" size={64} color={theme.textMuted} style={{ opacity: 0.3 }} />
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 18, marginTop: 20, textAlign: 'center' }}>
                {searchQuery ? 'Aucun événement trouvé' : 'Aucun événement disponible'}
              </Text>
              <Text style={{ color: theme.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                {searchQuery 
                  ? 'Essayez avec d\'autres mots-clés ou réessayez plus tard.'
                  : 'Pour synchroniser des événements depuis Eventbrite, Ticketmaster ou SeatGeek :\n\n1. Configurez une clé API dans backend/.env\n2. Appelez POST /api/events/sync/external\n3. Les événements apparaîtront automatiquement ici'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default HomeParticipantScreen;
