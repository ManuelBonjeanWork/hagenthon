import { useApp } from '../../context/AppContext'
import { bollettaVoci, TOTALE_BOLLETTA } from '../../data/bolletta'
import BillVoce from './BillVoce'
import './BillViewer.css'

export default function BillViewer() {
  const { activeVoce, setActiveVoce } = useApp()
  return (
    <div className="bill-viewer">
      <div className="bill-header"><h3>Bolletta Energia Elettrica</h3><p className="bill-periodo">Periodo: agosto 2026</p></div>
      <div className="bill-voci">
        {bollettaVoci.map(voce => (
          <BillVoce key={voce.id} voce={voce} isActive={activeVoce?.id === voce.id}
            onClick={() => setActiveVoce(voce.id === activeVoce?.id ? null : voce)} />
        ))}
      </div>
      <div className="bill-totale"><span>TOTALE DA PAGARE</span><span className="totale-importo">€{TOTALE_BOLLETTA.toFixed(2)}</span></div>
      <p className="bill-hint">Seleziona una voce per leggere la spiegazione</p>
    </div>
  )
}
