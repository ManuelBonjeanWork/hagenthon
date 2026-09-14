# FinanzaChiara MVP — Piano di Implementazione Agentico

> **Per l'Orchestrator Agent:** questo piano definisce il grafo delle dipendenze tra Issue, il codice completo per ogni Developer Agent e i criteri di accettazione per ogni Code Review Agent. Leggi la Sezione 3 del design doc per il ciclo completo del pipeline.

> **Spec:** `docs/superpowers/specs/2026-09-14-finanzachiara-design.md`

> **Repo:** https://github.com/ManuelBonjeanWork/hagenthon — **già creato**, remote vuoto (nessun branch pushato).
> **Projects board:** https://github.com/users/ManuelBonjeanWork/projects/2/views/1 — **già creato**.
> **Root dell'app:** la radice del repo. `src/`, `tests/`, `vite.config.js` convivono con `docs/` e `tema.md`.
> **Branch di integrazione:** `main`, creata da `develop` in Phase 0.2. Tutte le PR puntano lì.

**Goal:** Costruire l'MVP di FinanzaChiara in ~2h45min–3h end-to-end (~2h03min di solo sviluppo) usando il pipeline agentico: Orchestrator Agent coordina 8 Issue (0, 1a, 1b, 2, 3, 4, 5, 6), con due finestre di parallelismo — AppContext+DataLayer e i 4 componenti UI — per ridurre al minimo la critical path.

**Architecture:** React 18 + Vite 5 client-side. Stato globale via React Context. Navigazione tramite stato (no router). Contenuto finanziario pre-scritto in `data/`.

**Tech Stack:** React 18, Vite 5, Recharts 2, Vitest + React Testing Library.

## Modelli per agente

| Agente | Modello | Motivazione |
|--------|---------|-------------|
| **Orchestrator Agent** | `claude-opus-5` | Ragionamento complesso: legge il piano, valuta dipendenze, decide quando parallelizzare, gestisce i gate umani |
| **Developer Agent** | `claude-sonnet-5` | Scrittura di codice React completo da spec; bilanciamento tra qualità e velocità |
| **Code Review Agent** | `claude-sonnet-5` | Analisi critica del codice, verifica criteri architetturali e copy, feedback strutturato |
| **Tester Agent** | `claude-sonnet-5` | Scrive `tests/integrazione.test.jsx` in Issue #6.5: il flusso utente end-to-end con React Testing Library. Nessun framework E2E (Playwright/Cypress) è installato e non c'è tempo per aggiungerlo — RTL su `<App />` copre gli stessi percorsi |
| **GitHub PM Agent** | `claude-haiku-4-5-20251001` | Task meccanici e ripetibili: creare Issue, aprire PR, aggiornare label e Projects board |

## Global Constraints

- React 18 + Vite 5 — scaffolding pinnato a `create-vite@5` (vedi 0.1). `@latest` installerebbe Vite 7 + React 19, non lo stack dichiarato
- Recharts `^2.x` — unica libreria charting, nessun SVG custom
- Nessun backend, nessuna API key, tutto client-side
- Nessuna raccomandazione finanziaria nel copy
- Livelli: `"semplice"` | `"normale"` | `"tecnico"` (esatti, case-sensitive)
- Viste: `"hub"` | `"bolletta"` | `"rata"` (esatte)
- `localStorage` key: `"finanzachiara_level"`
- Vitest per unit test — lo script `"test": "vitest run"` va aggiunto in Issue #0 (lo scaffold Vite non lo genera). Mai `vitest` in watch: non termina e blocca l'agente
- Italiano ovunque — testi UI, label, commenti

---

## Grafo delle dipendenze (per l'Orchestrator)

```
Phase 0 — Orchestrator + GitHub PM Agent, in parallelo (~10 min)
                         │
                         ▼
Issue #0 — Scaffolding (~8 min · SEQUENZIALE: il progetto Vite deve esistere)
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
     #1a AppContext              #1b Data Layer           PARALLELO
       (~15 min)                   (~20 min)              finestra ~20 min
           └─────────────┬─────────────┘
                         │  entrambe Done
    ┌─────────────┬──────┴──────┬─────────────┐
    ▼             ▼             ▼             ▼
    #2            #3            #4            #5          PARALLELO
  Header       Bolletta     Glossario        Rata         finestra ~55 min
(~30 min)     (~55 min)     (~35 min)     (~40 min)
    └─────────────┴──────┬──────┴─────────────┘
                         │  tutte e 4 Done
                         ▼
Issue #6 — Integrazione + test + build (~30 min · SEQUENZIALE)
```

**Tempo di sviluppo sulla critical path:** ~10 + ~8 + ~20 + ~55 + ~30 = **~2h03min**
(vs struttura precedente a 6 Issue: ~2h55min — risparmio ~50 min)

