import { useApp } from '../../context/AppContext'
import LevelSelector from './LevelSelector'
import './Header.css'

export default function Header() {
  const { setGlossaryOpen, setView } = useApp()
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => setView('hub')}>💡 FinanzaChiara</button>
      <LevelSelector />
      <button className="glossary-btn" onClick={() => setGlossaryOpen(true)}>📖 Glossario</button>
    </header>
  )
}
