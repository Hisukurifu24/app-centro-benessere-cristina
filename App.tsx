import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import Navigation from './src/navigation';
import { requestNotificationPermissions, scheduleCompleanniNotifications } from './src/utils/notifications';

function AppContent() {
  const { clienti, impostazioni } = useApp();
  const [permissionsGranted, setPermissionsGranted] = React.useState(false);

  // Richiedi permessi notifiche una volta all'avvio
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const granted = await requestNotificationPermissions();
        setPermissionsGranted(granted);
      } catch (error) {
        console.error('Errore richiesta permessi notifiche:', error);
      }
    };

    requestPermissions();
  }, []);

  // Ri-schedula le notifiche ogni volta che la lista clienti cambia
  useEffect(() => {
    const setupNotifications = async () => {
      if (!permissionsGranted || clienti.length === 0) return;

      try {
        await scheduleCompleanniNotifications(clienti);
        console.log('Notifiche compleanni aggiornate');
      } catch (error) {
        console.error('Errore setup notifiche:', error);
      }
    };

    setupNotifications();
  }, [clienti, permissionsGranted]);

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
