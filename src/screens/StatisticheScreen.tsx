import React, { useMemo, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	TextInput,
	FlatList,
	Modal,
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
	const [tipoPiuUsatoSelezionatoId, setTipoPiuUsatoSelezionatoId] = useState<string | null>(null);
	const [isTipoDropdownVisible, setIsTipoDropdownVisible] = useState(false);
	const [tipoSearchQuery, setTipoSearchQuery] = useState('');
	const [giorniInattivitaInput, setGiorniInattivitaInput] = useState('30');
	const [giorniInattivitaError, setGiorniInattivitaError] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const clientiInattivi = getClientiInattivi(clienti, trattamenti);

	const giorniInattivita = useMemo(() => {
		const parsed = parseInt(giorniInattivitaInput, 10);
		if (Number.isNaN(parsed)) {
			return 30;
		}

		return Math.min(90, Math.max(1, parsed));
	}, [giorniInattivitaInput]);

	const filteredTipiTrattamento = useMemo(() => {
		const query = tipoSearchQuery.trim().toLowerCase();
		const sorted = [...tipiTrattamento].sort((a, b) => a.nome.localeCompare(b.nome, 'it-IT'));

		if (!query) {
			return sorted;
		}

		return sorted.filter(tipo => tipo.nome.toLowerCase().includes(query));
	}, [tipiTrattamento, tipoSearchQuery]);

	const handleGiorniInattivitaChange = (value: string) => {
		const numericOnly = value.replace(/[^0-9]/g, '');
		setGiorniInattivitaInput(numericOnly);

		if (!numericOnly) {
			setGiorniInattivitaError('Inserisci un valore da 1 a 90');
			return;
		}

		const parsed = parseInt(numericOnly, 10);
		if (Number.isNaN(parsed) || parsed < 1 || parsed > 90) {
			setGiorniInattivitaError('Valore valido: da 1 a 90');
			return;
		}

		setGiorniInattivitaError(null);
	};

	const normalizeGiorniInattivita = () => {
		const parsed = parseInt(giorniInattivitaInput, 10);
		if (Number.isNaN(parsed)) {
			setGiorniInattivitaInput('30');
			setGiorniInattivitaError(null);
			return;
		}

		const normalized = Math.min(90, Math.max(1, parsed));
		setGiorniInattivitaInput(String(normalized));
		setGiorniInattivitaError(null);
	};

	const handleSelectTipo = (tipoId: string) => {
		setTipoSelezionatoId(tipoId);
		setTipoSearchQuery('');
		setIsTipoDropdownVisible(false);
	};

	const clearTipoSelection = () => {
		setTipoSelezionatoId(null);
		setTipoSearchQuery('');
	};

	const clientiInattiviPerTipo = useMemo(() => {
		if (!tipoSelezionatoId) {
			return [];
		}

		const tipoSelezionato = tipiTrattamento.find(tipo => tipo.id === tipoSelezionatoId);
		if (!tipoSelezionato) {
			return [];
		}

		const now = Date.now();
		const inactivityWindowMs = giorniInattivita * 24 * 60 * 60 * 1000;
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

					return now - dataTrattamentoMs <= inactivityWindowMs;
				})
				.map(trattamento => trattamento.clienteId)
		);

		return clienti.filter(
			cliente =>
				clientiConAlmenoUnTrattamento.has(cliente.id) &&
				!clienteIdsAttivi.has(cliente.id)
		);
	}, [clienti, trattamenti, tipoSelezionatoId, tipiTrattamento, giorniInattivita]);

	const tipoSelezionato = useMemo(
		() => tipiTrattamento.find(tipo => tipo.id === tipoSelezionatoId) || null,
		[tipiTrattamento, tipoSelezionatoId]
	);

	const tipoPiuUsatoSelezionato = useMemo(
		() => tipiTrattamento.find(tipo => tipo.id === tipoPiuUsatoSelezionatoId) || null,
		[tipiTrattamento, tipoPiuUsatoSelezionatoId]
	);

	const clientiPerTrattamentoPiuUsato = useMemo(() => {
		if (!tipoPiuUsatoSelezionatoId) {
			return [];
		}

		const tipoTarget = tipiTrattamento.find(tipo => tipo.id === tipoPiuUsatoSelezionatoId);
		if (!tipoTarget) {
			return [];
		}

		const nomeTarget = tipoTarget.nome.trim().toLowerCase();

		return clienti
			.map(cliente => {
				const conteggiPerTipo = trattamenti
					.filter(trattamento => trattamento.clienteId === cliente.id)
					.reduce((acc, trattamento) => {
						const nome = trattamento.nome.trim().toLowerCase();
						if (!nome) {
							return acc;
						}

						acc[nome] = (acc[nome] || 0) + 1;
						return acc;
					}, {} as Record<string, number>);

				const counts = Object.values(conteggiPerTipo);
				if (counts.length === 0) {
					return null;
				}

				const maxCount = Math.max(...counts);
				const countTarget = conteggiPerTipo[nomeTarget] || 0;
				if (countTarget === 0 || countTarget !== maxCount) {
					return null;
				}

				const tipiAlTop = Object.values(conteggiPerTipo).filter(count => count === maxCount).length;

				return {
					cliente,
					count: countTarget,
					hasPariMerito: tipiAlTop > 1,
				};
			})
			.filter((item): item is { cliente: typeof clienti[number]; count: number; hasPariMerito: boolean } => item !== null)
			.sort((a, b) => {
				if (b.count !== a.count) {
					return b.count - a.count;
				}

				return a.cliente.nome.localeCompare(b.cliente.nome, 'it-IT');
			});
	}, [clienti, trattamenti, tipoPiuUsatoSelezionatoId, tipiTrattamento]);

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
								Seleziona un tipo di trattamento per vedere i clienti che lo hanno fatto almeno una volta ma non negli ultimi {giorniInattivita} giorni
							</Text>

							{tipiTrattamento.length > 0 ? (
								<>
									<View style={styles.filterControlsRow}>
										<View style={styles.giorniInputContainer}>
											<Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Giorni inattivita</Text>
											<TextInput
												value={giorniInattivitaInput}
												onChangeText={handleGiorniInattivitaChange}
												onBlur={normalizeGiorniInattivita}
												keyboardType="number-pad"
												maxLength={2}
												placeholder="30"
												placeholderTextColor={theme.textSecondary}
												style={[
													styles.giorniInput,
													{ color: theme.text, borderColor: giorniInattivitaError ? theme.error : theme.border, backgroundColor: theme.background },
												]}
											/>
										</View>

										<View style={styles.tipoDropdownContainer}>
											<Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Tipo trattamento</Text>
											<TouchableOpacity
												style={[styles.tipoDropdownButton, { borderColor: theme.border, backgroundColor: theme.background }]}
												onPress={() => setIsTipoDropdownVisible(true)}
											>
												<Text
													numberOfLines={1}
													style={[styles.tipoDropdownButtonText, { color: tipoSelezionato ? theme.text : theme.textSecondary }]}
												>
													{tipoSelezionato ? tipoSelezionato.nome : 'Seleziona tipo'}
												</Text>
												<Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
											</TouchableOpacity>
										</View>
									</View>

									{giorniInattivitaError && (
										<Text style={[styles.validationText, { color: theme.error }]}>{giorniInattivitaError}</Text>
									)}

									{tipoSelezionato && (
										<TouchableOpacity style={styles.clearTipoButton} onPress={clearTipoSelection}>
											<Text style={[styles.clearTipoButtonText, { color: theme.primary }]}>Rimuovi selezione</Text>
										</TouchableOpacity>
									)}

									{!tipoSelezionato ? (
										<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
											Seleziona un tipo di trattamento
										</Text>
									) : clientiInattiviPerTipo.length > 0 ? (
										<>
											<Text style={[styles.typeResultTitle, { color: theme.text }]}>
												Inattivi per {tipoSelezionato.nome} ({clientiInattiviPerTipo.length}) - ultimi {giorniInattivita} giorni
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

				<Modal
					visible={isTipoDropdownVisible}
					transparent
					animationType="slide"
					onRequestClose={() => {
						setIsTipoDropdownVisible(false);
						setTipoSearchQuery('');
					}}
				>
					<View style={styles.modalOverlay}>
						<View style={[styles.modalContent, { backgroundColor: theme.card }]}>
							<View style={styles.modalHeader}>
								<Text style={[styles.modalTitle, { color: theme.text }]}>Seleziona tipo trattamento</Text>
								<TouchableOpacity
									onPress={() => {
										setIsTipoDropdownVisible(false);
										setTipoSearchQuery('');
									}}
								>
									<Ionicons name="close" size={24} color={theme.text} />
								</TouchableOpacity>
							</View>

							<View style={[styles.modalSearchContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
								<Ionicons name="search" size={18} color={theme.textSecondary} style={styles.modalSearchIcon} />
								<TextInput
									style={[styles.modalSearchInput, { color: theme.text }]}
									placeholder="Cerca tipo trattamento..."
									placeholderTextColor={theme.textSecondary}
									value={tipoSearchQuery}
									onChangeText={setTipoSearchQuery}
								/>
								{tipoSearchQuery.length > 0 && (
									<TouchableOpacity onPress={() => setTipoSearchQuery('')}>
										<Ionicons name="close-circle" size={18} color={theme.textSecondary} />
									</TouchableOpacity>
								)}
							</View>

							<FlatList
								data={filteredTipiTrattamento}
								keyExtractor={item => item.id}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={[styles.tipoListItem, { borderBottomColor: theme.border }]}
										onPress={() => handleSelectTipo(item.id)}
									>
										<Text style={[styles.tipoListItemText, { color: theme.text }]}>{item.nome}</Text>
										{item.id === tipoSelezionatoId && (
											<Ionicons name="checkmark-circle" size={20} color={theme.primary} />
										)}
									</TouchableOpacity>
								)}
								ListEmptyComponent={
									<Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun tipo trovato</Text>
								}
							/>
						</View>
					</View>
				</Modal>

				{/* Clienti per Trattamento più Usato */}
				<View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
					<TouchableOpacity
						style={styles.sectionHeader}
						onPress={() => toggleSection('piuUsatoPerTipo')}
					>
						<View style={styles.sectionTitleContainer}>
							<Ionicons name="stats-chart" size={24} color={theme.primary} />
							<Text style={[styles.sectionTitle, { color: theme.text }]}>Clienti per Trattamento più Usato</Text>
						</View>
						<Ionicons
							name={expandedSections['piuUsatoPerTipo'] ? 'chevron-up' : 'chevron-down'}
							size={24}
							color={theme.textSecondary}
						/>
					</TouchableOpacity>

					{expandedSections['piuUsatoPerTipo'] && (
						<View style={styles.sectionContent}>
							<Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>Seleziona un tipo di trattamento per vedere quali clienti lo hanno come trattamento più usato</Text>

							{tipiTrattamento.length > 0 ? (
								<>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={styles.tipoFilterContainer}
									>
										{tipiTrattamento.map(tipo => {
											const isSelected = tipo.id === tipoPiuUsatoSelezionatoId;
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
														setTipoPiuUsatoSelezionatoId(prev => (prev === tipo.id ? null : tipo.id))
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

									{!tipoPiuUsatoSelezionato ? (
										<Text style={[styles.emptyText, { color: theme.textSecondary }]}>Seleziona un tipo di trattamento</Text>
									) : clientiPerTrattamentoPiuUsato.length > 0 ? (
										<>
											<Text style={[styles.typeResultTitle, { color: theme.text }]}>Più usato: {tipoPiuUsatoSelezionato.nome} ({clientiPerTrattamentoPiuUsato.length})</Text>
											{clientiPerTrattamentoPiuUsato.map(item => (
												<View key={item.cliente.id} style={[styles.clienteItem, { borderBottomColor: theme.border }]}>
													<Text style={[styles.clienteName, { color: theme.text }]}>{item.cliente.nome}</Text>
													<View style={styles.clienteMeta}>
														<Text style={[styles.clienteUsageCount, { color: theme.textSecondary }]}>{item.count} volte</Text>
														{item.hasPariMerito && (
															<Text style={[styles.pariMeritoBadge, { color: theme.warning, backgroundColor: `${theme.warning}20` }]}>Pari merito</Text>
														)}
													</View>
												</View>
											))}
										</>
									) : (
										<Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun cliente con questo trattamento come più usato</Text>
									)}
								</>
							) : (
								<Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nessun tipo di trattamento disponibile</Text>
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
	filterControlsRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: 10,
		marginBottom: 8,
	},
	giorniInputContainer: {
		width: 120,
	},
	tipoDropdownContainer: {
		flex: 1,
	},
	filterLabel: {
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 6,
	},
	giorniInput: {
		height: 44,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 12,
		fontSize: 16,
		fontWeight: '600',
	},
	tipoDropdownButton: {
		height: 44,
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	tipoDropdownButtonText: {
		flex: 1,
		marginRight: 8,
		fontSize: 15,
		fontWeight: '500',
	},
	validationText: {
		fontSize: 12,
		fontWeight: '500',
		marginBottom: 8,
	},
	clearTipoButton: {
		alignSelf: 'flex-start',
		paddingVertical: 6,
		marginBottom: 4,
	},
	clearTipoButtonText: {
		fontSize: 13,
		fontWeight: '600',
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
	clienteMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 8,
	},
	clienteUsageCount: {
		fontSize: 13,
		fontWeight: '600',
	},
	pariMeritoBadge: {
		fontSize: 11,
		fontWeight: '600',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 10,
		marginLeft: 8,
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
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: '82%',
		padding: 16,
		paddingBottom: 24,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
	},
	modalSearchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 10,
		marginBottom: 10,
	},
	modalSearchIcon: {
		marginRight: 8,
	},
	modalSearchInput: {
		flex: 1,
		height: 42,
		fontSize: 15,
	},
	tipoListItem: {
		paddingVertical: 14,
		paddingHorizontal: 4,
		borderBottomWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	tipoListItemText: {
		fontSize: 16,
		fontWeight: '500',
	},
});
