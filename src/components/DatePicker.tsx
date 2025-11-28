import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

	const handleChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || value;
		if (Platform.OS === 'android') {
			setShow(false);
		}
		if (event.type === 'set' && selectedDate) {
			onChange(selectedDate);
		}
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
				onPress={() => setShow(true)}
			>
				<Ionicons name="calendar-outline" size={20} color={theme.primary} />
				<Text style={[styles.dateText, { color: theme.text }]}>
					{formatDate(value)}
				</Text>
			</TouchableOpacity>

			{show && (
				<DateTimePicker
					value={value}
					mode="date"
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={handleChange}
					maximumDate={maximumDate}
					minimumDate={minimumDate}
					locale="it-IT"
				/>
			)}

			{show && Platform.OS === 'ios' && (
				<TouchableOpacity
					style={[styles.doneButton, { backgroundColor: theme.primary }]}
					onPress={() => setShow(false)}
				>
					<Text style={styles.doneButtonText}>Fatto</Text>
				</TouchableOpacity>
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
	doneButton: {
		marginTop: 12,
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	doneButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
});
