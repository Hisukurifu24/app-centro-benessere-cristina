import React, { useState, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	TextInput,
	Image,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { formatDate } from '../utils/helpers';

export default function ClientiScreen() {
	const navigation = useNavigation();
	const { clienti, impostazioni } = useApp();
	const [searchQuery, setSearchQuery] = useState('');
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const filteredClienti = useMemo(() => {
		if (!searchQuery.trim()) return clienti;

		const query = searchQuery.toLowerCase();
		return clienti.filter(cliente =>
			cliente.nome.toLowerCase().includes(query) ||
			cliente.telefono.includes(query) ||
			cliente.email.toLowerCase().includes(query)
		);
	}, [clienti, searchQuery]);

	const renderCliente = ({ item }) => (
		<TouchableOpacity
			style={[styles.clienteCard, { backgroundColor: theme.card, borderColor: theme.border }]}
			onPress={() => navigation.navigate('DettaglioCliente', { clienteId: item.id })}
		>
			<View style={styles.clienteContent}>
				{item.foto ? (
					<Image source={{ uri: item.foto }} style={styles.clienteFoto} />
				) : (
					<View style={[styles.clienteFotoPlaceholder, { backgroundColor: theme.secondary }]}>
						<Ionicons name="person" size={40} color={theme.text} />
					</View>
				)}

				<View style={styles.clienteInfo}>
					<Text style={[styles.clienteNome, { color: theme.text }]}>{item.nome}</Text>
					<View style={styles.clienteDettagli}>
						<Ionicons name="call" size={16} color={theme.textSecondary} />
						<Text style={[styles.clienteTesto, { color: theme.textSecondary }]}>
							{item.telefono}
						</Text>
					</View>
					<View style={styles.clienteDettagli}>
						<Ionicons name="calendar" size={16} color={theme.textSecondary} />
						<Text style={[styles.clienteTesto, { color: theme.textSecondary }]}>
							{formatDate(item.dataNascita)}
						</Text>
					</View>
				</View>

				<Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
			<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
				<Text style={[styles.title, { color: theme.text }]}>Clienti</Text>
				<TouchableOpacity
					style={[styles.addButton, { backgroundColor: theme.primary }]}
					onPress={() => navigation.navigate('AggiungiCliente')}
				>
					<Ionicons name="add" size={28} color="#FFF" />
				</TouchableOpacity>
			</View>

			<View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
				<Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
				<TextInput
					style={[styles.searchInput, { color: theme.text }]}
					placeholder="Cerca cliente..."
					placeholderTextColor={theme.textSecondary}
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity onPress={() => setSearchQuery('')}>
						<Ionicons name="close-circle" size={20} color={theme.textSecondary} />
					</TouchableOpacity>
				)}
			</View>

			<FlatList
				data={filteredClienti}
				renderItem={renderCliente}
				keyExtractor={item => item.id}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons name="people-outline" size={80} color={theme.textSecondary} />
						<Text style={[styles.emptyText, { color: theme.textSecondary }]}>
							{searchQuery ? 'Nessun cliente trovato' : 'Nessun cliente presente'}
						</Text>
						{!searchQuery && (
							<TouchableOpacity
								style={[styles.emptyButton, { backgroundColor: theme.primary }]}
								onPress={() => navigation.navigate('AggiungiCliente')}
							>
								<Text style={styles.emptyButtonText}>Aggiungi il primo cliente</Text>
							</TouchableOpacity>
						)}
					</View>
				}
			/>
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
		fontSize: 32,
		fontWeight: 'bold',
	},
	addButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 16,
		marginVertical: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
	},
	listContent: {
		padding: 16,
	},
	clienteCard: {
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		overflow: 'hidden',
	},
	clienteContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	clienteFoto: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	clienteFotoPlaceholder: {
		width: 70,
		height: 70,
		borderRadius: 35,
		justifyContent: 'center',
		alignItems: 'center',
	},
	clienteInfo: {
		flex: 1,
		marginLeft: 16,
	},
	clienteNome: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	clienteDettagli: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
	},
	clienteTesto: {
		fontSize: 14,
		marginLeft: 6,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 100,
	},
	emptyText: {
		fontSize: 18,
		marginTop: 16,
		marginBottom: 24,
	},
	emptyButton: {
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 12,
	},
	emptyButtonText: {
		color: '#FFF',
		fontSize: 16,
		fontWeight: '600',
	},
});
