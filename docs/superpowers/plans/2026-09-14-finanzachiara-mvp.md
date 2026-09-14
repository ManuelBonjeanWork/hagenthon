# FinanzaChiara MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire l'MVP di FinanzaChiara — web app React + Vite per l'educazione finanziaria con bolletta interattiva, simulatore rata e glossario, in 5 ore con 2 sviluppatori in parallelo.

**Architecture:** App client-side React + Vite senza backend. Stato globale via React Context (livello linguistico, view attiva, glossario aperto). Navigazione tramite stato (no router). Contenuto finanziario interamente pre-scritto in file `data/`.

**Tech Stack:** React 18, Vite 5, Recharts 2, Vitest + React Testing Library (unit test), localStorage per persistenza livello.

**Spec:** `docs/superpowers/specs/2026-09-14-finanzachiara-design.md`

## Global Constraints

- React 18 + Vite 5 — `npm create vite@latest finanzachiara -- --template react`
- Recharts `^2.x` — unica libreria di charting, nessun SVG custom
- Nessun backend, nessuna API key, tutto client-side
- Nessuna raccomandazione finanziaria nel copy — solo spiegazioni ed esposizione matematica
- Livelli linguistici: `"semplice"` | `"normale"` | `"tecnico"` (stringhe esatte, case-sensitive)
- Viste: `"hub"` | `"bolletta"` | `"rata"` (stringhe esatte)
- `localStorage` key: `"finanzachiara_level"` per persistenza livello
- Italiano ovunque — testi UI, label, commenti nel codice
- Vitest per unit test (`npm run test`), React Testing Library per component test

## Assegnazione parallela (5 ore, 2 persone)

| Ora | Persona A | Persona B |
|-----|-----------|-----------|
| 0–1 | Task 1: Setup + AppContext | Task 2: Data Layer |
| 1–2 | Task 3: Header + HubView | Task 4: BillViewer + BillVoce |
| 2–3 | Task 5: ExplanationPanel | Task 6: SimulationPanel |
| 3–4 | Task 7: GlossaryPanel | Task 8: RataRoom |
| 4–5 | Task 9: Integrazione + polish | Task 9: Integrazione + polish |

---

## File Map

```
finanzachiara/
├── src/
│   ├── App.jsx                          — provider Context + switch vista
│   ├── App.css                          — reset + variabili CSS globali
│   ├── context/
│   │   └── AppContext.jsx               — state: level, view, glossaryOpen, activeTerm, activeVoce
│   ├── data/
│   │   ├── bolletta.js                  — 7 voci con spiegazioni a 3 livelli + parametri simulazione
│   │   ├── glossario.js                 — 25 termini con spiegazioni a 3 livelli
│   │   └── rata.js                      — testi contestuali RataRoom a 3 livelli
│   ├── utils/
│   │   └── loanCalculator.js            — calcolaRata(), calcolaPianoAmmortamento()
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.jsx               — logo + LevelSelector + GlossaryButton
│   │   │   └── LevelSelector.jsx        — toggle 3 livelli con localStorage
│   │   ├── Hub/
│   │   │   ├── HubView.jsx              — griglia 3 situation cards
│   │   │   └── SituationCard.jsx        — singola card con emoji + titolo + descrizione
│   │   ├── Bolletta/
│   │   │   ├── BollettaRoom.jsx         — layout 2 colonne + SimulationPanel
│   │   │   ├── BillViewer.jsx           — lista voci bolletta interattiva
│   │   │   ├── BillVoce.jsx             — singola riga cliccabile con colore zona
│   │   │   ├── ExplanationPanel.jsx     — spiegazione voce selezionata + barra % + link glossario
│   │   │   └── SimulationPanel.jsx      — slider consumo/potenza/fascia + ricalcolo live
│   │   ├── Rata/
│   │   │   ├── RataRoom.jsx             — layout form + visualizer + spiegazione
│   │   │   ├── LoanForm.jsx             — 3 input (importo, durata, tasso) controlled
│   │   │   └── LoanVisualizer.jsx       — riepilogo numerico + BarChart Recharts
│   │   └── Glossario/
│   │       ├── GlossaryPanel.jsx        — slide-in overlay + lista per lettera
│   │       ├── GlossarySearch.jsx       — input ricerca controllato
│   │       └── GlossaryTerm.jsx         — singolo termine espandibile
└── tests/
    ├── loanCalculator.test.js
    ├── AppContext.test.jsx
    ├── LevelSelector.test.jsx
    └── SimulationPanel.test.jsx
```

---

## Task 1 — Setup progetto + AppContext
**Persona A | Ora 0–1**

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.css`
- Create: `src/context/AppContext.jsx`
- Create: `tests/AppContext.test.jsx`

**Interfaces:**
- Produces: hook `useApp()` → `{ currentLevel, setLevel, activeView, setView, glossaryOpen, setGlossaryOpen, activeGlossaryTerm, setActiveGlossaryTerm, activeVoce, setActiveVoce }`
- Produces: `<AppProvider>` wrapper component

---

- [ ] **Step 1: Scaffolding progetto**

```bash
npm create vite@latest finanzachiara -- --template react
cd finanzachiara
npm install
npm install recharts
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Configura Vitest in `vite.config.js`**

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 3: Crea `tests/setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Scrivi test fallente per AppContext**

```jsx
// tests/AppContext.test.jsx
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useApp } from '../src/context/AppContext'

function Probe() {
  const { currentLevel, setLevel, activeView, setView, glossaryOpen, setGlossaryOpen } = useApp()
  return (
    <div>
      <span data-testid="level">{currentLevel}</span>
      <span data-testid="view">{activeView}</span>
      <span data-testid="glossary">{String(glossaryOpen)}</span>
      <button onClick={() => setLevel('tecnico')}>setLevel</button>
      <button onClick={() => setView('bolletta')}>setView</button>
      <button onClick={() => setGlossaryOpen(true)}>openGlossary</button>
    </div>
  )
}

describe('AppContext', () => {
  it('ha valori iniziali corretti', () => {
    render(<AppProvider><Probe /></AppProvider>)
    expect(screen.getByTestId('level')).toHaveTextContent('semplice')
    expect(screen.getByTestId('view')).toHaveTextContent('hub')
    expect(screen.getByTestId('glossary')).toHaveTextContent('false')
  })

  it('aggiorna currentLevel', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('setLevel'))
    expect(screen.getByTestId('level')).toHaveTextContent('tecnico')
  })

  it('aggiorna activeView', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('setView'))
    expect(screen.getByTestId('view')).toHaveTextContent('bolletta')
  })

  it('apre il glossario', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('openGlossary'))
    expect(screen.getByTestId('glossary')).toHaveTextContent('true')
  })
})
```

- [ ] **Step 5: Esegui test — verifica FAIL**

```bash
npm run test
```
Atteso: FAIL — `AppContext` non esiste ancora.

- [ ] **Step 6: Crea `src/context/AppContext.jsx`**

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const LEVELS = ['semplice', 'normale', 'tecnico']
const LS_KEY = 'finanzachiara_level'

export function AppProvider({ children }) {
  const [currentLevel, setCurrentLevel] = useState(() => {
    const saved = localStorage.getItem(LS_KEY)
    return LEVELS.includes(saved) ? saved : 'semplice'
  })
  const [activeView, setActiveView] = useState('hub')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState(null)
  const [activeVoce, setActiveVoce] = useState(null)

  function setLevel(level) {
    if (!LEVELS.includes(level)) return
    setCurrentLevel(level)
    localStorage.setItem(LS_KEY, level)
  }

  function setView(view) {
    setActiveView(view)
  }

  function openGlossaryTerm(termId) {
    setActiveGlossaryTerm(termId)
    setGlossaryOpen(true)
  }

  return (
    <AppContext.Provider value={{
      currentLevel, setLevel,
      activeView, setView,
      glossaryOpen, setGlossaryOpen,
      activeGlossaryTerm, setActiveGlossaryTerm,
      openGlossaryTerm,
      activeVoce, setActiveVoce,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve essere usato dentro AppProvider')
  return ctx
}
```

- [ ] **Step 7: Crea `src/App.jsx`**

```jsx
import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header/Header'
import HubView from './components/Hub/HubView'
import BollettaRoom from './components/Bolletta/BollettaRoom'
import RataRoom from './components/Rata/RataRoom'
import GlossaryPanel from './components/Glossario/GlossaryPanel'
import './App.css'

function AppContent() {
  const { activeView } = useApp()
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {activeView === 'hub' && <HubView />}
        {activeView === 'bolletta' && <BollettaRoom />}
        {activeView === 'rata' && <RataRoom />}
      </main>
      <GlossaryPanel />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
```

- [ ] **Step 8: Crea `src/App.css` con variabili e reset**

```css
:root {
  --color-primary: #2563eb;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-zona-energia: #3b82f6;
  --color-zona-potenza: #eab308;
  --color-zona-oneri: #f97316;
  --color-zona-trasporto: #ef4444;
  --color-zona-imposte: #8b5cf6;
  --color-zona-totale: #1e293b;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: var(--color-bg); color: var(--color-text); }
.app { min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
button { cursor: pointer; }
```

- [ ] **Step 9: Verifica test passano**

```bash
npm run test
```
Atteso: 4 test PASS.

- [ ] **Step 10: Avvia dev server e verifica che l'app si carichi senza errori**

