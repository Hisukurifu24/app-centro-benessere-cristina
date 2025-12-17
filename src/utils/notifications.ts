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

export const scheduleCompleanniNotifications = async (clienti: Cliente[]) => {
	try {
		// Cancella tutte le notifiche precedenti
		await Notifications.cancelAllScheduledNotificationsAsync();

		const today = new Date();
		const maxNotifications = 64; // iOS ha un limite di 64 notifiche locali
		let scheduledCount = 0;

		// Ordina i clienti per data di compleanno più vicina
		const clientiConData = clienti
			.filter(cliente => cliente.dataNascita)
			.map(cliente => {
				const birthDate = new Date(cliente.dataNascita);
				const thisYearBirthday = new Date(
					today.getFullYear(),
					birthDate.getMonth(),
					birthDate.getDate(),
					9, 0, 0
				);

				if (thisYearBirthday < today) {
					thisYearBirthday.setFullYear(today.getFullYear() + 1);
				}

				return { cliente, nextBirthday: thisYearBirthday };
			})
			.sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

		// Schedula solo i primi 64 compleanni più vicini
		for (const { cliente, nextBirthday } of clientiConData) {
			if (scheduledCount >= maxNotifications) {
				console.log(`Limite di ${maxNotifications} notifiche raggiunto`);
				break;
			}

			try {
				const birthDate = new Date(cliente.dataNascita);
				await Notifications.scheduleNotificationAsync({
					content: {
						title: '🎉 Compleanno!',
						body: `Oggi è il compleanno di ${cliente.nome}!`,
						data: { clienteId: cliente.id, clienteNome: cliente.nome },
						sound: true,
					},
					trigger: {
						hour: 9,
						minute: 0,
						day: birthDate.getDate(),
						month: birthDate.getMonth() + 1, // I mesi in trigger Calendar vanno da 1 a 12
						repeats: true,
						type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
					},
				});
				scheduledCount++;
			} catch (error) {
				console.error(`Errore schedulazione notifica per ${cliente.nome}:`, error);
			}
		}

		console.log(`Schedulati ${scheduledCount} compleanni su ${clienti.length} clienti`);
	} catch (error) {
		console.error('Errore schedulazione notifiche compleanni:', error);
	}
};

export const checkCompleanni = (clienti: Cliente[]): Cliente[] => {
	const today = new Date();
	const todayMonth = today.getMonth();
	const todayDay = today.getDate();

	return clienti.filter(cliente => {
		if (!cliente.dataNascita) return false;
		const birthDate = new Date(cliente.dataNascita);
		if (isNaN(birthDate.getTime())) return false;
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
