import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cliente, Trattamento, Promozione, Impostazioni, TipoTrattamento } from '../types';

interface AppContextType {
	clienti: Cliente[];
	trattamenti: Trattamento[];
	promozioni: Promozione[];
	tipiTrattamento: TipoTrattamento[];
	impostazioni: Impostazioni;

	// Clienti
	addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => Promise<void>;
	updateCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
	deleteCliente: (id: string) => Promise<void>;

	// Trattamenti
	addTrattamento: (trattamento: Omit<Trattamento, 'id' | 'createdAt'>) => Promise<void>;
	updateTrattamento: (id: string, trattamento: Partial<Trattamento>) => Promise<void>;
	deleteTrattamento: (id: string) => Promise<void>;

	// Tipi Trattamento
	addTipoTrattamento: (tipo: Omit<TipoTrattamento, 'id' | 'createdAt'>) => Promise<void>;
	updateTipoTrattamento: (id: string, tipo: Partial<TipoTrattamento>) => Promise<void>;
	deleteTipoTrattamento: (id: string) => Promise<void>;

	// Promozioni
	addPromozione: (promozione: Omit<Promozione, 'id' | 'createdAt'>) => Promise<void>;
	updatePromozione: (id: string, promozione: Partial<Promozione>) => Promise<void>;
	deletePromozione: (id: string) => Promise<void>;

	// Impostazioni
	updateImpostazioni: (impostazioni: Partial<Impostazioni>) => Promise<void>;

	// Utility
	refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
	CLIENTI: '@clienti',
	TRATTAMENTI: '@trattamenti',
	PROMOZIONI: '@promozioni',
	TIPI_TRATTAMENTO: '@tipi_trattamento',
	IMPOSTAZIONI: '@impostazioni',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [clienti, setClienti] = useState<Cliente[]>([]);
	const [trattamenti, setTrattamenti] = useState<Trattamento[]>([]);
	const [promozioni, setPromozioni] = useState<Promozione[]>([]);
	const [tipiTrattamento, setTipiTrattamento] = useState<TipoTrattamento[]>([]);
	const [impostazioni, setImpostazioni] = useState<Impostazioni>({
		suoni: true,
		vibrazione: true,
		temaSuro: false,
	});

	// Carica dati all'avvio
	useEffect(() => {
		loadAllData();
	}, []);

	const loadAllData = async () => {
		try {
			const [clientiData, trattamentiData, promozioniData, tipiData, impostazioniData] = await Promise.all([
				AsyncStorage.getItem(STORAGE_KEYS.CLIENTI),
				AsyncStorage.getItem(STORAGE_KEYS.TRATTAMENTI),
				AsyncStorage.getItem(STORAGE_KEYS.PROMOZIONI),
				AsyncStorage.getItem(STORAGE_KEYS.TIPI_TRATTAMENTO),
				AsyncStorage.getItem(STORAGE_KEYS.IMPOSTAZIONI),
			]);

			if (clientiData) setClienti(JSON.parse(clientiData));
			if (trattamentiData) setTrattamenti(JSON.parse(trattamentiData));
			if (promozioniData) setPromozioni(JSON.parse(promozioniData));
			if (tipiData) setTipiTrattamento(JSON.parse(tipiData));
			if (impostazioniData) setImpostazioni(JSON.parse(impostazioniData));
		} catch (error) {
			console.error('Errore caricamento dati:', error);
		}
	};

	const refreshData = async () => {
		await loadAllData();
	};

	// CLIENTI
	const addCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt'>) => {
		const nuovoCliente: Cliente = {
			...cliente,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const nuoviClienti = [...clienti, nuovoCliente];
		setClienti(nuoviClienti);
		await AsyncStorage.setItem(STORAGE_KEYS.CLIENTI, JSON.stringify(nuoviClienti));
	};

	const updateCliente = async (id: string, clienteUpdate: Partial<Cliente>) => {
		const nuoviClienti = clienti.map(c => c.id === id ? { ...c, ...clienteUpdate } : c);
		setClienti(nuoviClienti);
		await AsyncStorage.setItem(STORAGE_KEYS.CLIENTI, JSON.stringify(nuoviClienti));
	};

	const deleteCliente = async (id: string) => {
		const nuoviClienti = clienti.filter(c => c.id !== id);
		setClienti(nuoviClienti);
		await AsyncStorage.setItem(STORAGE_KEYS.CLIENTI, JSON.stringify(nuoviClienti));

		// Elimina anche i trattamenti del cliente
		const nuoviTrattamenti = trattamenti.filter(t => t.clienteId !== id);
		setTrattamenti(nuoviTrattamenti);
		await AsyncStorage.setItem(STORAGE_KEYS.TRATTAMENTI, JSON.stringify(nuoviTrattamenti));
	};