```bash
npm run dev
```
Apri `http://localhost:5173` — la pagina deve caricarsi (anche vuota, senza errori in console).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: setup progetto + AppContext con test"
```

---

## Task 2 — Data Layer (bolletta, glossario, loanCalculator)
**Persona B | Ora 0–1**

**Files:**
- Create: `src/data/bolletta.js`
- Create: `src/data/glossario.js`
- Create: `src/data/rata.js`
- Create: `src/utils/loanCalculator.js`
- Create: `tests/loanCalculator.test.js`

**Interfaces:**
- Produces: `bollettaVoci` — array di oggetti `{ id, label, colore, importo, spiegazione: {semplice, normale, tecnico}, terminiGlossario: string[], parametroSimulazione? }`
- Produces: `TOTALE_BOLLETTA` — number (79.09)
- Produces: `glossario` — array `{ id, termine, lettera, spiegazione: {semplice, normale, tecnico}, correlati: string[] }`
- Produces: `rataContesti` — object `{ spiegazione: {semplice, normale, tecnico} }`
- Produces: `calcolaRata(P: number, tassoAnnuo: number, mesi: number): number`
- Produces: `calcolaPianoAmmortamento(P: number, tassoAnnuo: number, mesi: number): Array<{mese, rata, capitale, interessi, debitoResiduo}>`

---

- [ ] **Step 1: Scrivi test fallenti per loanCalculator**

```js
// tests/loanCalculator.test.js
import { describe, it, expect } from 'vitest'
import { calcolaRata, calcolaPianoAmmortamento } from '../src/utils/loanCalculator'

describe('calcolaRata', () => {
  it('calcola rata corretta per €10.000, 36 mesi, 7.5%', () => {
    expect(calcolaRata(10000, 7.5, 36)).toBeCloseTo(310.84, 1)
  })

  it('gestisce tasso zero — rata = P / mesi', () => {
    expect(calcolaRata(12000, 0, 12)).toBeCloseTo(1000, 1)
  })

  it('rata positiva per input validi', () => {
    expect(calcolaRata(5000, 5, 24)).toBeGreaterThan(0)
  })
})

describe('calcolaPianoAmmortamento', () => {
  it('restituisce array di lunghezza pari ai mesi', () => {
    expect(calcolaPianoAmmortamento(10000, 7.5, 36)).toHaveLength(36)
  })

  it('ogni elemento ha i campi attesi', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano[0]).toMatchObject({
      mese: 1,
      rata: expect.any(Number),
      capitale: expect.any(Number),
      interessi: expect.any(Number),
      debitoResiduo: expect.any(Number),
    })
  })

  it('debito residuo ultimo mese ≈ 0', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano[35].debitoResiduo).toBeCloseTo(0, 0)
  })

  it('la somma di capitale rimborsa P', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    const totCapitale = piano.reduce((s, r) => s + r.capitale, 0)
    expect(totCapitale).toBeCloseTo(10000, 0)
  })
})
```

- [ ] **Step 2: Esegui test — verifica FAIL**

```bash
npm run test tests/loanCalculator.test.js
```
Atteso: FAIL — `loanCalculator` non esiste.

- [ ] **Step 3: Crea `src/utils/loanCalculator.js`**

```js
/**
 * Ammortamento alla francese — rate costanti, quota interessi decrescente.
 * @param {number} P - capitale iniziale (€)
 * @param {number} tassoAnnuo - tasso annuo in percentuale (es. 7.5 per 7.5%)
 * @param {number} mesi - durata in mesi
 * @returns {number} rata mensile
 */
export function calcolaRata(P, tassoAnnuo, mesi) {
  const r = tassoAnnuo / 100 / 12
  if (r === 0) return P / mesi
  return P * (r * Math.pow(1 + r, mesi)) / (Math.pow(1 + r, mesi) - 1)
}

/**
 * Calcola il piano di ammortamento completo.
 * @returns {Array<{mese, rata, capitale, interessi, debitoResiduo}>}
 */
export function calcolaPianoAmmortamento(P, tassoAnnuo, mesi) {
  const rata = calcolaRata(P, tassoAnnuo, mesi)
  const r = tassoAnnuo / 100 / 12
  let debito = P
  return Array.from({ length: mesi }, (_, i) => {
    const interessi = debito * r
    const capitale = rata - interessi
    debito -= capitale
    return {
      mese: i + 1,
      rata,
      capitale,
      interessi,
      debitoResiduo: Math.max(debito, 0),
    }
  })
}

/** Formatta un numero come euro: €1.234,56 */
export function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}
```

- [ ] **Step 4: Verifica test passano**

```bash
npm run test tests/loanCalculator.test.js
```
Atteso: 7 test PASS.

- [ ] **Step 5: Crea `src/data/bolletta.js`**

```js
export const TOTALE_BOLLETTA = 79.09