⚠️ **Non è il tempo end-to-end.** Ogni Issue attraversa Code Review Agent → gate umano → merge
prima di sbloccare le dipendenti; quei minuti sono sulla critical path, non a lato.
Contando ~5–7 min per ciclo su 6 punti di sincronizzazione (#0, #1a+#1b, #2–#5, #6):
**+40/60 min → stima realistica ~2h45min – 3h.**
I due colli di bottiglia sono i gate dopo #1a/#1b e quello dopo i 4 componenti paralleli:
lì l'Orchestrator è bloccato su un umano, non su un agente.

### Status board GitHub Projects

Campo custom **"Stato Pipeline"** sul project 2 (creato in 0.4):

| Valore | Significato |
|---------|------------|
| `Queued` | Issue creata, dipendenze non soddisfatte |
| `In Sviluppo` | Developer Agent attivo |
| `In Code Review` | Code Review Agent attivo |
| `Pronto al Merge` | PR aperta, attende gate umano |
| `Done` | PR mergiata, Issue chiusa |

### Labels GitHub

`needs-fixes` · `code-review-approved` · `ready-to-merge`

---

## Phase 0 — Setup Pipeline
**Orchestrator Agent (`claude-opus-5`) + GitHub PM Agent (`claude-haiku-4-5-20251001`) | ~10 min | PARALLELO**

> **Orchestrator e GitHub PM Agent partono insieme:** il primo legge il piano e costruisce lo stato, il secondo prepara branch `main`, label e Issue. Non si aspettano a vicenda.
>
> ⚠️ Repo e Projects board **esistono già**: non ricrearli.

- [ ] **0.1 — Orchestrator legge il piano e inizializza lo stato** *(in parallelo con 0.2–0.3)*

```json
// docs/pipeline-state.json (creato dall'Orchestrator)
{
  "session": "2026-09-14",
  "plan": "docs/superpowers/plans/2026-09-14-finanzachiara-mvp.md",
  "project": {
    "number": 2,
    "owner": "ManuelBonjeanWork",
    "repo": "ManuelBonjeanWork/hagenthon",
    "fieldId": null,
    "optionIds": {}
  },
  "issues": {
    "0":  { "status": "queued", "deps": [],                       "slug": "scaffolding" },
    "1a": { "status": "queued", "deps": ["0"],                    "slug": "appcontext" },
    "1b": { "status": "queued", "deps": ["0"],                    "slug": "data-layer" },
    "2":  { "status": "queued", "deps": ["1a","1b"],              "slug": "header-hubview" },
    "3":  { "status": "queued", "deps": ["1a","1b"],              "slug": "bollettaroom" },
    "4":  { "status": "queued", "deps": ["1a","1b"],              "slug": "glossarypanel" },
    "5":  { "status": "queued", "deps": ["1a","1b"],              "slug": "rataroom" },
    "6":  { "status": "queued", "deps": ["2","3","4","5"],        "slug": "integrazione-polish" }
  }
}
```

- [ ] **0.2 — GitHub PM Agent prepara branch `main` e label** *(in parallelo con 0.1)*

> Repo (`ManuelBonjeanWork/hagenthon`) e board (project **2**) sono già creati. Qui si crea solo ciò che manca.

```bash
# a) Bootstrap di main — il remote e' vuoto, nessun branch e' mai stato pushato.
#    Senza questo, il `git checkout main && git pull` di ogni Issue fallisce.
git checkout develop
git checkout -B main
git push -u origin main
gh repo edit --default-branch main

# b) Crea le label del pipeline: NON esistono nel repo (ci sono solo quelle di default).
#    Senza questo passo tutte e 8 le `gh issue create --label "queued"` di 0.3 falliscono.
#    --force rende il comando idempotente se rilanciato.
gh label create queued               --color ededed --description "Dipendenze non soddisfatte"            --force
gh label create needs-fixes          --color d93f0b --description "Code Review Agent richiede modifiche"  --force
gh label create code-review-approved --color 0e8a16 --description "Code Review Agent ha approvato"        --force
gh label create ready-to-merge       --color 1d76db --description "In attesa del gate umano"              --force
```

- [ ] **0.3 — GitHub PM Agent crea tutte e 8 le Issue** *(in parallelo con 0.1)*

```bash
# Issue #0
gh issue create \
  --title "[#0] Scaffolding" \
  --body "## Contesto
Prima issue: crea la struttura del progetto Vite. Nessuna dipendenza.
Issue #1a e #1b partono in parallelo dopo questa.

## Deliverable
- Progetto Vite alla radice del repo (scaffolding via dir temporanea, create-vite@5)
- Script \`test\`: \`vitest run\` in package.json
- Vitest configurato in vite.config.js
- App.jsx shell autonoma (nessun import da moduli non ancora esistenti: main resta buildabile)
- App.css con CSS variables
- index.css reset" \
  --label "queued"

# Issue #1a
gh issue create \
  --title "[#1a] AppContext" \
  --body "## Dipende da: Issue #0

## Deliverable
- src/context/AppContext.jsx
- tests/AppContext.test.jsx (4 test passanti)" \
  --label "queued"

# Issue #1b
gh issue create \
  --title "[#1b] Data Layer" \
  --body "## Dipende da: Issue #0

## Deliverable
- src/utils/loanCalculator.js
- src/data/bolletta.js (6 voci a 3 livelli)
- src/data/glossario.js (24 termini)
- src/data/rata.js
- tests/loanCalculator.test.js (7 test passanti)" \
  --label "queued"

# Issue #2
gh issue create \
  --title "[#2] Header + HubView" \
  --body "## Dipende da: Issue #1a e #1b (entrambe)

## Riferimenti
- Design doc Sezione 5: Header e LevelSelector
- Design doc Sezione 6: HubView

## Deliverable
- Header.jsx con LevelSelector e GlossaryButton
- LevelSelector.jsx con persistenza localStorage
- HubView.jsx con 3 SituationCard" \
  --label "queued"

# Issue #3
gh issue create \
  --title "[#3] BollettaRoom" \
  --body "## Dipende da: Issue #1a e #1b (entrambe)

## Riferimenti
- Design doc Sezione 7: BollettaRoom

## Deliverable
- BillViewer.jsx + BillVoce.jsx (6 voci cliccabili con colori zona)
- ExplanationPanel.jsx (spiegazione + barra % + link glossario)
- SimulationPanel.jsx (slider consumo/potenza/fascia + ricalcolo live)
- BollettaRoom.jsx (layout 2 colonne)" \
  --label "queued"

# Issue #4
gh issue create \
  --title "[#4] GlossaryPanel" \
  --body "## Dipende da: Issue #1a e #1b (entrambe)

## Riferimenti
- Design doc Sezione 9: GlossaryPanel

## Deliverable
- GlossaryPanel.jsx (slide-in overlay)
- GlossarySearch.jsx (ricerca controllata)
- GlossaryTerm.jsx (espandibile + correlati + scroll automatico)" \
  --label "queued"

# Issue #5
gh issue create \
  --title "[#5] RataRoom" \
  --body "## Dipende da: Issue #1a e #1b (entrambe)

## Riferimenti
- Design doc Sezione 8: RataRoom

## Deliverable
- LoanForm.jsx (3 input: importo, durata, tasso)
- LoanVisualizer.jsx (riepilogo + BarChart Recharts)
- RataRoom.jsx (layout + spiegazione contestuale)" \
  --label "queued"

# Issue #6
gh issue create \
  --title "[#6] Integrazione + polish + build" \
  --body "## Dipende da: Issue #2, #3, #4, #5 (tutte)

## Deliverable
- src/App.jsx riscritta: placeholder di Issue #0 sostituiti con i componenti reali
- tests/integrazione.test.jsx (Tester Agent): flusso utente coperto da RTL
- Navigazione Hub <-> BollettaRoom <-> RataRoom funzionante
- Link bidirezionali ExplanationPanel ↔ GlossaryPanel
- Reset stili Vite default
- Build produzione senza errori
- Demo flow verificato manualmente" \
  --label "queued"
```

- [ ] **0.4 — GitHub PM Agent collega le Issue alla board** *(dopo 0.3)*

> `gh project create` non genera colonne e le Issue non finiscono sulla board da sole:
> senza questo passo la status board resta vuota e i 5 stati sono solo decorativi.

```bash
OWNER=ManuelBonjeanWork
REPO=ManuelBonjeanWork/hagenthon
PROJ=2

# a) Campo di stato custom: i default di Projects sono Todo/In Progress/Done,
#    che non coprono "In Code Review" e "Pronto al Merge".
gh project field-create $PROJ --owner $OWNER \
  --name "Stato Pipeline" --data-type SINGLE_SELECT \
  --single-select-options "Queued,In Sviluppo,In Code Review,Pronto al Merge,Done"

# b) Aggiungi tutte le Issue create in 0.3
for n in $(gh issue list --repo $REPO --state open --limit 20 --json number -q '.[].number'); do
  gh project item-add $PROJ --owner $OWNER --url "https://github.com/$REPO/issues/$n"
done

# c) Gli ID servono all'Orchestrator per spostare le card: salvali in pipeline-state.json
gh project field-list $PROJ --owner $OWNER --format json
gh project item-list  $PROJ --owner $OWNER --format json
```

> **Orchestrator:** a ogni transizione di stato aggiorna la card con
> `gh project item-edit --id <itemId> --project-id <projId> --field-id <fieldId> --single-select-option-id <optId>`.
> Se un ID manca, logga e prosegui: la board è osservabilità, non deve bloccare il pipeline.

- [ ] **0.5 — Orchestrator attende fine Phase 0, poi dispatcha Developer Agent #0** *(nessuna dipendenza → prima issue pronta)*

---

## Issue #0 — Scaffolding
**Developer Agent #0 (`claude-sonnet-5`) | Sequenziale | ~8 min**

> **Orchestrator:** dispatcha appena Phase 0 è completa. Nessuna dipendenza. Al merge, dispatcha in parallelo Agent #1a e Agent #1b.

**Branch:** `feature/0-scaffolding`

**Files da creare / modificare:**
- `package.json` (script `test`) · `vite.config.js` · `tests/setup.js`
- `src/App.jsx` (shell — importa i componenti ma non li implementa)
- `src/App.css` · `src/index.css`

---

- [ ] **0.1 — Scaffolding**

```bash
git checkout main && git pull
git checkout -b feature/0-scaffolding

# La radice del repo NON e' vuota (docs/, tema.md, .claude/): create-vite si fermerebbe
# a chiedere conferma in modo interattivo e bloccherebbe l'agente.
# Soluzione: scaffolding in una dir temporanea, poi copia dei file alla radice.
#   - dir SENZA punto iniziale: `.vite-tmp` non e' un nome npm valido e farebbe
#     comparire il prompt "Package name" (verificato: l'agente si blocca li').
#   - versione pinnata a 5: `@latest` installerebbe Vite 7 + React 19, non lo stack dichiarato.
npm create vite@5 vite-tmp -- --template react   # non interattivo: nome + template forniti
cp -R vite-tmp/. .        # copia anche i dotfile (.gitignore, eslint.config.js)
rm -rf vite-tmp
npm pkg set name="finanzachiara"

npm install
npm install recharts
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Lo scaffold Vite genera solo dev/build/lint/preview: senza questo ogni `npm run test`
# del piano (0.7, 1a.2, 1b.2, 6.6) fallisce con "Missing script: test".
# `vitest run` e non `vitest`: il watch mode non termina e bloccherebbe l'agente.
npm pkg set scripts.test="vitest run"
```

Verifica prima di proseguire:

```bash
npm run test -- --passWithNoTests   # deve uscire con codice 0, non "Missing script"
```

- [ ] **0.2 — Configura Vitest in `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { globals: true, environment: 'jsdom', setupFiles: './tests/setup.js' },
})
```

- [ ] **0.3 — Crea `tests/setup.js`**

```js
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

// AppContext persiste il livello in localStorage: senza pulizia un test che chiama
// setLevel() inquina tutti quelli successivi, dentro e fuori dal proprio file.
afterEach(() => localStorage.clear())
```

- [ ] **0.4 — Crea `src/App.jsx` (shell autonoma)**

> ⚠️ La shell **non deve importare `./context/AppContext`**: quel file nasce in Issue #1a.
> Importarlo qui renderebbe `main` non buildabile per tutta la finestra tra il merge di #0
> e quello di #1a — e il Code Review Agent non avrebbe modo di sapere che è voluto.
> Zero import da moduli non ancora esistenti: `main` è verde a ogni merge.

```jsx
// Shell autonoma. Verrà riscritta da capo in Issue #6.1 con i componenti reali
// di #1a, #2, #3, #4, #5. Fino ad allora non dipende da nulla che non esista già.
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="header"><span>💡 FinanzaChiara</span></header>
      <main className="main-content">
        <p>Shell iniziale. I componenti arrivano da Issue #1a, #2, #3, #4, #5.</p>
      </main>
    </div>
  )
}
```

- [ ] **0.5 — Crea `src/App.css`**

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
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: var(--color-bg); color: var(--color-text); }
.app { min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
button { cursor: pointer; }
```

- [ ] **0.6 — Crea `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
```

- [ ] **0.7 — Verifica che `main` resti buildabile**

```bash
npm run build          # deve completare senza errori
npm run test -- --passWithNoTests
```

- [ ] **0.8 — Commit e notifica Orchestrator**

```bash
git add -A
git commit -m "feat(#0): scaffolding Vite + Vitest + App shell + CSS variables

- build e test verdi su una shell senza dipendenze esterne

Closes #0

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin feature/0-scaffolding
```

> **Orchestrator:** dopo merge di #0 → dispatcha in parallelo Developer Agent #1a e Developer Agent #1b

---

## Issue #1a — AppContext
**Developer Agent #1a (`claude-sonnet-5`) | Parallelo con #1b | ~15 min**

> **Orchestrator:** dispatcha insieme a Agent #1b non appena #0 è mergiata. Non dipende dal data layer.

**Branch:** `feature/1a-appcontext`
**Dipende da:** Issue #0 mergiata su main → `git checkout main && git pull && git checkout -b feature/1a-appcontext`

**Files da creare:**
- `src/context/AppContext.jsx`
- `tests/AppContext.test.jsx`

---

- [ ] **1a.1 — Scrivi test fallenti**

```jsx
// tests/AppContext.test.jsx
import { render, screen } from '@testing-library/react'
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
  it('valori iniziali corretti', () => {
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

- [ ] **1a.2 — Esegui test → verifica FAIL**

```bash
npm run test -- tests/AppContext.test.jsx
```

- [ ] **1a.3 — Crea `src/context/AppContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'

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

  function openGlossaryTerm(termId) {
    setActiveGlossaryTerm(termId)
    setGlossaryOpen(true)
  }

  return (
    <AppContext.Provider value={{
      currentLevel, setLevel,
      activeView, setView: setActiveView,
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

- [ ] **1a.4 — Esegui test → verifica PASS**

```bash
npm run test -- tests/AppContext.test.jsx
```
Atteso: 4 test PASS.

- [ ] **1a.5 — Commit**

```bash
git add -A
git commit -m "feat(#1a): AppContext con currentLevel, activeView, glossaryOpen, activeVoce

- 4 unit test passanti

Closes #1a

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin feature/1a-appcontext
```

> **Orchestrator:** dopo merge di #1a e #1b (entrambe) → dispatcha in parallelo Developer Agent #2, #3, #4, #5

---

## Issue #1b — Data Layer
**Developer Agent #1b (`claude-sonnet-5`) | Parallelo con #1a | ~20 min**

> **Orchestrator:** dispatcha insieme a Agent #1a non appena #0 è mergiata. Non dipende da AppContext.

**Branch:** `feature/1b-data-layer`
**Dipende da:** Issue #0 mergiata su main → `git checkout main && git pull && git checkout -b feature/1b-data-layer`

**Files da creare:**
- `src/utils/loanCalculator.js`
- `src/data/bolletta.js` · `src/data/glossario.js` · `src/data/rata.js`
- `tests/loanCalculator.test.js`

---

- [ ] **1b.1 — Scrivi test fallenti per loanCalculator**

```js
// tests/loanCalculator.test.js
import { describe, it, expect } from 'vitest'
import { calcolaRata, calcolaPianoAmmortamento } from '../src/utils/loanCalculator'

describe('calcolaRata', () => {
  it('€10.000, 36 mesi, 7.5% → ~€311.06', () => {
    expect(calcolaRata(10000, 7.5, 36)).toBeCloseTo(311.06, 1)
  })
  it('tasso zero → P / mesi', () => {
    expect(calcolaRata(12000, 0, 12)).toBeCloseTo(1000, 1)
  })
  it('risultato positivo per input validi', () => {
    expect(calcolaRata(5000, 5, 24)).toBeGreaterThan(0)
  })
})

describe('calcolaPianoAmmortamento', () => {
  it('lunghezza array = mesi', () => {
    expect(calcolaPianoAmmortamento(10000, 7.5, 36)).toHaveLength(36)
  })
  it('ogni elemento ha i campi attesi', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano[0]).toMatchObject({ mese: 1, rata: expect.any(Number), capitale: expect.any(Number), interessi: expect.any(Number), debitoResiduo: expect.any(Number) })
  })
  it('debito residuo ultimo mese ≈ 0', () => {
    expect(calcolaPianoAmmortamento(10000, 7.5, 36)[35].debitoResiduo).toBeCloseTo(0, 0)
  })
  it('somma capitale = P', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano.reduce((s, r) => s + r.capitale, 0)).toBeCloseTo(10000, 0)
  })
})
```

- [ ] **1b.2 — Esegui test → verifica FAIL**

```bash
npm run test -- tests/loanCalculator.test.js
```

- [ ] **1b.3 — Crea `src/utils/loanCalculator.js`**

```js
export function calcolaRata(P, tassoAnnuo, mesi) {
  const r = tassoAnnuo / 100 / 12
  if (r === 0) return P / mesi
  return P * (r * Math.pow(1 + r, mesi)) / (Math.pow(1 + r, mesi) - 1)
}

