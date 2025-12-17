// Script per resettare AsyncStorage
// Esegui con: node reset-app.js

const STORAGE_KEYS = [
  '@clienti',
  '@trattamenti',
  '@promozioni',
  '@tipi_trattamento',
  '@impostazioni',
];

console.log('Per resettare l\'app, apri la console del simulatore e digita:');
console.log('');
console.log('AsyncStorage.clear().then(() => console.log("App resettata!"));');
console.log('');
console.log('Oppure riavvia l\'app e cancella i dati dalle impostazioni iOS del simulatore.');
