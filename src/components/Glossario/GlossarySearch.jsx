import { forwardRef } from 'react'

// Niente autoFocus: il focus alla ricerca lo da' GlossaryPanel in modo imperativo,
// dentro lo stesso effect che cattura il focus precedente (vedi commento li').
// Con autoFocus sul JSX, React lo applica in fase di commit prima che l'effect
// giri, quindi la cattura prenderebbe questo input invece del trigger di apertura.
const GlossarySearch = forwardRef(function GlossarySearch({ value, onChange }, ref) {
  return (
    <div className="glossary-search">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input ref={ref} type="search" aria-label="Cerca un termine nel glossario" placeholder="Cerca un termine..."
        value={value} onChange={e => onChange(e.target.value)} className="search-input" />
    </div>
  )
})

export default GlossarySearch