export function calcolaPianoAmmortamento(P, tassoAnnuo, mesi) {
  const rata = calcolaRata(P, tassoAnnuo, mesi)
  const r = tassoAnnuo / 100 / 12
  let debito = P
  return Array.from({ length: mesi }, (_, i) => {
    const interessi = debito * r
    const capitale = rata - interessi
    debito -= capitale
    return { mese: i + 1, rata, capitale, interessi, debitoResiduo: Math.max(debito, 0) }
  })
}

export function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}
```

- [ ] **1b.4 — Crea `src/data/bolletta.js`**

```js
export const ALIQUOTA_IVA = 0.10

// Somma delle 5 voci imponibili (71.90) + IVA 10% (7.19). Verificato: torna esatto.
export const TOTALE_BOLLETTA = 79.09

// `scala` dice al SimulationPanel come la voce reagisce ai cursori:
//   'consumo' → proporzionale ai kWh        'potenza' → proporzionale ai kW
//   'fissa'   → non cambia mai              'iva'     → ricalcolata sul nuovo imponibile
// `soggettaFascia` marca l'unica voce su cui la fascia oraria ha effetto reale.

export const bollettaVoci = [
  {
    id: 'quota-energia', label: 'Quota Energia (F1 / F2 / F3)', colore: 'energia', importo: 42.30,
    spiegazione: {
      semplice: 'Questi sono i soldi che paghi per l\'elettricità che hai usato davvero. Come pagare per quello che mangi al ristorante — solo quello che consumi.',
      normale: 'È il costo dei kWh consumati, diviso in fasce orarie: F1 (ore di punta, di giorno nei feriali, più cara), F2 e F3 (sera e notte/festivi, meno care).',
      tecnico: 'Corrispettivo variabile calcolato sui kWh prelevati, differenziato per fascia F1/F2/F3 secondo delibera ARERA 654/2015/R/eel e aggiornamenti trimestrali.',
    },
    terminiGlossario: ['kwh', 'fascia-oraria', 'f1-f2-f3', 'quota-energia'],
    scala: 'consumo', soggettaFascia: true,
  },
  {
    id: 'quota-potenza', label: 'Quota Potenza impegnata', colore: 'potenza', importo: 8.50,
    spiegazione: {
      semplice: 'È come un "affitto" per avere la corrente disponibile in casa, anche se non la usi. Lo paghi ogni mese indipendentemente da quanto consumi.',
      normale: 'Dipende dalla potenza contrattuale (di solito 3 kW per un\'abitazione). Se usi molti elettrodomestici insieme potresti aver bisogno di più potenza — e il costo sale.',
      tecnico: 'Quota fissa proporzionale alla potenza impegnata contrattualmente (kW), fatturata in €/kW/mese secondo i corrispettivi di potenza ARERA.',
    },
    terminiGlossario: ['potenza-impegnata', 'quota-potenza'],
    scala: 'potenza',
  },
  {
    id: 'oneri-sistema', label: 'Oneri di Sistema', colore: 'oneri', importo: 11.20,
    spiegazione: {
      semplice: 'Sono costi fissi che tutti i clienti italiani pagano, indipendentemente da quanto consumano. Servono a mantenere la rete elettrica e finanziare le energie rinnovabili.',
      normale: 'Componenti tariffarie ARERA: A3 (incentivi rinnovabili), UC1/UC3 (qualità servizio), MCT (compensazioni territoriali). Uguali per tutti, non negoziabili.',
      tecnico: 'Componenti tariffarie ex delibera ARERA ARG/elt 199/11: A3 (incentivi FER), UC1, UC3, MCT. Indipendenti dal profilo di consumo.',
    },
    terminiGlossario: ['oneri-sistema', 'arera', 'dispacciamento'],
    scala: 'fissa',
  },
  {
    id: 'trasporto-contatore', label: 'Trasporto e gestione contatore', colore: 'trasporto', importo: 6.80,
    spiegazione: {
      semplice: 'Sono i costi per portare la corrente dalla centrale elettrica fino a casa tua, e per tenere in funzione il contatore.',
      normale: 'Comprende la quota di distribuzione (rete locale), trasmissione (rete nazionale) e la gestione del contatore.',
      tecnico: 'Corrispettivi di distribuzione, trasmissione e misura dell\'energia, definiti dall\'ARERA nell\'ambito della regolazione tariffaria delle reti.',
    },
    terminiGlossario: ['quota-fissa', 'contatore'],
    scala: 'fissa',
  },
  {
    id: 'accisa', label: 'Imposta: Accisa energia', colore: 'imposte', importo: 3.10,
    spiegazione: {
      semplice: 'È una tassa dello Stato sull\'energia elettrica. Tutti la pagano, è obbligatoria per legge.',
      normale: 'L\'accisa è un\'imposta di consumo applicata ai kWh. Per uso domestico è €0.0227/kWh fino a 1.800 kWh/mese, poi aliquota piena.',
      tecnico: 'Imposta di consumo ex D.Lgs. 26/2007 (TUA). Aliquota ridotta domestica: €0.0227/kWh per i primi 1.800 kWh/mese; aliquota ordinaria €0.0460/kWh oltre.',
    },
    terminiGlossario: ['accisa', 'iva'],
    scala: 'consumo',
  },
  {
    id: 'iva', label: 'Imposta: IVA 10%', colore: 'imposte', importo: 7.19,
    spiegazione: {
      semplice: 'È l\'IVA, la tassa che si paga su quasi tutto. Per l\'elettricità di casa è al 10% (meno del solito 22%) perché è un bene essenziale.',
      normale: 'IVA al 10% per l\'uso domestico dell\'energia elettrica. Per uso professionale l\'IVA salirebbe al 22%.',
      tecnico: 'IVA agevolata al 10% ex art. 127-bis DPR 633/72 per forniture di energia elettrica ad uso domestico. Aliquota ordinaria 22% per altri usi.',
    },
    terminiGlossario: ['iva'],
    scala: 'iva',
  },
]
```

- [ ] **1b.5 — Crea `src/data/glossario.js`** (24 termini — contenuto completo nel design doc Sezione 9)

```js
// Struttura di ogni termine:
// { id, termine, lettera, spiegazione: {semplice, normale, tecnico}, correlati: string[] }
// 24 termini: accisa, ammortamento, arera, capitale, contatore, dispacciamento,
//          f1-f2-f3, fascia-oraria, inflazione, interessi, iva, kwh, oneri-sistema,
//          piano-rimborso, potenza-impegnata, quota-energia, quota-fissa, quota-potenza,
//          rata, spread, taeg, tan, tasso-fisso, tasso-variabile
// NB: ogni id citato in `terminiGlossario` (bolletta.js) e in `correlati` DEVE esistere qui,
//     altrimenti il link apre il pannello su un termine inesistente senza alcun errore.
// Testo completo: design doc Sezione 9 → "Struttura dati"

