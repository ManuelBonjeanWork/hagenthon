import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)
const LEVELS = ['semplice', 'normale', 'tecnico']
const LS_KEY = 'finanzachiara_level'

export function AppProvider({ children }) {
  const [currentLevel, setCurrentLevel] = useState(() => {
    const saved = localStorage.getItem(LS_KEY)
    return LEVELS.includes(saved) ? saved : 'semplice'
  })
  const [activeView, setActiveView] = useState('hub')
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState(null)
  const [activeVoce, setActiveVoce] = useState(null)

  function setLevel(level) {
    if (!LEVELS.includes(level)) return
    setCurrentLevel(level)
    localStorage.setItem(LS_KEY, level)
  }

  function openGlossaryTerm(termId) {
    setActiveGlossaryTerm(termId)
    setGlossaryOpen(true)
  }

  return (
    <AppContext.Provider value={{
      currentLevel, setLevel,
      activeView, setView: setActiveView,
      glossaryOpen, setGlossaryOpen,
      activeGlossaryTerm, setActiveGlossaryTerm,
      openGlossaryTerm,
      activeVoce, setActiveVoce,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve essere usato dentro AppProvider')
  return ctx
}
