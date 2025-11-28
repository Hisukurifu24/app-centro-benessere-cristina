import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';

export default function AggiungiClienteScreen() {
	const navigation = useNavigation();
	const { addCliente, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const [nome, setNome] = useState('');
	const [email, setEmail] = useState('');
	const [telefono, setTelefono] = useState('');
	const [dataNascita, setDataNascita] = useState(new Date());
	const [indirizzo, setIndirizzo] = useState('');
	const [foto, setFoto] = useState<string | undefined>();

	const handleSave = async () => {
		if (!nome.trim()) {
			Alert.alert('Errore', 'Il nome è obbligatorio');
			return;
		}
		if (!telefono.trim()) {
			Alert.alert('Errore', 'Il telefono è obbligatorio');
			return;
		}


		try {
			await addCliente({
				nome: nome.trim(),
				email: email.trim(),
				telefono: telefono.trim(),
				dataNascita: dataNascita.toISOString(),
				indirizzo: indirizzo.trim(),
				foto,
				autocura: '',
			});

			Alert.alert('Successo', 'Cliente aggiunto con successo', [
				{ text: 'OK', onPress: () => navigation.goBack() },
			]);
		} catch (error) {
			Alert.alert('Errore', 'Impossibile aggiungere il cliente');
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={[styles.container, { backgroundColor: theme.background }]}>
					<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
						<TouchableOpacity onPress={() => navigation.goBack()}>
							<Ionicons name="arrow-back" size={28} color={theme.text} />
						</TouchableOpacity>
						<Text style={[styles.title, { color: theme.text }]}>Nuovo Cliente</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text style={[styles.saveButton, { color: theme.primary }]}>Salva</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
						<TouchableOpacity
							style={styles.fotoContainer}
							onPress={() => showImagePickerOptions(setFoto)}
						>
							{foto ? (
								<Image source={{ uri: foto }} style={styles.foto} />
							) : (
								<View style={[styles.fotoPlaceholder, { backgroundColor: theme.secondary }]}>
									<Ionicons name="camera" size={40} color={theme.text} />
									<Text style={[styles.fotoText, { color: theme.text }]}>Aggiungi foto</Text>
								</View>
							)}
						</TouchableOpacity>

						<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Nome *</Text>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Nome completo"
								placeholderTextColor={theme.textSecondary}
								value={nome}
								onChangeText={setNome}
							/>
						</View>

						<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="email@esempio.com"
								placeholderTextColor={theme.textSecondary}
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>

						<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Telefono *</Text>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="+39 123 456 7890"
								placeholderTextColor={theme.textSecondary}
								value={telefono}
								onChangeText={setTelefono}
								keyboardType="phone-pad"
							/>
						</View>

						<DatePicker
							label="Data di nascita"
							value={dataNascita}
							onChange={setDataNascita}
							theme={theme}
							maximumDate={new Date()}
							required
						/>

						<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
							<Text style={[styles.label, { color: theme.textSecondary }]}>Indirizzo</Text>
							<TextInput
								style={[styles.input, { color: theme.text }]}
								placeholder="Via, città, CAP"
								placeholderTextColor={theme.textSecondary}
								value={indirizzo}
								onChangeText={setIndirizzo}
							/>
						</View>

						<Text style={[styles.note, { color: theme.textSecondary }]}>* Campi obbligatori</Text>
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	saveButton: {
		fontSize: 18,
		fontWeight: '600',
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 20,
	},
	fotoContainer: {
		alignItems: 'center',
		marginBottom: 24,
	},
	foto: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	fotoPlaceholder: {
		width: 120,
		height: 120,
		borderRadius: 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	fotoText: {
		marginTop: 8,
		fontSize: 14,
	},
	inputContainer: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
	},
	input: {
		fontSize: 16,
	},
	note: {
		fontSize: 12,
		textAlign: 'center',
		marginTop: 8,
	},
});
