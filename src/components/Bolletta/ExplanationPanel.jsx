import { useApp } from '../../context/AppContext'
import { TOTALE_BOLLETTA } from '../../data/bolletta'
import './ExplanationPanel.css'

// Colori risolti via variabili CSS (vedi :root in App.css): cambiare il tema
// del brand resta un'operazione in un punto solo, non richiede toccare questa mappa.
const COLORI = {
  energia: 'var(--color-zona-energia)',
  potenza: 'var(--color-zona-potenza)',
  oneri: 'var(--color-zona-oneri)',
  trasporto: 'var(--color-zona-trasporto)',
  imposte: 'var(--color-zona-imposte)',
}

export default function ExplanationPanel() {
  const { activeVoce, currentLevel, openGlossaryTerm } = useApp()
  if (!activeVoce) return (
    <div className="explanation-panel empty">
      <p className="empty-msg">👈 Seleziona una voce della bolletta per capire cosa significa</p>
    </div>
  )
  const pct = ((activeVoce.importo / TOTALE_BOLLETTA) * 100).toFixed(1)
  const colore = COLORI[activeVoce.colore] || 'var(--color-text-muted)'
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
