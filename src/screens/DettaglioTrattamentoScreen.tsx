import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
	TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate } from '../utils/helpers';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';
import { RootStackParamList } from '../types/navigation';

export default function DettaglioTrattamentoScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute<RouteProp<RootStackParamList, 'DettaglioTrattamento'>>();
	const { trattamentoId } = route.params;
	const { trattamenti, updateTrattamento, deleteTrattamento, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;
	const [isEditing, setIsEditing] = useState(false);
	const [editedNome, setEditedNome] = useState('');
	const [editedDescrizione, setEditedDescrizione] = useState('');
	const [editedData, setEditedData] = useState(new Date());
	const [editedFotoPrima, setEditedFotoPrima] = useState<string | undefined>();
	const [editedFotoDopo, setEditedFotoDopo] = useState<string | undefined>();

	const trattamento = trattamenti.find(t => t.id === trattamentoId);

	useEffect(() => {
		if (!trattamento || isEditing) return;

		setEditedNome(trattamento.nome);
		setEditedDescrizione(trattamento.descrizione || '');
		setEditedData(new Date(trattamento.data));
		setEditedFotoPrima(trattamento.fotoPrima);
		setEditedFotoDopo(trattamento.fotoDopo);
	}, [trattamento, isEditing]);

	if (!trattamento) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.errorText, { color: theme.text }]}>Trattamento non trovato</Text>
			</View>
		);
	}

	const handleStartEditing = () => {
		setEditedNome(trattamento.nome);
		setEditedDescrizione(trattamento.descrizione || '');
		setEditedData(new Date(trattamento.data));
		setEditedFotoPrima(trattamento.fotoPrima);
		setEditedFotoDopo(trattamento.fotoDopo);
		setIsEditing(true);
	};

	const handleSave = async () => {
		const nomePulito = editedNome.trim();

		if (!nomePulito) {
			Alert.alert('Errore', 'Il nome del trattamento è obbligatorio');
			return;
		}

		try {
			await updateTrattamento(trattamentoId, {
				nome: nomePulito,
				descrizione: editedDescrizione.trim(),
				data: editedData.toISOString(),
				fotoPrima: editedFotoPrima,
				fotoDopo: editedFotoDopo,
			});

			setIsEditing(false);
			Alert.alert('Successo', 'Trattamento aggiornato');
		} catch (error) {
			Alert.alert('Errore', 'Impossibile aggiornare il trattamento');
		}
	};

	// Trova tutti i trattamenti dello stesso tipo per lo stesso cliente
	const trattamentiStessoTipo = trattamenti
		.filter(t => t.clienteId === trattamento.clienteId && t.nome === trattamento.nome)
		.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

	// Primo e ultimo trattamento dello stesso tipo
	const primoTrattamento = trattamentiStessoTipo[0];
	const ultimoTrattamento = trattamentiStessoTipo[trattamentiStessoTipo.length - 1];

	const fotoPrimoTrattamento = primoTrattamento?.fotoPrima;
	const fotoUltimoTrattamento = ultimoTrattamento?.fotoDopo;

	const handleDelete = () => {
		Alert.alert(
			'Conferma eliminazione',
			'Vuoi eliminare questo trattamento?',
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Elimina',
					style: 'destructive',
					onPress: async () => {
						await deleteTrattamento(trattamentoId);
						navigation.goBack();
					},
				},
			]
		);
	};

	const renderFotoSection = (
		title: string,
		foto: string | undefined,
		editable: boolean = false,
		onPick?: () => void,
		onRemove?: () => void
	) => {
		return (
			<View style={styles.fotoSection}>
				<Text style={[styles.fotoLabel, { color: theme.textSecondary }]}>{title}</Text>
				<TouchableOpacity
					onPress={() => {
						if (editable && onPick) onPick();
					}}
					disabled={!editable}
				>
					{foto ? (
						<Image source={{ uri: foto }} style={styles.foto} resizeMode="contain" />
					) : (
						<View style={[styles.fotoPlaceholder, { backgroundColor: theme.border }]}>
							<Ionicons name="image-outline" size={32} color={theme.textSecondary} />
							{editable && (
								<Text style={[styles.fotoActionText, { color: theme.textSecondary }]}>Aggiungi foto</Text>
							)}
						</View>
					)}
				</TouchableOpacity>
				{editable && foto && (
					<TouchableOpacity style={styles.removePhotoButton} onPress={onRemove}>
						<Ionicons name="trash-outline" size={14} color={theme.error} />
						<Text style={[styles.removePhotoText, { color: theme.error }]}>Rimuovi foto</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color={theme.text} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.text }]}>Dettagli Trattamento</Text>
				<TouchableOpacity onPress={isEditing ? handleSave : handleStartEditing}>
					<Text style={[styles.editButton, { color: theme.primary }]}>
						{isEditing ? 'Salva' : 'Modifica'}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
				{isEditing && (
					<TouchableOpacity
						style={[styles.cancelButton, { borderColor: theme.border }]}
						onPress={() => setIsEditing(false)}
					>
						<Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Annulla modifiche</Text>
					</TouchableOpacity>
				)}

				<View style={[styles.infoCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.cardTitle, { color: theme.text }]}>Informazioni</Text>

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Nome:</Text>
						{isEditing ? (
							<TextInput
								style={[styles.infoInput, { color: theme.text, borderColor: theme.border }]}
								value={editedNome}
								onChangeText={setEditedNome}
								placeholder="Nome trattamento"
								placeholderTextColor={theme.textSecondary}
							/>
						) : (
							<Text style={[styles.infoValue, { color: theme.text }]}>{trattamento.nome}</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Descrizione:</Text>
						{isEditing ? (
							<TextInput
								style={[styles.infoTextArea, { color: theme.text, borderColor: theme.border }]}
								value={editedDescrizione}
								onChangeText={setEditedDescrizione}
								placeholder="Descrizione del trattamento"
								placeholderTextColor={theme.textSecondary}
								multiline
								numberOfLines={4}
								textAlignVertical="top"
							/>
						) : (
							<Text style={[styles.infoValue, { color: theme.text }]}>
								{trattamento.descrizione || 'N/A'}
							</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Data:</Text>
						{isEditing ? (
							<DatePicker
								label=""
								value={editedData}
								onChange={setEditedData}
								theme={theme}
								maximumDate={new Date()}
							/>
						) : (
							<Text style={[styles.infoValue, { color: theme.text }]}>
								{formatDate(trattamento.data)}
							</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Cliente:</Text>
						<Text style={[styles.infoValue, { color: theme.text }]}>
							{trattamento.clienteNome}
						</Text>
					</View>
				</View>

				<View style={[styles.fotoCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.cardTitle, { color: theme.text }]}>Foto</Text>

					<View style={styles.fotoGrid}>
						{renderFotoSection(
							'Prima',
							isEditing ? editedFotoPrima : trattamento.fotoPrima,
							isEditing,
							() => showImagePickerOptions((uri) => setEditedFotoPrima(uri), { preserveOriginalAspectRatio: true }),
							() => setEditedFotoPrima(undefined)
						)}
						{renderFotoSection(
							'Dopo',
							isEditing ? editedFotoDopo : trattamento.fotoDopo,
							isEditing,
							() => showImagePickerOptions((uri) => setEditedFotoDopo(uri), { preserveOriginalAspectRatio: true }),
							() => setEditedFotoDopo(undefined)
						)}
						{renderFotoSection('Primo Trattamento', fotoPrimoTrattamento)}
						{renderFotoSection('Ultimo Trattamento', fotoUltimoTrattamento)}
					</View>
				</View>

				{!isEditing && (
					<TouchableOpacity
						style={[styles.deleteButton, { backgroundColor: theme.error }]}
						onPress={handleDelete}
					>
						<Ionicons name="trash" size={18} color="#FFF" />
						<Text style={styles.deleteButtonText}>Elimina trattamento</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
} const styles = StyleSheet.create({
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
	editButton: {
		fontSize: 17,
		fontWeight: '600',
	},
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
	},
	cancelButton: {
		alignSelf: 'flex-end',
		borderWidth: 1,
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginBottom: 10,
	},
	cancelButtonText: {
		fontSize: 13,
		fontWeight: '600',
	},
	infoCard: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	fotoCard: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	infoRow: {
		marginBottom: 16,
	},
	infoLabel: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
	},
	infoValue: {
		fontSize: 16,
	},
	infoInput: {
		fontSize: 16,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	infoTextArea: {
		fontSize: 16,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		minHeight: 100,
	},
	fotoGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: -8,
	},
	fotoSection: {
		width: '50%',
		padding: 8,
	},
	fotoLabel: {
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 8,
	},
	foto: {
		width: '100%',
		height: 150,
		borderRadius: 8,
	},
	fotoPlaceholder: {
		width: '100%',
		height: 150,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 6,
	},
	fotoActionText: {
		fontSize: 12,
		fontWeight: '500',
	},
	removePhotoButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		gap: 6,
	},
	removePhotoText: {
		fontSize: 12,
		fontWeight: '600',
	},
	errorText: {
		fontSize: 18,
		textAlign: 'center',
		marginTop: 100,
	},
	deleteButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 14,
		borderRadius: 12,
		gap: 8,
	},
	deleteButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '700',
	},
});
