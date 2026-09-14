import { useApp } from '../../context/AppContext'
import BillViewer from './BillViewer'
import ExplanationPanel from './ExplanationPanel'
import SimulationPanel from './SimulationPanel'
import './BollettaRoom.css'

export default function BollettaRoom() {
  const { setView } = useApp()
  return (
    <div className="bolletta-room">
      <button className="back-btn" onClick={() => setView('hub')}>← Home</button>
      <h1 className="room-title">⚡ La tua bolletta della luce</h1>
      <div className="bolletta-grid"><BillViewer /><ExplanationPanel /></div>
      <SimulationPanel />
    </div>
  )
}
