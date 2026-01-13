import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';

const BG = '#050016';
const HEADER_BG = '#0A0A1E';
const CARD_BG = '#0b0620';
const BORDER = 'rgba(123, 92, 255, 0.25)';
const PRIMARY = '#7b5cff';
const MUTED = '#a0a0c0';
const MUTED2 = '#c0b8ff';
const ACCENT = '#00e0ff';
const DANGER = '#ff4fd8';

type ScanResult =
  | { type: 'success'; participant: string; ticketType: string; ticketId: string }
  | { type: 'error'; message: string };

const ScanTicketScreen = () => {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  const eventName = 'Scanner un billet';

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const validateTicket = async (ticketCode: string): Promise<ScanResult> => {
    try {
      // Chercher le ticket par son code dans Firestore
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('code', '==', ticketCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { type: 'error', message: 'Billet introuvable. Vérifiez le code.' };
      }

      const ticketDoc = snapshot.docs[0];
      const ticket = ticketDoc.data();

      if (ticket.checkedIn) {
        const checkedInDate = ticket.checkedInAt?.toDate?.();
        const dateStr = checkedInDate 
          ? checkedInDate.toLocaleDateString('fr-FR') + ' à ' + checkedInDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : 'une date inconnue';
        return { type: 'error', message: `Ce billet a déjà été scanné le ${dateStr}.` };
      }

      // Marquer comme checké
      await updateDoc(doc(db, 'tickets', ticketDoc.id), {
        checkedIn: true,
        checkedInAt: new Date(),
      });

      return {
        type: 'success',
        participant: ticket.participantName || 'Participant',
        ticketType: ticket.ticketType || 'Standard',
        ticketId: ticketDoc.id,
      };
    } catch (error: any) {
      console.error('Ticket validation error:', error);
      return { type: 'error', message: 'Erreur de validation. Réessayez.' };
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    const validationResult = await validateTicket(data);
    setResult(validationResult);
    setLoading(false);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code');
      return;
    }

    setLoading(true);
    const validationResult = await validateTicket(manualCode.trim());
    setResult(validationResult);
    setShowManualInput(false);
    setManualCode('');
    setLoading(false);
  };

  const closeModal = () => {
    setResult(null);
    setScanned(false);
  };

  const scanNext = () => {
    setResult(null);
    setScanned(false);
  };

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
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>{eventName}</Text>

        <View style={{ width: 38 }} />
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {!permission?.granted ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="camera-outline" size={48} color={MUTED} />
            <Text style={{ color: '#ffffff', fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
              Autorisation caméra requise
            </Text>
            <Text style={{ color: MUTED, marginTop: 8, textAlign: 'center' }}>
              Pour scanner les billets, autorisez l'accès à la caméra.
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={{
                marginTop: 20,
                backgroundColor: PRIMARY,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Autoriser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(123, 92, 255, 0.18)',
              position: 'relative',
            }}
          >
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.22)',
                pointerEvents: 'none',
              }}
            />

            <Text
              style={{
                position: 'absolute',
                top: 22,
                left: 18,
                color: MUTED2,
                fontWeight: '600',
              }}
            >
              Placez le QR code dans le cadre
            </Text>

            {loading && (
              <View
                style={{
                  position: 'absolute',
                  top: '40%',
                  alignSelf: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: 20,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Validation...</Text>
              </View>
            )}

            <View
              style={{
                position: 'absolute',
                top: '25%',
                left: '10%',
                right: '10%',
                height: 220,
                borderRadius: 22,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                pointerEvents: 'none',
              }}
            >
              <View style={{ position: 'absolute', top: -1, left: -1, width: 26, height: 26, borderTopWidth: 4, borderLeftWidth: 4, borderColor: 'rgba(255,255,255,0.85)', borderTopLeftRadius: 22 }} />
              <View style={{ position: 'absolute', top: -1, right: -1, width: 26, height: 26, borderTopWidth: 4, borderRightWidth: 4, borderColor: 'rgba(255,255,255,0.85)', borderTopRightRadius: 22 }} />
              <View style={{ position: 'absolute', bottom: -1, left: -1, width: 26, height: 26, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: 22 }} />
              <View style={{ position: 'absolute', bottom: -1, right: -1, width: 26, height: 26, borderBottomWidth: 4, borderRightWidth: 4, borderColor: 'rgba(255,255,255,0.85)', borderBottomRightRadius: 22 }} />
              <View style={{ position: 'absolute', top: '50%', left: 18, right: 18, height: 2, backgroundColor: 'rgba(0, 224, 255, 0.5)' }} />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setShowManualInput(true)}
          style={{ alignSelf: 'center', marginTop: 14, padding: 10 }}
        >
          <Text style={{ color: PRIMARY, fontWeight: '700' }}>Entrer un code manuellement</Text>
        </TouchableOpacity>
      </View>

      {/* Modal saisie manuelle */}
      <Modal visible={showManualInput} transparent animationType="fade" onRequestClose={() => setShowManualInput(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 }}>
          <View style={{ backgroundColor: CARD_BG, borderRadius: 22, padding: 20, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: BORDER }}>
            <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
              Entrer le code du billet
            </Text>
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Ex: ABC123"
              placeholderTextColor={MUTED}
              autoCapitalize="characters"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: BORDER,
                borderRadius: 12,
                padding: 14,
                color: '#ffffff',
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 2,
              }}
            />
            <TouchableOpacity
              onPress={handleManualSubmit}
              disabled={loading}
              style={{
                backgroundColor: PRIMARY,
                paddingVertical: 14,
                borderRadius: 999,
                alignItems: 'center',
                marginTop: 16,
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800' }}>
                {loading ? 'Validation...' : 'Valider'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowManualInput(false)} style={{ alignItems: 'center', padding: 14 }}>
              <Text style={{ color: MUTED2, fontWeight: '700' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!result}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        >
          <View
            style={{
              backgroundColor: CARD_BG,
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              padding: 18,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            {result?.type === 'success' ? (
              <>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: 'rgba(0, 224, 255, 0.14)',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 224, 255, 0.30)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="checkmark" size={28} color={ACCENT} />
                  </View>
                  <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 18 }}>
                    Check-in Réussi
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: BORDER,
                    padding: 14,
                    marginBottom: 14,
                  }}
                >
                  <Text style={{ color: MUTED, fontSize: 12 }}>Participant</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '800', marginTop: 4 }}>
                    {result.participant}
                  </Text>

                  <View style={{ height: 10 }} />

                  <Text style={{ color: MUTED, fontSize: 12 }}>Type de billet</Text>
                  <Text style={{ color: '#ffffff', fontWeight: '800', marginTop: 4 }}>
                    {result.ticketType}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={scanNext}
                  style={{
                    backgroundColor: PRIMARY,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '900' }}>Scanner le suivant</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeModal} style={{ alignItems: 'center', padding: 14 }}>
                  <Text style={{ color: MUTED2, fontWeight: '700' }}>Fermer</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: 'rgba(255, 79, 216, 0.12)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 79, 216, 0.22)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="close" size={26} color={DANGER} />
                  </View>
                  <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 18 }}>
                    Billet invalide
                  </Text>
                </View>

                <Text style={{ color: MUTED, textAlign: 'center', marginBottom: 14 }}>
                  {result?.type === 'error' ? result.message : ''}
                </Text>

                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    backgroundColor: PRIMARY,
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '900' }}>Réessayer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={scanNext}
                  style={{
                    marginTop: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(123, 92, 255, 0.35)',
                    paddingVertical: 14,
                    borderRadius: 999,
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '800' }}>Scanner un autre</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScanTicketScreen;
