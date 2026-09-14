import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header/Header'
import HubView from './components/Hub/HubView'
import BollettaRoom from './components/Bolletta/BollettaRoom'
import RataRoom from './components/Rata/RataRoom'
import GlossaryPanel from './components/Glossario/GlossaryPanel'
import './App.css'

function AppContent() {
  const { activeView } = useApp()
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {activeView === 'hub' && <HubView />}
        {activeView === 'bolletta' && <BollettaRoom />}
        {activeView === 'rata' && <RataRoom />}
      </main>
      <GlossaryPanel />
    </div>
  )
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>
}
