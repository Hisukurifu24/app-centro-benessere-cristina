import React, { useState, useEffect, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	Modal,
	FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { checkCompleanni } from '../utils/notifications';
import { sendBirthdayMessage } from '../utils/whatsapp';

export default function CalendarioScreen() {
	const { clienti, trattamenti, promozioni, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;
	const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
	const [birthdayClienti, setBirthdayClienti] = useState<any[]>([]);
	const [calendarKey, setCalendarKey] = useState(0);
	const today = new Date();
	const getDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	const todayString = getDateKey(today);
	const [selectedDateKey, setSelectedDateKey] = useState(todayString);
	const [visibleYear, setVisibleYear] = useState(today.getFullYear());
	const [showTodayButton, setShowTodayButton] = useState(false);

	type EventType = 'trattamento' | 'compleanno' | 'promozione';
	type CalendarEvent = {
		id: string;
		type: EventType;
		title: string;
		subtitle?: string;
		sortTimestamp: number;
	};

	const eventTypeLabels: Record<EventType, string> = {
		trattamento: 'Trattamento',
		compleanno: 'Compleanno',
		promozione: 'Promozione',
	};

	const parseDate = (dateString?: string) => {
		if (!dateString) return null;
		const parsed = new Date(dateString);
		return isNaN(parsed.getTime()) ? null : parsed;
	};

	const { markedDates, eventsByDate } = useMemo(() => {
		const dayEvents: Record<string, CalendarEvent[]> = {};
		const dayDots: Record<string, Set<EventType>> = {};

		const addEvent = (dateKey: string, event: CalendarEvent) => {
			if (!dayEvents[dateKey]) {
				dayEvents[dateKey] = [];
			}
			dayEvents[dateKey].push(event);
		};

		const addDot = (dateKey: string, type: EventType) => {
			if (!dayDots[dateKey]) {
				dayDots[dateKey] = new Set<EventType>();
			}
			dayDots[dateKey].add(type);
		};

		trattamenti.forEach(trattamento => {
			const date = parseDate(trattamento.data);
			if (!date) return;

			const dateKey = getDateKey(date);
			const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
			const timeText = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

			addEvent(dateKey, {
				id: `trattamento-${trattamento.id}`,
				type: 'trattamento',
				title: trattamento.nome,
				subtitle: hasTime ? `${trattamento.clienteNome} • ${timeText}` : trattamento.clienteNome,
				sortTimestamp: date.getTime(),
			});
			addDot(dateKey, 'trattamento');
		});

		promozioni.forEach(promozione => {
			const startDate = parseDate(promozione.dataInizio);
			const endDate = parseDate(promozione.dataFine);

			if (!startDate && !endDate) return;

			const startKey = startDate ? getDateKey(startDate) : null;
			const endKey = endDate ? getDateKey(endDate) : null;

			if (startKey && endKey && startKey === endKey) {
				addEvent(startKey, {
					id: `promozione-${promozione.id}-single`,
					type: 'promozione',
					title: promozione.nome,
					subtitle: 'Inizio/Fine promozione',
					sortTimestamp: startDate!.getTime(),
				});
				addDot(startKey, 'promozione');
				return;
			}

			if (startKey && startDate) {
				addEvent(startKey, {
					id: `promozione-${promozione.id}-start`,
					type: 'promozione',
					title: promozione.nome,
					subtitle: 'Inizio promozione',
					sortTimestamp: startDate.getTime(),
				});
				addDot(startKey, 'promozione');
			}

			if (endKey && endDate) {
				addEvent(endKey, {
					id: `promozione-${promozione.id}-end`,
					type: 'promozione',
					title: promozione.nome,
					subtitle: 'Fine promozione',
					sortTimestamp: endDate.getTime(),
				});
				addDot(endKey, 'promozione');
			}
		});

		clienti.forEach(cliente => {
			const birthDate = parseDate(cliente.dataNascita);
			if (!birthDate) return;

			const birthdayInVisibleYear = new Date(
				visibleYear,
				birthDate.getMonth(),
				birthDate.getDate()
			);

			if (isNaN(birthdayInVisibleYear.getTime())) return;

			const dateKey = getDateKey(birthdayInVisibleYear);
			addEvent(dateKey, {
				id: `compleanno-${cliente.id}-${visibleYear}`,
				type: 'compleanno',
				title: cliente.nome,
				subtitle: 'Ricorrenza compleanno',
				sortTimestamp: birthdayInVisibleYear.getTime(),
			});
			addDot(dateKey, 'compleanno');
		});

		Object.keys(dayEvents).forEach(dateKey => {
			dayEvents[dateKey].sort((a, b) => {
				if (a.sortTimestamp !== b.sortTimestamp) {
					return a.sortTimestamp - b.sortTimestamp;
				}

				const typeOrder: Record<EventType, number> = {
					trattamento: 1,
					promozione: 2,
					compleanno: 3,
				};

				return typeOrder[a.type] - typeOrder[b.type];
			});
		});

		const dotsByType: Record<EventType, string> = {
			trattamento: theme.primary,
			compleanno: theme.accent,
			promozione: theme.textSecondary,
		};

		const marks: Record<string, any> = {};
		Object.keys(dayDots).forEach(dateKey => {
			marks[dateKey] = {
				dots: Array.from(dayDots[dateKey]).map(type => ({
					key: type,
					color: dotsByType[type],
				})),
			};
		});

		marks[selectedDateKey] = {
			...(marks[selectedDateKey] || {}),
			selected: true,
			selectedColor: theme.primary,
			selectedTextColor: '#FFFFFF',
		};

		return {
			markedDates: marks,
			eventsByDate: dayEvents,
		};
	}, [clienti, promozioni, selectedDateKey, theme.accent, theme.primary, theme.textSecondary, trattamenti, visibleYear]);

	const selectedDateLabel = useMemo(() => {
		const [year, month, day] = selectedDateKey.split('-').map(Number);
		const selectedDate = new Date(year, month - 1, day);
		if (isNaN(selectedDate.getTime())) return selectedDateKey;

		return selectedDate.toLocaleDateString('it-IT', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}, [selectedDateKey]);

	const selectedDayEvents = useMemo(() => eventsByDate[selectedDateKey] || [], [eventsByDate, selectedDateKey]);

	const getEventBadgeColor = (type: EventType) => {
		if (type === 'trattamento') return theme.primary;
		if (type === 'compleanno') return theme.accent;
		return theme.textSecondary;
	};

	useEffect(() => {
		// Controlla compleanni di oggi
		const todayBirthdays = checkCompleanni(clienti);
		if (todayBirthdays.length > 0) {
			setBirthdayClienti(todayBirthdays);
			setShowBirthdayPopup(true);
		}
	}, [clienti]);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Calendario</Text>
			</View>

			<ScrollView>
				<Calendar
					key={calendarKey}
					markedDates={markedDates}
					markingType="multi-dot"
					onDayPress={(day) => {
						setSelectedDateKey(day.dateString);
					}}
					onMonthChange={(month) => {
						setVisibleYear(month.year);
						const monthString = `${month.year}-${String(month.month).padStart(2, '0')}`;
						const todayMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
						setShowTodayButton(monthString !== todayMonth);
					}}
					theme={{
						backgroundColor: theme.background,
						calendarBackground: theme.card,
						textSectionTitleColor: theme.textSecondary,
						selectedDayBackgroundColor: theme.primary,
						selectedDayTextColor: '#FFFFFF',
						todayTextColor: theme.primary,
						dayTextColor: theme.text,
						textDisabledColor: theme.textSecondary,
						monthTextColor: theme.text,
						arrowColor: theme.primary,
						dotColor: theme.primary,
						selectedDotColor: '#FFD700',
					}}
					style={[styles.calendar, { backgroundColor: theme.card }]}
				/>

				{showTodayButton && (
					<TouchableOpacity
						style={[styles.todayButton, { backgroundColor: theme.primary }]}
						onPress={() => {
							setCalendarKey(prev => prev + 1);
							setVisibleYear(today.getFullYear());
							setSelectedDateKey(todayString);
							setShowTodayButton(false);
						}}
					>
						<Ionicons name="today" size={20} color="#FFF" />
						<Text style={styles.todayButtonText}>Torna ad Oggi</Text>
					</TouchableOpacity>
				)}

				<View style={[styles.upcomingCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>
						Eventi del giorno
					</Text>
					<Text style={[styles.selectedDateText, { color: theme.textSecondary }]}>
						{selectedDateLabel}
					</Text>

					{selectedDayEvents.length === 0 ? (
						<Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
							Nessun evento per questa data.
						</Text>
					) : (
						selectedDayEvents.map(event => (
							<View key={event.id} style={[styles.eventItem, { borderBottomColor: theme.border }]}>
								<View style={[styles.eventTypeBadge, { backgroundColor: getEventBadgeColor(event.type) }]}>
									<Text style={styles.eventTypeText}>{eventTypeLabels[event.type]}</Text>
								</View>
								<Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
								{event.subtitle ? (
									<Text style={[styles.eventSubtitle, { color: theme.textSecondary }]}>{event.subtitle}</Text>
								) : null}
							</View>
						))
					)}
				</View>
			</ScrollView>

			<Modal
				visible={showBirthdayPopup}
				transparent
				animationType="fade"
				onRequestClose={() => setShowBirthdayPopup(false)}
			>
				<View style={styles.popupOverlay}>
					<View style={[styles.popupContent, { backgroundColor: theme.card }]}>
						<Text style={[styles.popupTitle, { color: theme.text }]}>
							🎉 Compleanni Oggi! 🎉
						</Text>

						<FlatList
							data={birthdayClienti}
							keyExtractor={item => item.id}
							renderItem={({ item }) => (
								<View style={styles.popupItem}>
									<Text style={[styles.popupName, { color: theme.text }]}>
										{item.nome}
									</Text>
									<TouchableOpacity
										style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}
										onPress={() => {
											sendBirthdayMessage(item.nome, item.telefono);
											setShowBirthdayPopup(false);
										}}
									>
										<Ionicons name="logo-whatsapp" size={20} color="#FFF" />
										<Text style={styles.whatsappText}>Invia Auguri</Text>
									</TouchableOpacity>
								</View>
							)}
						/>

						<TouchableOpacity
							style={[styles.closeButton, { backgroundColor: theme.primary }]}
							onPress={() => setShowBirthdayPopup(false)}
						>
							<Text style={styles.closeButtonText}>Chiudi</Text>
						</TouchableOpacity>
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
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
	},
	calendar: {
		margin: 16,
		borderRadius: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	todayButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 16,
		marginBottom: 16,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 12,
		gap: 8,
	},
	todayButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
	upcomingCard: {
		margin: 16,
		padding: 16,
		borderRadius: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	selectedDateText: {
		fontSize: 13,
		marginBottom: 10,
	},
	eventItem: {
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderRadius: 8,
		marginBottom: 6,
	},
	eventTypeBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		marginBottom: 8,
	},
	eventTypeText: {
		color: '#FFF',
		fontSize: 11,
		fontWeight: '700',
	},
	eventTitle: {
		fontSize: 16,
		fontWeight: '600',
	},
	eventSubtitle: {
		fontSize: 13,
		marginTop: 2,
	},
	emptyStateText: {
		fontSize: 14,
		paddingVertical: 8,
	},
	popupOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	popupContent: {
		width: '100%',
		maxWidth: 500,
		borderRadius: 20,
		padding: 24,
		maxHeight: '80%',
	},
	popupTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 20,
	},
	popupItem: {
		marginBottom: 16,
	},
	popupName: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 8,
	},
	whatsappButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 12,
		borderRadius: 8,
	},
	whatsappText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 8,
	},
	closeButton: {
		marginTop: 16,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
	},
	closeButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
});
