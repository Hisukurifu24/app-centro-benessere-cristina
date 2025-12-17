import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Alert,
	Modal,
	FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';

export default function AggiungiTrattamentoScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const { clienteId } = route.params as { clienteId: string };
	const { addTrattamento, clienti, tipiTrattamento, addTipoTrattamento, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const cliente = clienti.find(c => c.id === clienteId);

	const [nome, setNome] = useState('');
	const [descrizione, setDescrizione] = useState('');
	const [data, setData] = useState(new Date());
	const [fotoPrima, setFotoPrima] = useState<string | undefined>();
	const [fotoDopo, setFotoDopo] = useState<string | undefined>();
	const [showTipiModal, setShowTipiModal] = useState(false);
	const [showAddTipoModal, setShowAddTipoModal] = useState(false);
	const [nuovoTipoNome, setNuovoTipoNome] = useState('');
	const [nuovoTipoDescrizione, setNuovoTipoDescrizione] = useState('');

	const handleSave = async () => {
		if (!nome.trim()) {
			Alert.alert('Errore', 'Il nome del trattamento è obbligatorio');
			return;
		}


		try {
			await addTrattamento({
				nome: nome.trim(),
				descrizione: descrizione.trim(),
				data: data.toISOString(),
				clienteId,
				clienteNome: cliente?.nome || '',
				fotoPrima,
				fotoDopo,
			});

			Alert.alert('Successo', 'Trattamento aggiunto', [
				{ text: 'OK', onPress: () => navigation.goBack() },
			]);
		} catch (error) {
			Alert.alert('Errore', 'Impossibile aggiungere il trattamento');
		}
	};

	const handleAddTipoTrattamento = async () => {
		if (!nuovoTipoNome.trim()) {
			Alert.alert('Errore', 'Il nome del tipo di trattamento è obbligatorio');
			return;
		}

		try {
			await addTipoTrattamento({
				nome: nuovoTipoNome.trim(),
				descrizioneDefault: nuovoTipoDescrizione.trim(),
			});

			setNuovoTipoNome('');
			setNuovoTipoDescrizione('');
			setShowAddTipoModal(false);
			Alert.alert('Successo', 'Tipo di trattamento aggiunto');
		} catch (error) {
			Alert.alert('Errore', 'Impossibile aggiungere il tipo di trattamento');
		}
	}; const selectTipoTrattamento = (tipo: any) => {
		setNome(tipo.nome);
		setDescrizione(tipo.descrizioneDefault);
		setShowTipiModal(false);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color={theme.text} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.text }]}>Nuovo Trattamento</Text>
				<TouchableOpacity onPress={handleSave}>
					<Text style={[styles.saveButton, { color: theme.primary }]}>Salva</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
				<View style={[styles.clienteInfo, { backgroundColor: theme.card }]}>
					<Text style={[styles.label, { color: theme.textSecondary }]}>Cliente</Text>
					<Text style={[styles.clienteNome, { color: theme.text }]}>{cliente?.nome}</Text>
				</View>

				<TouchableOpacity
					style={[styles.selectTipoButton, { backgroundColor: nome ? theme.success : theme.primary }]}
					onPress={() => setShowTipiModal(true)}
				>
					<Ionicons name={nome ? "checkmark-circle" : "list"} size={20} color="#FFF" />
					<Text style={styles.selectTipoText}>
						{nome ? `Tipo: ${nome}` : 'Seleziona da tipi trattamento'}
					</Text>
				</TouchableOpacity>

				<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
					<Text style={[styles.label, { color: theme.textSecondary }]}>Descrizione</Text>
					<TextInput
						style={[styles.textArea, { color: theme.text }]}
						placeholder="Descrizione del trattamento..."
						placeholderTextColor={theme.textSecondary}
						value={descrizione}
						onChangeText={setDescrizione}
						multiline
						numberOfLines={4}
						textAlignVertical="top"
					/>
				</View>

				<DatePicker
					label="Data"
					value={data}
					onChange={setData}
					theme={theme}
					maximumDate={new Date()}
					required
				/>

				<View style={[styles.fotoSection, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Foto Prima</Text>
					<TouchableOpacity
						style={[styles.fotoButton, { borderColor: theme.border }]}
						onPress={() => showImagePickerOptions(setFotoPrima)}
					>
						{fotoPrima ? (
							<Text style={[styles.fotoSelectedText, { color: theme.success }]}>
								✓ Foto selezionata
							</Text>
						) : (
							<>
								<Ionicons name="camera" size={32} color={theme.textSecondary} />
								<Text style={[styles.fotoButtonText, { color: theme.textSecondary }]}>
									Aggiungi foto prima
								</Text>
							</>
						)}
					</TouchableOpacity>
				</View>

				<View style={[styles.fotoSection, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Foto Dopo</Text>
					<TouchableOpacity
						style={[styles.fotoButton, { borderColor: theme.border }]}
						onPress={() => showImagePickerOptions(setFotoDopo)}
					>
						{fotoDopo ? (
							<Text style={[styles.fotoSelectedText, { color: theme.success }]}>
								✓ Foto selezionata
							</Text>
						) : (
							<>
								<Ionicons name="camera" size={32} color={theme.textSecondary} />
								<Text style={[styles.fotoButtonText, { color: theme.textSecondary }]}>
									Aggiungi foto dopo
								</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Modal Selezione Tipo Trattamento */}
			<Modal
				visible={showTipiModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowTipiModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: theme.card }]}>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: theme.text }]}>Tipi di Trattamento</Text>
							<TouchableOpacity onPress={() => setShowTipiModal(false)}>
								<Ionicons name="close" size={28} color={theme.text} />
							</TouchableOpacity>
						</View>

						<FlatList
							data={tipiTrattamento}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={[styles.tipoItem, { borderBottomColor: theme.border }]}
									onPress={() => selectTipoTrattamento(item)}
								>
									<Text style={[styles.tipoNome, { color: theme.text }]}>{item.nome}</Text>
									{item.descrizioneDefault && (
										<Text style={[styles.tipoDescrizione, { color: theme.textSecondary }]}>
											{item.descrizioneDefault}
										</Text>
									)}
								</TouchableOpacity>
							)}
							keyExtractor={item => item.id}
							ListEmptyComponent={
								<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
									Nessun tipo di trattamento disponibile
								</Text>
							}
						/>

						<TouchableOpacity
							style={[styles.addTipoModalButton, { backgroundColor: theme.primary }]}
							onPress={() => {
								setShowTipiModal(false);
								setShowAddTipoModal(true);
							}}
						>
							<Ionicons name="add" size={20} color="#FFF" />
							<Text style={styles.addTipoModalButtonText}>Aggiungi nuovo tipo</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Modal Aggiungi Tipo Trattamento */}
			<Modal
				visible={showAddTipoModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowAddTipoModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={[styles.modalContent, { backgroundColor: theme.card }]}>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: theme.text }]}>Nuovo Tipo</Text>
							<TouchableOpacity onPress={() => setShowAddTipoModal(false)}>
								<Ionicons name="close" size={28} color={theme.text} />
							</TouchableOpacity>
						</View>

						<View style={styles.modalBody}>
							<TextInput
								style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
								placeholder="Nome tipo trattamento *"
								placeholderTextColor={theme.textSecondary}
								value={nuovoTipoNome}
								onChangeText={setNuovoTipoNome}
							/>
							<TextInput
								style={[styles.modalTextArea, { color: theme.text, borderColor: theme.border }]}
								placeholder="Descrizione predefinita"
								placeholderTextColor={theme.textSecondary}
								value={nuovoTipoDescrizione}
								onChangeText={setNuovoTipoDescrizione}
								multiline
								numberOfLines={4}
								textAlignVertical="top"
							/>
							<TouchableOpacity
								style={[styles.modalSaveButton, { backgroundColor: theme.primary }]}
								onPress={handleAddTipoTrattamento}
							>
								<Text style={styles.modalSaveButtonText}>Salva</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	clienteInfo: {
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 4,
	},
	clienteNome: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	selectTipoButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 14,
		borderRadius: 12,
		marginBottom: 16,
	},
	selectTipoText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	inputContainer: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	input: {
		fontSize: 16,
	},
	textArea: {
		fontSize: 16,
		minHeight: 100,
	},
	fotoSection: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	fotoButton: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 12,
		padding: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fotoButtonText: {
		marginTop: 8,
		fontSize: 14,
	},
	fotoSelectedText: {
		fontSize: 16,
		fontWeight: '600',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '80%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	tipoItem: {
		padding: 16,
		borderBottomWidth: 1,
	},
	tipoNome: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	tipoDescrizione: {
		fontSize: 14,
	},
	emptyText: {
		textAlign: 'center',
		padding: 32,
		fontSize: 16,
	},
	addTipoModalButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		margin: 16,
		padding: 14,
		borderRadius: 12,
	},
	addTipoModalButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	modalBody: {
		padding: 20,
	},
	modalInput: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 12,
	},
	modalTextArea: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		minHeight: 100,
		marginBottom: 16,
	},
	modalSaveButton: {
		padding: 14,
		borderRadius: 12,
		alignItems: 'center',
	},
	modalSaveButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
});
