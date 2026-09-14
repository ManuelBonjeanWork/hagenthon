import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { rataContesti, IMPORTO_DEFAULT, TASSO_DEFAULT, DURATA_DEFAULT } from '../../data/rata'
import LoanForm from './LoanForm'
import LoanVisualizer from './LoanVisualizer'
import './RataRoom.css'

export default function RataRoom() {
  const { setView, currentLevel } = useApp()
  const [params, setParams] = useState({ importo: IMPORTO_DEFAULT, tasso: TASSO_DEFAULT, durata: DURATA_DEFAULT })
  return (
    <div className="rata-room">
      <button className="back-btn" onClick={() => setView('hub')}>← Home</button>
      <h1 className="room-title">💳 Quanto costa davvero un prestito?</h1>
      <div className="rata-grid">
        <LoanForm {...params} onChange={(campo, valore) => setParams(p => ({ ...p, [campo]: valore }))} />
        <LoanVisualizer {...params} />
      </div>
      <div className="rata-spiegazione"><p>{rataContesti.spiegazione[currentLevel]}</p></div>
    </div>
  )
}
