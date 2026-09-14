import { useApp } from '../../context/AppContext'
import LevelSelector from './LevelSelector'
import logo from '../../assets/logo.svg'
import './Header.css'

export default function Header() {
  const { setGlossaryOpen, setView } = useApp()
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => setView('hub')}>
        <img src={logo} alt="FinanzaChiara logo" className="logo-img" />
        FinanzaChiara
      </button>
      <LevelSelector />
      <button className="glossary-btn" onClick={() => setGlossaryOpen(true)}>📖 Glossario</button>
    </header>
  )
}
