import * as FileSystem from 'expo-file-system/legacy';
import { Promozione } from '../types';

// Le immagini scelte con ImagePicker finiscono nella cache: iOS può svuotarla e il
// percorso assoluto del container cambia ad ogni aggiornamento dell'app.
// Per questo le copiamo in documentDirectory e salviamo solo il percorso relativo.
const PROMO_DIR = 'promozioni/';

const isAbsoluteUri = (value: string) => /^[a-z][a-z0-9+.-]*:/i.test(value);

export const resolveImageUri = (stored: string) =>
	isAbsoluteUri(stored) ? stored : `${FileSystem.documentDirectory}${stored}`;

export const getImmaginiPromozione = (promozione: Pick<Promozione, 'immagini' | 'foto'>): string[] =>
	Array.isArray(promozione.immagini)
		? promozione.immagini
		: promozione.foto
			? [promozione.foto]
			: [];

export const savePromoImage = async (sourceUri: string): Promise<string> => {
	const dir = `${FileSystem.documentDirectory}${PROMO_DIR}`;
	const info = await FileSystem.getInfoAsync(dir);
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
	}

	const extension = sourceUri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
	const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
	const relativePath = `${PROMO_DIR}${fileName}`;
	await FileSystem.copyAsync({ from: sourceUri, to: `${FileSystem.documentDirectory}${relativePath}` });
	return relativePath;
};

export const deletePromoImages = async (stored: string[]) => {
	await Promise.all(
		stored
			.filter(path => !isAbsoluteUri(path))
			.map(path =>
				FileSystem.deleteAsync(resolveImageUri(path), { idempotent: true }).catch(error =>
					console.warn('Impossibile eliminare immagine promozione:', error)
				)
			)
	);
};

export const fileExists = async (uri: string) => {
	try {
		return (await FileSystem.getInfoAsync(uri)).exists;
	} catch {
		return false;
	}
};
