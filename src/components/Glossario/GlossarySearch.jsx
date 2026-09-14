export default function GlossarySearch({ value, onChange, autoFocus }) {
  return (
    <div className="glossary-search">
      <span className="search-icon" aria-hidden="true">🔍</span>
      {/* autoFocus solo quando il pannello si apre "vuoto": se arriva da un link
          su un termine, il focus deve restare su quel termine, non sulla ricerca. */}
      <input type="search" aria-label="Cerca un termine nel glossario" placeholder="Cerca un termine..."
        value={value} onChange={e => onChange(e.target.value)} className="search-input" autoFocus={autoFocus} />
    </div>
  )
}
