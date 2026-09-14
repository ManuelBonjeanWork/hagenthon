import { useApp } from '../../context/AppContext'
import './Header.css'

const LIVELLI = [
  { id: 'semplice', label: '🟢 Semplice' },
  { id: 'normale',  label: '🔵 Normale'  },
  { id: 'tecnico',  label: '🔬 Tecnico'  },
]

export default function LevelSelector() {
  const { currentLevel, setLevel } = useApp()
  return (
    <div className="level-selector">
      {LIVELLI.map(({ id, label }) => (
        <button key={id} className={`level-btn ${currentLevel === id ? 'active' : ''}`} onClick={() => setLevel(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}
