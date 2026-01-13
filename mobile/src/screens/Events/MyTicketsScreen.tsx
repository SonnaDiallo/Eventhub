import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { auth, db } from '../../services/firebase';

const BG = '#050016';
const HEADER_BG = '#0A0A1E';
const CARD_BG = '#0b0620';
const BORDER = 'rgba(123, 92, 255, 0.25)';
const PRIMARY = '#7b5cff';
const MUTED = '#a0a0c0';
const MUTED2 = '#c0b8ff';
const ACCENT = '#00e0ff';

interface Ticket {
  id: string;
  code: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
}

const MyTicketsScreen = () => {
  const navigation = useNavigation<any>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ticketsRef = collection(db, 'tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            code: data.code,
            eventId: data.eventId,
            eventTitle: data.eventTitle,
            eventDate: data.eventDate,
            eventTime: data.eventTime,
            eventLocation: data.eventLocation,
            ticketType: data.ticketType,
            checkedIn: data.checkedIn || false,
            checkedInAt: data.checkedInAt?.toDate?.() || null,
          } as Ticket;
        });
        setTickets(ticketsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      onPress={() => setSelectedTicket(item)}
      style={{
        backgroundColor: CARD_BG,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 14,
        overflow: 'hidden',
      }}
    >
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16, marginBottom: 8 }}>
              {item.eventTitle}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="calendar-outline" size={14} color={PRIMARY} />
              <Text style={{ color: MUTED2, marginLeft: 8, fontSize: 13 }}>{item.eventDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="time-outline" size={14} color={PRIMARY} />
              <Text style={{ color: MUTED2, marginLeft: 8, fontSize: 13 }}>{item.eventTime}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={14} color={PRIMARY} />
              <Text style={{ color: MUTED2, marginLeft: 8, fontSize: 13 }}>{item.eventLocation}</Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <View style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 8 }}>
              <QRCode value={item.code} size={50} />
            </View>
            <Text style={{ color: MUTED, fontSize: 10, marginTop: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
              {item.code}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: BORDER,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: item.checkedIn ? 'rgba(0, 224, 255, 0.15)' : 'rgba(123, 92, 255, 0.15)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: item.checkedIn ? ACCENT : PRIMARY, fontSize: 11, fontWeight: '700' }}>
                {item.checkedIn ? 'Utilisé ✓' : item.ticketType}
              </Text>
            </View>
          </View>
          <Text style={{ color: PRIMARY, fontWeight: '600', fontSize: 13 }}>Voir le billet →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 18 }}>Mes billets</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : tickets.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Ionicons name="ticket-outline" size={64} color={MUTED} />
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
            Aucun billet
          </Text>
          <Text style={{ color: MUTED, textAlign: 'center', marginTop: 8 }}>
            Inscris-toi à un événement pour obtenir ton premier billet !
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeParticipant')}
            style={{
              marginTop: 20,
              backgroundColor: PRIMARY,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '700' }}>Voir les événements</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal détail du billet */}
      <Modal
        visible={!!selectedTicket}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }}>
          <View
            style={{
              backgroundColor: CARD_BG,
              borderRadius: 26,
              padding: 24,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedTicket(null)}
              style={{ position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 }}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
              {selectedTicket?.eventTitle}
            </Text>

            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 16 }}>
                <QRCode value={selectedTicket?.code || ''} size={160} />
              </View>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 24,
                  fontWeight: '900',
                  marginTop: 16,
                  letterSpacing: 4,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                }}
              >
                {selectedTicket?.code}
              </Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
                Présente ce QR code à l'entrée
              </Text>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="calendar-outline" size={16} color={PRIMARY} />
                <Text style={{ color: MUTED2, marginLeft: 10 }}>{selectedTicket?.eventDate}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="time-outline" size={16} color={PRIMARY} />
                <Text style={{ color: MUTED2, marginLeft: 10 }}>{selectedTicket?.eventTime}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={16} color={PRIMARY} />
                <Text style={{ color: MUTED2, marginLeft: 10 }}>{selectedTicket?.eventLocation}</Text>
              </View>
            </View>

            {selectedTicket?.checkedIn && (
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: 'rgba(0, 224, 255, 0.15)',
                  padding: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: ACCENT, fontWeight: '700' }}>
                  ✓ Billet déjà utilisé
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setSelectedTicket(null)}
              style={{
                marginTop: 20,
                backgroundColor: PRIMARY,
                paddingVertical: 14,
                borderRadius: 999,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyTicketsScreen;
