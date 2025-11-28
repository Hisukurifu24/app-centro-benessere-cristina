import { useApp } from '../context/AppContext';

// Dati di esempio per testare l'app
export const useSeedData = () => {
	const { addCliente, addTrattamento, addPromozione, addTipoTrattamento } = useApp();

	const seedData = async () => {
		try {
			// Aggiungi tipi di trattamento
			const tipi = [
				{ nome: 'Pulizia Viso', descrizioneDefault: 'Trattamento di pulizia profonda del viso' },
				{ nome: 'Massaggio Rilassante', descrizioneDefault: 'Massaggio per rilassare corpo e mente' },
				{ nome: 'Manicure', descrizioneDefault: 'Trattamento per le mani' },
				{ nome: 'Pedicure', descrizioneDefault: 'Trattamento per i piedi' },
				{ nome: 'Epilazione', descrizioneDefault: 'Rimozione peli superflui' },
			];

			for (const tipo of tipi) {
				await addTipoTrattamento(tipo);
			}

			// Aggiungi clienti di esempio
			const clienti = [
				{
					nome: 'Maria Rossi',
					email: 'maria.rossi@email.com',
					telefono: '+39 333 1234567',
					dataNascita: '1985-03-15',
					indirizzo: 'Via Roma 10, Milano',
					autocura: 'Pelle sensibile, preferisce prodotti naturali',
				},
				{
					nome: 'Laura Bianchi',
					email: 'laura.bianchi@email.com',
					telefono: '+39 345 9876543',
					dataNascita: '1990-07-22',
					indirizzo: 'Corso Italia 25, Milano',
					autocura: 'Usa crema idratante quotidianamente',
				},
				{
					nome: 'Giulia Verdi',
					email: 'giulia.verdi@email.com',
					telefono: '+39 320 5551234',
					dataNascita: '1988-11-30',
					indirizzo: 'Piazza Duomo 5, Milano',
					autocura: '',
				},
			];

			for (const cliente of clienti) {
				await addCliente(cliente);
			}

			// Aggiungi promozioni
			const today = new Date();
			const nextMonth = new Date(today);
			nextMonth.setMonth(nextMonth.getMonth() + 1);

			const promozioni = [
				{
					nome: 'Speciale Natale',
					descrizione: 'Sconto del 20% su tutti i trattamenti viso',
					dataInizio: today.toISOString().split('T')[0],
					dataFine: nextMonth.toISOString().split('T')[0],
				},
				{
					nome: 'Pacchetto Relax',
					descrizione: 'Massaggio + Pulizia viso a prezzo scontato',
					dataInizio: today.toISOString().split('T')[0],
					dataFine: nextMonth.toISOString().split('T')[0],
				},
			];

			for (const promo of promozioni) {
				await addPromozione(promo);
			}

			console.log('✅ Dati di esempio caricati con successo!');
		} catch (error) {
			console.error('❌ Errore caricamento dati di esempio:', error);
		}
	};

	return { seedData };
};
