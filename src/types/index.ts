export interface Cliente {
	id: string;
	nome: string;
	email: string;
	telefono: string;
	dataNascita: string;
	indirizzo: string;
	foto?: string;
	autocura: string;
	createdAt: string;
}

export interface Trattamento {
	id: string;
	nome: string;
	descrizione: string;
	data: string;
	clienteId: string;
	clienteNome: string;
	fotoPrima?: string;
	fotoDopo?: string;
	fotoPrimoTrattamento?: string;
	fotoUltimoTrattamento?: string;
	createdAt: string;
}

export interface TipoTrattamento {
	id: string;
	nome: string;
	descrizioneDefault: string;
	createdAt: string;
}

export interface Promozione {
	id: string;
	nome: string;
	descrizione: string;
	foto?: string;
	dataInizio: string;
	dataFine: string;
	createdAt: string;
}

export interface Impostazioni {
	suoni: boolean;
	vibrazione: boolean;
	temaSuro: boolean; // true = scuro, false = chiaro
}
