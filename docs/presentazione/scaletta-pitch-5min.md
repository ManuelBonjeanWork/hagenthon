# Scaletta Pitch — FinanzaChiara (5 minuti, giuria hackathon)

> **Livello: `manageriale-tecnico`** — pitch a una giuria: taglio bilanciato prodotto + metodo, dettaglio tecnico incluso solo dove è il differenziatore (agenti, modelli, parallelismo).
> **Budget parole:** 10 slide, note speaker totali ~590 parole (sotto il tetto dei ~700; il margine assorbe la demo dal vivo e le pause tra slide).
> **Lingua:** italiano. Termini tecnici consolidati mantenuti (`commit`, `deploy`, `board`, `MVP`, `Issue`, `kWh`, `TAEG`, `TAN`).
> **Nota di stato (2026-09-14):** claim allineate alla realtà attuale del repo — la pipeline ha completato l'MVP: data layer, componenti (Bolletta, Glossario, Header, Hub, Rata), integrazione in `App.jsx` e test (inclusi end-to-end) sono su `main`. L'app gira in locale (`npm run dev`, `npm run test` verdi); non è ancora deployata (nessuna build `dist/`). Se prima del pitch farete un deploy pubblico, aggiornate la slide 10 con "deployata".

---

## Slide 1 — FinanzaChiara

- **FinanzaChiara**
- *"Le tue bollette e i tuoi prestiti, finalmente in chiaro."*
- Un pitch da 5 minuti: il prodotto e il metodo

**Nota speaker:** Buongiorno. FinanzaChiara nasce da una domanda semplice: perché così tante persone pagano bollette e prestiti senza capire cosa c'è scritto? In cinque minuti vi mostriamo il prodotto e il metodo con cui l'abbiamo costruito.

---

## Slide 2 — Documenti che nessuno riesce a leggere

- Bollette: "oneri di sistema", "quota potenza", "dispacciamento"
- Prestiti: "TAEG", "TAN", "piano di ammortamento"
- Si paga senza capire, senza poter verificare un errore

**Nota speaker:** Ogni mese milioni di persone ricevono documenti che non riescono a leggere. La bolletta della luce parla di oneri di sistema e dispacciamento; il contratto di prestito di TAEG e piano di ammortamento. Il risultato è sempre lo stesso: si paga senza capire, senza poter controllare se c'è un errore, senza strumenti per capire cosa incide davvero sul costo.

---

## Slide 3 — Le stesse informazioni, al tuo livello

- App React che spiega bolletta della luce e prestito personale
- Tre livelli di linguaggio: **semplice · chiaro · tecnico**
- L'utente sceglie il livello, tutta l'app si adatta

**Nota speaker:** FinanzaChiara è un'app che spiega bolletta della luce e prestito personale. Il cuore è la scelta del livello di linguaggio: semplice, per chi vuole parole di tutti i giorni; chiaro, un ponte verso i termini del settore; tecnico, la terminologia esatta. L'utente sceglie e tutta l'app si adatta: stesse informazioni, al grado di dettaglio che riesce a gestire.

---

## Slide 4 — Stesso importo, ora si capisce

- **Prima:** "importi destinati alla copertura di costi di interesse generale... ai sensi della normativa vigente"
- **Dopo (semplice):** "una parte fissa che copre spese decise a livello nazionale, come gli incentivi alle rinnovabili"
- Cambia il linguaggio, non il dato

**Nota speaker:** Un esempio reale, la voce oneri di sistema. Prima suona così: importi destinati alla copertura di costi di interesse generale ai sensi della normativa vigente. Dopo, al livello semplice: una parte fissa che copre spese decise a livello nazionale, per esempio gli incentivi alle rinnovabili. Stesso importo, stesso fatto. Ma ora si capisce.

---

## Slide 5 — Tre stanze, un simulatore, il costo reale

*(demo dal vivo — `npm run dev`)*

- **Hub:** scegli il livello e l'area
- **Bolletta:** spiegata voce per voce + simulatore (slider kWh → costi)
- **Rata:** piano di ammortamento e costo reale (totale, capitale, interessi)

**Nota speaker:** L'app è organizzata in tre stanze. Dall'Hub si sceglie il livello e si entra. Nella stanza Bolletta ogni voce è spiegata, e un simulatore permette di muovere il consumo in kWh per vedere come cambiano i costi. Nella stanza Rata mostriamo il piano di ammortamento e il costo reale di un prestito: quanto si paga in totale, quanto è capitale e quanto interesse. Un glossario cliccabile è sempre a portata.

---

## Slide 6 — Descrivere il meccanismo, mai suggerire la mossa

- Nessun consiglio: spieghiamo come funziona un numero, non cosa fare
- Semplifichiamo il linguaggio, mai i numeri
- Formule esatte (TAEG, ammortamento): se un numero è alto, resta alto

**Nota speaker:** Qui c'è la nostra regola, e vale in ogni riga: descrivere il meccanismo, mai suggerire la mossa. Non indichiamo cosa fare; spieghiamo come funziona un numero e lasciamo la decisione all'utente. E semplifichiamo il linguaggio, mai i numeri: il calcolo del TAEG e il piano di ammortamento seguono la matematica reale. Se un importo è alto, resta alto e spieghiamo perché. Si capisce di più, ma non si viene mai ingannati.

---

