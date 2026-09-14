import { DURATE_DISPONIBILI } from '../../data/rata'

export default function LoanForm({ importo, durata, tasso, onChange }) {
  return (
    <div className="loan-form">
      <label className="form-field"><span>💰 Importo prestito</span>
        <div className="input-wrap"><span className="input-prefix">€</span>
          <input type="number" min={500} max={100000} step={500} value={importo} onChange={e => onChange('importo', Number(e.target.value))} className="form-input" />
        </div>
      </label>
      <label className="form-field"><span>📅 Durata</span>
        <select value={durata} onChange={e => onChange('durata', Number(e.target.value))} className="form-input">
          {DURATE_DISPONIBILI.map(m => <option key={m} value={m}>{m} mesi ({(m/12).toFixed(0)} {m < 24 ? 'anno' : 'anni'})</option>)}
        </select>
      </label>
      <label className="form-field"><span>📈 Tasso annuo (TAN)</span>
        <div className="input-wrap">
          <input type="number" min={0.1} max={30} step={0.1} value={tasso} onChange={e => onChange('tasso', Number(e.target.value))} className="form-input" />
          <span className="input-suffix">%</span>
        </div>
      </label>
    </div>
  )
}