	// TRATTAMENTI
	const addTrattamento = async (trattamento: Omit<Trattamento, 'id' | 'createdAt'>) => {
		const nuovoTrattamento: Trattamento = {
			...trattamento,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const nuoviTrattamenti = [...trattamenti, nuovoTrattamento];
		setTrattamenti(nuoviTrattamenti);
		await AsyncStorage.setItem(STORAGE_KEYS.TRATTAMENTI, JSON.stringify(nuoviTrattamenti));
	};

	const updateTrattamento = async (id: string, trattamentoUpdate: Partial<Trattamento>) => {
		const nuoviTrattamenti = trattamenti.map(t => t.id === id ? { ...t, ...trattamentoUpdate } : t);
		setTrattamenti(nuoviTrattamenti);
		await AsyncStorage.setItem(STORAGE_KEYS.TRATTAMENTI, JSON.stringify(nuoviTrattamenti));
	};

	const deleteTrattamento = async (id: string) => {
		const nuoviTrattamenti = trattamenti.filter(t => t.id !== id);
		setTrattamenti(nuoviTrattamenti);
		await AsyncStorage.setItem(STORAGE_KEYS.TRATTAMENTI, JSON.stringify(nuoviTrattamenti));
	};

	// TIPI TRATTAMENTO
	const addTipoTrattamento = async (tipo: Omit<TipoTrattamento, 'id' | 'createdAt'>) => {
		const nuovoTipo: TipoTrattamento = {
			...tipo,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const nuoviTipi = [...tipiTrattamento, nuovoTipo];
		setTipiTrattamento(nuoviTipi);
		await AsyncStorage.setItem(STORAGE_KEYS.TIPI_TRATTAMENTO, JSON.stringify(nuoviTipi));
	};

	const updateTipoTrattamento = async (id: string, tipoUpdate: Partial<TipoTrattamento>) => {
		const nuoviTipi = tipiTrattamento.map(t => t.id === id ? { ...t, ...tipoUpdate } : t);
		setTipiTrattamento(nuoviTipi);
		await AsyncStorage.setItem(STORAGE_KEYS.TIPI_TRATTAMENTO, JSON.stringify(nuoviTipi));
	};

	const deleteTipoTrattamento = async (id: string) => {
		const nuoviTipi = tipiTrattamento.filter(t => t.id !== id);
		setTipiTrattamento(nuoviTipi);
		await AsyncStorage.setItem(STORAGE_KEYS.TIPI_TRATTAMENTO, JSON.stringify(nuoviTipi));
	};

	// PROMOZIONI
	const addPromozione = async (promozione: Omit<Promozione, 'id' | 'createdAt'>) => {
		const nuovaPromozione: Promozione = {
			...promozione,
			id: Date.now().toString(),
			createdAt: new Date().toISOString(),
		};
		const nuovePromozioni = [...promozioni, nuovaPromozione];
		setPromozioni(nuovePromozioni);
		await AsyncStorage.setItem(STORAGE_KEYS.PROMOZIONI, JSON.stringify(nuovePromozioni));
	};

	const updatePromozione = async (id: string, promozioneUpdate: Partial<Promozione>) => {
		const nuovePromozioni = promozioni.map(p => p.id === id ? { ...p, ...promozioneUpdate } : p);
		setPromozioni(nuovePromozioni);
		await AsyncStorage.setItem(STORAGE_KEYS.PROMOZIONI, JSON.stringify(nuovePromozioni));
	};

	const deletePromozione = async (id: string) => {
		const nuovePromozioni = promozioni.filter(p => p.id !== id);
		setPromozioni(nuovePromozioni);
		await AsyncStorage.setItem(STORAGE_KEYS.PROMOZIONI, JSON.stringify(nuovePromozioni));
	};

	// IMPOSTAZIONI
	const updateImpostazioni = async (impostazioniUpdate: Partial<Impostazioni>) => {
		const nuoveImpostazioni = { ...impostazioni, ...impostazioniUpdate };
		setImpostazioni(nuoveImpostazioni);
		await AsyncStorage.setItem(STORAGE_KEYS.IMPOSTAZIONI, JSON.stringify(nuoveImpostazioni));
	};

	const value: AppContextType = {
		clienti,
		trattamenti,
		promozioni,
		tipiTrattamento,
		impostazioni,
		addCliente,
		updateCliente,
		deleteCliente,
		addTrattamento,
		updateTrattamento,
		deleteTrattamento,
		addTipoTrattamento,
		updateTipoTrattamento,
		deleteTipoTrattamento,
		addPromozione,
		updatePromozione,
		deletePromozione,
		updateImpostazioni,
		refreshData,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp deve essere usato all\'interno di AppProvider');
	}
	return context;
};
