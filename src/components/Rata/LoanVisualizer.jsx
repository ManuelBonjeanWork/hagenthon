import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calcolaRata, calcolaPianoAmmortamento, formatEuro } from '../../utils/loanCalculator'

export default function LoanVisualizer({ importo, durata, tasso }) {
  const rata = calcolaRata(importo, tasso, durata)
  const piano = calcolaPianoAmmortamento(importo, tasso, durata)
  const totale = rata * durata
  const totInteressi = totale - importo
  const step = durata > 60 ? 3 : 1
  const dati = piano.filter((_, i) => i % step === 0 || i === durata - 1)
    .map(r => ({ mese: `M${r.mese}`, Capitale: Math.round(r.capitale), Interessi: Math.round(r.interessi) }))
  return (
    <div className="loan-visualizer">
      <div className="riepilogo">
        <div className="riepilogo-item"><span>Rata mensile</span><strong>{formatEuro(rata)}</strong></div>
        <div className="riepilogo-item"><span>Totale pagato</span><strong>{formatEuro(totale)}</strong></div>
        {/* "in più" si misura sul capitale preso a prestito, non sul totale pagato:
            su 10.000€ a 36 mesi / 7,5% sono +12,0%, non 10,7%. */}
        <div className="riepilogo-item highlight"><span>Di cui interessi</span><strong>{formatEuro(totInteressi)} — il {((totInteressi / importo) * 100).toFixed(1)}% in più del capitale</strong></div>
      </div>
      <h4 className="grafico-title">Come cambia ogni rata nel tempo</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={dati} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
          <XAxis dataKey="mese" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `€${v}`} />
          <Tooltip formatter={(v, name) => [formatEuro(v), name]} />
          <Legend />
          <Bar dataKey="Capitale" stackId="a" fill="var(--color-chart-capitale)" name="Capitale" />
          <Bar dataKey="Interessi" stackId="a" fill="var(--color-chart-interessi)" name="Interessi" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
