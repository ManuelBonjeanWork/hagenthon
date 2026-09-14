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

FinanzaChiara viene costruita usando il pipeline agentico come metodo di sviluppo primario — non solo come roadmap futura. L'**Orchestrator Agent** coordina tutto; l'umano approva solo ai gate.

### Orchestrator Agent

Cervello del pipeline. Unico agente con visione del grafo delle dipendenze. Tutti gli altri agenti sono stateless — solo l'Orchestrator sa cosa viene prima e dopo.

**Avvio:** invocato una volta dall'umano con il plan doc come input.  
**Compito:**
1. Estrae il grafo delle dipendenze dal piano
2. Monitora GitHub Projects API per i cambi di status
3. Quando le dipendenze di un'Issue sono "Done" → dispatcha Developer Agent (worktree isolato)
4. **Issue indipendenti vengono dispatchate in parallelo** — più Developer Agent simultaneamente
5. Developer Agent completo → dispatcha Code Review Agent
6. Code Review approva → dispatcha GitHub PM Agent → PR
7. Notifica l'umano **solo** ai gate di approvazione
8. Fallimento → riprova una volta, poi notifica con log

**Stato persistente:** `docs/pipeline-state.json` — permette ripresa in caso di interruzione.

---

### 8 Issue e grafo delle dipendenze ottimizzato

```
Phase 0 (~10 min, PARALLELO):
  Orchestrator legge piano  +  GitHub PM Agent crea repo, board, 8 Issue
        │
        ▼
Issue #0: Scaffolding (~8 min, SEQUENZIALE)
  npm create vite, install deps, vite.config, App.jsx shell, App.css
        │
   ┌────┴───────────────────────────┐
   ▼                                ▼
Issue #1a: AppContext (~15 min)  Issue #1b: Data Layer (~20 min)   ← PARALLELO
  AppContext.jsx + test             loanCalculator.js
                                    bolletta.js / glossario.js
                                    rata.js + test
   └────┬───────────────────────────┘
        │ (entrambe Done)
   ┌────┼──────────┬──────────┐
   ▼    ▼          ▼          ▼
  #2   #3         #4         #5                                     ← PARALLELO
Header Bolletta  Glossario  RataRoom
   └────┴──────────┴──────────┘
        │ (tutte e 4 Done)
        ▼
   Issue #6: Integrazione + polish + build (~30 min, SEQUENZIALE)
```

| Issue | Contenuto | Dipende da | Agenti in gioco |
|-------|-----------|-----------|----------------|
| #0 | Scaffolding Vite + App shell + CSS | — | Developer → Code Review → PM |
| #1a | AppContext + test | #0 | Developer → Code Review → PM |
| #1b | loanCalculator + bolletta + glossario + rata + test | #0 | Developer → Code Review → PM |
| #2 | Header + HubView | #1a #1b | Developer → Code Review → PM |
| #3 | BollettaRoom completa | #1a #1b | Developer → Code Review → PM |
| #4 | GlossaryPanel | #1a #1b | Developer → Code Review → PM |
| #5 | RataRoom | #1a #1b | Developer → Code Review → PM |
| #6 | Integrazione + polish + E2E | #2 #3 #4 #5 | Developer → Code Review → Tester → PM |

---

### Timeline con agenti paralleli

| Fase | Agenti attivi | Tempo stimato |
|------|--------------|--------------|
| Phase 0 | Orchestrator + GitHub PM Agent in parallelo | ~10 min |
| Issue #0 | 1 Developer Agent (scaffolding) | ~8 min |
| Issue #1a + #1b | 2 Developer Agent in parallelo | ~20 min (limitato da #1b) |
| Issue #2+3+4+5 | 4 Developer Agent in parallelo | ~55 min (limitato da #3) |
| Issue #6 | Developer + Tester Agent | ~30 min |
| **Totale** | | **~2h03min** |

> Code Review e GitHub PM Agent per ogni Issue girano non appena quella specifica Issue è pronta — non aspettano il completamento delle Issue parallele sorelle.

Rimangono ~3 ore per debugging, demo prep e presentazione.

---

### Ciclo per ogni Issue

```
Orchestrator dispatcha Developer Agent (worktree git isolato)
    │
    ▼
Developer Agent
    ├── legge docs/features/<id>/ + sezione rilevante del design doc
    ├── implementa feature + unit test
    ├── committa su feature branch
    └── notifica Orchestrator → "done"
    │
    ▼
Code Review Agent
    ├── analizza diff della feature branch
    ├── posta commenti inline se necessario
    └── approva o richiede fix → torna a Developer Agent
    │
    ▼
GitHub PM Agent
    ├── apre PR feature branch → main
    ├── aggiorna Project item → "Pronto al Merge"
    └── ⛔ GATE UMANO: merge manuale dopo review PR
    │
    ▼ (solo Issue #6)
Tester Agent
    ├── verifica happy path manualmente (no Playwright in MVP)
    └── segnala problemi → Orchestrator → Developer Agent
```

---

### Cosa rimane al piano di implementazione

Il file `docs/superpowers/plans/2026-09-14-finanzachiara-mvp.md` contiene il codice completo per ogni Issue. Il Developer Agent lo legge come contesto per implementare correttamente ogni feature.

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