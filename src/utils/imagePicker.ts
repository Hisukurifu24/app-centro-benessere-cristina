import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

type PickImageOptions = {
	preserveOriginalAspectRatio?: boolean;
};

export const pickImage = async (
	fromCamera: boolean = false,
	options: PickImageOptions = {}
): Promise<string | null> => {
	try {
		const { preserveOriginalAspectRatio = false } = options;

		// Richiedi permessi
		if (fromCamera) {
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permesso negato', 'È necessario il permesso per accedere alla fotocamera');
				return null;
			}
		} else {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permesso negato', 'È necessario il permesso per accedere alla galleria');
				return null;
			}
		}

		// Apri fotocamera o galleria
		const result = fromCamera
			? await ImagePicker.launchCameraAsync({
				mediaTypes: ['images'],
				allowsEditing: !preserveOriginalAspectRatio,
				...(preserveOriginalAspectRatio ? {} : { aspect: [1, 1] }),
				quality: 0.7,
			})
			: await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: !preserveOriginalAspectRatio,
				...(preserveOriginalAspectRatio ? {} : { aspect: [1, 1] }),
				quality: 0.7,
			});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			return result.assets[0].uri;
		}

		return null;
	} catch (error) {
		console.error('Errore selezione immagine:', error);
		Alert.alert('Errore', 'Impossibile selezionare l\'immagine');
		return null;
	}
};

export const showImagePickerOptions = (
	onImageSelected: (uri: string) => void,
	options: PickImageOptions = {}
) => {
	Alert.alert(
		'Seleziona foto',
		'Scegli da dove prendere la foto',
		[
			{
				text: 'Fotocamera',
				onPress: async () => {
					const uri = await pickImage(true, options);
					if (uri) onImageSelected(uri);
				},
			},
			{
				text: 'Galleria',
				onPress: async () => {
					const uri = await pickImage(false, options);
					if (uri) onImageSelected(uri);
				},
			},
			{
				text: 'Annulla',
				style: 'cancel',
			},
		]
	);
};

const requestPermission = async (fromCamera: boolean) => {
	const { status } = fromCamera
		? await ImagePicker.requestCameraPermissionsAsync()
		: await ImagePicker.requestMediaLibraryPermissionsAsync();
	if (status !== 'granted') {
		Alert.alert(
			'Permesso negato',
			fromCamera
				? 'È necessario il permesso per accedere alla fotocamera'
				: 'È necessario il permesso per accedere alla galleria'
		);
		return false;
	}
	return true;
};

/**
 * Seleziona una o più immagini mantenendo le proporzioni originali.
 * Dalla galleria permette la selezione multipla (fino a selectionLimit).
 */
export const pickImages = async (fromCamera: boolean, selectionLimit: number): Promise<string[]> => {
	try {
		if (!(await requestPermission(fromCamera))) return [];

		const result = fromCamera
			? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
			: await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.7,
				allowsMultipleSelection: true,
				orderedSelection: true,
				selectionLimit,
			});

		if (result.canceled || !result.assets) return [];
		return result.assets.map(asset => asset.uri);
	} catch (error) {
		console.error('Errore selezione immagini:', error);
		Alert.alert('Errore', 'Impossibile selezionare le immagini');
		return [];
	}
};

export const showMultiImagePickerOptions = (
	onImagesSelected: (uris: string[]) => void,
	selectionLimit: number
) => {
	const handle = async (fromCamera: boolean) => {
		const uris = await pickImages(fromCamera, selectionLimit);
		if (uris.length > 0) onImagesSelected(uris);
	};

	Alert.alert('Aggiungi foto', 'Scegli da dove prendere le foto', [
		{ text: 'Fotocamera', onPress: () => handle(true) },
		{ text: 'Galleria', onPress: () => handle(false) },
		{ text: 'Annulla', style: 'cancel' },
	]);
};
