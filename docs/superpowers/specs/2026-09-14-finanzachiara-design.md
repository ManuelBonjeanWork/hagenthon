# FinanzaChiara — Design Document

**Data:** 2026-09-14  
**Team:** 2 persone  
**Tempo di sviluppo:** 5 ore  
**Tema:** Inclusione Finanziaria — Educazione alla finanza personale di base  

---

## 1. User Difficulty Statement

**Chi:** Persone con bassa alfabetizzazione finanziaria — adolescenti, adulti senza formazione economica, anziani, immigrati.  
**Dove:** Nel momento in cui ricevono documenti finanziari reali (bollette, contratti di prestito) o devono prendere decisioni economiche quotidiane.  
**Problema:** Il linguaggio finanziario è tecnico, pieno di sigle (TAEG, F1/F2/F3, oneri di sistema, accisa) e presuppone una conoscenza che la maggior parte delle persone non ha. Il risultato è che le persone firmano senza capire, pagano senza sapere cosa pagano, e rinunciano a informarsi perché "è troppo difficile".  
**Perché è rilevante:** L'incomprensione dei documenti finanziari porta a decisioni sbagliate, debiti non pianificati e vulnerabilità economica. Non è un problema di intelligenza — è un problema di linguaggio.

---

## 2. Scenario Educativo Preciso

**Scenario primario:** Comprensione di una bolletta elettrica italiana (luce).  
**Scenario secondario:** Comprensione del costo reale di un prestito (rata e interessi nel tempo).

Entrambi gli scenari sono **educativi e non consulenziali**: il sistema non dice mai all'utente cosa fare, mostra solo la matematica e la spiegazione di ciò che già sta pagando o che sta valutando.

---


## 3. Come costruiamo: Agentic SDLC Pipeline

FinanzaChiara è stata costruita con questo pipeline, non secondo questo pipeline: quanto segue descrive ciò che è stato eseguito davvero, e le regole sono quelle che l'esecuzione ha imposto.

**Risultato:** 8 Issue, 12 PR, 28 test, zero approvazioni umane bloccanti.

### Il contratto condiviso

Il punto di partenza, e la correzione più importante rispetto alla prima stesura di questo documento. Gli agenti sono *stateless* perché leggono file versionati, **non** perché l'Orchestrator si ricorda tutto e glielo racconta nel prompt.

| Artefatto | Cosa contiene | Perché serve |
|---|---|---|
| `CLAUDE.md` | vincolo anti-raccomandazione, valori esatti dei livelli e delle viste, mapping ID-piano → numero Issue GitHub | ogni agente lo legge; nessuno deve dedurlo |
| `.claude/agents/*.md` | contratto di ruolo: developer, code-reviewer, tester, github-pm | definisce *come* si lavora, non solo cosa |
| `docs/pipeline-state.json` | grafo delle dipendenze, ID di board e campi, stato per Issue | permette di riprendere dopo un'interruzione |

Quando questa conoscenza vive nei prompt invece che nei file, si degrada: un'istruzione data per un caso (*"verifica con uno script usa-e-getta"*) è stata generalizzata da un agente a un caso diverso, e ha portato alla cancellazione di 8 test di regressione. La regola è stata poi scritta in `developer.md`, dove non può più perdersi.

### Orchestrator Agent

Unico agente con visione del grafo. Non esegue codice applicativo: coordina, apre PR, mergia, aggiorna la board.

1. Legge il piano e costruisce `pipeline-state.json`
2. Dispatcha un Developer Agent quando le dipendenze di un'Issue sono chiuse — **in worktree isolato**
3. Issue indipendenti partono insieme: 2 in parallelo su #1a/#1b, 4 su #2–#5
4. **Reagisce alle notifiche di completamento degli agent**, non fa polling della board
5. Al completamento: apre la PR, dispatcha il Code Review Agent
6. Review approvata → mergia. Review negativa → rimanda al Developer con i rilievi scritti sulla PR
7. Fallimento → **si ferma e riporta comando esatto ed errore**. Nessun retry automatico

> **Perché niente retry.** Nessuno dei fallimenti reali è stato transitorio: script `test` mancante, label inesistenti, valore atteso sbagliato in un test, `create-vite` fermo su un prompt interattivo. Riprovare avrebbe fallito identico, due volte più lentamente. Il retry si riserva a rete e rate limit.

> **Perché niente polling della board.** La board è un *output*: leggibile dall'umano, non è il canale di coordinamento. Durante l'esecuzione è rimasta ferma per mezza sessione — scriveva su un campo custom mentre la vista era raggruppata su `Status` — e il pipeline ha continuato a funzionare. Se fosse stata il canale, si sarebbe bloccato tutto.