## Slide 7 — Costruita da una pipeline di agenti

- **Orchestrator** (Opus): coordina, assegna, verifica le dipendenze
- **Developer, Code Review, Tester** (Sonnet): scrivono, rivedono e testano il codice
- **GitHub PM** (Haiku): apre le PR e aggiorna il board

**Nota speaker:** E qui la seconda metà della storia: come l'abbiamo costruita. Non un solo sviluppatore, ma una pipeline di agenti orchestrati, ciascuno con un ruolo. Un Orchestrator su Claude Opus coordina e verifica le dipendenze. Gli agenti Sonnet scrivono, rivedono e testano il codice. Un agente Haiku, più leggero, apre le PR e aggiorna il project board. Ogni Issue passa da mani diverse: sviluppo, revisione, test, chiusura.

---

## Slide 8 — 8 Issue, 2 finestre parallele, ~2 ore

- Flusso **tema → design → mvp**
- 8 Issue ordinate per dipendenze
- 2 finestre di parallelismo → ~2 ore stimate sulla critical path

**Nota speaker:** Il flusso è tema, design, mvp. Dal tema e dai vincoli, un agente ha prodotto il design doc; la pipeline ha poi implementato otto Issue, ordinate per dipendenze. Il punto è il parallelismo: dove le Issue erano indipendenti, più agenti hanno lavorato insieme, in due finestre. Context e dati prima; poi stanze e glossario. Il piano stimava circa due ore di sviluppo sulla critical path, contro uno sviluppo tutto in fila.

---

## Slide 9 — Dove vogliamo arrivare (to-be)

- Dalla bolletta d'esempio alla **tua**: un agente AI estrae le voci dal documento reale, l'app le spiega
- Domande libere su una voce o sulla rata, al livello scelto — sempre "spiega", mai "consiglia"
- Nuovi scenari (estratto conto, busta paga, affitto) e contenuti che si aggiornano quando cambiano le tariffe

**Nota speaker:** Oggi mostriamo una bolletta d'esempio; dove vogliamo arrivare è la tua. Carichi il documento vero, un agente ne estrae le voci e l'app le spiega al tuo livello — sempre spiegare, mai consigliare. Poi nuovi scenari, dall'estratto conto alla busta paga, e agenti che tengono i contenuti allineati alle norme quando cambia una tariffa. Lo stesso perimetro etico, più in grande.

---

## Slide 10 — FinanzaChiara, in chiaro

- Metodo: repo, board e pipeline di agenti; tutto il codice su Git
- MVP funzionante: componenti, data layer e test end-to-end, in esecuzione locale
- *"Le tue bollette e i tuoi prestiti, finalmente in chiaro."*

**Nota speaker:** Chiudiamo con quello che lasciamo: un metodo che funziona — repo, board e una squadra di agenti che ha costruito l'MVP, con il codice su Git — e un prodotto funzionante, testato end-to-end, con una visione chiara di dove arrivare. Ma il messaggio da ricordare è uno solo: la chiarezza non si ottiene nascondendo i numeri, si ottiene spiegandoli. Le vostre bollette e i vostri prestiti, finalmente in chiaro. Grazie.

---

**Totale note speaker: ~590 parole** — tempo di parlato stimato ~4'00"–4'15" a ritmo da pitch, più la demo dal vivo (slide 5) e le pause di transizione: resta entro i 5 minuti, con margine ridotto (se serve recuperare tempo, la slide 9 to-be è la più comprimibile).

---

**Nota stilistica:** Livello `manageriale-tecnico` — giuria di hackathon, deliverable bilanciato prodotto/metodo. Formato scelto: scaletta slide + note speaker separate, il più adatto a un pitch cronometrato. Ho enfatizzato il differenziatore — i tre livelli, il vincolo etico e la pipeline di agenti con nomi/modelli e parallelismo — perché è ciò su cui la giuria valuta chiarezza e correttezza. Ho tenuto le note sotto il tetto (~590 vs ~700 parole) per non sforare i 5 minuti includendo la demo dal vivo. La slide 9 "to-be" mostra ambizione restando dentro il perimetro etico ("spiega, mai consiglia").

Etichetta del livello intermedio: nel copy user-facing uso **"Chiaro"**, la label che l'app mostra davvero nel selettore (`🔵 Chiaro`); il valore interno resta `normale` (case-sensitive, come da `CLAUDE.md`).

**Claim allineate alla realtà (2026-09-14).** Stato verificato sul repo: la pipeline ha completato l'MVP — data layer, componenti (Bolletta, Glossario, Header, Hub, Rata), integrazione in `App.jsx` e test (inclusi end-to-end) sono su `main`. L'app è **funzionante in locale** (`npm run dev`, `npm run test` verdi); **non è ancora deployata** (nessuna build `dist/`). Perciò:
- **Slide 5** è una *demo dal vivo* dal dev server.
- **Slide 8** presenta le ~2 ore come *stima di piano* sulla critical path (tempo reale non ancora misurato in queste note).
- **Slide 9** è dichiaratamente il *to-be* (visione), separata da ciò che esiste oggi.
- **Slide 10** dichiara un *MVP funzionante e testato*, non "deployato".

Quando farete un deploy pubblico, aggiornate la slide 10 → "app React funzionante e deployata"; se misurate il tempo reale di sviluppo, la slide 8 → "~2 ore *effettive*".
