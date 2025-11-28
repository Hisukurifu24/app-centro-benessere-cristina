import { Linking, Alert, Platform } from 'react-native';

export const openWhatsApp = (phoneNumber: string, message: string) => {
	// Rimuovi spazi e caratteri speciali dal numero
	const cleanNumber = phoneNumber.replace(/[^0-9+]/g, '');

	// Codifica il messaggio per URL
	const encodedMessage = encodeURIComponent(message);

	// Crea il link WhatsApp
	const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;

	// Apri WhatsApp
	Linking.canOpenURL(whatsappUrl)
		.then(supported => {
			if (supported) {
				return Linking.openURL(whatsappUrl);
			} else {
				Alert.alert('Errore', 'WhatsApp non è installato su questo dispositivo');
			}
		})
		.catch(err => {
			console.error('Errore apertura WhatsApp:', err);
			Alert.alert('Errore', 'Impossibile aprire WhatsApp');
		});
};

export const sendBirthdayMessage = (nome: string, phoneNumber: string) => {
	const message = `Ciao ${nome}! 🎉\n\nTanti auguri di buon compleanno dal Centro Estetico Cristina! 🎂\n\nTi auguriamo una giornata speciale! 💖`;
	openWhatsApp(phoneNumber, message);
};

export const sendInactiveClientMessage = (nome: string, phoneNumber: string) => {
	const message = `Ciao ${nome}! 💖\n\nCi manchi! È passato un po' di tempo dall'ultima volta che ci siamo viste.\n\nVorremmo ricordarti che siamo sempre qui per prenderci cura di te! 🌸\n\nContattaci per prenotare il tuo prossimo trattamento.\n\nCentro Estetico Cristina`;
	openWhatsApp(phoneNumber, message);
};
