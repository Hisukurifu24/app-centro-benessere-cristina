import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	FlatList,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { getClientiInattivi } from '../utils/notifications';
import { sendInactiveClientMessage } from '../utils/whatsapp';

export default function StatisticheScreen() {
	const { clienti, trattamenti, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const [expandedSections, setExpandedSections] = useState<any>({});

	const toggleSection = (section: string) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const clientiInattivi = getClientiInattivi(clienti, trattamenti);

	const sendReminder = (cliente: any) => {
		Alert.alert(
			'Invia Promemoria',
			`Vuoi inviare un messaggio WhatsApp a ${cliente.nome}?`,
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Invia',
					onPress: () => sendInactiveClientMessage(cliente.nome, cliente.telefono),
				},
			]
		);
	};

	const sendReminderToAll = () => {
		Alert.alert(
			'Invia a Tutti',
			`Vuoi inviare un promemoria WhatsApp a tutti i ${clientiInattivi.length} clienti inattivi?`,
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Invia',
					onPress: () => {
						clientiInattivi.forEach(cliente => {
							sendInactiveClientMessage(cliente.nome, cliente.telefono);
						});
					},
				},
			]
		);
	};

	const totalTrattamenti = trattamenti.length;
	const trattamentiPerCliente = totalTrattamenti / (clienti.length || 1);

	// Calcola trattamenti per tipo
	const trattamentiPerTipo = trattamenti.reduce((acc: any, t) => {
		acc[t.nome] = (acc[t.nome] || 0) + 1;
		return acc;
	}, {});

	const trattamentiPopolari = Object.entries(trattamentiPerTipo)
		.sort((a: any, b: any) => b[1] - a[1])
		.slice(0, 5);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Statistiche</Text>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{/* Statistiche Generali */}
				<View style={[styles.statsCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.cardTitle, { color: theme.text }]}>Panoramica</Text>

					<View style={styles.statRow}>
						<View style={styles.statItem}>
							<Text style={[styles.statNumber, { color: theme.primary }]}>{clienti.length}</Text>
							<Text style={[styles.statLabel, { color: theme.textSecondary }]}>Clienti</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={[styles.statNumber, { color: theme.primary }]}>{totalTrattamenti}</Text>
							<Text style={[styles.statLabel, { color: theme.textSecondary }]}>Trattamenti</Text>
						</View>
						<View style={styles.statItem}>
							<Text style={[styles.statNumber, { color: theme.primary }]}>
								{trattamentiPerCliente.toFixed(1)}
							</Text>
							<Text style={[styles.statLabel, { color: theme.textSecondary }]}>Media/Cliente</Text>
						</View>
					</View>
				</View>

				{/* Clienti Inattivi */}
				<View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={() => toggleSection('inattivi')}
					>
						<View style={styles.sectionTitleContainer}>
							<Ionicons name="alert-circle" size={24} color={theme.warning} />
							<Text style={[styles.sectionTitle, { color: theme.text }]}>
								Clienti Inattivi ({clientiInattivi.length})
							</Text>
						</View>
						<Ionicons
							name={expandedSections['inattivi'] ? 'chevron-up' : 'chevron-down'}
							size={24}
							color={theme.textSecondary}
						/>
					</TouchableOpacity>

					{expandedSections['inattivi'] && (
						<View style={styles.sectionContent}>
							<Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
								Clienti che non vengono da almeno un mese
							</Text>

							{clientiInattivi.length > 0 ? (
								<>
									{clientiInattivi.map(cliente => (
										<View key={cliente.id} style={[styles.clienteItem, { borderBottomColor: theme.border }]}>
											<Text style={[styles.clienteName, { color: theme.text }]}>{cliente.nome}</Text>
											<TouchableOpacity
												style={[styles.reminderButton, { backgroundColor: '#25D366' }]}
												onPress={() => sendReminder(cliente)}
											>
												<Ionicons name="logo-whatsapp" size={16} color="#FFF" />
												<Text style={styles.reminderText}>Promemoria</Text>
											</TouchableOpacity>
										</View>
									))}

									<TouchableOpacity
										style={[styles.sendAllButton, { backgroundColor: theme.primary }]}
										onPress={sendReminderToAll}
									>
										<Text style={styles.sendAllText}>Invia promemoria a tutti</Text>
									</TouchableOpacity>
								</>
							) : (
								<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
									Nessun cliente inattivo
								</Text>
							)}
						</View>
					)}
				</View>

				{/* Trattamenti Più Richiesti */}
				<View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={() => toggleSection('popolari')}
					>
						<View style={styles.sectionTitleContainer}>
							<Ionicons name="trending-up" size={24} color={theme.success} />
							<Text style={[styles.sectionTitle, { color: theme.text }]}>
								Trattamenti Popolari
							</Text>
						</View>
						<Ionicons
							name={expandedSections['popolari'] ? 'chevron-up' : 'chevron-down'}
							size={24}
							color={theme.textSecondary}
						/>
					</TouchableOpacity>

					{expandedSections['popolari'] && (
						<View style={styles.sectionContent}>
							{trattamentiPopolari.length > 0 ? (
								trattamentiPopolari.map(([nome, count]: any, index) => (
									<View key={nome} style={[styles.trattamentoItem, { borderBottomColor: theme.border }]}>
										<View style={styles.trattamentoRank}>
											<Text style={[styles.rankNumber, { color: theme.primary }]}>#{index + 1}</Text>
										</View>
										<Text style={[styles.trattamentoName, { color: theme.text }]}>{nome}</Text>
										<Text style={[styles.trattamentoCount, { color: theme.textSecondary }]}>
											{count} volte
										</Text>
									</View>
								))
							) : (
								<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
									Nessun trattamento registrato
								</Text>
							)}
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
	},
	content: {
		padding: 16,
	},
	statsCard: {
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	statRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	statItem: {
		alignItems: 'center',
	},
	statNumber: {
		fontSize: 32,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 14,
	},
	sectionCard: {
		borderRadius: 12,
		marginBottom: 16,
		overflow: 'hidden',
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
	},
	sectionTitleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginLeft: 12,
	},
	sectionContent: {
		padding: 16,
		paddingTop: 0,
	},
	sectionDescription: {
		fontSize: 14,
		marginBottom: 12,
	},
	clienteItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	clienteName: {
		fontSize: 16,
		flex: 1,
	},
	reminderButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
	},
	reminderText: {
		color: '#FFF',
		fontSize: 12,
		fontWeight: '600',
		marginLeft: 4,
	},
	sendAllButton: {
		marginTop: 16,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
	},
	sendAllText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
	trattamentoItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	trattamentoRank: {
		width: 40,
	},
	rankNumber: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	trattamentoName: {
		flex: 1,
		fontSize: 16,
	},
	trattamentoCount: {
		fontSize: 14,
	},
	emptyText: {
		textAlign: 'center',
		padding: 16,
		fontSize: 14,
	},
});
