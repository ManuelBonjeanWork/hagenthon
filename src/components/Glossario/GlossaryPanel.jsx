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

  // Un correlato puo' puntare a un termine escluso dal filtro di ricerca corrente: se cosi',
  // il suo <GlossaryTerm> non verrebbe mai renderizzato (niente scroll, niente espansione, e
  // si perderebbe pure il termine che si stava leggendo). Azzeriamo la query SOLO quando serve
  // -- il termine attivo non e' tra quelli visibili -- altrimenti si romperebbe il caso normale:
  // l'utente cerca, clicca un risultato gia' visibile, e si aspetta che il filtro resti.
  useEffect(() => {
    if (activeGlossaryTerm && !terminiVisibili.some(t => t.id === activeGlossaryTerm)) {
      setQuery('')
    }
  }, [activeGlossaryTerm, terminiVisibili])

  // Esc chiude, e il focus torna dov'era prima dell'apertura: senza questo chi naviga
  // da tastiera resta bloccato in fondo alla pagina dopo aver chiuso il pannello.
  const focusPrecedente = useRef(null)
  const searchRef = useRef(null)
  useEffect(() => {
    if (!glossaryOpen) return
    // La cattura deve avvenire PRIMA che qualsiasi elemento del pannello riceva il focus:
    // percio' niente autoFocus nel JSX (scatterebbe in fase di commit, prima di questo
    // effect) e il focus alla ricerca e' dato qui sotto, imperativamente, dopo la cattura.
    focusPrecedente.current = document.activeElement
    // Il focus va alla ricerca solo quando il pannello si apre "vuoto": se arriva da un
    // link su un termine, il focus deve restare su quel termine, non sulla ricerca.
    if (!activeGlossaryTerm) searchRef.current?.focus()
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
        <div className="glossary-search-wrap"><GlossarySearch ref={searchRef} value={query} onChange={setQuery} /></div>
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
          {terminiVisibili.length === 0 && <p className="no-results">Nessun termine trovato per «{query}»</p>}
        </div>
      </aside>
    </>
  )
}
