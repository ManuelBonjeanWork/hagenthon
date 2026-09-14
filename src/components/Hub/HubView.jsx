import { useApp } from '../../context/AppContext'
import SituationCard from './SituationCard'
import './HubView.css'

const CARDS = [
  { id: 'bolletta', emoji: '⚡', titolo: 'Bolletta della luce', descrizione: 'Cosa significa ogni numero in bolletta', view: 'bolletta' },
  { id: 'rata', emoji: '💳', titolo: 'Un prestito o una rata', descrizione: 'Il costo totale, non solo la rata mensile', view: 'rata' },
  { id: 'glossario', emoji: '📖', titolo: 'Glossario', descrizione: 'Il significato dei termini finanziari', view: null },
]

export default function HubView() {
  const { setView, setGlossaryOpen } = useApp()
  return (
    <div className="hub">
      <h1 className="hub-title">Cosa vuoi capire oggi?</h1>
      <div className="hub-grid">
        {CARDS.map(card => (
          <SituationCard key={card.id} emoji={card.emoji} titolo={card.titolo} descrizione={card.descrizione}
            onClick={() => card.view ? setView(card.view) : setGlossaryOpen(true)} />
        ))}
      </div>
    </div>
  )
}
