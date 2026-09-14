export default function BillVoce({ voce, isActive, onClick }) {
  return (
    <button className={`bill-voce zona-${voce.colore} ${isActive ? 'active' : ''}`} onClick={onClick} aria-pressed={isActive}>
      <span className="voce-label">{voce.label}</span>
      <span className="voce-importo">€{voce.importo.toFixed(2)}</span>
    </button>
  )
}
