import { useApp } from '../../context/AppContext'
import SituationCard from './SituationCard'
import './HubView.css'

const CARDS = [
  { id: 'bolletta', emoji: '⚡', titolo: 'La mia bolletta', descrizione: 'Capisco cosa pago voce per voce', view: 'bolletta' },
  { id: 'rata', emoji: '💳', titolo: 'Un prestito o una rata', descrizione: 'Scopro quanto costa davvero', view: 'rata' },
  { id: 'glossario', emoji: '📖', titolo: 'Parole difficili', descrizione: 'Cerco un termine che non capisco', view: null },
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