### Worktree: è ciò che rende reale il parallelismo

Non è un dettaglio implementativo. Due agenti nella stessa working tree si sovrascrivono, e durante questa sessione è successo davvero: un tentativo concorrente ha lasciato uno scaffold Vite fuori specifica che è stato necessario cancellare e rifare.

Regole che discendono dall'isolamento:

- ogni worktree parte senza `node_modules`: serve `npm ci` prima di qualsiasi test
- `main` non è checkoutabile in due worktree: gli agenti creano il branch da `origin/main`
- **vitest scandisce i worktree**. Senza escludere `.claude/` dalla config, `npm run test` raccoglie i test di tutti i branch in volo: durante l'esecuzione ha prodotto `36 failed | 61 passed (97)` su una `main` sana
- i worktree vanno rimossi con `git worktree remove`; `prune` da solo non tocca le directory ancora presenti

### 8 Issue e grafo delle dipendenze

```
Phase 0 — contratto condiviso, branch, label, Issue, board
        │
        ▼
Issue #0 — Scaffolding (SEQUENZIALE: il progetto Vite deve esistere)
        │
   ┌────┴─────────────┐
   ▼                  ▼
 #1a AppContext    #1b Data Layer            ← PARALLELO
   └────┬─────────────┘
        │  entrambe Done
   ┌────┼─────────┬─────────┐
   ▼    ▼         ▼         ▼
  #2   #3        #4        #5                ← PARALLELO
Header Bolletta Glossario  Rata
   └────┴─────────┴─────────┘
        │  tutte e 4 Done
        ▼
Issue #6 — Integrazione + test end-to-end + polish
```

| Issue | Contenuto | Dipende da |
|-------|-----------|-----------|
| #0 | Scaffolding Vite + shell autonoma + CSS | — |
| #1a | AppContext + 4 test | #0 |
| #1b | loanCalculator + bolletta + glossario + rata + 7 test | #0 |
| #2 | Header + HubView | #1a #1b |
| #3 | BollettaRoom completa | #1a #1b |
| #4 | GlossaryPanel | #1a #1b |
| #5 | RataRoom | #1a #1b |
| #6 | Integrazione + 9 test end-to-end + polish | #2 #3 #4 #5 |

`App.jsx` non viene toccata da #2–#5: è ciò che rende sicura la finestra a quattro agenti. Il cablaggio avviene tutto in #6, ed è la prima volta che i componenti entrano nel bundle — fino a quel momento `vite build` non li attraversa e il verde non dimostra che compilino.

### Ciclo per ogni Issue

```
Developer Agent (worktree isolato, branch da origin/main, npm ci)
    ├── legge .claude/agents/developer.md, CLAUDE.md, la sua sezione del piano
    ├── implementa; dove il piano prescrive TDD, rosso prima
    ├── gate locale: build + test + lint
    └── committa e pusha ──► notifica
        │
        ▼
Orchestrator apre la PR
        │
        ▼
Code Review Agent (worktree isolato)
    ├── verifica ESEGUENDO, non leggendo: ricalcola i numeri, esegue i test,
    │   scrive script di controllo sui dati
    └── verdetto SCRITTO SULLA PR, sempre — approvato o no
        │
   ┌────┴────────────────────┐
   ▼                         ▼
DA CORREGGERE             APPROVATO
   │                         │
 fix + test di regressione   merge
 committato verde            │
   │                         ▼
 re-review              se il difetto veniva dal piano,
   │                    lo stesso commit corregge anche il piano
   └──────────────────────────┘
        │
        ▼
Board aggiornata  ← output, non canale
```

Quattro regole che l'esecuzione ha imposto:

**Verificare eseguendo, non leggendo.** Una formula plausibile ma sbagliata supera la rilettura e fallisce l'aritmetica. Il reviewer di #3 ha ricopiato la funzione di calcolo in uno script, l'ha eseguita sui dati reali e ha confermato che la simulazione riproduce €79.09 esatti; quello di #1b ha verificato con uno script che nessuno dei riferimenti fra le 24 voci del glossario fosse orfano.

**Il verdetto va sulla PR.** Se resta nella conversazione, il repo mostra PR mergiate senza traccia di review e i rilievi non bloccanti si perdono con la sessione.

**Un test che ha trovato un difetto resta.** Rosso per dimostrare che discrimina, risolto, committato verde. Mai consegnare un test rosso: documenta il bug invece di ripararlo.