export const glossario = [
  { id: 'accisa', termine: 'Accisa', lettera: 'A', spiegazione: { semplice: 'Una tassa dello Stato che si paga sull\'energia che consumi. È fissa per legge.', normale: 'Imposta di consumo applicata ai kWh di elettricità. Aliquota ridotta per uso domestico.', tecnico: 'Imposta di consumo ex D.Lgs. 26/2007 (TUA). Aliquota ridotta domestica €0.0227/kWh fino a 1.800 kWh/mese.' }, correlati: ['iva', 'quota-energia'] },
  { id: 'ammortamento', termine: 'Ammortamento', lettera: 'A', spiegazione: { semplice: 'Il processo di rimborso graduale di un debito. Ogni mese paghi una rata con una parte del debito e un po\' di interessi.', normale: 'Piano di rimborso in rate periodiche. All\'inizio si paga più interessi, verso la fine più capitale.', tecnico: 'Estinzione graduale mediante versamenti periodici. Ammortamento alla francese: rate costanti, quota capitale crescente, quota interessi decrescente.' }, correlati: ['rata', 'interessi', 'capitale'] },
  { id: 'arera', termine: 'ARERA', lettera: 'A', spiegazione: { semplice: 'L\'ente del governo che decide le regole e i prezzi dell\'energia in Italia. Non è il tuo fornitore — è l\'arbitro.', normale: 'Autorità di Regolazione per Energia Reti e Ambiente. Stabilisce le tariffe regolate e protegge i consumatori.', tecnico: 'Autorità indipendente ex L. 481/1995. Definisce la regolazione tariffaria, accesso alle reti e standard di qualità.' }, correlati: ['oneri-sistema', 'quota-potenza'] },
  { id: 'capitale', termine: 'Capitale', lettera: 'C', spiegazione: { semplice: 'La somma che hai preso in prestito. Ogni rata restituisce un po\' di questo importo.', normale: 'Quota rata destinata a ridurre il debito originario. Aumenta nel tempo man mano che gli interessi diminuiscono.', tecnico: 'Quota capitale = rata costante - quota interessi calcolata sul debito residuo.' }, correlati: ['rata', 'interessi', 'ammortamento'] },
  { id: 'contatore', termine: 'Contatore', lettera: 'C', spiegazione: { semplice: 'Il dispositivo che misura quanta elettricità usi. Come il chilometrico di un\'auto.', normale: 'Strumento di misura dell\'energia prelevata. Il contatore elettronico trasmette le letture automaticamente.', tecnico: 'Misuratore di energia (punto di prelievo). I contatori 2G trasmettono teleletture ogni 15 minuti.' }, correlati: ['quota-potenza', 'quota-energia'] },
  { id: 'dispacciamento', termine: 'Dispacciamento', lettera: 'D', spiegazione: { semplice: 'Il lavoro di bilanciamento continuo della rete elettrica: quanta corrente entra deve essere uguale a quanta ne esce.', normale: 'Servizio di gestione in tempo reale del bilanciamento tra produzione e consumo. Gestito da Terna.', tecnico: 'Servizio di dispacciamento (SD) ex Terna S.p.A. come TSO. Costi uplift socializzati attraverso componenti UC.' }, correlati: ['oneri-sistema', 'arera'] },
  { id: 'f1-f2-f3', termine: 'F1 / F2 / F3', lettera: 'F', spiegazione: { semplice: 'Le fasce orarie della luce: F1 è la più cara (giorno feriale), F3 la più economica (notte e festivi).', normale: 'F1: lun-ven 8-19 (picco). F2: lun-ven 7-8 e 19-23, sab 7-23 (intermedio). F3: notti, domeniche, festivi (minimo).', tecnico: 'Fasce TOU definite dall\'ARERA. F1: ore di picco. F2: ore intermedie. F3: ore fuori picco. Rilevanti per tariffe biorarie/multiorarie.' }, correlati: ['fascia-oraria', 'quota-energia', 'kwh'] },
  { id: 'fascia-oraria', termine: 'Fascia oraria', lettera: 'F', spiegazione: { semplice: 'A seconda dell\'ora del giorno l\'elettricità costa di più o di meno. Di notte costa meno — come i voli lowcost.', normale: 'Suddivisione della giornata in periodi con prezzi diversi: lo stesso kWh costa cifre diverse a seconda dell\'ora in cui viene prelevato.', tecnico: 'Struttura tariffaria time-of-use (TOU) che differenzia il corrispettivo per fascia F1/F2/F3.' }, correlati: ['f1-f2-f3', 'quota-energia'] },
  { id: 'inflazione', termine: 'Inflazione', lettera: 'I', spiegazione: { semplice: 'L\'aumento generale dei prezzi nel tempo. Se è alta, con gli stessi soldi compri meno rispetto all\'anno scorso.', normale: 'Variazione percentuale del livello generale dei prezzi. In Italia calcolata dall\'ISTAT (indice NIC e FOI).', tecnico: 'Variazione del livello aggregato dei prezzi (CPI). Rilevante per adeguamento canoni e rivalutazione capitali.' }, correlati: ['spread', 'tasso-variabile'] },
  { id: 'interessi', termine: 'Interessi', lettera: 'I', spiegazione: { semplice: 'Il costo che paghi per aver preso in prestito dei soldi. Come un affitto per usare il denaro della banca.', normale: 'Quota rata che remunera il prestatore. Si calcola sul debito residuo × tasso mensile.', tecnico: 'Quota interessi = debito residuo × (TAN / 12). Decresce nell\'ammortamento alla francese.' }, correlati: ['rata', 'capitale', 'tan', 'taeg'] },
  { id: 'iva', termine: 'IVA', lettera: 'I', spiegazione: { semplice: 'La tassa che si paga su quasi tutti i prodotti. Per l\'energia di casa è 10% (meno del 22% normale) perché è essenziale.', normale: 'Imposta sul Valore Aggiunto. Per energia elettrica domestica aliquota agevolata 10%. Per uso professionale 22%.', tecnico: 'IVA agevolata 10% ex Tabella A, parte II-bis DPR 633/72 per forniture domestiche. Aliquota ordinaria 22% altri usi.' }, correlati: ['accisa'] },
  { id: 'kwh', termine: 'kWh', lettera: 'K', spiegazione: { semplice: 'L\'unità di misura dell\'elettricità. Un kWh è energia usata da una lampadina da 1.000 watt accesa per un\'ora.', normale: 'Kilowattora: 1.000 watt per 1 ora. Una lavatrice usa ~1 kWh per ciclo, una TV LED ~0.1 kWh/ora.', tecnico: 'Unità di energia elettrica attiva: 1 kWh = 3.6 MJ. Grandezza di riferimento per la fatturazione dell\'energia prelevata.' }, correlati: ['quota-energia', 'fascia-oraria', 'potenza-impegnata'] },
  { id: 'oneri-sistema', termine: 'Oneri di sistema', lettera: 'O', spiegazione: { semplice: 'Costi che tutti pagano per tenere in funzione la rete italiana e finanziare le energie rinnovabili. Non dipendono da quanto consumi.', normale: 'Componenti tariffarie ARERA che coprono incentivi FER (A3), qualità servizio (UC), compensazioni territoriali (MCT).', tecnico: 'Componenti parafiscali ex delibera ARERA ARG/elt 199/11. A3, UC1, UC3, UC6, MCT in quota variabile o fissa.' }, correlati: ['arera', 'dispacciamento', 'quota-fissa'] },
  { id: 'piano-rimborso', termine: 'Piano di rimborso', lettera: 'P', spiegazione: { semplice: 'Il calendario di tutti i pagamenti per restituire un prestito: quando paghi, quanto, e quanto debito rimane.', normale: 'Tabella con ogni rata suddivisa tra quota capitale e quota interessi, e il debito residuo dopo ogni pagamento.', tecnico: 'Prospetto analitico dell\'ammortamento: per ogni periodo mostra rata, quota interessi, quota capitale e debito residuo.' }, correlati: ['ammortamento', 'rata', 'capitale'] },
  { id: 'potenza-impegnata', termine: 'Potenza impegnata', lettera: 'P', spiegazione: { semplice: 'La quantità massima di elettricità che puoi usare contemporaneamente. Se superi questo limite, il contatore si stacca.', normale: 'La potenza contrattuale (tipicamente 3 kW per uso domestico). Determina quanti elettrodomestici puoi usare insieme.', tecnico: 'Potenza disponibile massima (kW) definita dal contratto. Il superamento attiva la protezione di massima corrente.' }, correlati: ['quota-potenza', 'contatore', 'kwh'] },
  { id: 'quota-energia', termine: 'Quota energia', lettera: 'Q', spiegazione: { semplice: 'La parte della bolletta che dipende da quanta elettricità hai usato. Più consumi, più paghi.', normale: 'Componente variabile: kWh consumati × prezzo unitario per fascia oraria.', tecnico: 'Corrispettivo variabile €/kWh per fascia F1/F2/F3. Aggiornato trimestralmente da ARERA per il mercato tutelato.' }, correlati: ['kwh', 'fascia-oraria', 'f1-f2-f3'] },
  { id: 'quota-fissa', termine: 'Quota fissa', lettera: 'Q', spiegazione: { semplice: 'La parte che paghi sempre, anche se non usi affatto la corrente. Come l\'abbonamento a uno streaming.', normale: 'Componente mensile indipendente dai consumi. Copre gestione contatore, trasporto e parte degli oneri di sistema.', tecnico: 'Corrispettivo fisso €/mese che remunera i costi di rete indipendenti dal volume di energia prelevata.' }, correlati: ['oneri-sistema', 'quota-potenza'] },
  { id: 'quota-potenza', termine: 'Quota potenza', lettera: 'Q', spiegazione: { semplice: 'La parte fissa che paghi per avere a disposizione una certa quantità di corrente, anche nei mesi in cui consumi pochissimo.', normale: 'Costo mensile proporzionale alla potenza impegnata dal contratto (di solito 3 kW). Aumenta se chiedi più potenza disponibile.', tecnico: 'Corrispettivo €/kW/mese sulla potenza impegnata contrattualmente, secondo i corrispettivi di potenza definiti da ARERA.' }, correlati: ['potenza-impegnata', 'quota-fissa', 'arera'] },
  { id: 'rata', termine: 'Rata', lettera: 'R', spiegazione: { semplice: 'Il pagamento periodico per restituire un prestito. Ogni rata comprende una parte del debito e un po\' di interessi.', normale: 'Pagamento fisso (nell\'ammortamento alla francese) composto da quota capitale + quota interessi. La proporzione cambia nel tempo.', tecnico: 'R = P × [r(1+r)^n] / [(1+r)^n - 1]. Quota interessi decresce, quota capitale cresce nel tempo.' }, correlati: ['ammortamento', 'capitale', 'interessi', 'tan'] },
  { id: 'spread', termine: 'Spread', lettera: 'S', spiegazione: { semplice: 'Il "ricarico" che la banca aggiunge al tasso base per guadagnare sul prestito. Più alto è, più paghi.', normale: 'Margine aggiunto al tasso di riferimento (es. Euribor) per determinare il tasso variabile finale.', tecnico: 'Componente del tasso che remunera rischio di credito e margine commerciale. TAN = tasso indice + spread.' }, correlati: ['tan', 'taeg', 'tasso-variabile'] },
  { id: 'taeg', termine: 'TAEG', lettera: 'T', spiegazione: { semplice: 'Il costo totale del prestito in percentuale, tutto incluso. TAN è il prezzo del pane, TAEG è quello che paghi alla cassa con sacchetto e scontrino.', normale: 'Tasso Annuo Effettivo Globale: TAN + spese accessorie (assicurazioni, commissioni). È l\'indicatore che rende confrontabili offerte con spese diverse.', tecnico: 'Indicatore sintetico ex direttiva 2008/48/CE inclusivo di tutti gli oneri noti al momento della stipula.' }, correlati: ['tan', 'rata', 'ammortamento'] },
  { id: 'tan', termine: 'TAN', lettera: 'T', spiegazione: { semplice: 'Il tasso di interesse "puro" di un prestito, senza le spese extra. Di solito è più basso del TAEG.', normale: 'Tasso Annuo Nominale: il tasso applicato al capitale, senza spese accessorie. Serve per calcolare la rata.', tecnico: 'Tasso nominale annuo per il calcolo della quota interessi nelle rate. Non include commissioni o oneri (che confluiscono nel TAEG).' }, correlati: ['taeg', 'interessi', 'rata'] },
  { id: 'tasso-fisso', termine: 'Tasso fisso', lettera: 'T', spiegazione: { semplice: 'Il tasso non cambia mai per tutta la durata del prestito. La rata che paghi oggi è uguale a quella di tra 10 anni.', normale: 'Il tasso è definito alla stipula e rimane invariato. Protegge dai rialzi dei tassi di mercato.', tecnico: 'TAN costante per l\'intera vita del finanziamento, indipendente dall\'andamento dei tassi di riferimento.' }, correlati: ['tasso-variabile', 'tan', 'spread'] },
  { id: 'tasso-variabile', termine: 'Tasso variabile', lettera: 'T', spiegazione: { semplice: 'Il tasso può cambiare nel tempo. Se i tassi salgono, paghi di più; se scendono, paghi di meno.', normale: 'Agganciato a un indice di riferimento (es. Euribor 3 mesi) + spread fisso. La rata varia all\'aggiornamento periodico.', tecnico: 'TAN = indice di riferimento (Euribor/IRS) + spread. Rata si ricalcola ad ogni reset periodico.' }, correlati: ['tasso-fisso', 'tan', 'spread', 'inflazione'] },
]
```

- [ ] **1b.6 — Crea `src/data/rata.js`**

```js
export const rataContesti = {
  spiegazione: {
    semplice: 'All\'inizio paghi più interessi perché il debito è alto. Man mano che rimborsi, gli interessi scendono. È normale — si chiama ammortamento.',
    normale: 'Nell\'ammortamento alla francese le rate sono costanti ma la composizione cambia: le prime rate hanno più interessi, le ultime quasi solo capitale.',
    tecnico: 'Piano alla francese: rata costante R, quota interessi decrescente I_t = D_{t-1} × r, quota capitale crescente C_t = R - I_t. Debito residuo D_t → 0 alla scadenza.',
  },
}
export const DURATE_DISPONIBILI = [12, 24, 36, 48, 60, 84, 120]
export const IMPORTO_DEFAULT = 10000
export const TASSO_DEFAULT = 7.5
export const DURATA_DEFAULT = 36
```

- [ ] **1b.7 — Esegui test → verifica PASS**

```bash
npm run test -- tests/loanCalculator.test.js
```
Atteso: **7 test PASS** (3 in `calcolaRata` + 4 in `calcolaPianoAmmortamento`).

- [ ] **1b.8 — Commit**

```bash
git add -A
git commit -m "feat(#1b): data layer completo

