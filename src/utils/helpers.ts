import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { Cliente, Trattamento, Promozione, TipoTrattamento } from '../types';

export const exportData = async (
	clienti: Cliente[],
	trattamenti: Trattamento[],
	promozioni: Promozione[],
	tipiTrattamento: TipoTrattamento[]
) => {
	try {
		const data = {
			clienti,
			trattamenti,
			promozioni,
			tipiTrattamento,
			exportDate: new Date().toISOString(),
			version: '1.0',
		};

		const jsonString = JSON.stringify(data, null, 2);
		const fileName = `backup_centro_estetico_${new Date().toISOString().split('T')[0]}.json`;
		const fileUri = FileSystem.documentDirectory + fileName;

		await FileSystem.writeAsStringAsync(fileUri, jsonString);

		const canShare = await Sharing.isAvailableAsync();
		if (canShare) {
			await Sharing.shareAsync(fileUri, {
				mimeType: 'application/json',
				dialogTitle: 'Esporta Backup',
				UTI: 'public.json',
			});
		} else {
			Alert.alert(
				'Backup creato',
				`File salvato in: ${fileUri}`,
				[{ text: 'OK' }]
			);
		}

		return true;
	} catch (error) {
		console.error('Errore export dati:', error);
		Alert.alert('Errore', 'Impossibile esportare i dati');
		return false;
	}
};

export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('it-IT', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('it-IT', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const calculateAge = (birthDate: string): number => {
	const today = new Date();
	const birth = new Date(birthDate);
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}

	return age;
};
