import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';

// Schermate
import ClientiScreen from '../screens/ClientiScreen';
import AggiungiClienteScreen from '../screens/AggiungiClienteScreen';
import DettaglioClienteScreen from '../screens/DettaglioClienteScreen';
import AggiungiTrattamentoScreen from '../screens/AggiungiTrattamentoScreen';
import DettaglioTrattamentoScreen from '../screens/DettaglioTrattamentoScreen';
import PromozioniScreen from '../screens/PromozioniScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import StatisticheScreen from '../screens/StatisticheScreen';
import ImpostazioniScreen from '../screens/ImpostazioniScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClientiStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="ClientiList" component={ClientiScreen} />
			<Stack.Screen name="AggiungiCliente" component={AggiungiClienteScreen} />
			<Stack.Screen name="DettaglioCliente" component={DettaglioClienteScreen} />
			<Stack.Screen name="AggiungiTrattamento" component={AggiungiTrattamentoScreen} />
			<Stack.Screen name="DettaglioTrattamento" component={DettaglioTrattamentoScreen} />
		</Stack.Navigator>
	);
}

export default function Navigation() {
	const { impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName;

					if (route.name === 'Clienti') {
						iconName = focused ? 'people' : 'people-outline';
					} else if (route.name === 'Promozioni') {
						iconName = focused ? 'pricetag' : 'pricetag-outline';
					} else if (route.name === 'Calendario') {
						iconName = focused ? 'calendar' : 'calendar-outline';
					} else if (route.name === 'Statistiche') {
						iconName = focused ? 'stats-chart' : 'stats-chart-outline';
					} else if (route.name === 'Impostazioni') {
						iconName = focused ? 'settings' : 'settings-outline';
					}

					return <Ionicons name={iconName as any} size={size} color={color} />;
				},
				tabBarActiveTintColor: theme.tabBarActive,
				tabBarInactiveTintColor: theme.tabBarInactive,
				tabBarStyle: {
					backgroundColor: theme.tabBar,
					borderTopColor: theme.border,
					paddingTop: 8,
					paddingBottom: 8,
					height: 70,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
				},
				headerShown: false,
			})}
		>
			<Tab.Screen name="Clienti" component={ClientiStack} />
			<Tab.Screen name="Promozioni" component={PromozioniScreen} />
			<Tab.Screen name="Calendario" component={CalendarioScreen} />
			<Tab.Screen name="Statistiche" component={StatisticheScreen} />
			<Tab.Screen name="Impostazioni" component={ImpostazioniScreen} />
		</Tab.Navigator>
	);
}
