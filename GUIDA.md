# 🚀 Guida Rapida - Centro Estetico Cristina

## Avvio Rapido

### 1. Prima volta

```bash
cd centro-estetico-cristina
npm start
```

Scansiona il QR code con l'iPad usando l'app **Expo Go**.

### 2. Comandi Utili

```bash
# Avvia su iOS Simulator (se hai Xcode)
npm run ios

# Avvia su Android
npm run android

# Avvia su Web
npm run web

# Pulisci cache
npx expo start -c
```

## 📱 Come Usare l'App

### Gestione Clienti

1. **Aggiungere un cliente:**
   - Tap sul pulsante `+` nella schermata Clienti
   - Compila i campi obbligatori (Nome, Telefono, Data nascita)
   - Opzionale: aggiungi foto, email, indirizzo
   - Tap su "Salva"

2. **Cercare un cliente:**
   - Usa la barra di ricerca in alto
   - Cerca per nome, telefono o email

3. **Vedere dettagli cliente:**
   - Tap su un cliente dalla lista
   - Vedi tutte le informazioni e trattamenti
   - Tap "Modifica" per modificare i dati
   - Puoi aggiungere note sull'autocura

### Gestione Trattamenti

1. **Aggiungere un trattamento:**
   - Vai nei dettagli di un cliente
   - Tap su "Aggiungi" nella sezione Trattamenti
   - Scegli da lista tipi o crea nuovo
   - Aggiungi foto prima/dopo
   - Salva

2. **Creare nuovo tipo trattamento:**
   - Quando aggiungi un trattamento
   - Tap su "Seleziona da tipi trattamento"
   - Tap su "Aggiungi nuovo tipo"
   - Inserisci nome e descrizione predefinita

### Gestione Promozioni

1. **Creare promozione:**
   - Tap sul `+` in Promozioni
   - Aggiungi foto (opzionale)
   - Compila nome, descrizione, date validità
   - Salva

2. **Condividere promozione:**
   - Tap su "Condividi" nella promozione
   - Scegli app con cui condividere

### Calendario e Compleanni

1. **Vedere compleanni:**
   - Vai su Calendario
   - I giorni con compleanni sono evidenziati
   - Vedi lista prossimi compleanni sotto

2. **Inviare auguri:**
   - Se ci sono compleanni oggi, apparirà popup all'apertura
   - Tap su "Invia Auguri" per aprire WhatsApp
   - Il messaggio è già precompilato

### Statistiche

1. **Clienti inattivi:**
   - Tap su "Clienti Inattivi" per espandere
   - Vedi lista clienti che non vengono da oltre 1 mese
   - Tap "Promemoria" per inviare messaggio WhatsApp
   - Oppure "Invia promemoria a tutti"

2. **Trattamenti popolari:**
   - Tap su "Trattamenti Popolari"
   - Vedi top 5 trattamenti più richiesti

### Impostazioni

1. **Cambiare tema:**
   - Vai su Impostazioni
   - Attiva/disattiva "Tema Scuro"

2. **Backup dati:**
   - Vai su Impostazioni
   - Tap su "Esporta Backup"
   - Conferma
   - Scegli dove salvare il file JSON

## 🎯 Suggerimenti

### Per ottenere il massimo

- ✅ Aggiungi foto ai clienti per riconoscerli facilmente
- ✅ Compila le note autocura per personalizzare i trattamenti
- ✅ Usa le foto prima/dopo per mostrare i risultati
- ✅ Crea tipi di trattamento per velocizzare l'inserimento
- ✅ Controlla regolarmente i clienti inattivi
- ✅ Fai backup periodici dei dati

### Date

Le date devono essere inserite nel formato: **DD/MM/YYYY**

Esempi:
- ✅ 15/03/1985
- ✅ 01/12/2024
- ❌ 15/3/85
- ❌ 2024-03-15

## 🔔 Notifiche

L'app invierà notifiche per:
- **Compleanni clienti** (ore 9:00 del giorno)
- All'apertura dell'app, popup se ci sono compleanni oggi

Assicurati di:
1. Autorizzare le notifiche quando richiesto
2. Mantenere l'app aggiornata con i compleanni dei clienti

## 💾 Gestione Dati

### Dove sono salvati i dati?

Tutti i dati sono salvati **localmente** sull'iPad. Non c'è sincronizzazione cloud automatica.

### Come fare backup?

1. Vai su Impostazioni
2. Tap "Esporta Backup"
3. Salva il file JSON in un luogo sicuro (iCloud, email, ecc.)

### Come ripristinare?

Attualmente non c'è funzione di import automatico. Conserva i backup in caso di necessità future.

## 🆘 Problemi Comuni

### L'app non si avvia
```bash
# Pulisci cache e riavvia
npx expo start -c
```

### Le foto non si caricano
- Controlla i permessi fotocamera/galleria nelle impostazioni iPad
- L'app chiederà i permessi al primo utilizzo

### Le notifiche non arrivano
- Controlla che le notifiche siano abilitate per Expo Go
- Verifica nelle Impostazioni iPad > Notifiche > Expo Go

### Il QR code non funziona
- Assicurati che iPad e computer siano sulla stessa rete WiFi
- Prova a digitare manualmente l'URL mostrato nel terminale

## 📞 WhatsApp

L'app apre WhatsApp con messaggi precompilati per:
- Auguri di compleanno
- Promemoria per clienti inattivi

**Nota:** WhatsApp deve essere installato sull'iPad.

## 🎨 Personalizzazione

### Colori

I colori principali dell'app sono definiti in `src/theme/colors.ts`:
- Primary: `#FF6B9D` (Rosa)
- Secondary: `#FFB6C1` (Rosa chiaro)

Per cambiarli, modifica questi valori nel file.

## 📈 Prossimi Passi

Dopo aver preso confidenza con l'app, considera:
1. Aggiungere tutti i clienti esistenti
2. Inserire lo storico trattamenti recenti
3. Creare le promozioni attive
4. Configurare i tipi di trattamento standard
5. Fare un backup completo

---

**Buon lavoro! 💖**

Per domande o problemi, conserva questo documento come riferimento.
