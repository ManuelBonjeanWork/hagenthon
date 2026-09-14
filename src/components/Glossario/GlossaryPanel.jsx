import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { glossario } from '../../data/glossario'
import GlossarySearch from './GlossarySearch'
import GlossaryTerm from './GlossaryTerm'
import './GlossaryPanel.css'

export default function GlossaryPanel() {
  const { glossaryOpen, setGlossaryOpen, activeGlossaryTerm, setActiveGlossaryTerm } = useApp()
  const [query, setQuery] = useState('')
  const terminiVisibili = useMemo(() => {
    if (!query) return glossario
    const q = query.toLowerCase()
    return glossario.filter(t => t.termine.toLowerCase().includes(q) || Object.values(t.spiegazione).some(s => s.toLowerCase().includes(q)))
  }, [query])
  const perLettera = useMemo(() => terminiVisibili.reduce((acc, t) => { const l = t.lettera; if (!acc[l]) acc[l] = []; acc[l].push(t); return acc }, {}), [terminiVisibili])
  function handleClose() { setGlossaryOpen(false); setActiveGlossaryTerm(null); setQuery('') }

  // Esc chiude, e il focus torna dov'era prima dell'apertura: senza questo chi naviga
  // da tastiera resta bloccato in fondo alla pagina dopo aver chiuso il pannello.
  const focusPrecedente = useRef(null)
  useEffect(() => {
    if (!glossaryOpen) return
    focusPrecedente.current = document.activeElement
    function onKeyDown(e) { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      focusPrecedente.current?.focus?.()
    }
  }, [glossaryOpen])

  if (!glossaryOpen) return null
  return (
    <>
      <div className="glossary-backdrop" onClick={handleClose} aria-hidden="true" />
      <aside className="glossary-panel" role="dialog" aria-modal="true" aria-label="Glossario">
        <div className="glossary-header"><h2>📖 Glossario</h2><button className="close-btn" onClick={handleClose} aria-label="Chiudi il glossario">✕</button></div>
        <div className="glossary-search-wrap"><GlossarySearch value={query} onChange={setQuery} autoFocus={!activeGlossaryTerm} /></div>
        <div className="glossary-list">
          {Object.keys(perLettera).sort().map(lettera => (
            <section key={lettera} className="lettera-group">
              <h3 className="lettera-heading">{lettera}</h3>
              {perLettera[lettera].map(t => (
                <GlossaryTerm key={t.id} termine={t} isActive={activeGlossaryTerm === t.id}
                  onSelect={() => setActiveGlossaryTerm(activeGlossaryTerm === t.id ? null : t.id)} />
              ))}
            </section>
          ))}
          {terminiVisibili.length === 0 && <p className="no-results">Nessun termine trovato per "{query}"</p>}
        </div>
      </aside>
    </>
  )
}
