import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export const pickImage = async (
	fromCamera: boolean = false
): Promise<string | null> => {
	try {
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
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.7,
			})
			: await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
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
	onImageSelected: (uri: string) => void
) => {
	Alert.alert(
		'Seleziona foto',
		'Scegli da dove prendere la foto',
		[
			{
				text: 'Fotocamera',
				onPress: async () => {
					const uri = await pickImage(true);
					if (uri) onImageSelected(uri);
				},
			},
			{
				text: 'Galleria',
				onPress: async () => {
					const uri = await pickImage(false);
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
