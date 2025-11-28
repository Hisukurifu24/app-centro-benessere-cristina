import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Switch,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { exportData } from '../utils/helpers';

export default function ImpostazioniScreen() {
	const { clienti, trattamenti, promozioni, tipiTrattamento, impostazioni, updateImpostazioni } = useApp();
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const handleToggle = async (setting: string, value: boolean) => {
		if (impostazioni.vibrazione) {
			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		await updateImpostazioni({ [setting]: value });
	};

	const handleExport = async () => {
		Alert.alert(
			'Esporta Dati',
			'Vuoi esportare tutti i dati dell\'app?',
			[
				{ text: 'Annulla', style: 'cancel' },
				{
					text: 'Esporta',
					onPress: async () => {
						const success = await exportData(clienti, trattamenti, promozioni, tipiTrattamento);
						if (success && impostazioni.vibrazione) {
							await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
						}
					},
				},
			]
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Impostazioni</Text>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				<View style={[styles.section, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Preferenze</Text>

					<View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
						<View style={styles.settingInfo}>
							<Ionicons name="volume-high" size={24} color={theme.primary} />
							<View style={styles.settingText}>
								<Text style={[styles.settingLabel, { color: theme.text }]}>Suoni</Text>
								<Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
									Abilita suoni di notifica
								</Text>
							</View>
						</View>
						<Switch
							value={impostazioni.suoni}
							onValueChange={(value) => handleToggle('suoni', value)}
							trackColor={{ false: theme.border, true: theme.primary }}
							thumbColor="#FFFFFF"
						/>
					</View>

					<View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
						<View style={styles.settingInfo}>
							<Ionicons name="phone-portrait" size={24} color={theme.primary} />
							<View style={styles.settingText}>
								<Text style={[styles.settingLabel, { color: theme.text }]}>Vibrazione</Text>
								<Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
									Feedback tattile per le azioni
								</Text>
							</View>
						</View>
						<Switch
							value={impostazioni.vibrazione}
							onValueChange={(value) => handleToggle('vibrazione', value)}
							trackColor={{ false: theme.border, true: theme.primary }}
							thumbColor="#FFFFFF"
						/>
					</View>

					<View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
						<View style={styles.settingInfo}>
							<Ionicons
								name={impostazioni.temaSuro ? 'moon' : 'sunny'}
								size={24}
								color={theme.primary}
							/>
							<View style={styles.settingText}>
								<Text style={[styles.settingLabel, { color: theme.text }]}>Tema Scuro</Text>
								<Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
									Interfaccia scura per ridurre affaticamento visivo
								</Text>
							</View>
						</View>
						<Switch
							value={impostazioni.temaSuro}
							onValueChange={(value) => handleToggle('temaSuro', value)}
							trackColor={{ false: theme.border, true: theme.primary }}
							thumbColor="#FFFFFF"
						/>
					</View>
				</View>

				<View style={[styles.section, { backgroundColor: theme.card }]}>
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Dati</Text>

					<TouchableOpacity
						style={[styles.actionRow, { borderBottomWidth: 0 }]}
						onPress={handleExport}
					>
						<View style={styles.settingInfo}>
							<Ionicons name="download" size={24} color={theme.primary} />
							<View style={styles.settingText}>
								<Text style={[styles.settingLabel, { color: theme.text }]}>Esporta Backup</Text>
								<Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
									Salva una copia di tutti i dati
								</Text>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
					</TouchableOpacity>
				</View>

				<View style={[styles.infoCard, { backgroundColor: theme.card }]}>
					<Text style={[styles.infoTitle, { color: theme.text }]}>Centro Estetico Cristina</Text>
					<Text style={[styles.infoVersion, { color: theme.textSecondary }]}>Versione 1.0.0</Text>
					<Text style={[styles.infoText, { color: theme.textSecondary }]}>
						App gestionale per iPad
					</Text>
				</View>
			</ScrollView>
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
	content: {
		padding: 16,
	},
	section: {
		borderRadius: 12,
		marginBottom: 16,
		overflow: 'hidden',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		padding: 16,
		paddingBottom: 8,
	},
	settingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	actionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
	},
	settingInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	settingText: {
		marginLeft: 16,
		flex: 1,
	},
	settingLabel: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	settingDescription: {
		fontSize: 14,
	},
	infoCard: {
		borderRadius: 12,
		padding: 20,
		alignItems: 'center',
	},
	infoTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	infoVersion: {
		fontSize: 14,
		marginBottom: 4,
	},
	infoText: {
		fontSize: 14,
		textAlign: 'center',
	},
});
