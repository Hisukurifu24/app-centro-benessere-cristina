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
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RNShare from 'react-native-share';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate } from '../utils/helpers';
import { showMultiImagePickerOptions } from '../utils/imagePicker';
import {
	fileExists,
	getImmaginiPromozione,
	resolveImageUri,
	savePromoImage,
} from '../utils/promoImages';
import DatePicker from '../components/DatePicker';
import { Promozione } from '../types';

const MAX_IMMAGINI = 10;

function PromoGallery({ immagini, theme }: { immagini: string[]; theme: any }) {
	const [width, setWidth] = useState(0);
	const [pagina, setPagina] = useState(0);

	if (immagini.length === 0) return null;

	if (immagini.length === 1) {
		return (
			<Image source={{ uri: resolveImageUri(immagini[0]) }} style={styles.promoFoto} resizeMode="contain" />
		);
	}

	return (
		<View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
			{width > 0 && (
				<FlatList
					data={immagini}
					keyExtractor={(item, index) => `${index}-${item}`}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={e =>
						setPagina(Math.round(e.nativeEvent.contentOffset.x / width))
					}
					renderItem={({ item }) => (
						<Image
							source={{ uri: resolveImageUri(item) }}
							style={[styles.promoFoto, { width }]}
							resizeMode="contain"
						/>
					)}
				/>
			)}
			<View style={styles.galleryDots}>
				{immagini.map((_, index) => (
					<View
						key={index}
						style={[
							styles.galleryDot,
							{ backgroundColor: index === pagina ? theme.primary : theme.border },
						]}
					/>
				))}
			</View>
		</View>
	);
}