export const bollettaVoci = [
  {
    id: 'quota-energia',
    label: 'Quota Energia (F1 / F2 / F3)',
    colore: 'energia',
    importo: 42.30,
    spiegazione: {
      semplice: 'Questi sono i soldi che paghi per l\'elettricità che hai usato davvero. Come pagare per quello che mangi al ristorante — solo quello che consumi.',
      normale: 'È il costo dei kWh consumati, diviso in fasce orarie: F1 (ore di punta, di giorno nei giorni feriali, più cara), F2 e F3 (sera e notte/festivi, meno care).',
      tecnico: 'Corrispettivo variabile calcolato sui kWh prelevati, differenziato per fascia oraria F1/F2/F3 secondo la delibera ARERA 654/2015/R/eel e aggiornamenti trimestrali.',
    },
    terminiGlossario: ['kwh', 'fascia-oraria', 'f1-f2-f3', 'quota-energia'],
    // usato dalla SimulationPanel: questa voce varia con il consumo
    variaConConsumo: true,
  },
  {
    id: 'quota-potenza',
    label: 'Quota Potenza impegnata',
    colore: 'potenza',
    importo: 8.50,
    spiegazione: {
      semplice: 'È come un "affitto" per avere la corrente disponibile in casa, anche se non la usi. Lo paghi ogni mese indipendentemente da quanto consumi.',
      normale: 'Dipende dalla potenza contrattuale (di solito 3 kW per un\'abitazione). Se usi molti elettrodomestici insieme, potresti aver bisogno di più potenza — e il costo sale.',
      tecnico: 'Quota fissa proporzionale alla potenza impegnata contrattualmente (kW), fatturata in €/kW/mese secondo i corrispettivi di potenza definiti da ARERA.',
    },
    terminiGlossario: ['potenza-impegnata', 'quota-potenza'],
    variaConConsumo: false,
  },
  {
    id: 'oneri-sistema',
    label: 'Oneri di Sistema',
    colore: 'oneri',
    importo: 11.20,
    spiegazione: {
      semplice: 'Sono costi fissi che tutti i clienti italiani pagano, indipendentemente da quanto consumano. Servono a mantenere la rete elettrica nazionale e finanziare le energie rinnovabili. Non puoi evitarli.',
      normale: 'Sono componenti tariffarie stabilite dall\'ARERA: A3 (incentivi energie rinnovabili), UC1/UC3 (qualità del servizio), MCT (compensazioni territoriali). Uguali per tutti, non negoziabili.',
      tecnico: 'Componenti tariffarie ex delibera ARERA ARG/elt 199/11: A3 (incentivi FER), UC1 (recupero oneri norme CEE), UC3 (copertura qualità), MCT (misure compensazione territoriale). Indipendenti dal profilo di consumo.',
    },
    terminiGlossario: ['oneri-sistema', 'arera', 'dispacciamento'],
    variaConConsumo: false,
  },
  {
    id: 'trasporto-contatore',
    label: 'Trasporto e gestione contatore',
    colore: 'trasporto',
    importo: 6.80,
    spiegazione: {
      semplice: 'Sono i costi per portare la corrente dalla centrale elettrica fino a casa tua, e per tenere in funzione il contatore che misura quanta ne usi.',
      normale: 'Comprende la quota di distribuzione (rete locale) e trasmissione (rete nazionale), più la quota fissa per la gestione e lettura del contatore.',
      tecnico: 'Corrispettivi di distribuzione, trasmissione e misura dell\'energia, definiti dall\'ARERA nell\'ambito della regolazione tariffaria delle reti.',
    },
    terminiGlossario: ['quota-fissa', 'contatore'],
    variaConConsumo: false,
  },
  {
    id: 'accisa',
    label: 'Imposta: Accisa energia',
    colore: 'imposte',
    importo: 3.10,
    spiegazione: {
      semplice: 'È una tassa dello Stato sull\'energia elettrica. Tutti la pagano, è obbligatoria per legge.',
      normale: 'L\'accisa è un\'imposta di consumo applicata ai kWh. Per uso domestico è €0.0227/kWh fino a 1.800 kWh/mese, poi aliquota piena.',
      tecnico: 'Imposta di consumo ex D.Lgs. 26/2007 (Testo Unico Accise). Aliquota ridotta per uso domestico: €0.0227/kWh per i primi 1.800 kWh/mese; aliquota ordinaria €0.0460/kWh oltre tale soglia.',
    },
    terminiGlossario: ['accisa', 'iva'],
    variaConConsumo: true,
  },
  {
    id: 'iva',
    label: 'Imposta: IVA 10%',
    colore: 'imposte',
    importo: 7.19,
    spiegazione: {
      semplice: 'È l\'IVA, la tassa che si paga su quasi tutto. Per l\'elettricità di casa è al 10% (meno del solito 22%) perché è considerata un bene essenziale.',
      normale: 'L\'IVA al 10% si applica all\'uso domestico dell\'energia elettrica. Se la fornitura fosse per uso professionale, l\'IVA salirebbe al 22%.',
      tecnico: 'IVA agevolata al 10% ai sensi dell\'art. 127-bis DPR 633/72, applicabile alle forniture di energia elettrica per uso domestico. Aliquota ordinaria 22% per altri usi.',
    },
    terminiGlossario: ['iva'],
    variaConConsumo: true,
  },
]
```

- [ ] **Step 6: Crea `src/data/glossario.js`**

```js
export const glossario = [
  { id: 'accisa', termine: 'Accisa', lettera: 'A', spiegazione: { semplice: 'Una tassa dello Stato che si paga sull\'energia che consumi. È fissa per legge.', normale: 'Imposta di consumo applicata ai kWh di elettricità o ai metri cubi di gas. L\'aliquota è ridotta per uso domestico.', tecnico: 'Imposta di consumo ex D.Lgs. 26/2007 (TUA). Aliquota ridotta per uso domestico: €0.0227/kWh fino a 1.800 kWh/mese; ordinaria €0.0460/kWh oltre.' }, correlati: ['iva', 'quota-energia'] },
  { id: 'ammortamento', termine: 'Ammortamento', lettera: 'A', spiegazione: { semplice: 'È il processo di rimborso graduale di un debito. Ogni mese paghi una rata che comprende una parte del debito e una parte di "affitto" del denaro.', normale: 'Piano di rimborso di un prestito in rate periodiche. All\'inizio si paga più interessi, verso la fine più capitale.', tecnico: 'Processo di estinzione graduale di un\'obbligazione finanziaria mediante versamenti periodici. L\'ammortamento alla francese prevede rate costanti con quota capitale crescente e quota interessi decrescente.' }, correlati: ['rata', 'interessi', 'capitale'] },
  { id: 'arera', termine: 'ARERA', lettera: 'A', spiegazione: { semplice: 'È l\'ente del governo che decide le regole e i prezzi dell\'energia in Italia. Non è il tuo fornitore — è l\'arbitro.', normale: 'Autorità di Regolazione per Energia Reti e Ambiente. Stabilisce le tariffe regolate (trasporto, oneri di sistema) e protegge i consumatori.', tecnico: 'Autorità indipendente istituita dalla L. 481/1995. Definisce la regolazione tariffaria, le condizioni di accesso alle reti e gli standard di qualità dei servizi energetici.' }, correlati: ['oneri-sistema', 'quota-potenza'] },
  { id: 'capitale', termine: 'Capitale', lettera: 'C', spiegazione: { semplice: 'È la somma di denaro che hai preso in prestito. Ogni rata che paghi restituisce un po\' di questo importo.', normale: 'La quota di ogni rata destinata a ridurre il debito originario. Aumenta nel tempo man mano che gli interessi diminuiscono.', tecnico: 'Quota capitale della rata: differenza tra la rata costante e la quota interessi calcolata sul debito residuo.' }, correlati: ['rata', 'interessi', 'ammortamento'] },
  { id: 'contatore', termine: 'Contatore', lettera: 'C', spiegazione: { semplice: 'Il dispositivo che misura quanta elettricità usi. Come il chilometrico di un\'auto — conta quello che consumi.', normale: 'Strumento di misura dell\'energia prelevata dalla rete. Il contatore elettronico trasmette le letture automaticamente al distributore.', tecnico: 'Misuratore di energia elettrica (punto di prelievo). I contatori di seconda generazione (2G) trasmettono teleletture ogni 15 minuti al sistema di acquisizione del distributore.' }, correlati: ['quota-potenza', 'quota-energia'] },
  { id: 'dispacciamento', termine: 'Dispacciamento', lettera: 'D', spiegazione: { semplice: 'È il lavoro di bilanciamento continuo della rete elettrica: quanta corrente entra deve essere uguale a quanta ne esce, ogni secondo.', normale: 'Servizio di gestione in tempo reale del bilanciamento tra produzione e consumo sulla rete elettrica nazionale. Gestito da Terna.', tecnico: 'Servizio di dispacciamento (SD) gestito da Terna S.p.A. come TSO. I costi di uplift e sbilanciamento sono socializzati tra tutti gli utenti attraverso le componenti UC.' }, correlati: ['oneri-sistema', 'arera'] },
  { id: 'estratto-conto', termine: 'Estratto conto', lettera: 'E', spiegazione: { semplice: 'È il riassunto mensile di tutto quello che hai fatto con il tuo conto in banca: entrate, uscite, saldo.', normale: 'Documento riepilogativo delle movimentazioni di un conto corrente in un periodo. Mostra saldo iniziale, ogni operazione e saldo finale.', tecnico: 'Rendiconto periodico delle operazioni di dare/avere su un conto corrente bancario, ex art. 119 TUB. Il cliente ha diritto di richiederne copia per 10 anni.' }, correlati: ['capitale', 'interessi'] },
  { id: 'f1-f2-f3', termine: 'F1 / F2 / F3', lettera: 'F', spiegazione: { semplice: 'Sono le fasce orarie in cui si divide la giornata per la luce: F1 è la più cara (giorno feriale), F3 la più economica (notte e festivi).', normale: 'F1: lunedì–venerdì 8–19 (picco). F2: lunedì–venerdì 7–8 e 19–23, sabato 7–23 (intermedio). F3: notti, domeniche, festivi (minimo). Prezzi crescenti da F3 a F1.', tecnico: 'Fasce orarie di valorizzazione dell\'energia definite dall\'ARERA. F1: ore di picco (lun-ven 8:00-19:00). F2: ore intermedie. F3: ore fuori picco. Rilevanti per tariffe biorarie e multiorarie.' }, correlati: ['fascia-oraria', 'quota-energia', 'kwh'] },
  { id: 'fascia-oraria', termine: 'Fascia oraria', lettera: 'F', spiegazione: { semplice: 'A seconda dell\'ora del giorno, l\'elettricità costa di più o di meno. Di notte costa meno — come i voli lowcost.', normale: 'Suddivisione della giornata in periodi con prezzi dell\'energia diversi. Usare elettrodomestici pesanti di notte o nel weekend può ridurre la bolletta.', tecnico: 'Struttura tariffaria time-of-use (TOU) che differenzia il corrispettivo dell\'energia per fascia F1/F2/F3. Rilevante per contratti monorari, biorari e multiorari.' }, correlati: ['f1-f2-f3', 'quota-energia'] },
  { id: 'inflazione', termine: 'Inflazione', lettera: 'I', spiegazione: { semplice: 'È l\'aumento generale dei prezzi nel tempo. Se l\'inflazione è alta, con gli stessi soldi compri meno cose rispetto all\'anno scorso.', normale: 'Misura la variazione percentuale del livello generale dei prezzi. In Italia è calcolata dall\'ISTAT con l\'indice dei prezzi al consumo (NIC e FOI).', tecnico: 'Variazione del livello aggregato dei prezzi misurata dagli indici ISTAT (CPI). Rilevante per l\'adeguamento di canoni, rate indicizzate e rivalutazione dei capitali.' }, correlati: ['spread', 'tasso-variabile'] },
  { id: 'interessi', termine: 'Interessi', lettera: 'I', spiegazione: { semplice: 'È il costo che paghi per aver preso in prestito dei soldi. Come un affitto per usare il denaro della banca.', normale: 'Quota della rata che remunera il prestatore per il rischio e per l\'uso del capitale. Si calcola sul debito residuo × tasso mensile.', tecnico: 'Quota interessi = debito residuo × (TAN annuo / 12). Decresce nel tempo nell\'ammortamento alla francese man mano che il debito residuo si riduce.' }, correlati: ['rata', 'capitale', 'tan', 'taeg'] },
  { id: 'iva', termine: 'IVA', lettera: 'I', spiegazione: { semplice: 'È la tassa che si paga su quasi tutti i prodotti e servizi. Di solito è 22%, ma per l\'energia di casa scende al 10% perché è un bene essenziale.', normale: 'Imposta sul Valore Aggiunto. Per forniture di energia elettrica ad uso domestico l\'aliquota è agevolata al 10%. Per uso professionale si applica il 22%.', tecnico: 'IVA agevolata 10% ex Tabella A, parte II-bis, allegata al DPR 633/72 per le forniture di energia elettrica ad uso domestico. Aliquota ordinaria 22% per altri usi.' }, correlati: ['accisa'] },
  { id: 'kwh', termine: 'kWh', lettera: 'K', spiegazione: { semplice: 'È l\'unità di misura dell\'elettricità. Un kWh è la quantità di energia usata da una lampadina da 1.000 watt accesa per un\'ora.', normale: 'Kilowattora: unità di energia equivalente a 1.000 watt consumati per 1 ora. Una lavatrice usa circa 1 kWh per ciclo, una TV LED circa 0.1 kWh/ora.', tecnico: 'Unità di misura dell\'energia elettrica attiva: 1 kWh = 3.6 MJ. Grandezza di riferimento per la fatturazione dell\'energia prelevata in regime di misura.' }, correlati: ['quota-energia', 'fascia-oraria', 'potenza-impegnata'] },
  { id: 'oneri-sistema', termine: 'Oneri di sistema', lettera: 'O', spiegazione: { semplice: 'Sono costi che tutti pagano per tenere in funzione la rete elettrica italiana e finanziare le energie rinnovabili. Non dipendono da quanto consumi.', normale: 'Componenti tariffarie stabilite dall\'ARERA che coprono: incentivi FER (A3), qualità del servizio (UC), compensazioni territoriali (MCT). Uguali per tutti i clienti.', tecnico: 'Componenti parafiscali ex delibera ARERA ARG/elt 199/11. Includono A3 (incentivi FER ex Conto Energia), UC1, UC3, UC6, MCT. Allocate in quota variabile (€/kWh) o fissa (€/mese) secondo il corrispettivo.' }, correlati: ['arera', 'dispacciamento', 'quota-fissa'] },
  { id: 'piano-rimborso', termine: 'Piano di rimborso', lettera: 'P', spiegazione: { semplice: 'È il calendario di tutti i pagamenti che farai per restituire un prestito: quando paghi, quanto paghi, e quanto debito rimane ogni mese.', normale: 'Tabella che elenca ogni rata con la suddivisione tra quota capitale e quota interessi, e il debito residuo dopo ogni pagamento.', tecnico: 'Prospetto analitico dell\'ammortamento: per ogni periodo mostra rata, quota interessi (debito residuo × r), quota capitale (rata - interessi) e debito residuo aggiornato.' }, correlati: ['ammortamento', 'rata', 'capitale'] },
  { id: 'potenza-impegnata', termine: 'Potenza impegnata', lettera: 'P', spiegazione: { semplice: 'È la quantità massima di elettricità che puoi usare contemporaneamente. Se superi questo limite, il contatore si stacca.', normale: 'La potenza contrattuale (tipicamente 3 kW per uso domestico). Determina quanti elettrodomestici puoi usare insieme. Aumentarla costa di più in bolletta.', tecnico: 'Potenza disponibile massima in kW definita dal contratto di fornitura. La quota di potenza in bolletta è proporzionale a questo valore. Il superamento attiva la protezione di massima corrente.' }, correlati: ['quota-potenza', 'contatore', 'kwh'] },
  { id: 'quota-energia', termine: 'Quota energia', lettera: 'Q', spiegazione: { semplice: 'La parte della bolletta che dipende da quanta elettricità hai usato davvero. Più consumi, più paghi.', normale: 'Componente variabile della bolletta calcolata moltiplicando i kWh consumati per il prezzo unitario di ciascuna fascia oraria.', tecnico: 'Corrispettivo variabile in €/kWh applicato ai prelievi rilevati per fascia F1/F2/F3. Aggiornato trimestralmente da ARERA per il mercato tutelato.' }, correlati: ['kwh', 'fascia-oraria', 'f1-f2-f3'] },
  { id: 'quota-fissa', terme: 'Quota fissa', lettera: 'Q', spiegazione: { semplice: 'È la parte della bolletta che paghi sempre, anche se non usi affatto la corrente. Come l\'abbonamento a uno streaming.', normale: 'Componente fissa mensile indipendente dai consumi. Copre i costi di gestione del contatore, trasporto e parte degli oneri di sistema.', tecnico: 'Corrispettivo fisso in €/mese (o €/punto di prelievo) che remunera i costi fissi di rete indipendenti dal volume di energia prelevata.' }, correlati: ['oneri-sistema', 'quota-potenza'] },
  { id: 'rata', termine: 'Rata', lettera: 'R', spiegazione: { semplice: 'È il pagamento periodico (di solito mensile) che fai per restituire un prestito. Ogni rata comprende una parte del debito e un po\' di interessi.', normale: 'Pagamento periodico di importo fisso (nell\'ammortamento alla francese) composto da quota capitale + quota interessi. La proporzione cambia nel tempo.', tecnico: 'Rata costante R = P × [r(1+r)^n] / [(1+r)^n - 1], dove P = capitale, r = tasso periodico, n = numero di periodi. La composizione interna varia: quota interessi decresce, quota capitale cresce.' }, correlati: ['ammortamento', 'capitale', 'interessi', 'tan'] },
  { id: 'spread', termine: 'Spread', lettera: 'S', spiegazione: { semplice: 'È il "ricarico" che la banca aggiunge al tasso base per guadagnare sul prestito. Più alto è, più paghi.', normale: 'Margine aggiunto dalla banca al tasso di riferimento (es. Euribor) per determinare il tasso variabile finale del mutuo.', tecnico: 'Componente del tasso di interesse che remunera il rischio di credito e il margine commerciale della banca. TAN = tasso indice (Euribor/IRS) + spread.' }, correlati: ['tan', 'taeg', 'tasso-variabile'] },
  { id: 'taeg', termine: 'TAEG', lettera: 'T', spiegazione: { semplice: 'È il costo totale del prestito in percentuale, tutto incluso. Il TAN è il prezzo del pane, il TAEG è quello che paghi alla cassa con sacchetto e scontrino.', normale: 'Tasso Annuo Effettivo Globale: include interessi (TAN) + tutte le spese accessorie (assicurazioni obbligatorie, commissioni di apertura, spese periodiche). È il numero da confrontare tra offerte diverse.', tecnico: 'Indicatore sintetico del costo del credito annuo calcolato secondo la direttiva 2008/48/CE (credito consumo) e 2014/17/UE (mutui). Inclusivo di tutti gli oneri noti al momento della stipula.' }, correlati: ['tan', 'rata', 'ammortamento'] },
  { id: 'tan', termine: 'TAN', lettera: 'T', spiegazione: { semplice: 'È il tasso di interesse "puro" di un prestito, senza contare le spese extra. Di solito è più basso del TAEG.', normale: 'Tasso Annuo Nominale: il tasso di interesse applicato al capitale, senza considerare spese e commissioni accessorie. Serve per calcolare la rata.', tecnico: 'Tasso nominale annuo utilizzato per il calcolo della quota interessi nelle rate. Non include commissioni, spese assicurative o oneri accessori (che confluiscono nel TAEG).' }, correlati: ['taeg', 'interessi', 'rata'] },
  { id: 'tasso-fisso', termine: 'Tasso fisso', lettera: 'T', spiegazione: { semplice: 'Il tasso non cambia mai per tutta la durata del prestito. La rata che paghi oggi è uguale a quella che pagherai tra 10 anni.', normale: 'Il tasso di interesse è definito al momento della stipula e rimane invariato per tutta la durata del contratto. Protegge dai rialzi dei tassi di mercato.', tecnico: 'Struttura a tasso fisso: TAN costante per l\'intera vita del finanziamento, indipendente dall\'andamento dei tassi di riferimento (Euribor, IRS). Trasferisce il rischio di tasso alla banca.' }, correlati: ['tasso-variabile', 'tan', 'spread'] },
  { id: 'tasso-variabile', termine: 'Tasso variabile', lettera: 'T', spiegazione: { semplice: 'Il tasso può cambiare nel tempo, di solito ogni 3 o 6 mesi. Se i tassi salgono, paghi di più; se scendono, paghi di meno.', normale: 'Il tasso è agganciato a un indice di riferimento (es. Euribor 3 mesi) + uno spread fisso. La rata varia al variare dell\'indice.', tecnico: 'TAN = indice di riferimento (Euribor 1/3/6 mesi, IRS) + spread contrattuale. La rata si ricalcola ad ogni reset periodico. Espone il mutuatario al rischio di tasso.' }, correlati: ['tasso-fisso', 'tan', 'spread', 'inflazione'] },
]
```

- [ ] **Step 7: Crea `src/data/rata.js`**

```js
export const rataContesti = {
  spiegazione: {
    semplice: 'All\'inizio paghi più interessi perché il debito è alto. Man mano che rimborsi, gli interessi scendono e rimborsi più debito. È normale — si chiama ammortamento.',
    normale: 'Nell\'ammortamento alla francese le rate sono costanti ma la composizione cambia: le prime rate hanno più interessi, le ultime quasi solo capitale. Il grafico mostra questa evoluzione.',
    tecnico: 'Piano di ammortamento alla francese (bullet): rata costante R, con quota interessi decrescente I_t = D_{t-1} × r e quota capitale crescente C_t = R - I_t. Il debito residuo D_t → 0 alla scadenza.',
  },
}