- loanCalculator: calcolaRata, calcolaPianoAmmortamento, formatEuro
- data/bolletta.js: 6 voci con spiegazioni a 3 livelli
- data/glossario.js: 24 termini con correlati
- data/rata.js: contesti e costanti
- 7 unit test passanti

Closes #1b

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
git push origin feature/1b-data-layer
```

> **Orchestrator:** attende che ENTRAMBE #1a e #1b siano Done → dispatcha in parallelo Developer Agent #2, #3, #4, #5

---

## Issue #2 — Header + HubView
**Developer Agent #2 (`claude-sonnet-5`) | Parallelo con #3 #4 #5 | ~30 min**

**Branch:** `feature/2-header-hubview`
**Dipende da:** Issue #1a e #1b entrambe mergiate su main → `git checkout main && git pull && git checkout -b feature/2-header-hubview`

**Files da creare:**
- `src/components/Header/Header.jsx` · `src/components/Header/Header.css` · `src/components/Header/LevelSelector.jsx`
- `src/components/Hub/HubView.jsx` · `src/components/Hub/HubView.css` · `src/components/Hub/SituationCard.jsx`

---

- [ ] **2.1 — Crea `src/components/Header/LevelSelector.jsx`**

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
        <button key={id} className={`level-btn ${currentLevel === id ? 'active' : ''}`} onClick={() => setLevel(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **2.2 — Crea `src/components/Header/Header.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import LevelSelector from './LevelSelector'
import './Header.css'

export default function Header() {
  const { setGlossaryOpen, setView } = useApp()
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => setView('hub')}>💡 FinanzaChiara</button>
      <LevelSelector />
      <button className="glossary-btn" onClick={() => setGlossaryOpen(true)}>📖 Glossario</button>
    </header>
  )
}
```

- [ ] **2.3 — Crea `src/components/Header/Header.css`**

```css
.header { display: flex; align-items: center; gap: 16px; padding: 12px 24px; background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow); }
.logo-btn { font-size: 1.2rem; font-weight: 700; background: none; border: none; color: var(--color-primary); flex-shrink: 0; }
.level-selector { display: flex; gap: 4px; background: var(--color-bg); padding: 4px; border-radius: var(--radius); margin-left: auto; }
.level-btn { padding: 6px 14px; border: none; border-radius: calc(var(--radius) - 2px); background: transparent; color: var(--color-text-muted); font-size: 0.875rem; transition: all 0.15s; }
.level-btn.active { background: var(--color-surface); color: var(--color-text); font-weight: 600; box-shadow: var(--shadow); }
.glossary-btn { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-surface); font-size: 0.875rem; flex-shrink: 0; }
```

- [ ] **2.4 — Crea `src/components/Hub/SituationCard.jsx`**

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

- [ ] **2.5 — Crea `src/components/Hub/HubView.jsx`**

```jsx
import { useApp } from '../../context/AppContext'
import SituationCard from './SituationCard'
import './HubView.css'

const CARDS = [
  { id: 'bolletta', emoji: '⚡', titolo: 'La mia bolletta', descrizione: 'Capisco cosa pago voce per voce', view: 'bolletta' },
  { id: 'rata', emoji: '💳', titolo: 'Un prestito o una rata', descrizione: 'Scopro quanto costa davvero', view: 'rata' },
  { id: 'glossario', emoji: '📖', titolo: 'Parole difficili', descrizione: 'Cerco un termine che non capisco', view: null },
]

