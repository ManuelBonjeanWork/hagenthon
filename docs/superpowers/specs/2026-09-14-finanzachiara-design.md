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

## 3. Architettura Generale

### Stack tecnologico
- **Frontend:** React + Vite (client-side only)
- **Backend:** nessuno
- **AI:** nessuna nell'MVP — prevista nella roadmap futura per parsing di bollette reali
- **Dipendenze esterne:** nessuna API key necessaria
- **Charting:** SVG custom o Recharts (leggero, già compatibile con React)

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

## 4. Header e Level Selector

### Comportamento
Il `LevelSelector` è sempre visibile nell'header. Cambiando il livello, **tutti i testi dell'app si aggiornano istantaneamente** tramite Context — sia la bolletta, sia la rata, sia il glossario.

Il livello non è legato all'età ma alla **preferenza di comprensione**: un adulto può scegliere "Semplice" senza sentirsi giudicato. Il copy del selector evita riferimenti all'età:

```
[ 🟢 Semplice ] [ 🔵 Chiaro ] [ 🔬 Tecnico ]
```

### Persistenza
Il livello scelto viene salvato in `localStorage` per non costringere l'utente a risceglierlo ogni visita.

---

## 5. HubView — Schermata Iniziale

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

## 6. BollettaRoom — Scenario Primario

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

## 7. RataRoom — Scenario Secondario

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

## 8. GlossaryPanel

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

## 9. Before / After Simplicity Evidence

### Prima (testo reale da bolletta Enel)

> "Corrispettivi di dispacciamento — Componente di sbilanciamento (DIS): €0.00432/kWh — Componente uplift (UP): €0.00218/kWh — Oneri generali di sistema A3: €0.02286/kWh — UC1: €0.00012/kWh — UC3: €0.00001/kWh — MCT: €0.00045/kWh"

### Dopo (livello Semplice)

> "Questi sono costi fissi che tutti i clienti italiani pagano, indipendentemente da quanto consumano. Servono a mantenere la rete elettrica nazionale e a finanziare le energie rinnovabili. Non puoi evitarli — li pagano anche i tuoi vicini."

### Dopo (livello Normale)

> "Sono le componenti tariffarie degli 'Oneri di sistema', stabilite dall'ARERA. La voce A3 finanzia gli incentivi alle energie rinnovabili. UC1 e UC3 coprono i costi di qualità del servizio. MCT è una compensazione territoriale per le aree con impianti energetici. Non dipendono dal tuo consumo."

---

## 10. Risk & Clarity Note

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

## 11. Roadmap Futura (post-hackathon)

### Fase 2 — AI Layer
- **Upload bolletta reale** → AI (Claude) estrae le voci e i valori → alimenta BillViewer con i dati reali dell'utente
- **Parsing testo incollato** → stesso flusso per bollette digitali
- **Spiegazioni dinamiche** → livelli linguistici più granulari, personalizzazione per contesto

### Fase 3 — Espansione scenari
- Card "Estratto conto bancario" — spiegazione di commissioni, movimenti, saldo disponibile vs contabile
- Card "Busta paga" — capire netto vs lordo, trattenute, TFR
- Card "Contratto di affitto" — deposito cauzionale, adeguamento ISTAT, spese condominiali

### Fase 4 — Percorso adattivo
- Rilevamento del livello di alfabetizzazione tramite micro-quiz iniziale
- Progressione del livello linguistico automatica man mano che l'utente interagisce

---

## 12. Priorità di sviluppo (5 ore, 2 persone)

| Ora | Persona A | Persona B |
|-----|-----------|-----------|
| 0–1 | Setup Vite + struttura file + Context | Data layer: `bolletta.js` + `glossario.js` |
| 1–2 | Header + LevelSelector + HubView | BillViewer (layout bolletta interattiva) |
| 2–3 | ExplanationPanel + collegamento Context | SimulationPanel (slider + calcoli) |
| 3–4 | GlossaryPanel (slide-in + search) | RataRoom (form + LoanVisualizer + grafico) |
| 4–5 | Link bidirezionali Glossario ↔ Bolletta + polish UI | Test cross-browser + fix bug + demo flow |
