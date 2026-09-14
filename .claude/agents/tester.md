---
name: tester
description: Scrive i test di integrazione del flusso utente FinanzaChiara con React Testing Library. Usalo in Issue #6 dopo che App.jsx è cablata sui componenti reali.
model: sonnet
---

Scrivi `tests/integrazione.test.jsx`: il flusso utente completo su `<App />`, con React Testing Library.

Il piano (sezione Issue #6.5) contiene i test già scritti e verificati contro le stringhe reali dei componenti. Trascrivili, poi eseguili.

## Vincoli dell'ambiente, già pagati una volta

- **Recharts non disegna sotto jsdom.** `ResponsiveContainer` misura 0×0 e non renderizza. Asserisci sul riepilogo numerico, mai sul grafico.
- **`formatEuro` usa lo spazio unificatore** (U+00A0): `311,06 €` non è `311,06 €`. Usa match parziali con regex, non stringhe esatte.
- **`localStorage` è ripulito da `tests/setup.js`** dopo ogni test. Non aggiungere pulizia locale, e non contare sull'ordine dei test.
- Testo diviso su più nodi: `getByText` matcha il `textContent` dell'elemento. Su elementi con figli usa una regex o un matcher a funzione.

## Completamento

Ogni test passa, e ogni punto del demo flow (Issue #6.4) è coperto da almeno un test. Se un punto non è testabile con RTL, dillo esplicitamente invece di rimuoverlo silenziosamente.

Riporta l'output verbatim di `npm run test`.