export default function HubView() {
  const { setView, setGlossaryOpen } = useApp()
  return (
    <div className="hub">
      <h1 className="hub-title">Cosa vuoi capire oggi?</h1>
      <div className="hub-grid">
        {CARDS.map(card => (
          <SituationCard key={card.id} emoji={card.emoji} titolo={card.titolo} descrizione={card.descrizione}
            onClick={() => card.view ? setView(card.view) : setGlossaryOpen(true)} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **2.6 — Crea `src/components/Hub/HubView.css`**

```css
.hub { text-align: center; padding: 48px 24px; }
.hub-title { font-size: 2rem; font-weight: 700; margin-bottom: 40px; }
.hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto; }
.situation-card { background: var(--color-surface); border: 2px solid var(--color-border); border-radius: 16px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; transition: all 0.2s; text-align: center; }
.situation-card:hover { border-color: var(--color-primary); box-shadow: 0 4px 12px rgba(37,99,235,0.15); transform: translateY(-2px); }
.card-emoji { font-size: 2.5rem; }
.card-titolo { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.card-desc { font-size: 0.9rem; color: var(--color-text-muted); }
```

- [ ] **2.7 — Commit**

```bash
git add -A
git commit -m "feat(#2): Header, LevelSelector e HubView

Closes #2"
git push origin feature/2-header-hubview
```

---

## Issue #3 — BollettaRoom completa
**Developer Agent #3 (`claude-sonnet-5`) | Parallelo con #2 #4 #5 | ~55 min**

**Branch:** `feature/3-bollettaroom`
**Dipende da:** Issue #1a e #1b entrambe mergiate su main → `git checkout main && git pull && git checkout -b feature/3-bollettaroom`

**Files da creare:**
- `src/components/Bolletta/BollettaRoom.jsx` · `BollettaRoom.css`
- `src/components/Bolletta/BillViewer.jsx` · `BillViewer.css` · `BillVoce.jsx`
- `src/components/Bolletta/ExplanationPanel.jsx` · `ExplanationPanel.css`
- `src/components/Bolletta/SimulationPanel.jsx` · `SimulationPanel.css`

---

- [ ] **3.1 — Crea `BillVoce.jsx`**

```jsx
export default function BillVoce({ voce, isActive, onClick }) {
  return (
    <button className={`bill-voce zona-${voce.colore} ${isActive ? 'active' : ''}`} onClick={onClick} aria-pressed={isActive}>
      <span className="voce-label">{voce.label}</span>
      <span className="voce-importo">€{voce.importo.toFixed(2)}</span>
    </button>
  )
}
```

- [ ] **3.2 — Crea `BillViewer.jsx` + `BillViewer.css`**

```jsx
import { useApp } from '../../context/AppContext'
import { bollettaVoci, TOTALE_BOLLETTA } from '../../data/bolletta'
import BillVoce from './BillVoce'
import './BillViewer.css'

export default function BillViewer() {
  const { activeVoce, setActiveVoce } = useApp()
  return (
    <div className="bill-viewer">
      <div className="bill-header"><h3>Bolletta Energia Elettrica</h3><p className="bill-periodo">Periodo: agosto 2026</p></div>
      <div className="bill-voci">
        {bollettaVoci.map(voce => (
          <BillVoce key={voce.id} voce={voce} isActive={activeVoce?.id === voce.id}
            onClick={() => setActiveVoce(voce.id === activeVoce?.id ? null : voce)} />
        ))}
      </div>
      <div className="bill-totale"><span>TOTALE DA PAGARE</span><span className="totale-importo">€{TOTALE_BOLLETTA.toFixed(2)}</span></div>
      <p className="bill-hint">👆 Clicca su una voce per capire cosa significa</p>
    </div>
  )
}
```

```css
/* BillViewer.css */
.bill-viewer { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; }
.bill-header { background: #1e293b; color: white; padding: 16px 20px; }
.bill-header h3 { font-size: 1rem; font-weight: 600; }
.bill-periodo { font-size: 0.8rem; opacity: 0.7; margin-top: 2px; }
.bill-voci { display: flex; flex-direction: column; }
.bill-voce { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border: none; border-bottom: 1px solid var(--color-border); background: var(--color-surface); text-align: left; font-size: 0.9rem; cursor: pointer; transition: background 0.15s; border-left: 4px solid transparent; }
.bill-voce:hover { background: var(--color-bg); }
.bill-voce.active { background: #eff6ff; }
.zona-energia { border-left-color: var(--color-zona-energia); }
.zona-potenza  { border-left-color: var(--color-zona-potenza); }
.zona-oneri    { border-left-color: var(--color-zona-oneri); }
.zona-trasporto{ border-left-color: var(--color-zona-trasporto); }
.zona-imposte  { border-left-color: var(--color-zona-imposte); }
.voce-label { color: var(--color-text); flex: 1; }
.voce-importo { font-weight: 600; font-variant-numeric: tabular-nums; }
.bill-totale { display: flex; justify-content: space-between; padding: 16px 20px; background: #1e293b; color: white; font-weight: 700; }
.totale-importo { font-size: 1.2rem; }
.bill-hint { text-align: center; padding: 10px; font-size: 0.8rem; color: var(--color-text-muted); }
```

- [ ] **3.3 — Crea `ExplanationPanel.jsx` + `ExplanationPanel.css`**

```jsx
import { useApp } from '../../context/AppContext'
import { TOTALE_BOLLETTA } from '../../data/bolletta'
import './ExplanationPanel.css'

const COLORI = { energia: '#3b82f6', potenza: '#eab308', oneri: '#f97316', trasporto: '#ef4444', imposte: '#8b5cf6' }

export default function ExplanationPanel() {
  const { activeVoce, currentLevel, openGlossaryTerm } = useApp()
  if (!activeVoce) return (
    <div className="explanation-panel empty">
      <p className="empty-msg">👈 Seleziona una voce della bolletta per capire cosa significa</p>
    </div>
  )
  const pct = ((activeVoce.importo / TOTALE_BOLLETTA) * 100).toFixed(1)
  const colore = COLORI[activeVoce.colore] || '#94a3b8'
  return (
    <div className="explanation-panel">
      <div className="exp-header" style={{ borderLeftColor: colore }}>
        <h3 className="exp-label">{activeVoce.label}</h3>
        <span className="exp-importo">€{activeVoce.importo.toFixed(2)}</span>
      </div>
      <div className="exp-barra">
        <div className="barra-fill" style={{ width: `${pct}%`, background: colore }} />
      </div>
      <span className="barra-pct">{pct}% della bolletta</span>
      <p className="exp-testo">{activeVoce.spiegazione[currentLevel]}</p>
      {activeVoce.terminiGlossario?.length > 0 && (
        <div className="exp-termini">
          <span className="termini-label">Approfondisci nel glossario:</span>
          <div className="termini-list">
            {activeVoce.terminiGlossario.map(id => (
              <button key={id} className="termine-link" onClick={() => openGlossaryTerm(id)}>→ {id.replace(/-/g, ' ')}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

```css
/* ExplanationPanel.css */
.explanation-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; min-height: 200px; }
.explanation-panel.empty { display: flex; align-items: center; justify-content: center; }
.empty-msg { color: var(--color-text-muted); font-size: 0.95rem; text-align: center; }
.exp-header { display: flex; justify-content: space-between; align-items: flex-start; border-left: 4px solid; padding-left: 12px; margin-bottom: 16px; }
.exp-label { font-size: 1rem; font-weight: 600; }
.exp-importo { font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; }
/* La didascalia sta FUORI dalla barra: dentro, con height 8px fissa, traboccava
   e finiva sopra il paragrafo. */
.exp-barra { background: var(--color-bg); border-radius: 4px; height: 8px; overflow: hidden; }
.barra-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
.barra-pct { display: block; margin-top: 6px; font-size: 0.75rem; color: var(--color-text-muted); }
.exp-testo { margin-top: 16px; line-height: 1.6; font-size: 0.95rem; }
.exp-termini { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--color-border); }
.termini-label { font-size: 0.8rem; color: var(--color-text-muted); display: block; margin-bottom: 8px; }
.termini-list { display: flex; flex-wrap: wrap; gap: 8px; }
.termine-link { background: none; border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; text-transform: capitalize; }
```

- [ ] **3.4 — Crea `SimulationPanel.jsx` + `SimulationPanel.css`**

```jsx
import { useState } from 'react'
import { bollettaVoci, TOTALE_BOLLETTA, ALIQUOTA_IVA } from '../../data/bolletta'
import './SimulationPanel.css'

// Ipotesi dichiarata, non un dato: lo sconto per fascia vale SOLO sulla quota energia.
// Oneri, trasporto, quota potenza e imposte non dipendono dall'ora in cui consumi.
const SCONTO_FASCIA = { giorno: 0, sera: -0.05, notte: -0.15 }
const CONSUMO_BASE = 180
const POTENZA_BASE = 3

function calcolaBollettaSimulata(consumo, potenza, fascia) {
  const imponibile = bollettaVoci
    .filter(v => v.scala !== 'iva')
    .reduce((sum, v) => {
      if (v.scala === 'consumo') {
        const base = v.importo * (consumo / CONSUMO_BASE)
        return sum + (v.soggettaFascia ? base * (1 + SCONTO_FASCIA[fascia]) : base)
      }
      if (v.scala === 'potenza') return sum + v.importo * (potenza / POTENZA_BASE)
      return sum + v.importo
    }, 0)
  // L'IVA si RICALCOLA sul nuovo imponibile: non e' una voce che scala per conto suo.
  // Ai valori di default (180 kWh, 3 kW, giorno) questo riproduce esattamente €79.09.
  return { imponibile, iva: imponibile * ALIQUOTA_IVA, totale: imponibile * (1 + ALIQUOTA_IVA) }
}

// Senza segno esplicito un risparmio si stampa identico a un aumento.
function conSegno(n, decimali = 2) {
  return `${n >= 0 ? '+' : '−'}€${Math.abs(n).toFixed(decimali)}`
}

export default function SimulationPanel() {
  const [consumo, setConsumo] = useState(CONSUMO_BASE)
  const [potenza, setPotenza] = useState(POTENZA_BASE)
  const [fascia, setFascia] = useState('giorno')
  const { imponibile, iva, totale } = calcolaBollettaSimulata(consumo, potenza, fascia)
  const diff = totale - TOTALE_BOLLETTA
  return (
    <div className="simulation-panel">
      <h3 className="sim-title">💡 Cosa succederebbe se cambiassi i tuoi consumi?</h3>
      <p className="sim-subtitle">Muovi i cursori — il calcolo si aggiorna subito. Il sistema mostra solo la matematica.</p>
      <div className="sim-controls">
        <label className="sim-label">Consumo mensile: <strong>{consumo} kWh</strong>
          <input type="range" min={50} max={400} step={10} value={consumo} onChange={e => setConsumo(Number(e.target.value))} className="sim-slider" />
        </label>
        <label className="sim-label">Potenza impegnata: <strong>{potenza} kW</strong>
          <input type="range" min={1.5} max={6} step={0.5} value={potenza} onChange={e => setPotenza(Number(e.target.value))} className="sim-slider" />
        </label>
        <div className="sim-label"><span>Fascia oraria prevalente:</span>
          <div className="fascia-group">
            {['giorno','sera','notte'].map(f => (
              <button key={f} className={`fascia-btn ${fascia === f ? 'active' : ''}`} onClick={() => setFascia(f)}>
                {f === 'giorno' ? '☀️ Giorno' : f === 'sera' ? '🌆 Sera' : '🌙 Notte'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`sim-result ${diff < 0 ? 'risparmio' : 'aumento'}`}>
        <div className="result-row"><span>Con queste scelte:</span><strong>€{totale.toFixed(2)}</strong></div>
        <div className="result-row muted"><span>di cui imponibile:</span><span>€{imponibile.toFixed(2)}</span></div>
        <div className="result-row muted"><span>di cui IVA 10%:</span><span>€{iva.toFixed(2)}</span></div>
        <div className="result-row muted"><span>Bolletta di esempio:</span><span>€{TOTALE_BOLLETTA.toFixed(2)}</span></div>
        <div className="result-row differenza"><span>Differenza:</span>
          <strong>{conSegno(diff)}/mese → {conSegno(diff * 12, 0)}/anno</strong>
        </div>
      </div>
      <p className="sim-nota">
        Come è calcolato: quota energia e accisa scalano con i kWh, la quota potenza con i kW,
        oneri di sistema e trasporto restano fissi, l&apos;IVA è il 10% dell&apos;imponibile risultante.
        Lo sconto per fascia (−5% sera, −15% notte) è un&apos;ipotesi applicata alla sola quota energia.
      </p>
    </div>
  )
}
```

```css
/* SimulationPanel.css */
.simulation-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; }
.sim-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
.sim-subtitle { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 24px; }
.sim-controls { display: flex; flex-direction: column; gap: 20px; }
.sim-label { display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem; }
.sim-slider { width: 100%; accent-color: var(--color-primary); }
.fascia-group { display: flex; gap: 8px; }
.fascia-btn { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 20px; background: var(--color-bg); font-size: 0.875rem; }
.fascia-btn.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
.sim-result { margin-top: 24px; padding: 16px 20px; border-radius: 10px; border: 2px solid; display: flex; flex-direction: column; gap: 8px; }
.sim-result.risparmio { border-color: #22c55e; background: #f0fdf4; }
.sim-result.aumento   { border-color: #ef4444; background: #fef2f2; }
.result-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
.result-row.muted { color: var(--color-text-muted); font-size: 0.85rem; }
.result-row.differenza { font-weight: 700; }
.sim-nota { margin-top: 14px; font-size: 0.75rem; line-height: 1.5; color: var(--color-text-muted); }
.sim-result.risparmio .differenza { color: #16a34a; }
.sim-result.aumento   .differenza { color: #dc2626; }
```

- [ ] **3.5 — Crea `BollettaRoom.jsx` + `BollettaRoom.css`**

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
      <div className="bolletta-grid"><BillViewer /><ExplanationPanel /></div>
      <SimulationPanel />
    </div>
  )
}
```

```css
/* BollettaRoom.css */
.bolletta-room { display: flex; flex-direction: column; gap: 24px; }
.back-btn { align-self: flex-start; background: none; border: none; color: var(--color-primary); font-size: 0.9rem; padding: 0; }
.room-title { font-size: 1.5rem; font-weight: 700; }
.bolletta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .bolletta-grid { grid-template-columns: 1fr; } }
```

- [ ] **3.6 — Commit**

```bash
git add -A
git commit -m "feat(#3): BollettaRoom completa (BillViewer, ExplanationPanel, SimulationPanel)

Closes #3"
git push origin feature/3-bollettaroom
```

---

## Issue #4 — GlossaryPanel
**Developer Agent #4 (`claude-sonnet-5`) | Parallelo con #2 #3 #5 | ~35 min**

**Branch:** `feature/4-glossarypanel`
**Dipende da:** Issue #1a e #1b entrambe mergiate su main → `git checkout main && git pull && git checkout -b feature/4-glossarypanel`

**Files da creare:**
- `src/components/Glossario/GlossaryPanel.jsx` · `GlossaryPanel.css`
- `src/components/Glossario/GlossarySearch.jsx`
- `src/components/Glossario/GlossaryTerm.jsx`

---

- [ ] **4.1 — Crea `GlossarySearch.jsx`**

```jsx
import { forwardRef } from 'react'

// Niente autoFocus: il focus alla ricerca lo da' GlossaryPanel in modo imperativo,
// dentro lo stesso effect che cattura il focus precedente (vedi commento in GlossaryPanel).
// Con autoFocus sul JSX, React lo applica in fase di commit prima che l'effect giri, quindi
// la cattura di document.activeElement prenderebbe questo input invece del trigger di apertura.
const GlossarySearch = forwardRef(function GlossarySearch({ value, onChange }, ref) {
  return (
    <div className="glossary-search">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input ref={ref} type="search" aria-label="Cerca un termine nel glossario" placeholder="Cerca un termine..."
        value={value} onChange={e => onChange(e.target.value)} className="search-input" />
    </div>
  )
})

export default GlossarySearch
```

- [ ] **4.2 — Crea `GlossaryTerm.jsx`**

```jsx
import { useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function GlossaryTerm({ termine, isActive, onSelect }) {
  const { currentLevel, openGlossaryTerm } = useApp()
  const ref = useRef(null)
  useEffect(() => { if (isActive && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [isActive])
  const bodyId = `term-body-${termine.id}`
  return (
    <div ref={ref} className={`glossary-term ${isActive ? 'active' : ''}`}>
      {/* Il toggle e' un <button> vero, non un <div onClick>: raggiungibile da Tab,
          attivabile con Invio/Spazio e annunciato con lo stato aperto/chiuso.
          I link ai correlati stanno FUORI da questo bottone (button annidati sono
          HTML invalido), percio' non serve piu' e.stopPropagation(). */}
      <button className="term-header" onClick={onSelect} aria-expanded={isActive} aria-controls={bodyId}>
        <span className="term-nome">{termine.termine}</span>
        <span className="term-toggle" aria-hidden="true">{isActive ? '▲' : '▼'}</span>
      </button>
      {isActive && (
        <div className="term-body" id={bodyId}>
          <p className="term-spiegazione">{termine.spiegazione[currentLevel]}</p>
          {termine.correlati?.length > 0 && (
            <div className="term-correlati">
              <span className="correlati-label">Vedi anche: </span>
              {termine.correlati.map(id => (
                <button key={id} className="correlato-link" onClick={() => openGlossaryTerm(id)}>
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

- [ ] **4.3 — Crea `GlossaryPanel.jsx` + `GlossaryPanel.css`**

```jsx
import { useState, useMemo, useEffect, useRef } from 'react'
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
    return glossario.filter(t => t.termine.toLowerCase().includes(q) || Object.values(t.spiegazione).some(s => s.toLowerCase().includes(q)))
  }, [query])
  const perLettera = useMemo(() => terminiVisibili.reduce((acc, t) => { const l = t.lettera; if (!acc[l]) acc[l] = []; acc[l].push(t); return acc }, {}), [terminiVisibili])
  function handleClose() { setGlossaryOpen(false); setActiveGlossaryTerm(null); setQuery('') }

  // Un correlato puo' puntare a un termine escluso dal filtro di ricerca corrente: se cosi',
  // il suo <GlossaryTerm> non verrebbe mai renderizzato (niente scroll, niente espansione, e
  // si perderebbe pure il termine che si stava leggendo). Azzeriamo la query SOLO quando serve
  // -- il termine attivo non e' tra quelli visibili -- altrimenti si romperebbe il caso normale:
  // l'utente cerca, clicca un risultato gia' visibile, e si aspetta che il filtro resti.
  useEffect(() => {
    if (activeGlossaryTerm && !terminiVisibili.some(t => t.id === activeGlossaryTerm)) {
      setQuery('')
    }
  }, [activeGlossaryTerm, terminiVisibili])

  // Esc chiude, e il focus torna dov'era prima dell'apertura: senza questo chi naviga
  // da tastiera resta bloccato in fondo alla pagina dopo aver chiuso il pannello.
  const focusPrecedente = useRef(null)
  const searchRef = useRef(null)
  useEffect(() => {
    if (!glossaryOpen) return
    // La cattura deve avvenire PRIMA che qualsiasi elemento del pannello riceva il focus:
    // percio' niente autoFocus nel JSX (scatterebbe in fase di commit, prima di questo
    // effect) e il focus alla ricerca e' dato qui sotto, imperativamente, dopo la cattura.
    focusPrecedente.current = document.activeElement
    // Il focus va alla ricerca solo quando il pannello si apre "vuoto": se arriva da un
    // link su un termine, il focus deve restare su quel termine, non sulla ricerca.
    if (!activeGlossaryTerm) searchRef.current?.focus()
    function onKeyDown(e) { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      focusPrecedente.current?.focus?.()
    }
  }, [glossaryOpen])

  if (!glossaryOpen) return null
  return (
    <>
      <div className="glossary-backdrop" onClick={handleClose} aria-hidden="true" />
      <aside className="glossary-panel" role="dialog" aria-modal="true" aria-label="Glossario">
        <div className="glossary-header"><h2>📖 Glossario</h2><button className="close-btn" onClick={handleClose} aria-label="Chiudi il glossario">✕</button></div>
        <div className="glossary-search-wrap"><GlossarySearch ref={searchRef} value={query} onChange={setQuery} /></div>
        <div className="glossary-list">
          {Object.keys(perLettera).sort().map(lettera => (
            <section key={lettera} className="lettera-group">
              <h3 className="lettera-heading">{lettera}</h3>
              {perLettera[lettera].map(t => (
                <GlossaryTerm key={t.id} termine={t} isActive={activeGlossaryTerm === t.id}
                  onSelect={() => setActiveGlossaryTerm(activeGlossaryTerm === t.id ? null : t.id)} />
              ))}
            </section>
          ))}
          {terminiVisibili.length === 0 && <p className="no-results">Nessun termine trovato per «{query}»</p>}
        </div>
      </aside>
    </>
  )
}
```

```css
/* GlossaryPanel.css */
.glossary-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; }
.glossary-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 95vw; background: var(--color-surface); z-index: 201; display: flex; flex-direction: column; box-shadow: -4px 0 20px rgba(0,0,0,0.15); animation: slideIn 0.2s ease; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.glossary-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--color-border); }
.glossary-header h2 { font-size: 1.1rem; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 1.2rem; color: var(--color-text-muted); }
.glossary-search-wrap { padding: 12px 20px; border-bottom: 1px solid var(--color-border); }
.glossary-search { display: flex; align-items: center; gap: 8px; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 8px 12px; }
.search-input { border: none; background: none; flex: 1; font-size: 0.9rem; outline: none; }
.glossary-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.lettera-group { margin-bottom: 4px; }
.lettera-heading { padding: 8px 20px 4px; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.glossary-term { border-bottom: 1px solid var(--color-border); }
.glossary-term:hover, .glossary-term.active { background: #eff6ff; }
.term-header { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 12px 20px; background: none; border: none; font: inherit; color: inherit; text-align: left; }
.term-body { padding: 0 20px 12px; margin-top: 0; }
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.term-nome { font-weight: 600; font-size: 0.95rem; }
.term-toggle { font-size: 0.7rem; color: var(--color-text-muted); }
.term-spiegazione { font-size: 0.875rem; line-height: 1.6; }
.term-correlati { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.correlati-label { font-size: 0.75rem; color: var(--color-text-muted); }
.correlato-link { background: none; border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 20px; padding: 2px 10px; font-size: 0.75rem; text-transform: capitalize; }
.no-results { padding: 20px; text-align: center; color: var(--color-text-muted); }
```

- [ ] **4.4 — Crea `tests/GlossaryPanel.test.jsx`**

```jsx
// tests/GlossaryPanel.test.jsx
//
// Test di regressione per due bug reali del GlossaryPanel (Issue #4, PR #14),
// trovati dal Code Review Agent e poi corretti. Non sono verifiche di cortesia
// sull'accessibilita': ognuno dei due describe qui sotto e' la rete su un
// difetto che si e' gia' manifestato una volta.
//
// 1. "ripristino del focus alla chiusura" copre l'ordinamento autoFocus vs
//    useEffect: React applica autoFocus in fase di commit, prima che giri lo
//    useEffect che cattura document.activeElement. Se il pannello si apriva
//    senza termine attivo, l'effect catturava l'input di ricerca appena
//    auto-focussato invece del bottone che aveva aperto il pannello; alla
//    chiusura quell'input era smontato e il focus finiva su <body>. Il fix
//    toglie autoFocus dal JSX e da' il focus in modo imperativo, nello stesso
//    effect, subito dopo la cattura.
//
// 2. "link ai termini correlati con ricerca attiva" copre il reset mirato
//    della query: openGlossaryTerm aggiorna solo il Context, non la query
//    locale del pannello. Se il termine di destinazione era escluso dal
//    filtro corrente, il suo <GlossaryTerm> non veniva mai renderizzato --
//    niente scroll, niente espansione. Il fix azzera la query SOLO quando il
//    termine attivo non e' tra quelli visibili, per non rompere il caso
//    normale (cerca, clicca un risultato gia' visibile, il filtro resta).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useApp } from '../src/context/AppContext'
import GlossaryPanel from '../src/components/Glossario/GlossaryPanel'

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

// Harness minimo: i due modi in cui l'app apre il pannello davvero -- un
// bottone che lo apre "vuoto" e un link che lo apre gia' su un termine.
function Harness() {
  const { setGlossaryOpen, openGlossaryTerm } = useApp()
  return (
    <div>
      <button onClick={() => setGlossaryOpen(true)}>apri-senza-termine</button>
      <button onClick={() => openGlossaryTerm('accisa')}>apri-con-termine</button>
      <GlossaryPanel />
    </div>
  )
}

// Ogni test chiama renderHarness() da se': niente stato condiviso tra test,
// niente dipendenza dall'ordine di esecuzione.
function renderHarness() {
  render(<AppProvider><Harness /></AppProvider>)
}

describe('GlossaryPanel — ripristino del focus alla chiusura', () => {
  const aperture = [
    ['senza termine attivo', 'apri-senza-termine'],
    ['con termine attivo', 'apri-con-termine'],
  ]
  const chiusure = [
    ['Esc', (user) => user.keyboard('{Escape}')],
    ['backdrop', (user) => user.click(document.querySelector('.glossary-backdrop'))],
    ['bottone X', (user) => user.click(screen.getByLabelText('Chiudi il glossario'))],
  ]

  describe.each(aperture)('apertura %s', (_l, triggerText) => {
    it.each(chiusure)('chiusura via %s riporta il focus sul trigger', async (_cl, closeFn) => {
      const user = userEvent.setup()
      renderHarness()
      const trigger = screen.getByText(triggerText)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
      await user.click(trigger)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await closeFn(user)
      expect(document.activeElement).toBe(trigger)
    })
  })
})

describe('GlossaryPanel — link ai termini correlati con ricerca attiva', () => {
  it('correlato escluso dal filtro: cerca "accisa" -> espandi "Accisa" -> click su "iva" -> IVA compare espanso', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('apri-senza-termine'))

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'accisa')
    await user.click(screen.getByText('Accisa'))
    await user.click(screen.getByRole('button', { name: 'iva' }))

    expect(screen.getByText('IVA')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /IVA/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('caso normale: cerca "TAN", clicca il risultato visibile, il filtro resta', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('apri-senza-termine'))

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'TAN')
    await user.click(screen.getByRole('button', { name: /^TAN/ }))

    expect(searchInput).toHaveValue('TAN')
  })
})
```

- [ ] **4.5 — Commit**

```bash
git add -A
git commit -m "feat(#4): GlossaryPanel con ricerca e link bidirezionali

Closes #4"
git push origin feature/4-glossarypanel
```

---

## Issue #5 — RataRoom
**Developer Agent #5 (`claude-sonnet-5`) | Parallelo con #2 #3 #4 | ~40 min**

**Branch:** `feature/5-rataroom`
**Dipende da:** Issue #1a e #1b entrambe mergiate su main → `git checkout main && git pull && git checkout -b feature/5-rataroom`

**Files da creare:**
- `src/components/Rata/RataRoom.jsx` · `RataRoom.css`
- `src/components/Rata/LoanForm.jsx`
- `src/components/Rata/LoanVisualizer.jsx`

---

- [ ] **5.1 — Crea `LoanForm.jsx`**

```jsx
import { DURATE_DISPONIBILI } from '../../data/rata'

export default function LoanForm({ importo, durata, tasso, onChange }) {
  return (
    <div className="loan-form">
      <label className="form-field"><span>💰 Importo prestito</span>
        <div className="input-wrap"><span className="input-prefix">€</span>
          <input type="number" min={500} max={100000} step={500} value={importo} onChange={e => onChange('importo', Number(e.target.value))} className="form-input" />
        </div>
      </label>
      <label className="form-field"><span>📅 Durata</span>
        <select value={durata} onChange={e => onChange('durata', Number(e.target.value))} className="form-input">
          {DURATE_DISPONIBILI.map(m => <option key={m} value={m}>{m} mesi ({(m/12).toFixed(0)} {m < 24 ? 'anno' : 'anni'})</option>)}
        </select>
      </label>
      <label className="form-field"><span>📈 Tasso annuo (TAN)</span>
        <div className="input-wrap">
          <input type="number" min={0.1} max={30} step={0.1} value={tasso} onChange={e => onChange('tasso', Number(e.target.value))} className="form-input" />
          <span className="input-suffix">%</span>
        </div>
      </label>
    </div>
  )
}
```

- [ ] **5.2 — Crea `LoanVisualizer.jsx`**

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calcolaRata, calcolaPianoAmmortamento, formatEuro } from '../../utils/loanCalculator'

export default function LoanVisualizer({ importo, durata, tasso }) {
  const rata = calcolaRata(importo, tasso, durata)
  const piano = calcolaPianoAmmortamento(importo, tasso, durata)
  const totale = rata * durata
  const totInteressi = totale - importo
  const step = durata > 60 ? 3 : 1
  const dati = piano.filter((_, i) => i % step === 0 || i === durata - 1)
    .map(r => ({ mese: `M${r.mese}`, Capitale: Math.round(r.capitale), Interessi: Math.round(r.interessi) }))
  return (
    <div className="loan-visualizer">
      <div className="riepilogo">
        <div className="riepilogo-item"><span>Rata mensile</span><strong>{formatEuro(rata)}</strong></div>
        <div className="riepilogo-item"><span>Totale pagato</span><strong>{formatEuro(totale)}</strong></div>
        {/* "in più" si misura sul capitale preso a prestito, non sul totale pagato:
            su 10.000€ a 36 mesi / 7,5% sono +12,0%, non 10,7%. */}
        <div className="riepilogo-item highlight"><span>Di cui interessi</span><strong>{formatEuro(totInteressi)} — il {((totInteressi / importo) * 100).toFixed(1)}% in più del capitale</strong></div>
      </div>
      <h4 className="grafico-title">Come cambia ogni rata nel tempo</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dati} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis dataKey="mese" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `€${v}`} />
          <Tooltip formatter={(v, name) => [formatEuro(v), name]} />
          <Legend />
          <Bar dataKey="Capitale" stackId="a" fill="#3b82f6" name="Capitale" />
          <Bar dataKey="Interessi" stackId="a" fill="#f97316" name="Interessi" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **5.3 — Crea `RataRoom.jsx` + `RataRoom.css`**

```jsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { rataContesti, IMPORTO_DEFAULT, TASSO_DEFAULT, DURATA_DEFAULT } from '../../data/rata'
import LoanForm from './LoanForm'
import LoanVisualizer from './LoanVisualizer'
import './RataRoom.css'

export default function RataRoom() {
  const { setView, currentLevel } = useApp()
  const [params, setParams] = useState({ importo: IMPORTO_DEFAULT, tasso: TASSO_DEFAULT, durata: DURATA_DEFAULT })
  return (
    <div className="rata-room">
      <button className="back-btn" onClick={() => setView('hub')}>← Torna alla home</button>
      <h1 className="room-title">💳 Quanto costa davvero un prestito?</h1>
      <div className="rata-grid">
        <LoanForm {...params} onChange={(campo, valore) => setParams(p => ({ ...p, [campo]: valore }))} />
        <LoanVisualizer {...params} />
      </div>
      <div className="rata-spiegazione"><p>{rataContesti.spiegazione[currentLevel]}</p></div>
    </div>
  )
}
```

```css
/* RataRoom.css */
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

- [ ] **5.4 — Commit**

```bash
git add -A
git commit -m "feat(#5): RataRoom con LoanForm, LoanVisualizer e grafico Recharts

Closes #5"
git push origin feature/5-rataroom
```

> **Orchestrator:** quando Issue #2, #3, #4, #5 sono tutte "Done" → dispatcha Developer Agent #6

---

## Issue #6 — Integrazione + polish + build
**Developer Agent #6 (`claude-sonnet-5`) + Tester Agent (`claude-sonnet-5`) | Sequenziale (dopo #2 #3 #4 #5) | ~30 min**

**Branch:** `feature/6-integrazione`
**Dipende da:** Issue #2, #3, #4, #5 tutte mergiate su main

---

- [ ] **6.1 — Riscrivi `src/App.jsx`** ⚠️ **passo centrale: senza questo l'app mostra ancora i segnaposto di Issue #0**

Issue #2–#5 non toccano mai `App.jsx` (è ciò che rende sicuro il parallelismo). Di conseguenza il file
contiene ancora i placeholder `function HubView() { return <div>Hub</div> }` scritti in #0.
Vanno sostituiti con gli import reali, altrimenti il demo flow al passo 6.4 fallisce al punto 1.

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
  return <AppProvider><AppContent /></AppProvider>
}
```

Verifica che nessun segnaposto sia sopravvissuto:

```bash
grep -n "return <div>" src/App.jsx   # non deve stampare nulla
```

- [ ] **6.2 — Pulisci `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
```

- [ ] **6.3 — Verifica `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
```

- [ ] **6.4 — Demo flow completo (verifica manuale)**

  1. Hub mostra 3 card ✓
  2. Card "Bolletta" → BollettaRoom ✓
  3. Clic "Oneri di Sistema" → ExplanationPanel si aggiorna ✓
  4. Clic link "oneri sistema" → GlossaryPanel apre sul termine ✓
  5. Chiudi Glossario → BollettaRoom ancora visibile ✓
  6. Slider consumo → totale simulato cambia ✓
  7. Hub → Card "Prestito" → RataRoom ✓
  8. Cambia importo → grafico si aggiorna ✓
  9. LevelSelector "Tecnico" → tutte le spiegazioni cambiano ✓
  10. Ricarica → livello "Tecnico" persistito da localStorage ✓
  11. Header logo → torna all'Hub ✓
  12. Hub → Card "Parole difficili" → GlossaryPanel apre ✓

- [ ] **6.5 — Tester Agent: `tests/integrazione.test.jsx`** *(il flusso di 6.4, automatizzato)*

> Recharts non disegna nulla sotto jsdom (`ResponsiveContainer` misura 0×0): asserire sul
> riepilogo numerico, mai sul grafico.

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'

// localStorage è ripulito da tests/setup.js dopo ogni test.

describe('Flusso utente completo', () => {
  it('l\'Hub presenta le 3 situazioni', () => {
    render(<App />)
    expect(screen.getByText('Cosa vuoi capire oggi?')).toBeInTheDocument()
    expect(screen.getByText('La mia bolletta')).toBeInTheDocument()
    expect(screen.getByText('Un prestito o una rata')).toBeInTheDocument()
    expect(screen.getByText('Parole difficili')).toBeInTheDocument()
  })

  it('una voce di bolletta apre la spiegazione corrispondente', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('La mia bolletta'))
    expect(screen.getByText('⚡ La tua bolletta della luce')).toBeInTheDocument()
    await user.click(screen.getByText('Oneri di Sistema'))
    expect(screen.getByText(/Sono costi fissi che tutti i clienti italiani pagano/)).toBeInTheDocument()
  })

  it('il link della spiegazione apre il glossario sul termine giusto', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('La mia bolletta'))
    await user.click(screen.getByText('Oneri di Sistema'))
    await user.click(screen.getByRole('button', { name: /oneri sistema/i }))
    expect(screen.getByRole('heading', { name: /Glossario/ })).toBeInTheDocument()
    // il termine deve essere espanso, non solo il pannello aperto
    expect(screen.getByText(/Costi che tutti pagano per tenere in funzione la rete italiana/)).toBeInTheDocument()
  })

  it('ogni id in terminiGlossario e correlati esiste nel glossario', async () => {
    const { bollettaVoci } = await import('../src/data/bolletta')
    const { glossario } = await import('../src/data/glossario')
    const ids = new Set(glossario.map(t => t.id))
    const riferiti = [
      ...bollettaVoci.flatMap(v => v.terminiGlossario ?? []),
      ...glossario.flatMap(t => t.correlati ?? []),
    ]
    expect([...new Set(riferiti)].filter(id => !ids.has(id))).toEqual([])
  })

  it('il LevelSelector cambia il testo delle spiegazioni', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('La mia bolletta'))
    await user.click(screen.getByText('Oneri di Sistema'))
    await user.click(screen.getByText('🔬 Tecnico'))
    expect(screen.getByText(/delibera ARERA ARG\/elt 199\/11/)).toBeInTheDocument()
  })

  it('il livello scelto viene persistito', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🔬 Tecnico'))
    expect(localStorage.getItem('finanzachiara_level')).toBe('tecnico')
  })

  it('ai valori di default la simulazione riproduce la bolletta di esempio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('La mia bolletta'))
    // 180 kWh / 3 kW / giorno → differenza esattamente zero
    expect(screen.getByText(/\+€0\.00\/mese/)).toBeInTheDocument()
  })

  it('RataRoom calcola la rata di default', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Un prestito o una rata'))
    expect(screen.getByText('💳 Quanto costa davvero un prestito?')).toBeInTheDocument()
    // formatEuro usa lo spazio unificatore: match parziale, non stringa esatta
    expect(screen.getByText(/311,06/)).toBeInTheDocument()
  })

  it('il logo riporta all\'Hub', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Un prestito o una rata'))
    await user.click(screen.getByText('💡 FinanzaChiara'))
    expect(screen.getByText('Cosa vuoi capire oggi?')).toBeInTheDocument()
  })
})
```

- [ ] **6.6 — Esegui tutti i test**

```bash
npm run test
```
Atteso: tutti PASS.

- [ ] **6.7 — Build produzione**

```bash
npm run build
```
Atteso: `dist/` generata senza errori.

- [ ] **6.8 — Commit**

```bash
git add -A
git commit -m "feat(#6): integrazione finale, polish e build verificata

- App.jsx cablata sui componenti reali
- Demo flow completo verificato (manuale + tests/integrazione.test.jsx)
- Build produzione senza errori
- Tutti i test passanti

Closes #6"
git push origin feature/6-integrazione
```

---

## Criteri di accettazione per il Code Review Agent (`claude-sonnet-5`)

Per ogni PR, il Code Review Agent verifica:

**Architettura**
- Nessun componente accede allo state fuori da `useApp()`
- Ogni file ha una sola responsabilità (max ~150 righe)
- Nessun hardcoding di stringhe di livello — usare sempre `currentLevel` dal Context

**Copy e vincoli tema**
- Nessuna frase che inizia con "dovresti", "ti consiglio", "è meglio che" o simili
- Nessuna frase che orienti l'utente verso un'azione, nemmeno implicitamente: «usa X di notte»,
  «è il numero da confrontare», «conviene». Il filtro sulle formule esplicite non basta —
  il criterio è **descrivere il meccanismo, non suggerire la mossa**
- Ogni spiegazione ha le 3 varianti (`semplice`, `normale`, `tecnico`)
- Gli importi numerici sono sempre esatti (`.toFixed(2)`)

**Qualità codice**
- Import non usati rimossi
- Nessun `console.log` nel codice committato
- CSS in file separati, nessun inline style tranne valori dinamici (`style={{ color: var }}`)

**Test**
- Per Issue #1: unit test passanti per `loanCalculator` e `AppContext`
- Per Issue #6: build produzione senza warning
- Per Issue #6: `src/App.jsx` non contiene più alcun componente segnaposto
- Per Issue #6: `tests/integrazione.test.jsx` copre i 12 punti del demo flow e passa
