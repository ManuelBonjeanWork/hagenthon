import { useState } from 'react'
import { bollettaVoci, TOTALE_BOLLETTA, ALIQUOTA_IVA } from '../../data/bolletta'
import './SimulationPanel.css'

// Ipotesi dichiarata, non un dato: lo sconto per fascia vale SOLO sulla quota energia.
// Oneri, trasporto, quota potenza e imposte non dipendono dall'ora in cui consumi.
const SCONTO_FASCIA = { giorno: 0, sera: -0.05, notte: -0.15 }
const CONSUMO_BASE = 180
const POTENZA_BASE = 3

function calcolaBollettaSimulata(consumo, potenza, fascia) {
  const imponibile = bollettaVoci
    .filter(v => v.scala !== 'iva')
    .reduce((sum, v) => {
      if (v.scala === 'consumo') {
        const base = v.importo * (consumo / CONSUMO_BASE)
        return sum + (v.soggettaFascia ? base * (1 + SCONTO_FASCIA[fascia]) : base)
      }
      if (v.scala === 'potenza') return sum + v.importo * (potenza / POTENZA_BASE)
      return sum + v.importo
    }, 0)
  // L'IVA si RICALCOLA sul nuovo imponibile: non e' una voce che scala per conto suo.
  // Ai valori di default (180 kWh, 3 kW, giorno) questo riproduce esattamente €79.09.
  return { imponibile, iva: imponibile * ALIQUOTA_IVA, totale: imponibile * (1 + ALIQUOTA_IVA) }
}

// Senza segno esplicito un risparmio si stampa identico a un aumento.
function conSegno(n, decimali = 2) {
  return `${n >= 0 ? '+' : '−'}€${Math.abs(n).toFixed(decimali)}`
}

export default function SimulationPanel() {
  const [consumo, setConsumo] = useState(CONSUMO_BASE)
  const [potenza, setPotenza] = useState(POTENZA_BASE)
  const [fascia, setFascia] = useState('giorno')
  const { imponibile, iva, totale } = calcolaBollettaSimulata(consumo, potenza, fascia)
  const diff = totale - TOTALE_BOLLETTA
  return (
    <div className="simulation-panel">
      <h3 className="sim-title">💡 Come cambia il totale al variare dei parametri?</h3>
      <p className="sim-subtitle">Muovi i cursori: il calcolo si aggiorna in tempo reale.</p>
      <div className="sim-controls">
        <label className="sim-label">Consumo mensile: <strong>{consumo} kWh</strong>
          <input type="range" min={50} max={400} step={10} value={consumo} onChange={e => setConsumo(Number(e.target.value))} className="sim-slider" />
        </label>
        <label className="sim-label">Potenza impegnata: <strong>{potenza} kW</strong>
          <input type="range" min={1.5} max={6} step={0.5} value={potenza} onChange={e => setPotenza(Number(e.target.value))} className="sim-slider" />
        </label>
        <div className="sim-label"><span>Fascia oraria prevalente:</span>
          <div className="fascia-group">
            {['giorno','sera','notte'].map(f => (
              <button key={f} className={`fascia-btn ${fascia === f ? 'active' : ''}`} onClick={() => setFascia(f)}>
                {f === 'giorno' ? '☀️ Giorno' : f === 'sera' ? '🌆 Sera' : '🌙 Notte'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`sim-result ${diff < 0 ? 'risparmio' : 'aumento'}`}>
        <div className="result-row"><span>Con questi parametri:</span><strong>€{totale.toFixed(2)}</strong></div>
        <div className="result-row muted"><span>di cui imponibile:</span><span>€{imponibile.toFixed(2)}</span></div>
        <div className="result-row muted"><span>di cui IVA 10%:</span><span>€{iva.toFixed(2)}</span></div>
        <div className="result-row muted"><span>Bolletta di esempio:</span><span>€{TOTALE_BOLLETTA.toFixed(2)}</span></div>
        <div className="result-row differenza"><span>Differenza:</span>
          <strong>{conSegno(diff)}/mese → {conSegno(diff * 12, 0)}/anno</strong>
        </div>
      </div>
      <p className="sim-nota">
        Come è calcolato: quota energia e accisa scalano con i kWh, la quota potenza con i kW,
        oneri di sistema e trasporto restano fissi, l&apos;IVA è il 10% dell&apos;imponibile risultante.
        Lo sconto per fascia (−5% sera, −15% notte) è un&apos;ipotesi applicata alla sola quota energia.
      </p>
    </div>
  )
}
