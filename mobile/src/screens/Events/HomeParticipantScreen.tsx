import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AuthStackParamList, EventData } from '../../navigation/AuthNavigator';

import type { QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { Timestamp, collection, onSnapshot, orderBy, query as fsQuery } from 'firebase/firestore';

import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<AuthStackParamList, 'HomeParticipant'>;

const BG = '#050016';
const HEADER_BG = '#0A0A1E';
const CARD_BG = '#0b0620';
const BORDER = 'rgba(123, 92, 255, 0.25)';
const PRIMARY = '#7b5cff';
const MUTED = '#a0a0c0';
const MUTED2 = '#c0b8ff';

const HomeParticipantScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const q = fsQuery(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot) => {
        const mapped = snap.docs.map((d: QueryDocumentSnapshot) => {
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
      },
      (err: any) => {
        console.error('Firestore events error', err?.message);
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
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View
        style={{
          backgroundColor: HEADER_BG,
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(123, 92, 255, 0.15)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 18 }}>Événements</Text>
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
              borderColor: BORDER,
            }}
          >
            <Ionicons name="ticket-outline" size={16} color={PRIMARY} />
            <Text style={{ color: PRIMARY, fontWeight: '700', marginLeft: 6, fontSize: 13 }}>Mes billets</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: MUTED, marginTop: 6 }}>Trouve et rejoins les meilleurs événements.</Text>

        <View
          style={{
            marginTop: 14,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: BORDER,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={18} color={MUTED2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher un événement..."
            placeholderTextColor="rgba(255, 255, 255, 0.35)"
            style={{ color: '#ffffff', flex: 1, marginLeft: 10 }}
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
                backgroundColor: CARD_BG,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: BORDER,
                marginBottom: 14,
                overflow: 'hidden',
              }}
            >
              <Image source={{ uri: item.coverImage }} style={{ width: '100%', height: 160 }} />

              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 16, flex: 1, paddingRight: 12 }}>
                    {item.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(123, 92, 255, 0.15)',
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: BORDER,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ color: PRIMARY, fontWeight: '800', fontSize: 12 }}>{priceLabel}</Text>
                  </View>
                </View>

                <View style={{ height: 10 }} />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                  <Text style={{ color: MUTED2 }}>{item.date} · {item.time}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Ionicons name="location-outline" size={16} color={PRIMARY} />
                  <Text style={{ color: MUTED2 }}>{item.location}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <Ionicons name="person-outline" size={16} color={PRIMARY} />
                  <Text style={{ color: MUTED }}>Organisé par {item.organizer}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: MUTED }}>Aucun événement trouvé.</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeParticipantScreen;
