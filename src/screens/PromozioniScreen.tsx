import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Image,
	Alert,
	Modal,
	TextInput,
	ScrollView,
	Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate } from '../utils/helpers';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';

export default function PromozioniScreen() {
	const { promozioni, addPromozione, deletePromozione, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const [showModal, setShowModal] = useState(false);
	const [nome, setNome] = useState('');
	const [descrizione, setDescrizione] = useState('');
	const [dataInizio, setDataInizio] = useState(new Date());
	const [dataFine, setDataFine] = useState(new Date());
	const [foto, setFoto] = useState<string | undefined>();

	const handleShare = async (promozione: any) => {
		try {
			// Crea il messaggio di testo della promozione
			const message = `${promozione.nome}

${promozione.descrizione ? `${promozione.descrizione}\n\n` : ''}📅 Valida dal ${formatDate(promozione.dataInizio)} al ${formatDate(promozione.dataFine)}`;

			// Se c'è una foto, prova a condividerla con il testo
			if (promozione.foto) {
				const canShare = await Sharing.isAvailableAsync();
				if (canShare) {
					await Sharing.shareAsync(promozione.foto, {
						dialogTitle: `Condividi: ${promozione.nome}`,
						mimeType: 'image/*',
						UTI: 'public.image',
					});
				}
			}

			// Condividi sempre anche il testo
			await Share.share({
				message: message,
				title: promozione.nome,
			});
		} catch (error) {
			console.error('Errore condivisione:', error);
			Alert.alert('Errore', 'Impossibile condividere la promozione');
		}
	};

	const handleSave = async () => {
		if (!nome.trim()) {
			Alert.alert('Errore', 'Compila tutti i campi obbligatori');
			return;
		}

		try {
			await addPromozione({
				nome: nome.trim(),
				descrizione: descrizione.trim(),
				foto,
				dataInizio: dataInizio.toISOString(),
				dataFine: dataFine.toISOString(),
			});

			// Reset dei campi dopo il successo del salvataggio
			setNome('');
			setDescrizione('');
			setDataInizio(new Date());
			setDataFine(new Date());
			setFoto(undefined);

			// Chiudi il modal prima di mostrare l'alert
			setShowModal(false);

			// Mostra l'alert dopo aver chiuso il modal
			setTimeout(() => {
				Alert.alert('Successo', 'Promozione aggiunta');
			}, 300);
		} catch (error) {
			console.error('Errore durante l\'aggiunta della promozione:', error);
			Alert.alert('Errore', 'Impossibile aggiungere la promozione');
		}
	};

	const handleDelete = (id: string) => {
		Alert.alert(
			'Conferma eliminazione',
			'Vuoi eliminare questa promozione?',
			[
				{ text: 'Annulla', style: 'cancel' },
				{ text: 'Elimina', style: 'destructive', onPress: () => deletePromozione(id) },
			]
		);
	};

	const renderPromozione = ({ item }: { item: any }) => {
		const now = new Date();
		const endDate = new Date(item.dataFine);
		const isExpired = endDate < now;

		return (
			<View style={[styles.promoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
				{item.foto && (
					<Image source={{ uri: item.foto }} style={styles.promoFoto} resizeMode="contain" />
				)}

				<View style={styles.promoContent}>
					<Text style={[styles.promoNome, { color: theme.text }]}>{item.nome}</Text>

					{item.descrizione && (
						<Text style={[styles.promoDescrizione, { color: theme.textSecondary }]}>
							{item.descrizione}
						</Text>
					)}

					<View style={styles.promoDate}>
						<Ionicons name="calendar" size={16} color={theme.textSecondary} />
						<Text style={[styles.promoDateText, { color: theme.textSecondary }]}>
							{formatDate(item.dataInizio)} - {formatDate(item.dataFine)}
						</Text>
					</View>

					{isExpired && (
						<View style={[styles.expiredBadge, { backgroundColor: theme.error }]}>
							<Text style={styles.expiredText}>Scaduta</Text>
						</View>
					)}

					<View style={styles.promoActions}>
						<TouchableOpacity
							style={[styles.shareButton, { backgroundColor: theme.primary }]}
							onPress={() => handleShare(item)}
						>
							<Ionicons name="share-social" size={20} color="#FFF" />
							<Text style={styles.shareButtonText}>Condividi</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.deleteIconButton}
							onPress={() => handleDelete(item.id)}
						>
							<Ionicons name="trash" size={20} color={theme.error} />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Promozioni</Text>
				<TouchableOpacity
					style={[styles.addButton, { backgroundColor: theme.primary }]}
					onPress={() => setShowModal(true)}
				>
					<Ionicons name="add" size={28} color="#FFF" />
				</TouchableOpacity>
			</View>

			<FlatList
				data={promozioni}
				renderItem={renderPromozione}
				keyExtractor={item => item.id}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons name="pricetag-outline" size={80} color={theme.textSecondary} />
						<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
							Nessuna promozione attiva
						</Text>
					</View>
				}
			/>

			<Modal
				visible={showModal}
				animationType="slide"
				onRequestClose={() => setShowModal(false)}
				presentationStyle="pageSheet"
			>
				<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
					<View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
						<View style={[styles.modalHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
							<TouchableOpacity onPress={() => setShowModal(false)}>
								<Ionicons name="close" size={28} color={theme.text} />
							</TouchableOpacity>
							<Text style={[styles.modalTitle, { color: theme.text }]}>Nuova Promozione</Text>
							<TouchableOpacity onPress={handleSave}>
								<Text style={[styles.saveButton, { color: theme.primary }]}>Salva</Text>
							</TouchableOpacity>
						</View>

						<ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
							<TouchableOpacity
								style={[styles.fotoButton, { borderColor: theme.border }]}
								onPress={() => showImagePickerOptions(setFoto, { preserveOriginalAspectRatio: true })}
							>
								{foto ? (
									<Image source={{ uri: foto }} style={styles.fotoPreview} resizeMode="contain" />
								) : (
									<>
										<Ionicons name="image" size={40} color={theme.textSecondary} />
										<Text style={[styles.fotoButtonText, { color: theme.textSecondary }]}>
											Aggiungi foto
										</Text>
									</>
								)}
							</TouchableOpacity>

							<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
								<Text style={[styles.label, { color: theme.textSecondary }]}>Nome *</Text>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholder="Nome promozione"
									placeholderTextColor={theme.textSecondary}
									value={nome}
									onChangeText={setNome}
								/>
							</View>

							<View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
								<Text style={[styles.label, { color: theme.textSecondary }]}>Descrizione</Text>
								<TextInput
									style={[styles.textArea, { color: theme.text }]}
									placeholder="Descrizione promozione..."
									placeholderTextColor={theme.textSecondary}
									value={descrizione}
									onChangeText={setDescrizione}
									multiline
									numberOfLines={4}
									textAlignVertical="top"
								/>
							</View>

							<DatePicker
								label="Data Inizio"
								value={dataInizio}
								onChange={(date) => {
									setDataInizio(date);
									// Se la data fine è precedente alla nuova data inizio, aggiornala
									if (dataFine < date) {
										setDataFine(date);
									}
								}}
								theme={theme}
								required
							/>

							<DatePicker
								label="Data Fine"
								value={dataFine}
								onChange={setDataFine}
								theme={theme}
								minimumDate={dataInizio}
								required
							/>
						</ScrollView>
					</View>
				</SafeAreaView>
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
		fontSize: 32,
		fontWeight: 'bold',
	},
	addButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContent: {
		padding: 16,
	},
	promoCard: {
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		overflow: 'hidden',
	},
	promoFoto: {
		width: '100%',
		height: 200,
	},
	promoContent: {
		padding: 16,
	},
	promoNome: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	promoDescrizione: {
		fontSize: 16,
		marginBottom: 12,
	},
	promoDate: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	promoDateText: {
		fontSize: 14,
		marginLeft: 6,
	},
	expiredBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		marginBottom: 12,
	},
	expiredText: {
		color: '#FFF',
		fontSize: 12,
		fontWeight: '600',
	},
	promoActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	shareButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderRadius: 8,
		marginRight: 12,
	},
	shareButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 6,
	},
	deleteIconButton: {
		padding: 12,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 100,
	},
	emptyText: {
		fontSize: 18,
		marginTop: 16,
	},
	modalContainer: {
		flex: 1,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	saveButton: {
		fontSize: 18,
		fontWeight: '600',
	},
	modalContent: {
		flex: 1,
	},
	modalContentContainer: {
		padding: 20,
	},
	fotoButton: {
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 12,
		height: 200,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 16,
	},
	fotoPreview: {
		width: '100%',
		height: '100%',
		borderRadius: 12,
	},
	fotoButtonText: {
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
	textArea: {
		fontSize: 16,
		minHeight: 100,
	},
});