**Se il difetto viene dal piano, si corregge il piano.** Altrimenti la prossima esecuzione lo riproduce. È successo due volte, su bug introdotti in fase di stesura.

### Gate e supervisione

**Gate automatici, su ogni Issue — sono l'unico meccanismo di qualità:**

`npm run build` · `npm run test` · `npm run lint` · verdetto di review scritto sulla PR

> `lint` non era nel gate iniziale, e per questo si sono accumulati in silenzio tre errori `react/no-unescaped-entities` più una config che segnalava `no-undef` su ogni file di test. **Senza approvazione umana, ogni buco nel gate diventa debito che nessuno intercetta.**

**Supervisione umana: continua e non bloccante.** Nessun gate di approvazione è stato usato, e il pipeline ha comunque prodotto 8 Issue e 12 PR. Ma l'umano è intervenuto undici volte, e quattro di quelle hanno trovato difetti che l'automazione non vedeva:

| Osservazione | Difetto trovato |
|---|---|
| «perché non vedo muoversi i task?» | board che scriveva su un campo non visibile nella vista |
| «i problemi del review finiscono sulla PR?» | sei PR mergiate senza traccia di review |
| «i test non si rimuovono se servono ancora» | 8 test di regressione cancellati dopo l'uso |
| «rimetti il titolo dell'hub» | decisione di prodotto che nessun test può prendere |

Nessuno di questi è un bug nel codice — quelli li hanno presi i Code Review Agent. Sono difetti **del processo**: il pipeline produceva verde mentre perdeva audit trail, rete di regressione e visibilità.

Ne discende il principio di design: **si investe nella traccia, non nei cancelli.** Un gate bloccante mette davanti un diff da approvare, e con un diff davanti non si nota che la board è ferma. La superficie di supervisione è fatta di tre cose, e vanno trattate come meccanismo e non come contorno:

1. la **board**, leggibile a colpo d'occhio sul campo che la vista mostra davvero
2. il **verdetto di review sulla PR**, sempre
3. i **rilievi non bloccanti su una Issue**, non nella memoria dell'Orchestrator

Corollario operativo: il pipeline dev'essere interrompibile in qualsiasi momento e riprendibile. Lo stato vive su disco, e ogni passo lascia una traccia leggibile senza dover rileggere la conversazione.

### Lavorare in più di uno sullo stesso repo

Il pipeline assume un solo Orchestrator che possiede il repo. Durante questa sessione tre sessioni hanno scritto sullo stesso checkout, con conseguenze concrete: uno scaffold fuori specifica da rifare, `origin/main` rossa per una riscrittura di copy senza aggiornamento dei test, due worktree cancellati sotto i piedi da un `prune` concorrente, un push rifiutato per divergenza, e un conflitto su `Header.css` da risolvere a mano.

Tre regole:

1. **Una sessione, un worktree.** Mai due agenti — né due persone — nella stessa working tree.
2. **`main` si tocca solo via PR**, con branch protection. Un commit diretto l'ha già rotta una volta.
3. **Il contratto condiviso coordina anche le persone.** Se una sessione cambia le copy, «i test si aggiornano nello stesso commit» deve stare in `CLAUDE.md`, non nella memoria di chi c'era.

### Cosa rimane al piano di implementazione

`docs/superpowers/plans/2026-09-14-finanzachiara-mvp.md` contiene il codice completo di ogni Issue, i criteri di accettazione e i numeri attesi. Il Developer Agent lo tratta come specifica eseguibile: il codice è già stato compilato, i blocchi dati eseguiti e l'aritmetica verificata, quindi va trascritto fedelmente. Quando non funziona, l'agente si ferma e lo segnala invece di aggirarlo in silenzio.

## 4. Architettura Generale

### Stack tecnologico
- **Frontend:** React + Vite (client-side only)
- **Backend:** nessuno
- **AI:** nessuna nell'MVP — prevista nella roadmap futura per parsing di bollette reali
- **Dipendenze esterne:** nessuna API key necessaria
- **Charting:** Recharts (leggero, React-native, documentazione eccellente — nessun SVG custom)

### Struttura dell'applicazione

