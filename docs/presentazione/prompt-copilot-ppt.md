# Prompt per Copilot — Scaletta PPT "FinanzaChiara"

Prompt pronto da incollare in **Copilot Chat** per generare la **scaletta** (slide per slide) di una presentazione su FinanzaChiara.

- **Strumento:** Copilot Chat → scaletta (poi passabile a Copilot in PowerPoint o da incollare a mano)
- **Pubblico:** giuria di hackathon (pitch)
- **Taglio:** bilanciato — metà metodo di lavoro agentico, metà prodotto
- **Percorso raccontato:** `tema.md` (partenza) → design doc → piano MVP

> Il prompt è autosufficiente: contiene tutti i fatti dei tre documenti, perché Copilot Chat non vede il repo. Incollalo così com'è.

---

## Prompt

```text
SEI un esperto di storytelling e progettazione di presentazioni per pitch di hackathon.

OBIETTIVO: genera una SCALETTA DETTAGLIATA, slide per slide, per una presentazione PowerPoint (~12–14 slide, 6–7 minuti) che racconta il progetto "FinanzaChiara" a una GIURIA DI HACKATHON. Taglio BILANCIATO: metà sul metodo di lavoro agentico che abbiamo seguito, metà sul prodotto.

LINGUA: italiano.

FORMATO DI OUTPUT — per ogni slide dammi:
- Usa il template allegato
- Slide N — Titolo
- 3–5 bullet essenziali (una idea per bullet, testo "da slide", non paragrafi)
- Nota per lo speaker: 1–2 frasi su cosa dire a voce
- Visual: suggerimento concreto (diagramma, screenshot, tabella, grafico…)
Alla fine aggiungi una sezione "Note di design": palette/tono consigliati e i 3 messaggi chiave che la giuria deve ricordare.

CONTESTO DEL PROGETTO (usa questi fatti, non inventarne altri):

▸ LA SFIDA (punto di partenza)
- Tema hackathon: "Inclusione finanziaria" — usare strumenti di agentic coding per l'educazione alla finanza personale di base.
- Vincolo etico del tema: educare, NON consigliare. Vietate raccomandazioni d'investimento o su cosa comprare/vendere/scegliere. Richiesta una capability software concreta, non una semplice riscrittura di testi.
- 3 deliverable richiesti dalla giuria: (1) User Difficulty Statement, (2) Before/After Simplicity Evidence, (3) Risk & Clarity Note.
- Team di 2 persone, 5 ore di sviluppo.

▸ IL PRODOTTO — FinanzaChiara
- App React (Vite, client-side, nessun backend, nessuna AI nell'MVP) che rende comprensibili due documenti finanziari reali: la BOLLETTA della luce e il COSTO DI UN PRESTITO/RATA.
- Idea centrale: ogni contenuto esiste in 3 LIVELLI DI PROFONDITÀ scelti dall'utente con un selettore — "semplice", "chiaro/normale", "tecnico". Cambiando livello, tutti i testi dell'app si riscrivono all'istante.
- Vincolo d'oro del prodotto: "DESCRIVERE IL MECCANISMO, MAI SUGGERIRE LA MOSSA". L'app spiega come funziona un numero, non dice cosa fare. I numeri mostrati sono sempre esatti (ammortamento alla francese, IVA, oneri).
- Struttura "Hub & Rooms": una schermata Hub con 3 scelte → BollettaRoom (bolletta interattiva cliccabile voce per voce + pannello spiegazione + simulatore "cosa succederebbe se…") → RataRoom (calcolo rata con grafico capitale/interessi nel tempo) → Glossario (~25 termini: TAEG, TAN, kWh, F1/F2/F3, oneri di sistema, accisa…).

▸ BEFORE/AFTER (evidenza di semplificazione — usala in una slide dedicata)
- PRIMA (testo reale da bolletta): "Corrispettivi di dispacciamento — Componente uplift (UP) €0,00218/kWh — Oneri generali di sistema A3 €0,02286/kWh — UC1, UC3, MCT…"
- DOPO (livello semplice): "Sono costi fissi che tutti i clienti italiani pagano, indipendentemente da quanto consumano. Servono a mantenere la rete elettrica e a finanziare le energie rinnovabili. Non puoi evitarli."

▸ RISK & CLARITY (come abbiamo evitato l'ambiguità)
- Cosa NON è stato alterato: importi sempre esatti; formule secondo standard; note normative del livello "tecnico" precise.
- Nessuna raccomandazione: la simulazione mostra solo la conseguenza matematica di scenari che l'utente propone, mai "dovresti".

▸ IL METODO DI LAVORO AGENTICO (il cuore del racconto: il percorso seguito)
- Percorso in 3 tappe documentate: (1) tema.md = il brief della sfida → (2) design doc = decisioni di prodotto e architettura → (3) piano MVP = codice completo di ogni Issue. Ogni tappa alimenta la successiva.
- Abbiamo COSTRUITO l'app con una PIPELINE SDLC AGENTICA, non a mano: un ORCHESTRATOR AGENT (Claude Opus) coordina tutto e conosce il grafo delle dipendenze; agenti stateless specializzati fanno il lavoro:
  • Developer Agent (Claude Sonnet) → scrive codice + test su branch isolato
  • Code Review Agent (Claude Sonnet) → verifica criteri architetturali e di copy
  • Tester Agent (Claude Sonnet) → test di integrazione del flusso utente
  • GitHub PM Agent (Claude Haiku) → crea Issue, apre PR, aggiorna la board
- Lavoro spezzato in 8 ISSUE con un grafo delle dipendenze e 2 FINESTRE DI PARALLELISMO: prima 2 agenti in parallelo (AppContext + Data Layer), poi 4 agenti in parallelo (Header, Bolletta, Glossario, Rata), infine integrazione.
- L'umano approva solo ai "gate" (merge delle PR); il resto è automatizzato. Stato salvato in un file di pipeline per riprendere dopo un'interruzione.
- Risultato: ~2 ore di sviluppo sulla critical path (vs sviluppo sequenziale), lasciando tempo per demo e pitch.
- Roadmap futura: agenti di manutenzione (Regulatory Monitor che apre una PR quando cambia una tariffa ARERA; Semantic Lint sui contenuti) e un AI layer per upload/parsing di bollette reali — sempre in modalità "spiega/estrai", mai "consiglia".

ARCO NARRATIVO SUGGERITO (adattalo se migliora il ritmo):
1. Titolo + tagline
2. Il problema: chi non capisce i documenti finanziari e perché conta (User Difficulty Statement)
3. La sfida dell'hackathon e i suoi vincoli
4. La nostra idea: FinanzaChiara + i 3 livelli di linguaggio
5. Come funziona: Hub & Rooms (flow/screenshot)
6. Demo 1 — la bolletta interattiva + simulatore
7. Demo 2 — il costo reale di una rata
8. Before/After: la prova della semplificazione
9. Il vincolo etico: "descrivere il meccanismo, non suggerire la mossa" + Risk & Clarity
10. IL METODO: costruita con una pipeline di agenti (Orchestrator + team di agenti)
11. Il grafo delle 8 Issue e il parallelismo (perché è stato veloce)
12. Risultati: cosa consegniamo + timeline
13. Roadmap
14. Chiusura + messaggio da ricordare

REQUISITI DI STILE:
- Una sola idea forte per slide; bullet brevi, niente muri di testo.
- Concreto e memorabile; evita frasi generiche da "slide fatta dall'AI".
- Rispetta il tono del progetto: mai suggerire scelte finanziarie, nemmeno negli esempi.
- Evidenzia due volte il fattore differenziante: (a) i 3 livelli di linguaggio, (b) aver costruito il prodotto con una pipeline di agenti orchestrati.
```

---

## Come usarlo

1. Incolla il prompt in **Copilot Chat** e ottieni la scaletta.
2. Passa la scaletta a **Copilot in PowerPoint** ("crea una presentazione da questo testo") oppure incollala slide per slide.

### Varianti rapide (aggiungile in coda al prompt)
- **Pitch lampo:** «Riduci a ~8 slide per un pitch da 3 minuti.»
- **Copione:** «Per ogni slide scrivi anche le speaker notes parola per parola.»
- **Bilingue:** «Genera la scaletta anche in inglese.»
- **Immagini:** «Proponi un'icona o un'immagine per ogni slide.»
