# FinanzaChiara

App React che spiega bolletta della luce e prestiti a chi non ha competenze finanziarie.
Ogni contenuto esiste in tre livelli di profondità che l'utente sceglie: `semplice`, `normale`, `tecnico`.

- **Piano di implementazione:** `docs/superpowers/plans/2026-09-14-finanzachiara-mvp.md` — contiene il codice completo di ogni Issue. È la fonte di verità: eseguilo alla lettera, non reinterpretarlo.
- **Design doc:** `docs/superpowers/specs/2026-09-14-finanzachiara-design.md`
- **Stato del pipeline:** `docs/pipeline-state.json` — ID board, mapping Issue, dipendenze.

## Il vincolo che governa tutto

**Descrivere il meccanismo, mai suggerire la mossa.** L'app spiega come funziona un numero; non dice all'utente cosa fare. Vale nel copy, nei commenti e nei nomi.

Fallisce il vincolo: «conviene», «è il numero da confrontare», «usa la lavatrice di notte», «dovresti».
Lo rispetta: «nelle fasce meno care lo stesso kWh costa meno», «il TAEG include le spese accessorie».

Corollario: i numeri mostrati devono essere veri. Una simulazione che inventa la matematica è più dannosa di una che non esiste — l'utente si fida perché non sa verificare.

## Valori esatti, case-sensitive

| | |
|---|---|
| Livelli | `semplice` · `normale` · `tecnico` |
| Viste | `hub` · `bolletta` · `rata` |
| localStorage | `finanzachiara_level` |

Uno di questi scritto male rompe il Context in silenzio: nessun errore, solo spiegazioni che non cambiano.

## Convenzioni

- **Italiano ovunque**: UI, label, commenti, messaggi di commit.
- Stato globale solo via `useApp()`. Nessun componente legge il Context direttamente.
- Recharts è l'unica libreria di grafici. Nessun SVG scritto a mano.
- CSS in file separati accanto al componente. Inline style solo per valori calcolati a runtime.
- Nessun backend, nessuna API key, nessuna chiamata di rete.

## Gotcha: i numeri delle Issue

Gli ID nel piano (`#0`, `#1a`, `#1b`, `#2`…) **non sono** i numeri GitHub. Il mapping vive in `docs/pipeline-state.json` sotto `issues[*].gh`.

`#0`→1 · `#1a`→2 · `#1b`→3 · `#2`→4 · `#3`→5 · `#4`→6 · `#5`→7 · `#6`→8

Nei commit usa il numero GitHub: `Closes #1`, mai `Closes #0` (issue inesistente) né `Closes #1a` (sintassi non valida).