```
src/
├── App.jsx                    # Router tra viste + Context provider
├── context/
│   └── AppContext.jsx          # currentLevel, glossaryOpen, activeVoce
├── data/
│   ├── bolletta.js             # Voci bolletta con spiegazioni a 3 livelli
│   ├── glossario.js            # ~25 termini con spiegazioni a 3 livelli
│   └── rata.js                 # Formule e testi di supporto
├── components/
│   ├── Header/
│   │   ├── Header.jsx          # Logo + LevelSelector + GlossaryButton
│   │   └── LevelSelector.jsx   # Toggle Semplice | Normale | Tecnico
│   ├── Hub/
│   │   ├── HubView.jsx         # Schermata iniziale con situation cards
│   │   └── SituationCard.jsx   # Singola card scenario
│   ├── Bolletta/
│   │   ├── BollettaRoom.jsx    # Layout Room: BillViewer + ExplanationPanel + SimulationPanel
│   │   ├── BillViewer.jsx      # Bolletta interattiva con zone cliccabili
│   │   ├── BillVoce.jsx        # Singola voce cliccabile della bolletta
│   │   ├── ExplanationPanel.jsx# Spiegazione contestuale al livello corrente
│   │   └── SimulationPanel.jsx # Slider "what if" con ricalcolo live
│   ├── Rata/
│   │   ├── RataRoom.jsx        # Layout Room: form + visualizer
│   │   ├── LoanForm.jsx        # Input importo, durata, tasso
│   │   └── LoanVisualizer.jsx  # Grafico ammortamento + riepilogo
│   └── Glossario/
│       ├── GlossaryPanel.jsx   # Slide-in panel
│       ├── GlossarySearch.jsx  # Barra di ricerca
│       └── GlossaryTerm.jsx    # Singolo termine con spiegazione
└── utils/
    └── loanCalculator.js       # Formule di calcolo rata e ammortamento
```

### State globale (React Context)

```js
{
  currentLevel: "semplice" | "normale" | "tecnico",  // livello linguistico corrente
  glossaryOpen: boolean,                              // pannello glossario aperto/chiuso
  activeGlossaryTerm: string | null,                  // termine da aprire nel glossario
  activeView: "hub" | "bolletta" | "rata"             // navigazione tra viste
}
```

---

## 5. Header e Level Selector

### Comportamento
Il `LevelSelector` è sempre visibile nell'header. Cambiando il livello, **tutti i testi dell'app si aggiornano istantaneamente** tramite Context — sia la bolletta, sia la rata, sia il glossario.

Il livello non è legato all'età ma alla **preferenza di comprensione**: un adulto può scegliere "Semplice" senza sentirsi giudicato. Il copy del selector evita riferimenti all'età:

```
[ 🟢 Semplice ] [ 🔵 Chiaro ] [ 🔬 Tecnico ]
```

### Persistenza
Il livello scelto viene salvato in `localStorage` per non costringere l'utente a risceglierlo ogni visita.

---

## 6. HubView — Schermata Iniziale

### Situation Cards

```
┌─────────────────────────────────────────────────────┐
│           Cosa vuoi capire oggi?                    │
│                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────┐ │
│  │  ⚡ Bolletta   │  │  💳 Prestito  │  │ 📖 ABC  │ │
│  │               │  │               │  │         │ │
│  │ "Non capisco  │  │ "Quanto pago  │  │Glossario│ │
│  │  cosa pago"   │  │  davvero?"    │  │         │ │
│  └───────────────┘  └───────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────┘
```

- **Card Bolletta** → apre BollettaRoom
- **Card Prestito** → apre RataRoom
- **Card Glossario** → apre GlossaryPanel direttamente
- Le card mostrano una micro-descrizione al livello linguistico corrente

---

## 7. BollettaRoom — Scenario Primario

### Struttura layout (due colonne su desktop, stack su mobile)

```
┌──────────────────────┬────────────────────────────┐
│    BillViewer        │    ExplanationPanel        │
│    (bolletta         │    (spiegazione voce        │
│     interattiva)     │     selezionata)            │
├──────────────────────┴────────────────────────────┤
│              SimulationPanel                      │
│         "Cosa succederebbe se..."                 │
└───────────────────────────────────────────────────┘
```

### BillViewer — Voci interattive

La bolletta è renderizzata come HTML/CSS che simula un documento reale. Ogni voce è un elemento cliccabile con colore di zona:

| Colore | Voce | Importo esempio |
|--------|------|----------------|
| 🔵 | Quota Energia (F1 / F2 / F3) | €42.30 |
| 🟡 | Quota Potenza impegnata | €8.50 |
| 🟠 | Oneri di Sistema (A3, UC, MCT…) | €11.20 |
| 🔴 | Trasporto e gestione contatore | €6.80 |
| 🟣 | Imposta: Accisa energia | €3.10 |
| 🟣 | Imposta: IVA 10% | €7.19 |
| ⚫ | **TOTALE DA PAGARE** | **€79.09** |

