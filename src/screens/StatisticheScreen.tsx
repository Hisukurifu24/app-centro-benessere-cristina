import React, { useMemo, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { getClientiInattivi } from '../utils/notifications';
import { sendInactiveClientMessage } from '../utils/whatsapp';

export default function StatisticheScreen() {
	const { clienti, trattamenti, tipiTrattamento, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	const [tipoSelezionatoId, setTipoSelezionatoId] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const clientiInattivi = getClientiInattivi(clienti, trattamenti);
	const clientiInattiviPerTipo = useMemo(() => {
		if (!tipoSelezionatoId) {
			return [];
		}

		const tipoSelezionato = tipiTrattamento.find(tipo => tipo.id === tipoSelezionatoId);
		if (!tipoSelezionato) {
			return [];
		}

		const now = Date.now();
		const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
		const nomeSelezionato = tipoSelezionato.nome.trim().toLowerCase();
		const clientiConAlmenoUnTrattamento = new Set<string>();

		const clienteIdsAttivi = new Set(
			trattamenti
				.filter(trattamento => {
					const nomeTrattamento = trattamento.nome.trim().toLowerCase();
					if (nomeTrattamento !== nomeSelezionato) {
						return false;
					}

					clientiConAlmenoUnTrattamento.add(trattamento.clienteId);

					const dataTrattamentoMs = new Date(trattamento.data).getTime();
					if (Number.isNaN(dataTrattamentoMs)) {
						return false;
					}

					return now - dataTrattamentoMs <= THIRTY_DAYS_IN_MS;
				})
				.map(trattamento => trattamento.clienteId)
		);

		return clienti.filter(
			cliente =>
				clientiConAlmenoUnTrattamento.has(cliente.id) &&
				!clienteIdsAttivi.has(cliente.id)
		);
	}, [clienti, trattamenti, tipoSelezionatoId, tipiTrattamento]);

	const tipoSelezionato = useMemo(
		() => tipiTrattamento.find(tipo => tipo.id === tipoSelezionatoId) || null,
		[tipiTrattamento, tipoSelezionatoId]
	);

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

				{/* Clienti Inattivi per Trattamento */}
				<View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={() => toggleSection('inattiviPerTipo')}
					>
						<View style={styles.sectionTitleContainer}>
							<Ionicons name="alert-circle" size={24} color={theme.warning} />
							<Text style={[styles.sectionTitle, { color: theme.text }]}>Clienti Inattivi per Trattamento</Text>
						</View>
						<Ionicons
							name={expandedSections['inattiviPerTipo'] ? 'chevron-up' : 'chevron-down'}
							size={24}
							color={theme.textSecondary}
						/>
					</TouchableOpacity>

					{expandedSections['inattiviPerTipo'] && (
						<View style={styles.sectionContent}>
							<Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
								Seleziona un tipo di trattamento per vedere i clienti che lo hanno fatto almeno una volta ma non negli ultimi 30 giorni
							</Text>

							{tipiTrattamento.length > 0 ? (
								<>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={styles.tipoFilterContainer}
									>
										{tipiTrattamento.map(tipo => {
											const isSelected = tipo.id === tipoSelezionatoId;
											return (
												<TouchableOpacity
													key={tipo.id}
													style={[
														styles.tipoFilterChip,
														isSelected
															? { backgroundColor: theme.primary, borderColor: theme.primary }
															: { backgroundColor: theme.background, borderColor: theme.border },
													]}
													onPress={() =>
														setTipoSelezionatoId(prev => (prev === tipo.id ? null : tipo.id))
													}
												>
													<Text
														style={[
															styles.tipoFilterChipText,
															isSelected ? { color: '#FFF' } : { color: theme.text },
														]}
													>
														{tipo.nome}
													</Text>
												</TouchableOpacity>
											);
										})}
									</ScrollView>

									{!tipoSelezionato ? (
										<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
											Seleziona un tipo di trattamento
										</Text>
									) : clientiInattiviPerTipo.length > 0 ? (
										<>
											<Text style={[styles.typeResultTitle, { color: theme.text }]}>
												Inattivi per {tipoSelezionato.nome} ({clientiInattiviPerTipo.length})
											</Text>
											{clientiInattiviPerTipo.map(cliente => (
												<View key={cliente.id} style={[styles.clienteItem, { borderBottomColor: theme.border }]}>
													<Text style={[styles.clienteName, { color: theme.text }]}>{cliente.nome}</Text>
												</View>
											))}
										</>
									) : (
										<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
											Nessun cliente inattivo per questo trattamento
										</Text>
									)}
								</>
							) : (
								<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
									Nessun tipo di trattamento disponibile
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
	tipoFilterContainer: {
		paddingBottom: 12,
		paddingRight: 8,
	},
	tipoFilterChip: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		borderWidth: 1,
		marginRight: 8,
	},
	tipoFilterChipText: {
		fontSize: 14,
		fontWeight: '600',
	},
	typeResultTitle: {
		fontSize: 15,
		fontWeight: '600',
		marginBottom: 8,
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
