import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
	label: string;
	value: Date;
	onChange: (date: Date) => void;
	theme: any;
	required?: boolean;
	maximumDate?: Date;
	minimumDate?: Date;
}

export default function DatePicker({
	label,
	value,
	onChange,
	theme,
	required = false,
	maximumDate,
	minimumDate
}: DatePickerProps) {
	const [show, setShow] = useState(false);

	const [tempDate, setTempDate] = useState(value);

	const handleChange = (event: any, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShow(false);
			if (event.type === 'set' && selectedDate) {
				onChange(selectedDate);
			}
		} else {
			// Su iOS aggiorniamo solo la data temporanea
			if (selectedDate) {
				setTempDate(selectedDate);
			}
		}
	};

	const handleConfirm = () => {
		onChange(tempDate);
		setShow(false);
	};

	const handleCancel = () => {
		setTempDate(value);
		setShow(false);
	};

	const formatDate = (date: Date) => {
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.card }]}>
			<Text style={[styles.label, { color: theme.textSecondary }]}>
				{label} {required && '*'}
			</Text>
			<TouchableOpacity
				style={[styles.dateButton, { borderColor: theme.border }]}
				onPress={() => {
					setTempDate(value);
					setShow(true);
				}}
			>
				<Ionicons name="calendar-outline" size={20} color={theme.primary} />
				<Text style={[styles.dateText, { color: theme.text }]}>
					{formatDate(value)}
				</Text>
			</TouchableOpacity>

			{Platform.OS === 'ios' ? (
				<Modal
					visible={show}
					transparent
					animationType="slide"
					onRequestClose={handleCancel}
				>
					<View style={styles.modalOverlay}>
						<View style={[styles.modalContent, { backgroundColor: theme.card }]}>
							<View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
								<TouchableOpacity onPress={handleCancel} style={styles.modalButtonContainer}>
									<Text style={[styles.modalButton, { color: theme.error }]}>Annulla</Text>
								</TouchableOpacity>
								<Text style={[styles.modalTitle, { color: theme.text }]}>{label}</Text>
								<TouchableOpacity onPress={handleConfirm} style={styles.modalButtonContainer}>
									<Text style={[styles.modalButton, { color: theme.primary }]}>Conferma</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.pickerContainer}>
								<DateTimePicker
									value={tempDate}
									mode="date"
									display="spinner"
									onChange={handleChange}
									maximumDate={maximumDate}
									minimumDate={minimumDate}
									locale="it-IT"
									style={styles.picker}
								/>
							</View>
						</View>
					</View>
				</Modal>
			) : (
				show && (
					<DateTimePicker
						value={value}
						mode="date"
						display="default"
						onChange={handleChange}
						maximumDate={maximumDate}
						minimumDate={minimumDate}
						locale="it-IT"
					/>
				)
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		marginBottom: 8,
	},
	dateButton: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		gap: 12,
	},
	dateText: {
		fontSize: 16,
		flex: 1,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: 34,
		overflow: 'hidden',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
	},
	modalButtonContainer: {
		minWidth: 80,
	},
	modalTitle: {
		fontSize: 17,
		fontWeight: '600',
		flex: 1,
		textAlign: 'center',
	},
	modalButton: {
		fontSize: 17,
		fontWeight: '600',
	},
	pickerContainer: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	picker: {
		height: 200,
		width: '100%',
	},
});
