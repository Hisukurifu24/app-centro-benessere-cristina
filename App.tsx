import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import Navigation from './src/navigation';
import { requestNotificationPermissions, scheduleCompleannniNotifications } from './src/utils/notifications';

function AppContent() {
  const { clienti, impostazioni } = useApp();

  useEffect(() => {
    // Richiedi permessi notifiche e schedula notifiche compleanni
    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted && clienti.length > 0) {
        await scheduleCompleannniNotifications(clienti);
      }
    };

    setupNotifications();
  }, [clienti]);

  return (
    <>
      <StatusBar style={impostazioni.temaSuro ? 'light' : 'dark'} />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
