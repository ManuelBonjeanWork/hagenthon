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