export const DURATE_DISPONIBILI = [12, 24, 36, 48, 60, 84, 120]
export const IMPORTO_DEFAULT = 10000
export const TASSO_DEFAULT = 7.5
export const DURATA_DEFAULT = 36
```

- [ ] **Step 8: Verifica che tutti i test passino**

```bash
npm run test
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: data layer bolletta, glossario, rata e loanCalculator"
```

---

## Task 3 — Header + LevelSelector + HubView
**Persona A | Ora 1–2**

**Files:**
- Create: `src/components/Header/Header.jsx`
- Create: `src/components/Header/Header.css`
- Create: `src/components/Header/LevelSelector.jsx`
- Create: `src/components/Hub/HubView.jsx`
- Create: `src/components/Hub/HubView.css`
- Create: `src/components/Hub/SituationCard.jsx`
- Create: `tests/LevelSelector.test.jsx`

**Interfaces:**
- Consumes: `useApp()` → `currentLevel`, `setLevel`, `setGlossaryOpen`, `setView`
- Produces: `<Header />` — rendered con logo, LevelSelector, bottone glossario
- Produces: `<HubView />` — rendered con 3 SituationCard
- Produces: `<SituationCard { emoji, titolo, descrizione, onClick } />`

---

- [ ] **Step 1: Scrivi test per LevelSelector**

```jsx
// tests/LevelSelector.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../src/context/AppContext'
import LevelSelector from '../src/components/Header/LevelSelector'

