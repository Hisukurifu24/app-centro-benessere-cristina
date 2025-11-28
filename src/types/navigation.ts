export type RootStackParamList = {
	ClientiList: undefined;
	AggiungiCliente: undefined;
	DettaglioCliente: { clienteId: string };
	AggiungiTrattamento: { clienteId: string };
	DettaglioTrattamento: { trattamentoId: string };
};

export type TabParamList = {
	Clienti: undefined;
	Promozioni: undefined;
	Calendario: undefined;
	Statistiche: undefined;
	Impostazioni: undefined;
};
