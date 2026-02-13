import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate } from '../utils/helpers';

const { width } = Dimensions.get('window');

export default function DettaglioTrattamentoScreen() {
	const navigation = useNavigation();
	const route = useRoute();
	const { trattamentoId } = route.params as { trattamentoId: string };
	const { trattamenti, deleteTrattamento, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const trattamento = trattamenti.find(t => t.id === trattamentoId);

	if (!trattamento) {
		return (
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<Text style={[styles.errorText, { color: theme.text }]}>Trattamento non trovato</Text>
			</View>
		);
	}

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

	const renderFotoSection = (title: string, foto?: string) => {
		return (
			<View style={styles.fotoSection}>
				<Text style={[styles.fotoLabel, { color: theme.textSecondary }]}>{title}</Text>
				{foto ? (
					<Image source={{ uri: foto }} style={styles.foto} resizeMode="contain" />
				) : (
					<View style={[styles.fotoPlaceholder, { backgroundColor: theme.border }]}>
						<Ionicons name="image-outline" size={32} color={theme.textSecondary} />
					</View>
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
				<TouchableOpacity onPress={handleDelete}>
					<Ionicons name="trash" size={24} color={theme.error} />
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
				<View style={[styles.infoCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.cardTitle, { color: theme.text }]}>Informazioni</Text>

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Nome:</Text>
						<Text style={[styles.infoValue, { color: theme.text }]}>{trattamento.nome}</Text>
					</View>

					{trattamento.descrizione && (
						<View style={styles.infoRow}>
							<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Descrizione:</Text>
							<Text style={[styles.infoValue, { color: theme.text }]}>
								{trattamento.descrizione}
							</Text>
						</View>
					)}

					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Data:</Text>
						<Text style={[styles.infoValue, { color: theme.text }]}>
							{formatDate(trattamento.data)}
						</Text>
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
						{renderFotoSection('Prima', trattamento.fotoPrima)}
						{renderFotoSection('Dopo', trattamento.fotoDopo)}
						{renderFotoSection('Primo Trattamento', fotoPrimoTrattamento)}
						{renderFotoSection('Ultimo Trattamento', fotoUltimoTrattamento)}
					</View>
				</View>
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
	content: {
		flex: 1,
	},
	contentContainer: {
		padding: 16,
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
	},
	errorText: {
		fontSize: 18,
		textAlign: 'center',
		marginTop: 100,
	},
});
