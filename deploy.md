# Deploy iOS (EAS) — Centro Estetico Cristina

Guida operativa aggiornata al progetto attuale (`@hisukurifu24/centro-estetico-cristina`).

## Dati progetto (correnti)

- EAS Project ID: `d03c179a-02d7-4438-9b13-b953c2b2faa7`
- Bundle Identifier iOS reale: `com.centroesteticocristina.app2`
- Apple Team: `D8PM9KXLH7`
- Profilo build: `production` con `autoIncrement: true` in `eas.json`
- Submit iOS non-interattivo: `submit.production.ios.ascAppId = 6756626676`

## Attenzione importante su versioni iOS

Il progetto ha la cartella `ios/`, quindi per iOS fanno fede i valori nativi.

- `expo.version` in `app.json` **non basta** per il submit iOS
- la versione App Store è `CFBundleShortVersionString` in `ios/CentroEsteticoCristina/Info.plist`
- il build number viene incrementato automaticamente da EAS (`autoIncrement: true`)

Errore ricevuto: `You've already submitted this version of the app`.

Significa che hai provato a reinviare la stessa `CFBundleShortVersionString`.

## Flusso corretto (release iOS)

1. Aggiorna versione marketing iOS (prima della build)

	File: `ios/CentroEsteticoCristina/Info.plist`

	```xml
	<key>CFBundleShortVersionString</key>
	<string>1.1.2</string>
	```

2. Build produzione

	```bash
	eas build --platform ios --profile production
	```

3. Submit dell'ultima build

	```bash
	eas submit --platform ios --latest
	```

4. Verifica su App Store Connect

	- Build ricevuta
	- Versione app corretta (es. `1.1.2`)
	- Build number incrementato (automatico)

## Comandi utili

```bash
# aggiornare la CLI (consigliato)
npm install -g eas-cli

# login EAS
eas login

# stato credenziali iOS
eas credentials
```

## Troubleshooting rapido

- `Specified value for ios.bundleIdentifier ... is ignored`
  - normale con cartella `ios/` presente; usa il bundle id nativo (`app2`)

- `You've already submitted this version of the app`
  - incrementa `CFBundleShortVersionString` (es. `1.1.2` → `1.1.3`), poi rifai build+submit

- problemi credenziali/certificati
  - apri `eas credentials` e rigenera/sincronizza se necessario

## Checklist pre-submit

1. Versione iOS incrementata in `Info.plist`
2. `eas build --platform ios --profile production` completata
3. `eas submit --platform ios --latest` completato
4. Build visibile in App Store Connect
