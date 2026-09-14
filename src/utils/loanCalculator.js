export function calcolaRata(P, tassoAnnuo, mesi) {
  const r = tassoAnnuo / 100 / 12
  if (r === 0) return P / mesi
  return P * (r * Math.pow(1 + r, mesi)) / (Math.pow(1 + r, mesi) - 1)
}

export function calcolaPianoAmmortamento(P, tassoAnnuo, mesi) {
  const rata = calcolaRata(P, tassoAnnuo, mesi)
  const r = tassoAnnuo / 100 / 12
  let debito = P
  return Array.from({ length: mesi }, (_, i) => {
    const interessi = debito * r
    const capitale = rata - interessi
    debito -= capitale
    return { mese: i + 1, rata, capitale, interessi, debitoResiduo: Math.max(debito, 0) }
  })
}

export function formatEuro(n) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)
}