export default function PromozioniScreen() {
	const { promozioni, addPromozione, deletePromozione, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const [showModal, setShowModal] = useState(false);
	const [nome, setNome] = useState('');
	const [descrizione, setDescrizione] = useState('');
	const [dataInizio, setDataInizio] = useState(new Date());
	const [dataFine, setDataFine] = useState(new Date());
	const [immagini, setImmagini] = useState<string[]>([]);
	const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);

	const buildMessage = (promozione: Promozione) =>
		`${promozione.nome}

${promozione.descrizione ? `${promozione.descrizione}\n\n` : ''}📅 Valida dal ${formatDate(promozione.dataInizio)} al ${formatDate(promozione.dataFine)}`;

	const condividi = async (promozione: Promozione, urls: string[]) => {
		try {
			await RNShare.open({
				title: promozione.nome,
				message: buildMessage(promozione),
				...(urls.length > 0 ? { urls } : {}),
				failOnCancel: false,
			});
		} catch (error) {
			console.error('Errore condivisione:', error);
			Alert.alert('Errore', 'Impossibile condividere la promozione');
		}
	};

	const handleShare = async (promozione: Promozione) => {
		const uris = getImmaginiPromozione(promozione).map(resolveImageUri);
		const esistenze = await Promise.all(uris.map(fileExists));
		const disponibili = uris.filter((_, index) => esistenze[index]);
		const mancanti = uris.length - disponibili.length;

		if (mancanti > 0) {
			Alert.alert(
				'Foto non disponibili',
				mancanti === uris.length
					? 'Le foto di questa promozione non sono più presenti sul dispositivo. Vuoi condividere solo il testo?'
					: `${mancanti} foto non sono più presenti sul dispositivo. Vuoi condividere le altre?`,
				[
					{ text: 'Annulla', style: 'cancel' },
					{ text: 'Condividi', onPress: () => condividi(promozione, disponibili) },
				]
			);
			return;
		}

		await condividi(promozione, disponibili);
	};

	const resetForm = () => {
		setNome('');
		setDescrizione('');
		setDataInizio(new Date());
		setDataFine(new Date());
		setImmagini([]);
	};

	const handleAggiungiFoto = () => {
		const rimanenti = MAX_IMMAGINI - immagini.length;
		if (rimanenti <= 0) {
			Alert.alert('Limite raggiunto', `Puoi aggiungere al massimo ${MAX_IMMAGINI} foto`);
			return;
		}
		showMultiImagePickerOptions(
			uris => setImmagini(prev => [...prev, ...uris].slice(0, MAX_IMMAGINI)),
			rimanenti
		);
	};

	const handleRimuoviFoto = (index: number) => {
		setImmagini(prev => prev.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		if (!nome.trim()) {
			Alert.alert('Errore', 'Compila tutti i campi obbligatori');
			return;
		}
		if (salvataggioInCorso) return;

		setSalvataggioInCorso(true);
		try {
			// Copia le foto in una cartella permanente dell'app
			const immaginiSalvate = await Promise.all(immagini.map(savePromoImage));

			await addPromozione({
				nome: nome.trim(),
				descrizione: descrizione.trim(),
				immagini: immaginiSalvate,
				dataInizio: dataInizio.toISOString(),
				dataFine: dataFine.toISOString(),
			});

			resetForm();

			// Chiudi il modal prima di mostrare l'alert
			setShowModal(false);

			setTimeout(() => {
				Alert.alert('Successo', 'Promozione aggiunta');
			}, 300);
		} catch (error) {
			console.error('Errore durante l\'aggiunta della promozione:', error);
			Alert.alert('Errore', 'Impossibile aggiungere la promozione');
		} finally {
			setSalvataggioInCorso(false);
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

	const renderPromozione = ({ item }: { item: Promozione }) => {
		const now = new Date();
		const endDate = new Date(item.dataFine);
		const isExpired = endDate < now;

		return (
			<View style={[styles.promoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
				<PromoGallery immagini={getImmaginiPromozione(item)} theme={theme} />

				<View style={styles.promoContent}>
					<Text style={[styles.promoNome, { color: theme.text }]}>{item.nome}</Text>

					{item.descrizione ? (
						<Text style={[styles.promoDescrizione, { color: theme.textSecondary }]}>
							{item.descrizione}
						</Text>
					) : null}

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
							<TouchableOpacity onPress={() => setShowModal(false)} disabled={salvataggioInCorso}>
								<Ionicons name="close" size={28} color={theme.text} />
							</TouchableOpacity>
							<Text style={[styles.modalTitle, { color: theme.text }]}>Nuova Promozione</Text>
							{salvataggioInCorso ? (
								<ActivityIndicator color={theme.primary} />
							) : (
								<TouchableOpacity onPress={handleSave}>
									<Text style={[styles.saveButton, { color: theme.primary }]}>Salva</Text>
								</TouchableOpacity>
							)}
						</View>

						<ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
							{immagini.length === 0 ? (
								<TouchableOpacity
									style={[styles.fotoButton, { borderColor: theme.border }]}
									onPress={handleAggiungiFoto}
								>
									<Ionicons name="images" size={40} color={theme.textSecondary} />
									<Text style={[styles.fotoButtonText, { color: theme.textSecondary }]}>
										Aggiungi foto (max {MAX_IMMAGINI})
									</Text>
								</TouchableOpacity>
							) : (
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									style={styles.thumbList}
									contentContainerStyle={styles.thumbListContent}
								>
									{immagini.map((uri, index) => (
										<View key={`${index}-${uri}`} style={[styles.thumb, { borderColor: theme.border }]}>
											<Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
											<TouchableOpacity
												style={styles.thumbRemove}
												onPress={() => handleRimuoviFoto(index)}
												hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
											>
												<Ionicons name="close-circle" size={24} color="#FFF" />
											</TouchableOpacity>
										</View>
									))}
									{immagini.length < MAX_IMMAGINI && (
										<TouchableOpacity
											style={[styles.thumb, styles.thumbAdd, { borderColor: theme.border }]}
											onPress={handleAggiungiFoto}
										>
											<Ionicons name="add" size={32} color={theme.textSecondary} />
											<Text style={[styles.thumbAddText, { color: theme.textSecondary }]}>
												{immagini.length}/{MAX_IMMAGINI}
											</Text>
										</TouchableOpacity>
									)}
								</ScrollView>
							)}

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
	galleryDots: {
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 8,
		gap: 6,
	},
	galleryDot: {
		width: 7,
		height: 7,
		borderRadius: 4,
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
	fotoButtonText: {
		marginTop: 8,
		fontSize: 14,
	},
	thumbList: {
		marginBottom: 16,
		marginHorizontal: -20,
	},
	thumbListContent: {
		paddingHorizontal: 20,
		gap: 10,
	},
	thumb: {
		width: 120,
		height: 120,
		borderRadius: 12,
		borderWidth: 1,
		overflow: 'hidden',
	},
	thumbImage: {
		width: '100%',
		height: '100%',
	},
	thumbRemove: {
		position: 'absolute',
		top: 4,
		right: 4,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		borderRadius: 12,
	},
	thumbAdd: {
		borderWidth: 2,
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
	},
	thumbAddText: {
		fontSize: 12,
		marginTop: 2,
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