Al clic su una voce → ExplanationPanel si aggiorna con la spiegazione contestuale.

### ExplanationPanel

```
┌──────────────────────────────────────┐
│ 🟠 Oneri di Sistema                 │
│    €11.20  ██████░░░░ 14% del totale │
│                                      │
│ [Spiegazione al livello corrente]    │
│                                      │
│ Termini correlati:                   │
│ → A3  → MCT  → quota fissa           │
└──────────────────────────────────────┘
```

**Spiegazioni per voce (esempio "Oneri di Sistema"):**

```js
{
  semplice: "Sono soldi che tutti i clienti pagano per mantenere la rete elettrica nazionale. Non dipende da quanto usi — li paghi comunque.",
  normale: "Sono tariffe stabilite dall'ARERA che finanziano incentivi alle energie rinnovabili, costi di dispacciamento e agevolazioni sociali. Sono uguali per tutti e non negoziabili.",
  tecnico: "Componenti tariffarie definite da ARERA (delibera ARG/elt 199/11 e successivi) a copertura di: incentivi FER (A3), costi di qualità del servizio (UC), misure di compensazione territoriale (MCT). Indipendenti dal consumo."
}
```

### SimulationPanel — "Cosa succederebbe se..."

L'utente sceglie cosa simulare. Il sistema mostra solo la matematica:

```
💡 Modifica i tuoi consumi e vedi come cambia la bolletta

Consumo mensile:      [———●────] 180 kWh  [range: 50–400]
Potenza impegnata:    [●───────] 3 kW     [range: 1.5–6]
Fascia principale:    ( Giorno  ● Sera  ○ Notte )

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Con queste scelte:    €67.20
  Bolletta attuale:     €79.09
  Differenza:          -€11.89/mese  →  -€142.68/anno
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Importante:** il pannello non dice mai "dovresti fare X". Mostra solo: se tu cambiassi Y, il risultato matematico sarebbe Z.

---

## 8. RataRoom — Scenario Secondario

### LoanForm — 3 input, ricalcolo istantaneo

```
💰 Importo prestito:   [ €10.000      ]
📅 Durata:             [ 36 mesi  ▼  ]   (12 / 24 / 36 / 48 / 60 / 84 / 120)
📈 Tasso annuo (TAN):  [ 7,5 %        ]
```

### Formula di calcolo (in `utils/loanCalculator.js`)

```js
// Ammortamento alla francese (rate costanti)
export function calcolaRata(P, tassoAnnuo, mesi) {
  const r = tassoAnnuo / 100 / 12;        // tasso mensile
  if (r === 0) return P / mesi;
  return P * (r * Math.pow(1 + r, mesi)) / (Math.pow(1 + r, mesi) - 1);
}

export function calcolaPianoAmmortamento(P, tassoAnnuo, mesi) {
  const rata = calcolaRata(P, tassoAnnuo, mesi);
  const r = tassoAnnuo / 100 / 12;
  let debito = P;
  return Array.from({ length: mesi }, (_, i) => {
    const interessi = debito * r;
    const capitale = rata - interessi;
    debito -= capitale;
    return { mese: i + 1, rata, capitale, interessi, debitoResiduo: Math.max(debito, 0) };
  });
}
```

### LoanVisualizer — Output

```
┌────────────────────────────────────────────┐
│  Rata mensile:       €310.84               │
│  Totale pagato:      €11.190.24            │
│  Di cui interessi:   €1.190.24  ████░░░░░  │
│                      (10.6% in più)        │
└────────────────────────────────────────────┘

Piano di rimborso nel tempo:
Mese 1  [████████░░░░░░░░] €247.34 capitale  €63.50 interessi
Mese 12 [██████████░░░░░░] €261.08 capitale  €49.76 interessi
Mese 36 [████████████████] €308.42 capitale   €2.42 interessi

