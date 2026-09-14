import { useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function GlossaryTerm({ termine, isActive, onSelect }) {
  const { currentLevel, openGlossaryTerm } = useApp()
  const ref = useRef(null)
  useEffect(() => { if (isActive && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [isActive])
  const bodyId = `term-body-${termine.id}`
  return (
    <div ref={ref} className={`glossary-term ${isActive ? 'active' : ''}`}>
      {/* Il toggle e' un <button> vero, non un <div onClick>: raggiungibile da Tab,
          attivabile con Invio/Spazio e annunciato con lo stato aperto/chiuso.
          I link ai correlati stanno FUORI da questo bottone (button annidati sono
          HTML invalido), percio' non serve piu' e.stopPropagation(). */}
      <button className="term-header" onClick={onSelect} aria-expanded={isActive} aria-controls={bodyId}>
        <span className="term-nome">{termine.termine}</span>
        <span className="term-toggle" aria-hidden="true">{isActive ? '▲' : '▼'}</span>
      </button>
      {isActive && (
        <div className="term-body" id={bodyId}>
          <p className="term-spiegazione">{termine.spiegazione[currentLevel]}</p>
          {termine.correlati?.length > 0 && (
            <div className="term-correlati">
              <span className="correlati-label">Vedi anche: </span>
              {termine.correlati.map(id => (
                <button key={id} className="correlato-link" onClick={() => openGlossaryTerm(id)}>
                  {id.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
