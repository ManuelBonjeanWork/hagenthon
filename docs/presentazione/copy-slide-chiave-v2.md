# Copy Slide Chiave — FinanzaChiara v2 (pezzi ad alto impatto)

> **Livello: `manageriale`** — copy per una giuria: massima brevità, impatto, prima riga = messaggio completo. Due varianti per elemento: **A = diretta/assertiva**, **B = formale/diplomatica**.
> **Vincolo etico rispettato in ogni riga:** descrivere il meccanismo, mai suggerire la mossa. Nessun «conviene / dovresti / è il numero da confrontare».
> **Lingua:** italiano.
> **Allegati:** il pitch include in allegato il template delle slide e il logo di FinanzaChiara.

---

## 1. Tagline

**Variante A — diretta/assertiva**

> Le tue bollette e i tuoi prestiti, finalmente in chiaro.

**Variante B — formale/diplomatica**

> Bollette e prestiti spiegati con parole chiare, al tuo livello.

---

## 2. Slide del problema (User Difficulty Statement)

**Variante A — diretta/assertiva**

**Titolo:** Documenti che nessuno riesce a leggere

- Bollette piene di "oneri di sistema", "dispacciamento", "quota potenza"
- Prestiti con "TAEG", "TAN", "piano di ammortamento"
- Si paga senza capire, senza poter verificare un errore

*Frase-gancio (a voce):* "Ogni mese arriva un documento che parla una lingua che non abbiamo mai imparato."

**Variante B — formale/diplomatica**

**Titolo:** Quando i numeri restano incomprensibili

- Le bollette usano termini tecnici come "oneri di sistema" e "dispacciamento"
- I prestiti parlano di "TAEG", "TAN" e "piano di ammortamento"
- Molte persone pagano senza avere gli strumenti per capire cosa leggono

*Frase-gancio (a voce):* "Milioni di persone gestiscono ogni mese documenti che nessuno ha mai spiegato loro."

---

## 3. Slide del prodotto — i tre livelli

**Titolo slide:** Un dato. Tre livelli. Zero consigli.

**Esempio su fascia F1 della bolletta:**

```
semplice → "Hai consumato più corrente nelle ore più care della giornata."
chiaro   → "La fascia F1 copre i feriali dalle 8 alle 19. Il kWh in F1 costa di più."
tecnico  → "F1 ARERA: fascia di punta lun–ven 8–19. Prezzo biorario differenziale."
```

*Sottotitolo:* Lo stesso meccanismo, spiegato in modo diverso — mai interpretato.

---

## 4. Slide del vincolo etico

**Variante A — diretta/assertiva**

> Nessun "conviene". Nessun "dovresti". Solo: ecco come funziona.

**Variante B — formale/diplomatica**

> In finanza personale, la differenza tra spiegare e consigliare è la differenza tra autonomia e dipendenza. FinanzaChiara sceglie l'autonomia.

---

## 5. Slide della pipeline multi-agente

**Titolo slide:** Costruita da agenti Claude. Verificabile su GitHub.

**Body — tre ruoli espliciti:**

```
Claude Opus    → Orchestrator  — pianifica, decompone, coordina
Claude Sonnet  → Developer     — scrive, fa review, testa
Claude Haiku   → GitHub PM     — apre Issue, aggiorna la board
```

*Sottotitolo:* Una pipeline multi-agente deterministica. Non un esperimento — un metodo.

---

## 6. Slide del parallelismo

**Titolo slide:** Due finestre di parallelismo reale

**Variante A — schema visivo**

```
Finestra 1 — sviluppo parallelo
  ├── Agent A: Issue #1a — modulo Bolletta
  └── Agent B: Issue #1b — modulo Rata
        ↓ merge su main  (~40% di tempo risparmiato)

Finestra 2 — ruoli paralleli
  ├── Developer (Sonnet): scrive il codice
  └── GitHub PM (Haiku): aggiorna la board
```

**Variante B — narrativa**

> Due funzionalità sviluppate contemporaneamente su worktree separati. Developer che scrive e GitHub PM che traccia la board — in parallelo. Un team umano avrebbe bisogno di handoff e sincronizzazione. La pipeline no.

---

## 7. Slide della visione (to-be)

**Variante A — diretta/assertiva**

> Bolletta e prestito oggi. Mutuo, CUD, fondo pensione domani. La stessa architettura — il meccanismo, mai il consiglio.

**Variante B — formale/diplomatica**

> Un motore di spiegazione neutro e verificabile per ogni documento finanziario che un cittadino italiano riceve nel corso della vita. Accessibile, scalabile, privo di conflitti di interesse.

---

## 8. Messaggio di chiusura

**Variante A — diretta/assertiva**

> La chiarezza non nasce nascondendo i numeri, ma spiegandoli. È tutto quello che FinanzaChiara fa: le tue bollette e i tuoi prestiti, finalmente in chiaro.

**Variante B — formale/diplomatica**

> Capire cosa si paga non è un privilegio per esperti. FinanzaChiara restituisce alle persone le parole per leggere i propri documenti, con i numeri veri e spiegati.

---

**Nota stilistica (v2 rispetto a v1):**
- **Sezione 3 (prodotto):** aggiunto esempio concreto su fascia F1 con le tre formulazioni affiancate e allineate — leggibile a distanza su uno schermo proiettato, immediato senza spiegazioni.
- **Sezione 5 (pipeline):** i tre modelli Claude (Opus / Sonnet / Haiku) sono ora espliciti con tabella ruolo/funzione — trasforma un claim vago in un'architettura verificabile.
- **Sezione 6 (parallelismo):** introdotto schema ASCII con le due finestre nominate, i branch espliciti e la stima quantitativa (~40%).
- **Sezione 7 (visione):** aggiunto mutuo, CUD, fondo pensione come estensioni concrete — ambizione entro il perimetro etico.
- **Sezione 4 (vincolo etico):** aggiunta variante B che spiega l'impatto in termini di autonomia vs dipendenza, utile per una giuria che non conosce il dominio finanziario.
- **Allegati:** aggiunto riferimento a template e logo nella nota introduttiva.

Ho evitato ogni verbo di scelta finanziaria e la forma «dovrebbe/dovresti» in ogni variante, per rispettare il vincolo etico alla lettera.
