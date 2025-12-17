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
	const { clienti, trattamenti, impostazioni } = useApp();
	const [searchQuery, setSearchQuery] = useState('');
	const [sortBy, setSortBy] = useState<'nome' | 'cognome' | 'ultimoTrattamento'>('nome');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
	const theme = impostazioni.temaSuro ? darkTheme : lightTheme;

	const filteredAndSortedClienti = useMemo(() => {
		let result = clienti;

		// Applica filtro
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(cliente =>
				cliente.nome.toLowerCase().includes(query) ||
				cliente.telefono.includes(query) ||
				cliente.email.toLowerCase().includes(query)
			);
		}

		// Applica ordinamento
		result = [...result].sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'nome':
					// Ordina per nome completo
					comparison = a.nome.localeCompare(b.nome, 'it');
					break;
				case 'cognome':
					// Estrae il cognome (ultima parola del nome)
					const getCognome = (nomeCompleto: string) => {
						const parti = nomeCompleto.trim().split(' ');
						return parti[parti.length - 1];
					};
					const cognomeA = getCognome(a.nome);
					const cognomeB = getCognome(b.nome);
					comparison = cognomeA.localeCompare(cognomeB, 'it');
					break;
				case 'ultimoTrattamento':
					// Trova l'ultimo trattamento per ogni cliente
					const trattamentiA = trattamenti.filter(t => t.clienteId === a.id);
					const trattamentiB = trattamenti.filter(t => t.clienteId === b.id);

					const ultimoA = trattamentiA.length > 0
						? Math.max(...trattamentiA.map(t => new Date(t.data).getTime()))
						: 0;
					const ultimoB = trattamentiB.length > 0
						? Math.max(...trattamentiB.map(t => new Date(t.data).getTime()))
						: 0;

					comparison = ultimoB - ultimoA; // Più recenti prima di default
					break;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

		return result;
	}, [clienti, trattamenti, searchQuery, sortBy, sortOrder]);

	const toggleSortOrder = () => {
		setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
	};

	const handleSortChange = (newSortBy: 'nome' | 'cognome' | 'ultimoTrattamento') => {
		if (sortBy === newSortBy) {
			toggleSortOrder();
		} else {
			setSortBy(newSortBy);
			setSortOrder('asc');
		}
	};

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

			<View style={[styles.sortContainer, { backgroundColor: theme.card }]}>
				<Text style={[styles.sortLabel, { color: theme.textSecondary }]}>Ordina per:</Text>
				<TouchableOpacity
					style={[
						styles.sortButton,
						sortBy === 'nome' && { backgroundColor: theme.primary }
					]}
					onPress={() => handleSortChange('nome')}
				>
					<Ionicons
						name="text"
						size={16}
						color={sortBy === 'nome' ? '#FFF' : theme.textSecondary}
					/>
					<Text style={[
						styles.sortButtonText,
						{ color: sortBy === 'nome' ? '#FFF' : theme.textSecondary }
					]}>
						Nome
					</Text>
					{sortBy === 'nome' && (
						<Ionicons
							name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
							size={14}
							color="#FFF"
						/>
					)}
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.sortButton,
						sortBy === 'cognome' && { backgroundColor: theme.primary }
					]}
					onPress={() => handleSortChange('cognome')}
				>
					<Ionicons
						name="person"
						size={16}
						color={sortBy === 'cognome' ? '#FFF' : theme.textSecondary}
					/>
					<Text style={[
						styles.sortButtonText,
						{ color: sortBy === 'cognome' ? '#FFF' : theme.textSecondary }
					]}>
						Cognome
					</Text>
					{sortBy === 'cognome' && (
						<Ionicons
							name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
							size={14}
							color="#FFF"
						/>
					)}
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.sortButton,
						sortBy === 'ultimoTrattamento' && { backgroundColor: theme.primary }
					]}
					onPress={() => handleSortChange('ultimoTrattamento')}
				>
					<Ionicons
						name="medical"
						size={16}
						color={sortBy === 'ultimoTrattamento' ? '#FFF' : theme.textSecondary}
					/>
					<Text style={[
						styles.sortButtonText,
						{ color: sortBy === 'ultimoTrattamento' ? '#FFF' : theme.textSecondary }
					]}>
						Ultimo Tratt.
					</Text>
					{sortBy === 'ultimoTrattamento' && (
						<Ionicons
							name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
							size={14}
							color="#FFF"
						/>
					)}
				</TouchableOpacity>
			</View>

			<FlatList
				data={filteredAndSortedClienti}
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
	sortContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 16,
		marginBottom: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		gap: 8,
	},
	sortLabel: {
		fontSize: 14,
		fontWeight: '600',
		marginRight: 4,
	},
	sortButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 20,
		gap: 4,
	},
	sortButtonText: {
		fontSize: 13,
		fontWeight: '600',
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
