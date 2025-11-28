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

	useEffect(() => {
		// Segna compleanni sul calendario
		const marked = {};
		clienti.forEach(cliente => {
			const birthDate = new Date(cliente.dataNascita);
			const today = new Date();
			const thisYearBirthday = new Date(
				today.getFullYear(),
				birthDate.getMonth(),
				birthDate.getDate()
			);

			const dateKey = thisYearBirthday.toISOString().split('T')[0];
			marked[dateKey] = {
				marked: true,
				dotColor: theme.primary,
				customStyles: {
					container: {
						backgroundColor: theme.accent,
					},
					text: {
						color: theme.text,
						fontWeight: 'bold',
					},
				},
			};
		});
		setMarkedDates(marked);

		// Controlla compleanni di oggi
		const today = checkCompleanni(clienti);
		if (today.length > 0) {
			setBirthdayClienti(today);
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
					markingType={'custom'}
					markedDates={markedDates}
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
					}}
					style={[styles.calendar, { backgroundColor: theme.card }]}
				/>

				<View style={[styles.legend, { backgroundColor: theme.card }]}>
					<View style={styles.legendItem}>
						<View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
						<Text style={[styles.legendText, { color: theme.text }]}>Compleanno</Text>
					</View>
				</View>

				<View style={[styles.upcomingCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>
						Prossimi Compleanni
					</Text>
					{clienti
						.sort((a, b) => {
							const dateA = new Date(a.dataNascita);
							const dateB = new Date(b.dataNascita);
							return dateA.getMonth() * 100 + dateA.getDate() -
								(dateB.getMonth() * 100 + dateB.getDate());
						})
						.slice(0, 10)
						.map(cliente => {
							const birthDate = new Date(cliente.dataNascita);
							return (
								<View key={cliente.id} style={[styles.birthdayItem, { borderBottomColor: theme.border }]}>
									<Text style={[styles.birthdayName, { color: theme.text }]}>
										{cliente.nome}
									</Text>
									<Text style={[styles.birthdayDate, { color: theme.textSecondary }]}>
										{birthDate.getDate()}/{birthDate.getMonth() + 1}
									</Text>
								</View>
							);
						})}
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
	legend: {
		marginHorizontal: 16,
		marginBottom: 16,
		padding: 16,
		borderRadius: 12,
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 8,
	},
	legendText: {
		fontSize: 14,
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
		paddingVertical: 12,
		borderBottomWidth: 1,
	},
	birthdayName: {
		fontSize: 16,
	},
	birthdayDate: {
		fontSize: 14,
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
