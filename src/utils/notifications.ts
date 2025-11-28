import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Cliente } from '../types';

// Configurazione notifiche
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

export const requestNotificationPermissions = async () => {
	if (Platform.OS === 'ios') {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === 'granted';
	}
	return true;
};

export const scheduleCompleannniNotifications = async (clienti: Cliente[]) => {
	// Cancella tutte le notifiche precedenti
	await Notifications.cancelAllScheduledNotificationsAsync();

	const today = new Date();

	for (const cliente of clienti) {
		const birthDate = new Date(cliente.dataNascita);

		// Crea data del compleanno per quest'anno
		const thisYearBirthday = new Date(
			today.getFullYear(),
			birthDate.getMonth(),
			birthDate.getDate(),
			9, // ore 9:00
			0,
			0
		);

		// Se il compleanno è già passato quest'anno, schedula per l'anno prossimo
		if (thisYearBirthday < today) {
			thisYearBirthday.setFullYear(today.getFullYear() + 1);
		}

		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: '🎉 Compleanno!',
					body: `Oggi è il compleanno di ${cliente.nome}!`,
					data: { clienteId: cliente.id, clienteNome: cliente.nome },
					sound: true,
				},
				trigger: {
					date: thisYearBirthday,
					repeats: true,
					type: Notifications.SchedulableTriggerInputTypes.DATE,
				},
			});
		} catch (error) {
			console.error(`Errore schedulazione notifica per ${cliente.nome}:`, error);
		}
	}
};

export const checkCompleanni = (clienti: Cliente[]): Cliente[] => {
	const today = new Date();
	const todayMonth = today.getMonth();
	const todayDay = today.getDate();

	return clienti.filter(cliente => {
		const birthDate = new Date(cliente.dataNascita);
		return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDay;
	});
};

export const getClientiInattivi = (clienti: Cliente[], trattamenti: any[]): Cliente[] => {
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

	return clienti.filter(cliente => {
		const trattamentiCliente = trattamenti.filter(t => t.clienteId === cliente.id);

		if (trattamentiCliente.length === 0) return true;

		const ultimoTrattamento = trattamentiCliente
			.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

		return new Date(ultimoTrattamento.data) < oneMonthAgo;
	});
};