[Barre impilate: 🟦 capitale  🟧 interessi]
→ "All'inizio paghi più interessi. Questo è normale: si chiama ammortamento."
```

Spiegazione contestuale sotto il grafico, al livello corrente.

---

## 9. GlossaryPanel

### Comportamento
- Slide-in da destra, overlay (non cambia la view corrente)
- Apertura: bottone fisso in header, clic su termine linkato in ExplanationPanel, clic su Card Glossario nell'Hub
- Se aperto da un termine specifico, scorre automaticamente alla voce e la evidenzia

### Struttura

```
┌─────────────────────────────┐
│  📖 Glossario           ✕   │
│  ┌─────────────────────┐    │
│  │ 🔍 Cerca termine... │    │
│  └─────────────────────┘    │
│                             │
│  A  Accisa · Ammortamento   │
│  F  Fascia oraria · F1F2F3  │
│  K  kWh                     │
│  O  Oneri di sistema        │
│  R  Rata                    │
│  T  TAEG · TAN              │
│  ...                        │
└─────────────────────────────┘
```

### Termini inclusi nell'MVP (~25)

`kWh · fascia oraria · F1 F2 F3 · quota energia · quota potenza · oneri di sistema · accisa · IVA · potenza impegnata · contatore · TAEG · TAN · rata · ammortamento · capitale · interessi · tasso fisso · tasso variabile · inflazione · spread · piano di rimborso · quota fissa · dispacciamento · ARERA · estratto conto`

### Struttura dati

```js
{
  id: "taeg",
  termine: "TAEG",
  lettera: "T",
  spiegazione: {
    semplice: "È il costo totale del prestito in percentuale, tutto incluso. Il TAN è il prezzo del pane, il TAEG è quello che paghi alla cassa con sacchetto e scontrino.",
    normale: "Tasso Annuo Effettivo Globale: include interessi + tutte le spese accessorie (assicurazioni, commissioni di apertura). È il numero da confrontare tra offerte diverse.",
    tecnico: "Indicatore sintetico del costo del credito annuo, calcolato secondo la direttiva 2008/48/CE, inclusivo di tutti gli oneri (TAN + spese di istruttoria, assicurazioni obbligatorie, commissioni periodiche)."
  },
  correlati: ["TAN", "rata", "ammortamento"]
}
```

---

## 10. Before / After Simplicity Evidence

### Prima (testo reale da bolletta Enel)

> "Corrispettivi di dispacciamento — Componente di sbilanciamento (DIS): €0.00432/kWh — Componente uplift (UP): €0.00218/kWh — Oneri generali di sistema A3: €0.02286/kWh — UC1: €0.00012/kWh — UC3: €0.00001/kWh — MCT: €0.00045/kWh"

### Dopo (livello Semplice)

> "Questi sono costi fissi che tutti i clienti italiani pagano, indipendentemente da quanto consumano. Servono a mantenere la rete elettrica nazionale e a finanziare le energie rinnovabili. Non puoi evitarli — li pagano anche i tuoi vicini."

### Dopo (livello Normale)

> "Sono le componenti tariffarie degli 'Oneri di sistema', stabilite dall'ARERA. La voce A3 finanzia gli incentivi alle energie rinnovabili. UC1 e UC3 coprono i costi di qualità del servizio. MCT è una compensazione territoriale per le aree con impianti energetici. Non dipendono dal tuo consumo."

---

## 11. Risk & Clarity Note

### Cosa è stato semplificato
- Linguaggio tecnico delle voci bolletta → spiegazioni in tre livelli accessibili
- Concetto di ammortamento → visualizzato come grafico barre nel tempo
- Sigle (TAEG, TAN, F1/F2/F3, ARERA) → definizioni concrete con analogie

### Cosa NON è stato alterato
- Gli importi numerici sono sempre mostrati esatti, mai arrotondati con perdita di informazione
- Le formule di calcolo rata seguono lo standard ammortamento alla francese (formula esatta)
- Le descrizioni normative (ARERA, direttive UE) nel livello "tecnico" sono precise

### Come è stata evitata l'ambiguità
- Il sistema non interpreta mai la situazione specifica dell'utente
- Nessuna raccomandazione: la simulazione mostra conseguenze matematiche di scenari che l'utente propone
- Il glossario distingue chiaramente TAN da TAEG — due concetti spesso confusi
- Ogni spiegazione "semplice" include una frase di ancoraggio al livello superiore ("si chiama X")

### Cosa il sistema NON fa (vincoli rispettati)
- Non dice mai "dovresti tagliare questa spesa"
- Non consiglia quale offerta energetica scegliere
- Non valuta se un prestito sia conveniente per l'utente specifico
- Non raccoglie dati personali

---

## 12. Roadmap Futura (post-hackathon)

### Toolchain Agentici per il Team

Agenti rivolti agli sviluppatori — operano offline, in fase di sviluppo e manutenzione, mai a contatto con i dati degli utenti finali. Zero tracking, privacy by design.

#### Area 1 — Manutenzione Contenuti

##### 🔔 Regulatory Monitor Agent
**Trigger:** cron periodico su fonti ufficiali (ARERA, Gazzetta Ufficiale, MEF)  
**Compito:** rileva variazioni normative (tariffe, aliquote, sigle, delibere) e le mappa alle voci impattate nel data layer  
**Output:** PR automatica con modifiche proposte a `data/bolletta.js` e `data/glossario.js`, con link alla fonte ufficiale come commento  
**Revisione:** un developer approva la PR prima del merge — nessun aggiornamento automatico al contenuto finanziario  

##### 🔍 Semantic Lint Agent
**Trigger:** ogni PR che tocca `data/`  
**Compito:** analizza ogni spiegazione e verifica:
- il livello "semplice" non usa termini tecnici non definiti nel glossario
- il livello "tecnico" è preciso e coerente con le fonti normative
- i `terminiGlossario` di ogni voce esistono effettivamente in `glossario.js`
- non ci sono contraddizioni tra i tre livelli della stessa voce

**Output:** commento inline sulla PR con i problemi trovati, severity alta/media/bassa

##### ✅ Content CI Suite
**Trigger:** CI su ogni PR che tocca `data/`  
**Compito:** test automatici e misurabili sul contenuto:
- **Indice Gulpease** per livello: "semplice" > 60, "normale" > 45, "tecnico" senza vincolo
- lunghezza spiegazioni: "semplice" < 60 parole, "tecnico" < 120 parole
- ogni voce ha almeno un termine in `terminiGlossario`
- ogni `correlati` nel glossario punta a un `id` esistente

**Output:** pass/fail in CI con report dettagliato per voce

---

#### Area 2 — Generazione Nuovi Scenari

##### ⚙️ Scenario Generator Agent
**Trigger:** developer carica uno o più documenti reali (PDF, immagine, testo) della tipologia da aggiungere  
**Compito:** dialogo interattivo a turni —
1. estrae automaticamente le voci dal documento reale
2. propone la struttura dati (`id`, `label`, `importo`, `spiegazione` a 3 livelli, `terminiGlossario`)
3. il developer corregge voce per voce
4. l'agente apprende lo stile delle correzioni e migliora le proposte successive nella stessa sessione

**Output:** file `data/<scenario>.js` pronto da revisionare e committare  
**Vincolo:** le spiegazioni generate vengono marcate `"generated": true` fino alla revisione umana — la Content CI Suite le tratta come warning finché non vengono approvate

---

#### Area 3 — Pipeline di Sviluppo

##### 🧱 Code Review Agent
**Trigger:** PR con modifiche a `src/`  
**Compito:** analizza le modifiche al codice e segnala:
- componenti che violano il principio di responsabilità singola (file > 200 righe)
- props mal definite o non tipizzate
- accesso diretto al Context fuori dai componenti previsti
- pattern non coerenti con l'architettura Hub & Rooms definita nel design doc

**Output:** commento inline sulla PR, non bloccante — advisory

##### 📝 Content Review Agent
**Trigger:** PR con modifiche a `data/`  
**Compito:** complementare al Semantic Lint, si concentra su:
- coerenza dello stile narrativo tra voci diverse (stesso tono nel livello "semplice")
- formule matematiche nei commenti del data layer verificate algebricamente
- nuovi termini aggiunti non già presenti con nome diverso nel glossario (deduplicazione)

**Output:** commento inline sulla PR

##### 🎭 E2E Generator Agent
**Trigger:** nuovo componente, nuovo flusso utente, o nuova card scenario aggiunta  
**Compito:** legge il design doc e la struttura dei componenti React, genera test Playwright per tutti i flussi critici:
- click su voce bolletta → ExplanationPanel aggiornato
- slider SimulationPanel → totale ricalcolato correttamente
- LevelSelector → tutti i testi della pagina aggiornati al nuovo livello
- navigazione Hub → BollettaRoom → Hub
- apertura GlossaryPanel da header, da link inline, da card Hub
- calcolo rata: input modificato → output aggiornato istantaneamente

**Output:** file `e2e/<scenario>.spec.ts` pronto da revisionare; i developer lo possiedono da lì in poi

---

> 📌 **L'Orchestrator Agent e l'Agentic SDLC Pipeline non sono roadmap futura — sono il metodo con cui FinanzaChiara viene costruita adesso.** Vedere **Sezione 3** per il grafo delle dipendenze ottimizzato (8 Issue, 2 finestre di parallelismo) e la timeline di ~2h03min.

---

### Fase 2 — AI Layer
- **Upload bolletta reale** → AI (Claude) estrae le voci e i valori → alimenta BillViewer con i dati reali dell'utente
- **Parsing testo incollato** → stesso flusso per bollette digitali
- **Spiegazioni dinamiche** → livelli linguistici più granulari, personalizzazione per contesto

### Fase 2b — Agenti AI

Ogni agente ha un perimetro educativo preciso e non può uscire dal proprio dominio. Nessuno fornisce raccomandazioni — operano tutti in modalità "spiega" o "estrai", mai "consiglia".

#### 🔍 Document Parser Agent
**Trigger:** l'utente carica o incolla una bolletta/documento reale  
**Compito:** estrae strutturato (JSON) le voci, gli importi e le sigle dal testo grezzo  
**Output:** alimenta BillViewer con i dati reali al posto della bolletta di esempio  
**Vincolo:** non interpreta né commenta i valori — li passa alla logica deterministica esistente  
**Stack:** Claude API con tool use → JSON schema delle voci bolletta

#### 🗣️ Language Adapter Agent
**Trigger (BollettaRoom):** l'utente chiede una spiegazione con parole diverse o fa una domanda libera su una voce della bolletta  
**Trigger (RataRoom):** l'utente fa una domanda libera sul grafico di ammortamento (es. "perché nei primi mesi pago più interessi?", "cosa significa debito residuo?")  
**Trigger (SimulationPanel):** l'utente clicca il nudge contestuale *"Vuoi capire come è calcolato questo risparmio?"* che appare dopo ogni ricalcolo — l'agente si attiva con il contesto della simulazione precaricato; nessuna risposta automatica senza input dell'utente  
**Compito:** genera una spiegazione contestuale al livello corrente per la domanda posta, usando come contesto il documento/scenario attivo  
**Output:** testo in un panel di risposta, in aggiunta (non in sostituzione) al contenuto pre-scritto  
**Vincolo:** risponde solo su termini e calcoli del documento/scenario attivo; rifiuta domande su investimenti, prodotti o consigli finanziari  
**Stack:** Claude API con system prompt ristretto + contesto della room attiva (voce selezionata / parametri rata / valori slider)

#### 📖 Glossary Enricher Agent
**Trigger:** l'utente cerca nel glossario un termine non presente nel dataset pre-costruito  
**Compito:** genera al volo la definizione al livello corrente per il termine cercato  
**Output:** nuova voce nel GlossaryPanel, marcata come "generata" vs "verificata"  
**Vincolo:** genera solo definizioni di termini finanziari generici, non valutazioni su prodotti specifici  
**Stack:** Claude API + cache locale delle definizioni generate per non ripetere chiamate

#### 🧭 Onboarding Guide Agent
**Trigger:** primo accesso o clic su "Non so da dove iniziare"  
**Compito:** dialogo breve a domande/risposte per capire la situazione dell'utente (ha una bolletta? vuole capire un prestito? non sa nulla?) e guidarlo alla card giusta  
**Output:** raccomanda la situation card più rilevante e imposta il livello linguistico iniziale  
**Vincolo:** non fa domande su importi, redditi o situazioni personali — solo sul tipo di documento/scenario  
**Stack:** Claude API con conversazione a turni limitati (max 3 scambi) + mapping output → view

---

### Architettura agenti (schema generale)

```
Utente
  │
  ▼
