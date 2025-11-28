# Centro Estetico Cristina - App per iPad

App gestionale completa per il Centro Estetico Cristina, sviluppata con React Native ed Expo.

## 🎯 Funzionalità

### 📋 Clienti
- Lista clienti con foto, nome, telefono e data di nascita
- Ricerca clienti
- Aggiungi nuovi clienti
- Dettagli cliente completi con:
  - Informazioni personali
  - Note autocura (modificabili)
  - Lista trattamenti effettuati
  - Modifica ed eliminazione

### 💅 Trattamenti
- Aggiungi trattamenti ai clienti
- Gestione tipi di trattamento personalizzati
- Dettagli trattamento con:
  - Informazioni base (nome, descrizione, data)
  - Foto prima/dopo
  - Foto primo/ultimo trattamento

### 🎁 Promozioni
- Lista promozioni attive
- Aggiungi nuove promozioni con foto
- Data validità (inizio/fine)
- Condivisione promozioni
- Badge per promozioni scadute

### 📅 Calendario
- Calendario con evidenziazione compleanni clienti
- Lista prossimi compleanni
- Popup automatico all'apertura app per compleanni del giorno
- Invio auguri WhatsApp diretto

### 📊 Statistiche
- Panoramica generale (clienti, trattamenti, media)
- **Clienti inattivi** (non visitano da oltre 1 mese)
  - Invio promemoria WhatsApp individuale o di massa
- **Trattamenti più richiesti** (top 5)
- Sezioni espandibili

### ⚙️ Impostazioni
- Toggle suoni
- Toggle vibrazione
- Tema chiaro/scuro
- **Backup/Export dati** (esporta tutti i dati in JSON)

## 🔔 Notifiche

- **Notifiche locali** per compleanni clienti (ore 9:00)
- **Popup automatico** all'apertura app se ci sono compleanni del giorno
- Integrazione WhatsApp per messaggi auguri

## 🚀 Installazione e Avvio

### Prerequisiti
- Node.js installato
- Expo Go app su iPad (scarica da App Store)

### Comandi

```bash
# Vai nella cartella del progetto
cd centro-estetico-cristina

# Avvia il server di sviluppo
npm start

# Oppure avvia direttamente per iOS
npm run ios
```

### Test su iPad

1. Installa **Expo Go** dall'App Store sul tuo iPad
2. Esegui `npm start` nel terminale
3. Scansiona il QR code con la fotocamera dell'iPad
4. L'app si aprirà automaticamente in Expo Go

## 📱 Ottimizzazione iPad

L'app è ottimizzata per iPad con:
- Layout responsive per schermo grande
- Supporto orientamento portrait e landscape
- Interfaccia touch-friendly con pulsanti grandi
- Navigazione a tab per accesso rapido alle sezioni

## 🎨 Temi

L'app supporta due temi:
- **Chiaro**: Interfaccia luminosa con colori rosa (#FF6B9D)
- **Scuro**: Interfaccia scura per ridurre affaticamento visivo

## 💾 Gestione Dati

- Tutti i dati sono salvati **localmente** su iPad tramite AsyncStorage
- Nessun server o connessione internet richiesta
- Funzione **backup/export** per salvare tutti i dati in file JSON
- I dati persistono anche chiudendo l'app

## 📸 Foto

- Scatta foto con fotocamera iPad
- Seleziona foto dalla galleria
- Foto salvate localmente nell'app

## 🔗 Integrazioni

- **WhatsApp**: Apertura diretta con messaggio precompilato
- **Share**: Condivisione promozioni tramite sheet nativo iOS

## 🛠 Tecnologie

- **React Native** + **Expo SDK 54**
- **TypeScript**
- **React Navigation** (bottom tabs + stack)
- **AsyncStorage** per persistenza dati
- **Expo Image Picker** per foto
- **Expo Notifications** per notifiche locali
- **Expo Sharing** per condivisione
- **React Native Calendars** per calendario

## 📁 Struttura Progetto

```
src/
├── context/          # AppContext per gestione stato globale
├── navigation/       # Configurazione navigazione
├── screens/          # Tutte le schermate dell'app
├── theme/            # Colori e temi
├── types/            # TypeScript interfaces
└── utils/            # Utilities (helpers, notifiche, WhatsApp, ecc.)
```

## 🎯 Prossimi Sviluppi

Possibili migliorie future:
- Sincronizzazione cloud (Firebase/iCloud)
- Statistiche avanzate con grafici
- Gestione appuntamenti
- Promemoria automatici per trattamenti
- Export PDF report
- Backup automatico

## 📄 Licenza

Proprietà del Centro Estetico Cristina - Tutti i diritti riservati.
