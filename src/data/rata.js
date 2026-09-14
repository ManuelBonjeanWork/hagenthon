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