Frontend React (MVP deterministico)
  │
  ├─── Document Parser Agent ──────→ JSON voci → BillViewer
  │
  ├─── Language Adapter Agent ─────→ BollettaRoom: testo → ExplanationPanel
  │                                  RataRoom: risposta → panel domanda
  │                                  SimulationPanel: risposta → panel (su nudge utente)
  │
  ├─── Glossary Enricher Agent ────→ definizione → GlossaryPanel
  │
  └─── Onboarding Guide Agent ─────→ view suggerita + livello iniziale
```

Ogni agente è stateless e isolato — non condividono contesto tra loro. Il frontend rimane la fonte di verità per navigazione e stato.

---

### Fase 3 — Espansione scenari
- Card "Estratto conto bancario" — spiegazione di commissioni, movimenti, saldo disponibile vs contabile
- Card "Busta paga" — capire netto vs lordo, trattenute, TFR
- Card "Contratto di affitto" — deposito cauzionale, adeguamento ISTAT, spese condominiali
- **Document Comparison Agent** — confronto voce per voce tra due bollette (mese corrente vs precedente); mostra delta colorati senza giudicare se le variazioni siano normali o meno

### Fase 4 — Percorso adattivo
- Rilevamento del livello di alfabetizzazione tramite micro-quiz iniziale
- Progressione del livello linguistico automatica man mano che l'utente interagisce

---