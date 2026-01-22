// mobile/src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import CreateEventScreen from '../screens/Events/CreateEventScreen';
import EventDetailsScreen from '../screens/Events/EventDetailsScreen';
import ParticipantsScreen from '../screens/Events/ParticipantsScreen';
import HomeParticipantScreen from '../screens/Events/HomeParticipantScreen';
import MyTicketsScreen from '../screens/Events/MyTicketsScreen';
import OrganizerDashboardScreen from '../screens/Organizer/OrganizerDashboardScreen';
import ScanTicketScreen from '../screens/Organizer/ScanTicketScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

export type EventData = {
  id: string;
  title: string;
  coverImage: string;
  date: string;
  time: string;
  location: string;
  address: string;
  organizer: string;
  description: string;
  price: number;
  isFree: boolean;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  HomeParticipant: undefined;
  MyTickets: undefined;
  OrganizerDashboard: undefined;
  ScanTicket: undefined;
  CreateEvent: undefined;
  EventDetails: { event?: EventData } | undefined;
  Participants: { eventId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0A1E',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Connexion' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Inscription' }}
      />
      <Stack.Screen
        name="HomeParticipant"
        component={HomeParticipantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyTickets"
        component={MyTicketsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrganizerDashboard"
        component={OrganizerDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScanTicket"
        component={ScanTicketScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
        options={{ title: 'Participants' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;