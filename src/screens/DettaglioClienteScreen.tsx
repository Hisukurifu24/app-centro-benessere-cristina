import React, { useState, useEffect, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	TextInput,
	Alert,
	FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate, calculateAge } from '../utils/helpers';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';
import { Trattamento, ProdottoAutocura } from '../types';
import { RootStackParamList } from '../types/navigation';

export default function DettaglioClienteScreen() {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const route = useRoute();
	const { clienteId } = route.params as { clienteId: string };
	const { clienti, trattamenti, updateCliente, deleteCliente, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;
	const minimumDataNascita = new Date(1900, 0, 1);

	const cliente = clienti.find(c => c.id === clienteId);
	const trattamentiCliente = trattamenti.filter(t => t.clienteId === clienteId);

	const trattamentoPiuUsato = useMemo(() => {
		if (trattamentiCliente.length === 0) {
			return {
				nomi: [] as string[],
				conteggio: 0,
				hasPariMerito: false,
				hasData: false,
			};
		}

		const conteggiPerNome = trattamentiCliente.reduce((acc, trattamento) => {
			const nomeNormalizzato = trattamento.nome.trim().toLowerCase();
			if (!nomeNormalizzato) {
				return acc;
			}

			if (!acc[nomeNormalizzato]) {
				acc[nomeNormalizzato] = { nomeDisplay: trattamento.nome.trim(), count: 0 };
			}

			acc[nomeNormalizzato].count += 1;
			return acc;
		}, {} as Record<string, { nomeDisplay: string; count: number }>);

		const conteggi = Object.values(conteggiPerNome);
		if (conteggi.length === 0) {
			return {
				nomi: [] as string[],
				conteggio: 0,
				hasPariMerito: false,
				hasData: false,
			};
		}

		const maxConteggio = Math.max(...conteggi.map(item => item.count));
		const nomiPiuUsati = conteggi
			.filter(item => item.count === maxConteggio)
			.map(item => item.nomeDisplay);

		return {
			nomi: nomiPiuUsati,
			conteggio: maxConteggio,
			hasPariMerito: nomiPiuUsati.length > 1,
			hasData: true,
		};
	}, [trattamentiCliente]);

	const [isEditing, setIsEditing] = useState(false);
	const [editedCliente, setEditedCliente] = useState(cliente);

	// Form autocura (aggiunta / modifica prodotto)
	const [showAutocuraForm, setShowAutocuraForm] = useState(false);
	const [prodottoInModificaId, setProdottoInModificaId] = useState<string | null>(null);
	const [nomeProdotto, setNomeProdotto] = useState('');
	const [dataProdotto, setDataProdotto] = useState(new Date());

	useEffect(() => {
		// Se si sta modificando il cliente, non perdere le modifiche in corso:
		// sincronizza solo la lista autocura (salvata subito su storage)
		setEditedCliente(prev =>
			isEditing && prev && cliente
				? { ...prev, prodottiAutocura: cliente.prodottiAutocura }
				: cliente
		);
	}, [cliente]);

	const prodottiAutocura = useMemo(
		() =>
			[...(cliente?.prodottiAutocura ?? [])].sort(
				(a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
			),
		[cliente?.prodottiAutocura]
	);

	if (!cliente) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.errorText, { color: theme.text }]}>Cliente non trovato</Text>
			</View>
		);
	}

	const handleSave = async () => {
		if (!editedCliente) return;

		try {
			await updateCliente(clienteId, editedCliente);
			setIsEditing(false);
			Alert.alert('Successo', 'Cliente aggiornato');
		} catch (error) {
			Alert.alert('Errore', 'Impossibile aggiornare il cliente');
		}
	};

	const resetAutocuraForm = () => {
		setShowAutocuraForm(false);
		setProdottoInModificaId(null);
		setNomeProdotto('');
		setDataProdotto(new Date());
	};

	const apriNuovoProdotto = () => {
		setProdottoInModificaId(null);
		setNomeProdotto('');
		setDataProdotto(new Date());
		setShowAutocuraForm(true);
	};

	const apriModificaProdotto = (prodotto: ProdottoAutocura) => {
		setProdottoInModificaId(prodotto.id);
		setNomeProdotto(prodotto.nome);
		setDataProdotto(new Date(prodotto.data));
		setShowAutocuraForm(true);
	};

	const handleSalvaProdotto = async () => {
		const nome = nomeProdotto.trim();
		if (!nome) {
			Alert.alert('Errore', 'Inserisci il nome del prodotto');
			return;
		}

		const listaCorrente = cliente.prodottiAutocura ?? [];
		const nuovaLista = prodottoInModificaId
			? listaCorrente.map(p =>
				p.id === prodottoInModificaId ? { ...p, nome, data: dataProdotto.toISOString() } : p
			)
			: [...listaCorrente, { id: Date.now().toString(), nome, data: dataProdotto.toISOString() }];

		try {
			await updateCliente(clienteId, { prodottiAutocura: nuovaLista });
			resetAutocuraForm();
		} catch (error) {
			Alert.alert('Errore', 'Impossibile salvare il prodotto');
		}
	};

	const handleEliminaProdotto = (prodotto: ProdottoAutocura) => {
		Alert.alert('Elimina prodotto', `Vuoi eliminare "${prodotto.nome}"?`, [
			{ text: 'Annulla', style: 'cancel' },
			{
				text: 'Elimina',
				style: 'destructive',
				onPress: async () => {
					try {
						await updateCliente(clienteId, {
							prodottiAutocura: (cliente.prodottiAutocura ?? []).filter(p => p.id !== prodotto.id),
						});
						if (prodottoInModificaId === prodotto.id) {
							resetAutocuraForm();
						}
					} catch (error) {
						Alert.alert('Errore', 'Impossibile eliminare il prodotto');
					}
				},
			},
		]);
	};

	const handleDelete = () => {
		Alert.alert(
			'Conferma eliminazione',
			`Vuoi eliminare ${cliente.nome}? Verranno eliminati anche tutti i suoi trattamenti.`,
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Elimina',
					style: 'destructive',
					onPress: async () => {
						await deleteCliente(clienteId);
						navigation.goBack();
					},
				},
			]
		);
	};

	const renderTrattamento = ({ item }: { item: Trattamento }) => (
		<TouchableOpacity
			style={[styles.trattamentoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
			onPress={() => navigation.navigate('DettaglioTrattamento', { trattamentoId: item.id })}
		>
			<View style={styles.trattamentoContent}>
				<View style={styles.trattamentoInfo}>
					<Text style={[styles.trattamentoNome, { color: theme.text }]}>{item.nome}</Text>
					<Text style={[styles.trattamentoData, { color: theme.textSecondary }]}>
						{formatDate(item.data)}
					</Text>
				</View>
				<Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="arrow-back" size={28} color={theme.text} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.text }]}>Dettagli Cliente</Text>
				<TouchableOpacity onPress={isEditing ? handleSave : () => setIsEditing(true)}>
					<Text style={[styles.editButton, { color: theme.primary }]}>
						{isEditing ? 'Salva' : 'Modifica'}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content}>
				<View style={styles.fotoSection}>
					<TouchableOpacity
						onPress={() => {
							if (isEditing) {
								showImagePickerOptions((uri) =>
									setEditedCliente(prev => prev ? { ...prev, foto: uri } : prev)
								);
							}
						}}
						disabled={!isEditing}
					>
						{editedCliente?.foto ? (
							<Image source={{ uri: editedCliente.foto }} style={styles.foto} />
						) : (
							<View style={[styles.fotoPlaceholder, { backgroundColor: theme.secondary }]}>
								<Ionicons name="person" size={60} color={theme.text} />
							</View>
						)}
					</TouchableOpacity>
				</View>

				<View style={[styles.infoCard, { backgroundColor: theme.card }]}>
					<View style={styles.infoRow}>
						<Ionicons name="person" size={20} color={theme.primary} />
						{isEditing ? (
							<TextInput
								style={[styles.infoInput, { color: theme.text }]}
								value={editedCliente?.nome}
								onChangeText={(text) =>
									setEditedCliente(prev => prev ? { ...prev, nome: text } : prev)
								}
							/>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>{cliente.nome}</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Ionicons name="mail" size={20} color={theme.primary} />
						{isEditing ? (
							<TextInput
								style={[styles.infoInput, { color: theme.text }]}
								value={editedCliente?.email}
								onChangeText={(text) =>
									setEditedCliente(prev => prev ? { ...prev, email: text } : prev)
								}
								keyboardType="email-address"
							/>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>{cliente.email || 'N/A'}</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Ionicons name="call" size={20} color={theme.primary} />
						{isEditing ? (
							<TextInput
								style={[styles.infoInput, { color: theme.text }]}
								value={editedCliente?.telefono}
								onChangeText={(text) =>
									setEditedCliente(prev => prev ? { ...prev, telefono: text } : prev)
								}
								keyboardType="phone-pad"
							/>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>{cliente.telefono}</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Ionicons name="calendar" size={20} color={theme.primary} />
						{isEditing ? (
							<View style={styles.dateEditorContainer}>
								{editedCliente?.dataNascita ? (
									<>
										<DatePicker
											label=""
											value={new Date(editedCliente.dataNascita)}
											onChange={(date) =>
												setEditedCliente(prev => prev ? { ...prev, dataNascita: date.toISOString() } : prev)
											}
											theme={theme}
											minimumDate={minimumDataNascita}
											maximumDate={new Date()}
										/>
										<TouchableOpacity
											style={[styles.dateActionButton, { borderColor: theme.error }]}
											onPress={() =>
												setEditedCliente(prev => prev ? { ...prev, dataNascita: undefined } : prev)
											}
										>
											<Ionicons name="trash-outline" size={16} color={theme.error} />
											<Text style={[styles.dateActionText, { color: theme.error }]}>Rimuovi data</Text>
										</TouchableOpacity>
									</>
								) : (
									<TouchableOpacity
										style={[styles.dateActionButton, { borderColor: theme.primary }]}
										onPress={() =>
											setEditedCliente(prev => prev ? { ...prev, dataNascita: new Date().toISOString() } : prev)
										}
									>
										<Ionicons name="calendar-outline" size={16} color={theme.primary} />
										<Text style={[styles.dateActionText, { color: theme.primary }]}>Aggiungi data di nascita</Text>
									</TouchableOpacity>
								)}
							</View>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>
								{cliente.dataNascita
									? `${formatDate(cliente.dataNascita)} (${calculateAge(cliente.dataNascita)} anni)`
									: 'N/A'}
							</Text>
						)}
					</View>

					<View style={styles.infoRow}>
						<Ionicons name="location" size={20} color={theme.primary} />
						{isEditing ? (
							<TextInput
								style={[styles.infoInput, { color: theme.text }]}
								value={editedCliente?.indirizzo}
								onChangeText={(text) =>
									setEditedCliente(prev => prev ? { ...prev, indirizzo: text } : prev)
								}
							/>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>{cliente.indirizzo || 'N/A'}</Text>
						)}
					</View>
				</View>

				<View style={[styles.autocuraCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Note</Text>
					{isEditing ? (
						<TextInput
							style={[styles.autocuraInput, {
								color: theme.text,
								backgroundColor: theme.background,
								borderColor: theme.border,
							}]}
							value={editedCliente?.note}
							onChangeText={(text) =>
								setEditedCliente(prev => prev ? { ...prev, note: text } : prev)
							}
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							placeholder="Note aggiuntive sul cliente..."
							placeholderTextColor={theme.textSecondary}
						/>
					) : (
						<Text style={[styles.noteText, { color: cliente.note ? theme.text : theme.textSecondary }]}>
							{cliente.note || 'Nessuna nota. Tocca "Modifica" per aggiungerne una.'}
						</Text>
					)}
				</View>

				<View style={[styles.trattamentiCard, { backgroundColor: theme.card }]}>
					<View style={styles.trattamentiHeader}>
						<Text style={[styles.sectionTitle, styles.headerTitle, { color: theme.text }]}>
							Autocura ({prodottiAutocura.length})
						</Text>
						{!showAutocuraForm && (
							<TouchableOpacity
								style={[styles.addTrattamentoButton, { backgroundColor: theme.primary }]}
								onPress={apriNuovoProdotto}
							>
								<Ionicons name="add" size={20} color="#FFF" />
								<Text style={styles.addTrattamentoText}>Aggiungi</Text>
							</TouchableOpacity>
						)}
					</View>

					{showAutocuraForm && (
						<View style={[styles.autocuraForm, { borderColor: theme.border, backgroundColor: theme.background }]}>
							<Text style={[styles.autocuraFormLabel, { color: theme.textSecondary }]}>Nome prodotto *</Text>
							<TextInput
								style={[styles.autocuraFormInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
								value={nomeProdotto}
								onChangeText={setNomeProdotto}
								placeholder="Es. Crema idratante"
								placeholderTextColor={theme.textSecondary}
								autoFocus={!prodottoInModificaId}
							/>
							<DatePicker
								label="Data"
								value={dataProdotto}
								onChange={setDataProdotto}
								theme={theme}
								containerStyle={styles.autocuraDatePicker}
							/>
							<View style={styles.autocuraFormActions}>
								<TouchableOpacity
									style={[styles.autocuraFormButton, { borderColor: theme.border, borderWidth: 1 }]}
									onPress={resetAutocuraForm}
								>
									<Text style={[styles.autocuraFormButtonText, { color: theme.text }]}>Annulla</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.autocuraFormButton, { backgroundColor: theme.primary }]}
									onPress={handleSalvaProdotto}
								>
									<Text style={[styles.autocuraFormButtonText, { color: '#FFF' }]}>
										{prodottoInModificaId ? 'Salva modifiche' : 'Aggiungi'}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					)}

					{prodottiAutocura.length > 0 ? (
						prodottiAutocura.map(prodotto => (
							<TouchableOpacity
								key={prodotto.id}
								style={[styles.trattamentoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
								onPress={() => apriModificaProdotto(prodotto)}
							>
								<View style={styles.trattamentoContent}>
									<View style={styles.trattamentoInfo}>
										<Text style={[styles.trattamentoNome, { color: theme.text }]}>{prodotto.nome}</Text>
										<Text style={[styles.trattamentoData, { color: theme.textSecondary }]}>
											{formatDate(prodotto.data)}
										</Text>
									</View>
									<TouchableOpacity
										onPress={() => handleEliminaProdotto(prodotto)}
										hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
									>
										<Ionicons name="trash-outline" size={20} color={theme.error} />
									</TouchableOpacity>
								</View>
							</TouchableOpacity>
						))
					) : (
						!showAutocuraForm && (
							<Text style={[styles.noTrattamenti, { color: theme.textSecondary }]}>
								Nessun prodotto registrato
							</Text>
						)
					)}
				</View>

				<View style={[styles.trattamentiCard, { backgroundColor: theme.card }]}>
					<View style={styles.trattamentiHeader}>
						<Text style={[styles.sectionTitle, { color: theme.text }]}>
							Trattamenti ({trattamentiCliente.length})
						</Text>
						<TouchableOpacity
							style={[styles.addTrattamentoButton, { backgroundColor: theme.primary }]}
							onPress={() => navigation.navigate('AggiungiTrattamento', { clienteId })}
						>
							<Ionicons name="add" size={20} color="#FFF" />
							<Text style={styles.addTrattamentoText}>Aggiungi</Text>
						</TouchableOpacity>
					</View>

					{trattamentiCliente.length > 0 ? (
						<FlatList
							data={trattamentiCliente.sort((a, b) =>
								new Date(b.data).getTime() - new Date(a.data).getTime()
							)}
							renderItem={renderTrattamento}
							keyExtractor={item => item.id}
							scrollEnabled={false}
						/>
					) : (
						<Text style={[styles.noTrattamenti, { color: theme.textSecondary }]}>
							Nessun trattamento registrato
						</Text>
					)}
				</View>

				<View style={[styles.autocuraCard, { backgroundColor: theme.card }]}>
					<View style={styles.mostUsedHeader}>
						<Ionicons name="trending-up" size={20} color={theme.primary} />
						<Text style={[styles.sectionTitle, styles.mostUsedTitle, { color: theme.text }]}>Trattamento più usato</Text>
					</View>

					{!trattamentoPiuUsato.hasData ? (
						<Text style={[styles.noTrattamenti, styles.mostUsedEmpty, { color: theme.textSecondary }]}>Nessun trattamento registrato</Text>
					) : (
						<View style={styles.mostUsedContent}>
							<Text style={[styles.mostUsedName, { color: theme.text }]}>
								{trattamentoPiuUsato.hasPariMerito
									? `Pari merito: ${trattamentoPiuUsato.nomi.join(', ')}`
									: trattamentoPiuUsato.nomi[0]}
							</Text>
							<Text style={[styles.mostUsedCount, { color: theme.textSecondary }]}>
								{trattamentoPiuUsato.hasPariMerito
									? `${trattamentoPiuUsato.conteggio} volte ciascuno`
									: `${trattamentoPiuUsato.conteggio} volte`}
							</Text>
						</View>
					)}
				</View>

				{!isEditing && (
					<TouchableOpacity
						style={[styles.deleteButton, { backgroundColor: theme.error }]}
						onPress={handleDelete}
					>
						<Ionicons name="trash" size={20} color="#FFF" />
						<Text style={styles.deleteButtonText}>Elimina Cliente</Text>
					</TouchableOpacity>
				)}

				<View style={{ height: 40 }} />
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
		fontSize: 18,
		fontWeight: '600',
	},
	content: {
		flex: 1,
	},
	fotoSection: {
		alignItems: 'center',
		paddingVertical: 24,
	},
	foto: {
		width: 140,
		height: 140,
		borderRadius: 70,
	},
	fotoPlaceholder: {
		width: 140,
		height: 140,
		borderRadius: 70,
		justifyContent: 'center',
		alignItems: 'center',
	},
	infoCard: {
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	infoText: {
		fontSize: 16,
		marginLeft: 12,
		flex: 1,
	},
	infoInput: {
		fontSize: 16,
		marginLeft: 12,
		flex: 1,
		padding: 8,
		borderRadius: 6,
	},
	dateEditorContainer: {
		flex: 1,
		marginLeft: 12,
	},
	dateActionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderRadius: 8,
		paddingVertical: 10,
		gap: 8,
	},
	dateActionText: {
		fontSize: 14,
		fontWeight: '600',
	},
	autocuraCard: {
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	mostUsedTitle: {
		marginBottom: 0,
		marginLeft: 8,
	},
	mostUsedHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	mostUsedContent: {
		gap: 4,
	},
	mostUsedName: {
		fontSize: 16,
		fontWeight: '600',
	},
	mostUsedCount: {
		fontSize: 14,
	},
	mostUsedEmpty: {
		paddingVertical: 4,
	},
	noteText: {
		fontSize: 16,
		lineHeight: 22,
	},
	headerTitle: {
		marginBottom: 0,
	},
	autocuraForm: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
	},
	autocuraFormLabel: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
	},
	autocuraFormInput: {
		fontSize: 16,
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
	},
	autocuraDatePicker: {
		backgroundColor: 'transparent',
		padding: 0,
		marginTop: 12,
		marginBottom: 12,
	},
	autocuraFormActions: {
		flexDirection: 'row',
		gap: 8,
	},
	autocuraFormButton: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
		borderRadius: 8,
	},
	autocuraFormButtonText: {
		fontSize: 15,
		fontWeight: '600',
	},
	autocuraInput: {
		fontSize: 16,
		padding: 12,
		borderRadius: 8,
		borderWidth: 1,
		minHeight: 120,
	},
	trattamentiCard: {
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
	},
	trattamentiHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	addTrattamentoButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
	},
	addTrattamentoText: {
		color: '#FFF',
		fontSize: 14,
		fontWeight: '600',
		marginLeft: 4,
	},
	trattamentoCard: {
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 1,
	},
	trattamentoContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 12,
	},
	trattamentoInfo: {
		flex: 1,
	},
	trattamentoNome: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	trattamentoData: {
		fontSize: 14,
	},
	noTrattamenti: {
		fontSize: 14,
		textAlign: 'center',
		paddingVertical: 16,
	},
	deleteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 16,
		marginTop: 8,
		paddingVertical: 14,
		borderRadius: 12,
	},
	deleteButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	errorText: {
		fontSize: 18,
		textAlign: 'center',
		marginTop: 100,
	},
});
