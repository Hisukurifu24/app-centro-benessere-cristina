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
