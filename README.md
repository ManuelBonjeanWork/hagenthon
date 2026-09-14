# FinanzaChiara

App React che spiega la bolletta della luce e il costo di un prestito a chi non
ha competenze finanziarie. Ogni spiegazione ha tre livelli di dettaglio scelti
dall'utente — **semplice**, **normale**, **tecnico** — persistiti in
`localStorage`.

L'app descrive come funziona un numero, non consiglia cosa fare: nessun
consiglio, nessun backend, nessuna chiamata di rete. Tutti i dati (bolletta,
glossario, parametri del prestito) sono di esempio, definiti in `src/data/`.

## Avvio

```bash
npm install
npm run dev
```

Vite serve l'app in locale con hot reload.

## Verifica

```bash
npm run lint   # ESLint
npm run test   # suite Vitest (jsdom + Testing Library)
npm run build  # build di produzione in dist/
```

## Struttura

- `src/components/Hub` — schermata iniziale, scelta della situazione
- `src/components/Bolletta` — lettura della bolletta e simulazione consumi
- `src/components/Rata` — costo di un prestito e grafico del piano di ammortamento
- `src/components/Glossario` — glossario dei termini tecnici, apribile da ovunque
- `src/context/AppContext.jsx` — stato globale (livello di dettaglio, vista attiva)
- `docs/superpowers/` — design doc e piano di implementazione del progetto
