import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate, calculateAge } from '../utils/helpers';
import { showImagePickerOptions } from '../utils/imagePicker';
import DatePicker from '../components/DatePicker';

export default function DettaglioClienteScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const { clienteId } = route.params as { clienteId: string };
	const { clienti, trattamenti, updateCliente, deleteCliente, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const cliente = clienti.find(c => c.id === clienteId);
	const trattamentiCliente = trattamenti.filter(t => t.clienteId === clienteId);

	const [isEditing, setIsEditing] = useState(false);
	const [editedCliente, setEditedCliente] = useState(cliente);

	useEffect(() => {
		setEditedCliente(cliente);
	}, [cliente]);

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

	const renderTrattamento = ({ item }) => (
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
							<View style={{ flex: 1, marginLeft: 12 }}>
								<DatePicker
									label=""
									value={editedCliente?.dataNascita ? new Date(editedCliente.dataNascita) : new Date()}
									onChange={(date) =>
										setEditedCliente(prev => prev ? { ...prev, dataNascita: date.toISOString() } : prev)
									}
									theme={theme}
									maximumDate={new Date()}
								/>
							</View>
						) : (
							<Text style={[styles.infoText, { color: theme.text }]}>
								{formatDate(cliente.dataNascita)} ({calculateAge(cliente.dataNascita)} anni)
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
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Autocura</Text>
					<TextInput
						style={[styles.autocuraInput, {
							color: theme.text,
							backgroundColor: isEditing ? theme.background : 'transparent',
							borderColor: theme.border,
						}]}
						value={editedCliente?.autocura}
						onChangeText={(text) =>
							setEditedCliente(prev => prev ? { ...prev, autocura: text } : prev)
						}
						multiline
						numberOfLines={6}
						textAlignVertical="top"
						placeholder="Note sull'autocura del cliente..."
						placeholderTextColor={theme.textSecondary}
						editable={isEditing}
					/>
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
