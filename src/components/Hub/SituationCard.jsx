export default function SituationCard({ emoji, titolo, descrizione, onClick }) {
  return (
    <button className="situation-card" onClick={onClick}>
      <span className="card-emoji">{emoji}</span>
      <h2 className="card-titolo">{titolo}</h2>
      <p className="card-desc">{descrizione}</p>
    </button>
  )
}