function renderWithCtx() {
  return render(<AppProvider><LevelSelector /></AppProvider>)
}

it('mostra i 3 livelli', () => {
  renderWithCtx()
  expect(screen.getByText(/semplice/i)).toBeInTheDocument()
  expect(screen.getByText(/chiaro/i)).toBeInTheDocument()
  expect(screen.getByText(/tecnico/i)).toBeInTheDocument()
})

it('semplice è attivo per default', () => {
  renderWithCtx()
  expect(screen.getByText(/semplice/i).closest('button')).toHaveClass('active')
})

it('clic su Tecnico aggiorna il livello', async () => {
  renderWithCtx()
  await userEvent.click(screen.getByText(/tecnico/i))
  expect(screen.getByText(/tecnico/i).closest('button')).toHaveClass('active')
})
```

- [ ] **Step 2: Esegui — verifica FAIL**

```bash
npm run test tests/LevelSelector.test.jsx
```

- [ ] **Step 3: Crea `src/components/Header/LevelSelector.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import './Header.css'

const LIVELLI = [
  { id: 'semplice', label: '🟢 Semplice' },
  { id: 'normale',  label: '🔵 Chiaro'   },
  { id: 'tecnico',  label: '🔬 Tecnico'  },
]

export default function LevelSelector() {
  const { currentLevel, setLevel } = useApp()
  return (
    <div className="level-selector">
      {LIVELLI.map(({ id, label }) => (
        <button
          key={id}
          className={`level-btn ${currentLevel === id ? 'active' : ''}`}
          onClick={() => setLevel(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Crea `src/components/Header/Header.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import LevelSelector from './LevelSelector'
import './Header.css'

export default function Header() {
  const { setGlossaryOpen, setView } = useApp()
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => setView('hub')}>
        💡 FinanzaChiara
      </button>
      <LevelSelector />
      <button className="glossary-btn" onClick={() => setGlossaryOpen(true)}>
        📖 Glossario
      </button>
    </header>
  )
}
```

- [ ] **Step 5: Crea `src/components/Header/Header.css`**

```css
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}

.logo-btn {
  font-size: 1.2rem;
  font-weight: 700;
  background: none;
  border: none;
  color: var(--color-primary);
  flex-shrink: 0;
}

.level-selector {
  display: flex;
  gap: 4px;
  background: var(--color-bg);
  padding: 4px;
  border-radius: var(--radius);
  margin-left: auto;
}

.level-btn {
  padding: 6px 14px;
  border: none;
  border-radius: calc(var(--radius) - 2px);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  transition: all 0.15s;
}

.level-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 600;
  box-shadow: var(--shadow);
}

.glossary-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  font-size: 0.875rem;
  flex-shrink: 0;
}
```

- [ ] **Step 6: Crea `src/components/Hub/SituationCard.jsx`**

```jsx
export default function SituationCard({ emoji, titolo, descrizione, onClick }) {
  return (
    <button className="situation-card" onClick={onClick}>
      <span className="card-emoji">{emoji}</span>
      <h2 className="card-titolo">{titolo}</h2>
      <p className="card-desc">{descrizione}</p>
    </button>
  )
}
```

- [ ] **Step 7: Crea `src/components/Hub/HubView.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import SituationCard from './SituationCard'
import './HubView.css'

const CARDS = [
  {
    id: 'bolletta',
    emoji: '⚡',
    titolo: 'La mia bolletta',
    descrizione: 'Capisco cosa pago voce per voce',
    view: 'bolletta',
  },
  {
    id: 'rata',
    emoji: '💳',
    titolo: 'Un prestito o una rata',
    descrizione: 'Scopro quanto costa davvero',
    view: 'rata',
  },
  {
    id: 'glossario',
    emoji: '📖',
    titolo: 'Parole difficili',
    descrizione: 'Cerco un termine che non capisco',
    view: null, // apre il glossario
  },
]

export default function HubView() {
  const { setView, setGlossaryOpen } = useApp()

  function handleCard(card) {
    if (card.view) setView(card.view)
    else setGlossaryOpen(true)
  }

  return (
    <div className="hub">
      <h1 className="hub-title">Cosa vuoi capire oggi?</h1>
      <div className="hub-grid">
        {CARDS.map(card => (
          <SituationCard
            key={card.id}
            emoji={card.emoji}
            titolo={card.titolo}
            descrizione={card.descrizione}
            onClick={() => handleCard(card)}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Crea `src/components/Hub/HubView.css`**

```css
.hub { text-align: center; padding: 48px 24px; }
.hub-title { font-size: 2rem; font-weight: 700; margin-bottom: 40px; }

.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.situation-card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 16px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  text-align: center;
}

.situation-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(37,99,235,0.15);
  transform: translateY(-2px);
}

.card-emoji { font-size: 2.5rem; }
.card-titolo { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.card-desc { font-size: 0.9rem; color: var(--color-text-muted); }
```

- [ ] **Step 9: Verifica test passano**

```bash
npm run test
```

- [ ] **Step 10: Verifica visiva nel browser** — Hub deve mostrare 3 card, LevelSelector funzionante

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: Header, LevelSelector e HubView"
```

---

## Task 4 — BillViewer + BillVoce
**Persona B | Ora 1–2**

**Files:**
- Create: `src/components/Bolletta/BillViewer.jsx`
- Create: `src/components/Bolletta/BillViewer.css`
- Create: `src/components/Bolletta/BillVoce.jsx`

**Interfaces:**
- Consumes: `bollettaVoci`, `TOTALE_BOLLETTA` da `src/data/bolletta.js`
- Consumes: `useApp()` → `activeVoce`, `setActiveVoce`
- Produces: `<BillViewer />` — lista voci cliccabili, seleziona `activeVoce` nel Context

---

- [ ] **Step 1: Crea `src/components/Bolletta/BillVoce.jsx`**

```jsx
export default function BillVoce({ voce, isActive, onClick }) {
  return (
    <button
      className={`bill-voce zona-${voce.colore} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <span className="voce-label">{voce.label}</span>
      <span className="voce-importo">€{voce.importo.toFixed(2)}</span>
    </button>
  )
}
```

- [ ] **Step 2: Crea `src/components/Bolletta/BillViewer.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import { bollettaVoci, TOTALE_BOLLETTA } from '../../data/bolletta'
import BillVoce from './BillVoce'
import './BillViewer.css'

export default function BillViewer() {
  const { activeVoce, setActiveVoce } = useApp()

  return (
    <div className="bill-viewer">
      <div className="bill-header">
        <h3>Bolletta Energia Elettrica</h3>
        <p className="bill-periodo">Periodo: agosto 2026</p>
      </div>
      <div className="bill-voci">
        {bollettaVoci.map(voce => (
          <BillVoce
            key={voce.id}
            voce={voce}
            isActive={activeVoce?.id === voce.id}
            onClick={() => setActiveVoce(voce.id === activeVoce?.id ? null : voce)}
          />
        ))}
      </div>
      <div className="bill-totale">
        <span>TOTALE DA PAGARE</span>
        <span className="totale-importo">€{TOTALE_BOLLETTA.toFixed(2)}</span>
      </div>
      <p className="bill-hint">👆 Clicca su una voce per capire cosa significa</p>
    </div>
  )
}
```

- [ ] **Step 3: Crea `src/components/Bolletta/BillViewer.css`**

```css
.bill-viewer {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.bill-header {
  background: #1e293b;
  color: white;
  padding: 16px 20px;
}
.bill-header h3 { font-size: 1rem; font-weight: 600; }
.bill-periodo { font-size: 0.8rem; opacity: 0.7; margin-top: 2px; }

.bill-voci { display: flex; flex-direction: column; }

.bill-voce {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 4px solid transparent;
}
.bill-voce:hover { background: var(--color-bg); }
.bill-voce.active { background: #eff6ff; }

.zona-energia { border-left-color: var(--color-zona-energia); }
.zona-potenza  { border-left-color: var(--color-zona-potenza);  }
.zona-oneri    { border-left-color: var(--color-zona-oneri);    }
.zona-trasporto{ border-left-color: var(--color-zona-trasporto);}
.zona-imposte  { border-left-color: var(--color-zona-imposte);  }

.voce-label { color: var(--color-text); flex: 1; }
.voce-importo { font-weight: 600; font-variant-numeric: tabular-nums; }

.bill-totale {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  background: #1e293b;
  color: white;
  font-weight: 700;
}
.totale-importo { font-size: 1.2rem; }

.bill-hint { text-align: center; padding: 10px; font-size: 0.8rem; color: var(--color-text-muted); }
```

- [ ] **Step 4: Verifica visiva** — dopo merge con Task 1, BillViewer deve mostrare le voci con colore laterale e click che attiva lo stato `active`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: BillViewer e BillVoce interattivi"
```

---

## Task 5 — ExplanationPanel
**Persona A | Ora 2–3**

**Files:**
- Create: `src/components/Bolletta/ExplanationPanel.jsx`
- Create: `src/components/Bolletta/ExplanationPanel.css`

**Interfaces:**
- Consumes: `useApp()` → `activeVoce`, `currentLevel`, `openGlossaryTerm`
- Consumes: `TOTALE_BOLLETTA` da `src/data/bolletta.js`
- Produces: `<ExplanationPanel />` — mostra spiegazione della voce selezionata

---

- [ ] **Step 1: Crea `src/components/Bolletta/ExplanationPanel.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import { TOTALE_BOLLETTA } from '../../data/bolletta'
import './ExplanationPanel.css'

const COLORI_ZONA = {
  energia:   '#3b82f6',
  potenza:   '#eab308',
  oneri:     '#f97316',
  trasporto: '#ef4444',
  imposte:   '#8b5cf6',
}

export default function ExplanationPanel() {
  const { activeVoce, currentLevel, openGlossaryTerm } = useApp()

  if (!activeVoce) {
    return (
      <div className="explanation-panel empty">
        <p className="empty-msg">👈 Seleziona una voce della bolletta per capire cosa significa</p>
      </div>
    )
  }

  const percentuale = ((activeVoce.importo / TOTALE_BOLLETTA) * 100).toFixed(1)
  const colore = COLORI_ZONA[activeVoce.colore] || '#94a3b8'

  return (
    <div className="explanation-panel">
      <div className="exp-header" style={{ borderLeftColor: colore }}>
        <h3 className="exp-label">{activeVoce.label}</h3>
        <span className="exp-importo">€{activeVoce.importo.toFixed(2)}</span>
      </div>

      <div className="exp-barra">
        <div className="barra-fill" style={{ width: `${percentuale}%`, background: colore }} />
        <span className="barra-pct">{percentuale}% della bolletta</span>
      </div>

      <p className="exp-testo">{activeVoce.spiegazione[currentLevel]}</p>

      {activeVoce.terminiGlossario?.length > 0 && (
        <div className="exp-termini">
          <span className="termini-label">Approfondisci nel glossario:</span>
          <div className="termini-list">
            {activeVoce.terminiGlossario.map(termId => (
              <button
                key={termId}
                className="termine-link"
                onClick={() => openGlossaryTerm(termId)}
              >
                → {termId.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crea `src/components/Bolletta/ExplanationPanel.css`**

```css
.explanation-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  min-height: 200px;
}

.explanation-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-msg { color: var(--color-text-muted); font-size: 0.95rem; text-align: center; }

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 4px solid;
  padding-left: 12px;
  margin-bottom: 16px;
}

.exp-label { font-size: 1rem; font-weight: 600; }
.exp-importo { font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; }

.exp-barra {
  position: relative;
  background: var(--color-bg);
  border-radius: 4px;
  height: 8px;
  margin-bottom: 8px;
}
.barra-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.barra-pct { font-size: 0.75rem; color: var(--color-text-muted); }

.exp-testo {
  margin-top: 16px;
  line-height: 1.6;
  font-size: 0.95rem;
  color: var(--color-text);
}

.exp-termini { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--color-border); }
.termini-label { font-size: 0.8rem; color: var(--color-text-muted); display: block; margin-bottom: 8px; }
.termini-list { display: flex; flex-wrap: wrap; gap: 8px; }
.termine-link {
  background: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.8rem;
  text-transform: capitalize;
}
.termine-link:hover { background: #eff6ff; }
```

- [ ] **Step 3: Crea `src/components/Bolletta/BollettaRoom.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import BillViewer from './BillViewer'
import ExplanationPanel from './ExplanationPanel'
import SimulationPanel from './SimulationPanel'
import './BollettaRoom.css'

export default function BollettaRoom() {
  const { setView } = useApp()
  return (
    <div className="bolletta-room">
      <button className="back-btn" onClick={() => setView('hub')}>← Torna alla home</button>
      <h1 className="room-title">⚡ La tua bolletta della luce</h1>
      <div className="bolletta-grid">
        <BillViewer />
        <ExplanationPanel />
      </div>
      <SimulationPanel />
    </div>
  )
}
```

- [ ] **Step 4: Crea `src/components/Bolletta/BollettaRoom.css`**

```css
.bolletta-room { display: flex; flex-direction: column; gap: 24px; }
.back-btn { align-self: flex-start; background: none; border: none; color: var(--color-primary); font-size: 0.9rem; padding: 0; }
.room-title { font-size: 1.5rem; font-weight: 700; }
.bolletta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .bolletta-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Verifica visiva** — clic su voce bolletta → ExplanationPanel aggiornato con percentuale e link glossario

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ExplanationPanel e BollettaRoom layout"
```

---

## Task 6 — SimulationPanel
**Persona B | Ora 2–3**

**Files:**
- Create: `src/components/Bolletta/SimulationPanel.jsx`
- Create: `src/components/Bolletta/SimulationPanel.css`
- Create: `tests/SimulationPanel.test.jsx`

**Interfaces:**
- Consumes: `bollettaVoci`, `TOTALE_BOLLETTA` da `src/data/bolletta.js`
- Produces: `<SimulationPanel />` — slider consumo/potenza/fascia + ricalcolo live

---

- [ ] **Step 1: Scrivi test per la logica di simulazione**

```jsx
// tests/SimulationPanel.test.jsx
import { describe, it, expect } from 'vitest'

// Logica pura di calcolo simulazione (da estrarre nell'implementazione)
function calcolaBollettaSimulata(consumo, potenza, fascia, voci, totaleBase) {
  // voci che variano col consumo scalano proporzionalmente
  const consumoBase = 180
  const potenzaBase = 3
  let totale = 0
  for (const v of voci) {
    if (v.variaConConsumo) {
      totale += v.importo * (consumo / consumoBase)
    } else if (v.id === 'quota-potenza') {
      totale += v.importo * (potenza / potenzaBase)
    } else {
      totale += v.importo
    }
  }
  // sconto fascia: notte -15%, sera -5%, giorno 0%
  const scontoFascia = { giorno: 0, sera: -0.05, notte: -0.15 }
  totale = totale * (1 + (scontoFascia[fascia] ?? 0))
  return Math.max(totale, 0)
}

describe('calcolaBollettaSimulata', () => {
  const voci = [
    { id: 'quota-energia', importo: 42.30, variaConConsumo: true },
    { id: 'quota-potenza', importo: 8.50, variaConConsumo: false },
    { id: 'oneri-sistema', importo: 11.20, variaConConsumo: false },
  ]

  it('con parametri base restituisce valore vicino al totale originale', () => {
    const sim = calcolaBollettaSimulata(180, 3, 'giorno', voci, 79.09)
    expect(sim).toBeCloseTo(61.00, 0) // somma delle 3 voci campione
  })

  it('consumo dimezzato riduce la quota energia', () => {
    const alta = calcolaBollettaSimulata(180, 3, 'giorno', voci, 79.09)
    const bassa = calcolaBollettaSimulata(90, 3, 'giorno', voci, 79.09)
    expect(bassa).toBeLessThan(alta)
  })

  it('fascia notte riduce il totale', () => {
    const giorno = calcolaBollettaSimulata(180, 3, 'giorno', voci, 79.09)
    const notte  = calcolaBollettaSimulata(180, 3, 'notte',  voci, 79.09)
    expect(notte).toBeLessThan(giorno)
  })
})
```

- [ ] **Step 2: Esegui — verifica FAIL**

```bash
npm run test tests/SimulationPanel.test.jsx
```

- [ ] **Step 3: Crea `src/components/Bolletta/SimulationPanel.jsx`**

```jsx
import { useState } from 'react'
import { bollettaVoci, TOTALE_BOLLETTA } from '../../data/bolletta'
import './SimulationPanel.css'

const SCONTO_FASCIA = { giorno: 0, sera: -0.05, notte: -0.15 }
const CONSUMO_BASE = 180
const POTENZA_BASE = 3

function calcolaBollettaSimulata(consumo, potenza, fascia) {
  let totale = 0
  for (const v of bollettaVoci) {
    if (v.variaConConsumo) {
      totale += v.importo * (consumo / CONSUMO_BASE)
    } else if (v.id === 'quota-potenza') {
      totale += v.importo * (potenza / POTENZA_BASE)
    } else {
      totale += v.importo
    }
  }
  return Math.max(totale * (1 + SCONTO_FASCIA[fascia]), 0)
}

export default function SimulationPanel() {
  const [consumo, setConsumo] = useState(CONSUMO_BASE)
  const [potenza, setPotenza] = useState(POTENZA_BASE)
  const [fascia, setFascia] = useState('giorno')

  const bollettaSimulata = calcolaBollettaSimulata(consumo, potenza, fascia)
  const differenza = bollettaSimulata - TOTALE_BOLLETTA
  const differenzaAnno = differenza * 12

  return (
    <div className="simulation-panel">
      <h3 className="sim-title">💡 Cosa succederebbe se cambiassi i tuoi consumi?</h3>
      <p className="sim-subtitle">Muovi i cursori — il calcolo si aggiorna subito. Il sistema mostra solo la matematica.</p>

      <div className="sim-controls">
        <label className="sim-label">
          Consumo mensile: <strong>{consumo} kWh</strong>
          <input
            type="range" min={50} max={400} step={10}
            value={consumo}
            onChange={e => setConsumo(Number(e.target.value))}
            className="sim-slider"
          />
          <span className="sim-range">50 kWh ←→ 400 kWh</span>
        </label>

        <label className="sim-label">
          Potenza impegnata: <strong>{potenza} kW</strong>
          <input
            type="range" min={1.5} max={6} step={0.5}
            value={potenza}
            onChange={e => setPotenza(Number(e.target.value))}
            className="sim-slider"
          />
          <span className="sim-range">1.5 kW ←→ 6 kW</span>
        </label>

        <div className="sim-label">
          <span>Fascia oraria prevalente:</span>
          <div className="fascia-group">
            {['giorno', 'sera', 'notte'].map(f => (
              <button
                key={f}
                className={`fascia-btn ${fascia === f ? 'active' : ''}`}
                onClick={() => setFascia(f)}
              >
                {f === 'giorno' ? '☀️ Giorno' : f === 'sera' ? '🌆 Sera' : '🌙 Notte'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`sim-result ${differenza < 0 ? 'risparmio' : 'aumento'}`}>
        <div className="result-row">
          <span>Con queste scelte:</span>
          <strong>€{bollettaSimulata.toFixed(2)}</strong>
        </div>
        <div className="result-row muted">
          <span>Bolletta di esempio:</span>
          <span>€{TOTALE_BOLLETTA.toFixed(2)}</span>
        </div>
        <div className="result-row differenza">
          <span>Differenza:</span>
          <strong>
            {differenza >= 0 ? '+' : ''}€{differenza.toFixed(2)}/mese
            {' → '}
            {differenzaAnno >= 0 ? '+' : ''}€{Math.abs(differenzaAnno).toFixed(0)}/anno
          </strong>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crea `src/components/Bolletta/SimulationPanel.css`**

```css
.simulation-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.sim-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
.sim-subtitle { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 24px; }

.sim-controls { display: flex; flex-direction: column; gap: 20px; }

.sim-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.sim-slider { width: 100%; accent-color: var(--color-primary); }
.sim-range { font-size: 0.75rem; color: var(--color-text-muted); }

.fascia-group { display: flex; gap: 8px; }
.fascia-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg);
  font-size: 0.875rem;
}
.fascia-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.sim-result {
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 10px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sim-result.risparmio { border-color: #22c55e; background: #f0fdf4; }
.sim-result.aumento   { border-color: #ef4444; background: #fef2f2; }

.result-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
.result-row.muted { color: var(--color-text-muted); font-size: 0.85rem; }
.result-row.differenza { font-weight: 700; }
.sim-result.risparmio .differenza { color: #16a34a; }
.sim-result.aumento   .differenza { color: #dc2626; }
```

- [ ] **Step 5: Verifica test passano**

```bash
npm run test
```

- [ ] **Step 6: Verifica visiva** — slider aggiornano il risultato in tempo reale

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: SimulationPanel con ricalcolo live"
```

---

## Task 7 — GlossaryPanel
**Persona A | Ora 3–4**

**Files:**
- Create: `src/components/Glossario/GlossaryPanel.jsx`
- Create: `src/components/Glossario/GlossaryPanel.css`
- Create: `src/components/Glossario/GlossarySearch.jsx`
- Create: `src/components/Glossario/GlossaryTerm.jsx`

**Interfaces:**
- Consumes: `glossario` da `src/data/glossario.js`
- Consumes: `useApp()` → `glossaryOpen`, `setGlossaryOpen`, `currentLevel`, `activeGlossaryTerm`, `setActiveGlossaryTerm`
- Produces: `<GlossaryPanel />` — slide-in overlay con ricerca e termini raggruppati per lettera

---

- [ ] **Step 1: Crea `src/components/Glossario/GlossarySearch.jsx`**

```jsx
export default function GlossarySearch({ value, onChange }) {
  return (
    <div className="glossary-search">
      <span className="search-icon">🔍</span>
      <input
        type="search"
        placeholder="Cerca un termine..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="search-input"
        autoFocus
      />
    </div>
  )
}
```

- [ ] **Step 2: Crea `src/components/Glossario/GlossaryTerm.jsx`**

```jsx
import { useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function GlossaryTerm({ termine, isActive, onSelect }) {
  const { currentLevel, openGlossaryTerm } = useApp()
  const ref = useRef(null)

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isActive])

  return (
    <div
      ref={ref}
      className={`glossary-term ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="term-header">
        <span className="term-nome">{termine.termine}</span>
        <span className="term-toggle">{isActive ? '▲' : '▼'}</span>
      </div>
      {isActive && (
        <div className="term-body">
          <p className="term-spiegazione">{termine.spiegazione[currentLevel]}</p>
          {termine.correlati?.length > 0 && (
            <div className="term-correlati">
              <span className="correlati-label">Vedi anche: </span>
              {termine.correlati.map(id => (
                <button key={id} className="correlato-link" onClick={e => { e.stopPropagation(); openGlossaryTerm(id) }}>
                  {id.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Crea `src/components/Glossario/GlossaryPanel.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { glossario } from '../../data/glossario'
import GlossarySearch from './GlossarySearch'
import GlossaryTerm from './GlossaryTerm'
import './GlossaryPanel.css'

export default function GlossaryPanel() {
  const { glossaryOpen, setGlossaryOpen, activeGlossaryTerm, setActiveGlossaryTerm } = useApp()
  const [query, setQuery] = useState('')

  const terminiVisibili = useMemo(() => {
    if (!query) return glossario
    const q = query.toLowerCase()
    return glossario.filter(t =>
      t.termine.toLowerCase().includes(q) ||
      Object.values(t.spiegazione).some(s => s.toLowerCase().includes(q))
    )
  }, [query])

  const perLettera = useMemo(() => {
    return terminiVisibili.reduce((acc, t) => {
      const l = t.lettera
      if (!acc[l]) acc[l] = []
      acc[l].push(t)
      return acc
    }, {})
  }, [terminiVisibili])

  function handleClose() {
    setGlossaryOpen(false)
    setActiveGlossaryTerm(null)
    setQuery('')
  }

  if (!glossaryOpen) return null

  return (
    <>
      <div className="glossary-backdrop" onClick={handleClose} />
      <aside className="glossary-panel">
        <div className="glossary-header">
          <h2>📖 Glossario</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>
        <div className="glossary-search-wrap">
          <GlossarySearch value={query} onChange={setQuery} />
        </div>
        <div className="glossary-list">
          {Object.keys(perLettera).sort().map(lettera => (
            <section key={lettera} className="lettera-group">
              <h3 className="lettera-heading">{lettera}</h3>
              {perLettera[lettera].map(t => (
                <GlossaryTerm
                  key={t.id}
                  termine={t}
                  isActive={activeGlossaryTerm === t.id}
                  onSelect={() => setActiveGlossaryTerm(activeGlossaryTerm === t.id ? null : t.id)}
                />
              ))}
            </section>
          ))}
          {terminiVisibili.length === 0 && (
            <p className="no-results">Nessun termine trovato per "{query}"</p>
          )}
        </div>
      </aside>
    </>
  )
}
```

- [ ] **Step 4: Crea `src/components/Glossario/GlossaryPanel.css`**

```css
.glossary-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
}

.glossary-panel {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 380px; max-width: 95vw;
  background: var(--color-surface);
  z-index: 201;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  animation: slideIn 0.2s ease;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

.glossary-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px; border-bottom: 1px solid var(--color-border);
}
.glossary-header h2 { font-size: 1.1rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.2rem; color: var(--color-text-muted); }

.glossary-search-wrap { padding: 12px 20px; border-bottom: 1px solid var(--color-border); }

.glossary-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 8px 12px;
}
.search-input { border: none; background: none; flex: 1; font-size: 0.9rem; outline: none; }

.glossary-list { flex: 1; overflow-y: auto; padding: 8px 0; }

.lettera-group { margin-bottom: 4px; }
.lettera-heading { padding: 8px 20px 4px; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.glossary-term {
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}
.glossary-term:hover, .glossary-term.active { background: #eff6ff; }

.term-header { display: flex; justify-content: space-between; align-items: center; }
.term-nome { font-weight: 600; font-size: 0.95rem; }
.term-toggle { font-size: 0.7rem; color: var(--color-text-muted); }

.term-body { margin-top: 10px; }
.term-spiegazione { font-size: 0.875rem; line-height: 1.6; color: var(--color-text); }

.term-correlati { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.correlati-label { font-size: 0.75rem; color: var(--color-text-muted); }
.correlato-link {
  background: none; border: 1px solid var(--color-primary);
  color: var(--color-primary); border-radius: 20px;
  padding: 2px 10px; font-size: 0.75rem; text-transform: capitalize;
}

.no-results { padding: 20px; text-align: center; color: var(--color-text-muted); }
```

- [ ] **Step 5: Verifica visiva** — clic "Glossario" in header apre panel; ricerca filtra; clic su termine lo espande; clic su link correlato salta al termine

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: GlossaryPanel con ricerca e link bidirezionali"
```

---

## Task 8 — RataRoom
**Persona B | Ora 3–4**

**Files:**
- Create: `src/components/Rata/RataRoom.jsx`
- Create: `src/components/Rata/RataRoom.css`
- Create: `src/components/Rata/LoanForm.jsx`
- Create: `src/components/Rata/LoanVisualizer.jsx`

**Interfaces:**
- Consumes: `calcolaRata`, `calcolaPianoAmmortamento`, `formatEuro` da `src/utils/loanCalculator.js`
- Consumes: `rataContesti`, `DURATE_DISPONIBILI`, `IMPORTO_DEFAULT`, `TASSO_DEFAULT`, `DURATA_DEFAULT` da `src/data/rata.js`
- Consumes: `useApp()` → `currentLevel`, `setView`
- Produces: `<RataRoom />` — form + BarChart Recharts + spiegazione contestuale

---

- [ ] **Step 1: Crea `src/components/Rata/LoanForm.jsx`**

```jsx
import { DURATE_DISPONIBILI } from '../../data/rata'

export default function LoanForm({ importo, durata, tasso, onChange }) {
  return (
    <div className="loan-form">
      <label className="form-field">
        <span>💰 Importo prestito</span>
        <div className="input-wrap">
          <span className="input-prefix">€</span>
          <input
            type="number" min={500} max={100000} step={500}
            value={importo}
            onChange={e => onChange('importo', Number(e.target.value))}
            className="form-input"
          />
        </div>
      </label>
      <label className="form-field">
        <span>📅 Durata</span>
        <select
          value={durata}
          onChange={e => onChange('durata', Number(e.target.value))}
          className="form-input"
        >
          {DURATE_DISPONIBILI.map(m => (
            <option key={m} value={m}>{m} mesi ({(m / 12).toFixed(0)} {m < 24 ? 'anno' : 'anni'})</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>📈 Tasso annuo (TAN)</span>
        <div className="input-wrap">
          <input
            type="number" min={0.1} max={30} step={0.1}
            value={tasso}
            onChange={e => onChange('tasso', Number(e.target.value))}
            className="form-input"
          />
          <span className="input-suffix">%</span>
        </div>
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Crea `src/components/Rata/LoanVisualizer.jsx`**

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calcolaRata, calcolaPianoAmmortamento, formatEuro } from '../../utils/loanCalculator'

export default function LoanVisualizer({ importo, durata, tasso }) {
  const rata = calcolaRata(importo, tasso, durata)
  const piano = calcolaPianoAmmortamento(importo, tasso, durata)
  const totale = rata * durata
  const totInteressi = totale - importo
  const pctInteressi = ((totInteressi / totale) * 100).toFixed(1)

  // Per il grafico mostriamo ogni mese (se <= 60) o ogni 3 mesi (se > 60)
  const step = durata > 60 ? 3 : 1
  const datiGrafico = piano
    .filter((_, i) => i % step === 0 || i === durata - 1)
    .map(r => ({
      mese: `M${r.mese}`,
      Capitale: Math.round(r.capitale),
      Interessi: Math.round(r.interessi),
    }))

  return (
    <div className="loan-visualizer">
      <div className="riepilogo">
        <div className="riepilogo-item">
          <span>Rata mensile</span>
          <strong>{formatEuro(rata)}</strong>
        </div>
        <div className="riepilogo-item">
          <span>Totale pagato</span>
          <strong>{formatEuro(totale)}</strong>
        </div>
        <div className="riepilogo-item highlight">
          <span>Di cui interessi</span>
          <strong>{formatEuro(totInteressi)} ({pctInteressi}% in più)</strong>
        </div>
      </div>
      <div className="grafico-wrap">
        <h4 className="grafico-title">Come cambia ogni rata nel tempo</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={datiGrafico} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <XAxis dataKey="mese" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `€${v}`} />
            <Tooltip formatter={(v, name) => [formatEuro(v), name]} />
            <Legend />
            <Bar dataKey="Capitale" stackId="a" fill="#3b82f6" name="Capitale" />
            <Bar dataKey="Interessi" stackId="a" fill="#f97316" name="Interessi" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crea `src/components/Rata/RataRoom.jsx`**

```jsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { rataContesti, IMPORTO_DEFAULT, TASSO_DEFAULT, DURATA_DEFAULT } from '../../data/rata'
import LoanForm from './LoanForm'
import LoanVisualizer from './LoanVisualizer'
import './RataRoom.css'

export default function RataRoom() {
  const { setView, currentLevel } = useApp()
  const [params, setParams] = useState({
    importo: IMPORTO_DEFAULT,
    tasso: TASSO_DEFAULT,
    durata: DURATA_DEFAULT,
  })

  function handleChange(campo, valore) {
    setParams(p => ({ ...p, [campo]: valore }))
  }

  return (
    <div className="rata-room">
      <button className="back-btn" onClick={() => setView('hub')}>← Torna alla home</button>
      <h1 className="room-title">💳 Quanto costa davvero un prestito?</h1>
      <div className="rata-grid">
        <LoanForm
          importo={params.importo}
          durata={params.durata}
          tasso={params.tasso}
          onChange={handleChange}
        />
        <LoanVisualizer
          importo={params.importo}
          tasso={params.tasso}
          durata={params.durata}
        />
      </div>
      <div className="rata-spiegazione">
        <p>{rataContesti.spiegazione[currentLevel]}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crea `src/components/Rata/RataRoom.css`**

```css
.rata-room { display: flex; flex-direction: column; gap: 24px; }
.back-btn { align-self: flex-start; background: none; border: none; color: var(--color-primary); font-size: 0.9rem; padding: 0; cursor: pointer; }
.room-title { font-size: 1.5rem; font-weight: 700; }

.rata-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
@media (max-width: 768px) { .rata-grid { grid-template-columns: 1fr; } }

.loan-form { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 20px; align-self: start; }
.form-field { display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem; font-weight: 500; }
.input-wrap { display: flex; align-items: center; border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; }
.input-prefix, .input-suffix { padding: 8px 12px; background: var(--color-bg); color: var(--color-text-muted); font-size: 0.9rem; }
.form-input { border: none; padding: 8px 12px; font-size: 0.95rem; flex: 1; outline: none; width: 100%; }

.loan-visualizer { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; }

.riepilogo { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--color-border); }
.riepilogo-item { display: flex; justify-content: space-between; font-size: 0.95rem; }
.riepilogo-item.highlight { background: #fff7ed; padding: 10px 12px; border-radius: var(--radius); border: 1px solid #fed7aa; }
.riepilogo-item.highlight strong { color: #ea580c; }

.grafico-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 12px; color: var(--color-text-muted); }

.rata-spiegazione { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius); padding: 16px 20px; font-size: 0.9rem; line-height: 1.6; }
```

- [ ] **Step 5: Verifica visiva** — modifica form → grafico e riepilogo aggiornati istantaneamente

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: RataRoom con LoanForm, LoanVisualizer e grafico Recharts"
```

---

## Task 9 — Integrazione, polish e demo flow
**Entrambi | Ora 4–5**

**Files:**
- Modify: `src/index.css` — rimuovi stili default Vite
- Modify: `src/main.jsx` — verifica import corretto
- Verify: `public/` — favicon opzionale

---

- [ ] **Step 1: Pulisci `src/index.css`**

```css
/* src/index.css — reset pulito, App.css gestisce il resto */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
```

- [ ] **Step 2: Verifica `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Test del demo flow completo** — esegui manualmente:

  1. Apri `http://localhost:5173`
  2. Hub mostra 3 card ✓
  3. Clicca "La mia bolletta" → BollettaRoom ✓
  4. Clicca "Oneri di Sistema" → ExplanationPanel mostra spiegazione ✓
  5. Clicca link "oneri sistema" → GlossaryPanel apre sul termine corretto ✓
  6. Chiudi Glossario → BollettaRoom ancora visibile ✓
  7. Muovi slider consumo → totale simulato cambia ✓
  8. Torna alla home → Clicca "Un prestito" → RataRoom ✓
  9. Cambia importo → grafico e riepilogo si aggiornano ✓
  10. Cambia livello "Tecnico" → tutte le spiegazioni cambiano ✓
  11. Ricarica la pagina → livello "Tecnico" persistito da localStorage ✓

- [ ] **Step 4: Esegui tutti i test**

```bash
npm run test
```
Atteso: tutti PASS.

- [ ] **Step 5: Build di produzione — verifica zero errori**

```bash
npm run build
```
Atteso: `dist/` generata senza errori o warning.

- [ ] **Step 6: Commit finale**

```bash
git add -A
git commit -m "feat: integrazione completa MVP FinanzaChiara

- Hub → BollettaRoom → RataRoom navigazione funzionante
- GlossaryPanel con link bidirezionali da ExplanationPanel
- LevelSelector con persistenza localStorage
- Build di produzione verificata"
```

---

## Self-Review

### Copertura spec

| Requisito spec | Task | Stato |
|----------------|------|-------|
| HubView con 3 situation cards | Task 3 | ✅ |
| LevelSelector con persistenza localStorage | Task 3 | ✅ |
| BillViewer con 6 voci cliccabili + colori zona | Task 4 | ✅ |
| ExplanationPanel con spiegazione + barra % | Task 5 | ✅ |
| Link ExplanationPanel → GlossaryPanel | Task 5 | ✅ |
| SimulationPanel slider + ricalcolo live | Task 6 | ✅ |
| GlossaryPanel slide-in con ricerca | Task 7 | ✅ |
| GlossaryTerm con correlati e scroll automatico | Task 7 | ✅ |
| RataRoom con LoanForm (3 input) | Task 8 | ✅ |
| LoanVisualizer con BarChart Recharts | Task 8 | ✅ |
| Spiegazione contestuale RataRoom | Task 8 | ✅ |
| Back button in ogni Room | Task 5, 8 | ✅ |
| Nessuna raccomandazione finanziaria nel copy | tutti | ✅ |
| Zero backend, zero API key | architettura | ✅ |

### Placeholder scan
Nessun TBD, TODO o placeholder nei task. Ogni step include codice completo.

### Type consistency
- `currentLevel`: `"semplice" | "normale" | "tecnico"` — usato consistentemente in tutti i task
- `activeVoce`: oggetto dal tipo di `bollettaVoci[number]` — passato da Context, consumato in Task 4 e 5
- `calcolaRata(P, tassoAnnuo, mesi)` — firma identica in Task 2 (definizione) e Task 8 (utilizzo)
- `formatEuro(n)` — definita in Task 2, usata in Task 8
