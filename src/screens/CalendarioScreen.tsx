import React, { useState, useEffect } from 'react';
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
	const { clienti, impostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;
	const [markedDates, setMarkedDates] = useState<any>({});
	const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
	const [birthdayClienti, setBirthdayClienti] = useState<any[]>([]);
	const [calendarKey, setCalendarKey] = useState(0);
	const today = new Date();
	const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
	const [showTodayButton, setShowTodayButton] = useState(false);

	useEffect(() => {
		// Segna compleanni sul calendario
		const marked: any = {};
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Crea la chiave per oggi in formato locale
		const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

		// Prima, segna oggi con uno stile speciale
		marked[todayKey] = {
			selected: true,
			selectedColor: theme.primary,
			marked: false,
		};

		clienti.forEach(cliente => {
			if (!cliente.dataNascita) return;

			const birthDate = new Date(cliente.dataNascita);

			// Valida la data
			if (isNaN(birthDate.getTime())) return;

			// Calcola il prossimo compleanno (questo anno o prossimo)
			let nextBirthday = new Date(
				today.getFullYear(),
				birthDate.getMonth(),
				birthDate.getDate()
			);
			nextBirthday.setHours(0, 0, 0, 0);

			// Se il compleanno di quest'anno è passato, usa quello dell'anno prossimo
			if (nextBirthday < today) {
				nextBirthday = new Date(
					today.getFullYear() + 1,
					birthDate.getMonth(),
					birthDate.getDate()
				);
			}

			// Valida la data risultante
			if (isNaN(nextBirthday.getTime())) return;

			try {
				// Crea la chiave per il compleanno in formato locale
				const dateKey = `${nextBirthday.getFullYear()}-${String(nextBirthday.getMonth() + 1).padStart(2, '0')}-${String(nextBirthday.getDate()).padStart(2, '0')}`;

				// Se è oggi, combina lo stile
				if (dateKey === todayKey) {
					marked[dateKey] = {
						selected: true,
						selectedColor: theme.primary,
						marked: true,
						dotColor: '#FFD700',
						selectedDotColor: '#FFD700',
					};
				} else {
					marked[dateKey] = {
						marked: true,
						dotColor: theme.primary,
					};
				}
			} catch (error) {
				console.error(`Data non valida per cliente ${cliente.nome}:`, cliente.dataNascita);
			}
		});
		setMarkedDates(marked);

		// Controlla compleanni di oggi
		const todayBirthdays = checkCompleanni(clienti);
		if (todayBirthdays.length > 0) {
			setBirthdayClienti(todayBirthdays);
			setShowBirthdayPopup(true);
		}
	}, [clienti, theme]);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Calendario</Text>
			</View>

			<ScrollView>
				<Calendar
					key={calendarKey}
					markedDates={markedDates}
					onMonthChange={(month) => {
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
							setShowTodayButton(false);
						}}
					>
						<Ionicons name="today" size={20} color="#FFF" />
						<Text style={styles.todayButtonText}>Torna ad Oggi</Text>
					</TouchableOpacity>
				)}

				<View style={[styles.upcomingCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>
						Prossimi Compleanni
					</Text>
					{(() => {
						const today = new Date();

						return clienti
							.filter(cliente => {
								if (!cliente.dataNascita) return false;
								const birthDate = new Date(cliente.dataNascita);
								return !isNaN(birthDate.getTime());
							})
							.map(cliente => {
								const birthDate = new Date(cliente.dataNascita);
								const birthdayThisYear = new Date(
									today.getFullYear(),
									birthDate.getMonth(),
									birthDate.getDate()
								);

								// Calcola giorni fino al compleanno
								let daysUntil;
								if (birthdayThisYear >= today) {
									daysUntil = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
								} else {
									const birthdayNextYear = new Date(
										today.getFullYear() + 1,
										birthDate.getMonth(),
										birthDate.getDate()
									);
									daysUntil = Math.ceil((birthdayNextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
								}

								return {
									...cliente,
									birthDate,
									daysUntil,
								};
							})
							.sort((a, b) => a.daysUntil - b.daysUntil)
							.slice(0, 10)
							.map(cliente => {
								const isToday = cliente.daysUntil === 0;
								return (
									<View key={cliente.id} style={[
										styles.birthdayItem,
										{ borderBottomColor: theme.border },
										isToday && { backgroundColor: theme.accent }
									]}>
										<View style={styles.birthdayInfo}>
											<Text style={[styles.birthdayName, { color: theme.text }]}>
												{cliente.nome} {isToday && '🎉'}
											</Text>
											<Text style={[styles.birthdayDays, { color: theme.textSecondary }]}>
												{isToday
													? 'Oggi!'
													: cliente.daysUntil === 1
														? 'Domani'
														: `Tra ${cliente.daysUntil} giorni`}
											</Text>
										</View>
										<Text style={[styles.birthdayDate, { color: theme.textSecondary }]}>
											{cliente.birthDate.getDate()}/{cliente.birthDate.getMonth() + 1}
										</Text>
									</View>
								);
							});
					})()}
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
		marginBottom: 12,
	},
	birthdayItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderRadius: 8,
		marginBottom: 4,
	},
	birthdayInfo: {
		flex: 1,
	},
	birthdayName: {
		fontSize: 16,
		fontWeight: '600',
	},
	birthdayDays: {
		fontSize: 12,
		marginTop: 2,
	},
	birthdayDate: {
		fontSize: 14,
		fontWeight: '500',
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
