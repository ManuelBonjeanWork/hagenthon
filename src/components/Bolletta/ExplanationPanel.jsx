import { useApp } from '../../context/AppContext'
import { TOTALE_BOLLETTA } from '../../data/bolletta'
import './ExplanationPanel.css'

const COLORI = { energia: '#3b82f6', potenza: '#eab308', oneri: '#f97316', trasporto: '#ef4444', imposte: '#8b5cf6' }

export default function ExplanationPanel() {
  const { activeVoce, currentLevel, openGlossaryTerm } = useApp()
  if (!activeVoce) return (
    <div className="explanation-panel empty">
      <p className="empty-msg">👈 Seleziona una voce della bolletta per capire cosa significa</p>
    </div>
  )
  const pct = ((activeVoce.importo / TOTALE_BOLLETTA) * 100).toFixed(1)
  const colore = COLORI[activeVoce.colore] || '#94a3b8'
  return (
    <div className="explanation-panel">
      <div className="exp-header" style={{ borderLeftColor: colore }}>
        <h3 className="exp-label">{activeVoce.label}</h3>
        <span className="exp-importo">€{activeVoce.importo.toFixed(2)}</span>
      </div>
      <div className="exp-barra">
        <div className="barra-fill" style={{ width: `${pct}%`, background: colore }} />
        <span className="barra-pct">{pct}% della bolletta</span>
      </div>
      <p className="exp-testo">{activeVoce.spiegazione[currentLevel]}</p>
      {activeVoce.terminiGlossario?.length > 0 && (
        <div className="exp-termini">
          <span className="termini-label">Approfondisci nel glossario:</span>
          <div className="termini-list">
            {activeVoce.terminiGlossario.map(id => (
              <button key={id} className="termine-link" onClick={() => openGlossaryTerm(id)}>→ {id.replace(/-/g, ' ')}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
