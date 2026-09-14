# FinanzaChiara

App React che spiega la bolletta della luce e il costo di un prestito a chi non ha competenze finanziarie.
Ogni spiegazione ha **tre livelli di dettaglio** scelti dall'utente — `semplice`, `normale`, `tecnico` — persistiti in `localStorage`.

> **Principio guida:** l'app descrive come funziona un numero, non consiglia cosa fare.
> Nessun consiglio, nessun backend, nessuna chiamata di rete.

---

## Requisiti

| Strumento | Versione minima |
|-----------|----------------|
| Node.js   | 18.x            |
| npm       | 9.x             |

---

## Installazione e avvio

```bash
npm install
npm run dev
```

Vite avvia un server di sviluppo con hot reload. L'app è disponibile su **http://localhost:5173** (porta di default di Vite; se già occupata, Vite sceglie la successiva libera e lo indica in console).

---

## Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo con hot reload |
| `npm run build` | Compila l'app di produzione in `dist/` |
| `npm run preview` | Serve il contenuto di `dist/` in locale (dopo `build`) |
| `npm run lint` | Controlla il codice con ESLint |
| `npm run test` | Esegue la suite di test con Vitest |

---

## Utilizzo dell'app

### Scelta del livello di dettaglio

In alto nella schermata è sempre visibile il selettore del livello. Il livello scelto si applica a tutti i testi dell'app e viene salvato automaticamente nel browser (`localStorage` → chiave `finanzachiara_level`).

| Livello | A chi si rivolge |
|---------|-----------------|
| `semplice` | Chi vuole solo capire il numero in poche parole |
| `normale` | Chi vuole un po' di contesto in più |
| `tecnico` | Chi vuole la spiegazione completa con i meccanismi |

### Viste principali

**Hub (`hub`)**
Schermata iniziale. L'utente sceglie la situazione che vuole esplorare: bolletta della luce o simulazione prestito.

**Bolletta (`bolletta`)**
Mostra una bolletta di esempio con le voci disaggregate (energia, oneri, imposte). Per ogni voce è disponibile una spiegazione al livello scelto. È presente una simulazione dei consumi per fascia oraria basata su dati fissi definiti in `src/data/bolletta.js`.

**Rata (`rata`)**
Permette di inserire importo, durata e tasso di interesse di un prestito e mostra la rata mensile calcolata con la formula dell'ammortamento alla francese. Il grafico (Recharts) visualizza l'evoluzione di quota capitale e quota interessi nel tempo. I parametri di default si trovano in `src/data/rata.js`.

**Glossario**
Pannello apribile da qualsiasi vista. Contiene le definizioni dei termini tecnici usati nell'app (es. TAEG, quota capitale, F1/F2/F3). Le definizioni sono in `src/data/glossario.js` e rispettano anch'esse i tre livelli di dettaglio.

---

## Struttura del progetto

```
finanzachiara/
├── src/
│   ├── components/
│   │   ├── Hub/          # Schermata iniziale
│   │   ├── Bolletta/     # Vista bolletta e simulazione consumi
│   │   ├── Rata/         # Vista prestito e piano di ammortamento
│   │   ├── Glossario/    # Pannello glossario
│   │   └── Header/       # Barra di navigazione e selettore livello
│   ├── context/
│   │   └── AppContext.jsx # Stato globale (livello, vista attiva)
│   ├── data/
│   │   ├── bolletta.js   # Dati di esempio della bolletta
│   │   ├── rata.js       # Parametri di default del prestito
│   │   └── glossario.js  # Definizioni dei termini tecnici
│   ├── utils/            # Funzioni di calcolo (ammortamento, ecc.)
│   └── main.jsx          # Entry point React
├── tests/                # Suite Vitest + Testing Library
├── docs/
│   └── superpowers/
│       ├── specs/        # Design doc
│       └── plans/        # Piano di implementazione
├── dist/                 # Output della build (generato)
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## Stato globale

Tutto lo stato condiviso transita attraverso il hook `useApp()` esportato da `src/context/AppContext.jsx`. Nessun componente legge il Context direttamente.

```js
const { livello, setLivello, vista, setVista } = useApp();
```

| Campo | Tipo | Valori possibili |
|-------|------|-----------------|
| `livello` | string | `'semplice'` · `'normale'` · `'tecnico'` |
| `vista` | string | `'hub'` · `'bolletta'` · `'rata'` |

---

## Convenzioni di sviluppo

- **Italiano ovunque**: UI, label, commenti, messaggi di commit.
- Stato globale solo via `useApp()`.
- Grafici esclusivamente con **Recharts**; nessun SVG scritto a mano.
- CSS in file separati accanto al componente; inline style solo per valori calcolati a runtime.
- Nessun backend, nessuna API key, nessuna chiamata di rete.
- I numeri mostrati devono essere matematicamente corretti: una simulazione che inventa la matematica è più dannosa di una che non esiste.

---

## Test

```bash
npm run test
```

La suite usa **Vitest** con ambiente `jsdom` e **Testing Library**. I test si trovano in `tests/`. I worktree degli agent sono esclusi automaticamente dalla raccolta (`exclude` in `vite.config.js`).

---

## Build di produzione

```bash
npm run build
npm run preview   # verifica locale dell'output
```

L'output viene scritto in `dist/`. L'app è completamente statica: può essere servita da qualsiasi CDN o hosting di file statici senza configurazione server-side.

---

## Documentazione interna

| File | Contenuto |
|------|-----------|
| `docs/superpowers/specs/2026-09-14-finanzachiara-design.md` | Design doc completo |
| `docs/superpowers/plans/2026-09-14-finanzachiara-mvp.md` | Piano di implementazione (fonte di verità) |
| `docs/pipeline-state.json` | Stato del pipeline e mapping Issue GitHub |
| `CLAUDE.md` | Istruzioni per gli agenti AI che lavorano sul progetto |
