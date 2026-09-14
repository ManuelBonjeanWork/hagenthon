// tests/integrazione.test.jsx
//
// Automatizza il demo flow manuale di 6.4: Hub -> BollettaRoom -> Glossario -> RataRoom -> Hub.
//
// Recharts non disegna nulla sotto jsdom (`ResponsiveContainer` misura 0x0): si asserisce
// sempre sul riepilogo numerico (LoanVisualizer/SimulationPanel), mai sul grafico.
// formatEuro usa lo spazio unificatore di Intl.NumberFormat: i match sugli importi sono
// regex parziali sulle cifre, mai stringhe esatte con il simbolo di valuta.
//
// localStorage e' ripulito da tests/setup.js dopo ogni test.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'

// GlossaryTerm chiama ref.current.scrollIntoView() quando il termine e' attivo (vedi
// GlossaryTerm.jsx): jsdom non implementa affatto scrollIntoView, quindi senza questo
// stub il click sul link "-> oneri sistema" fa esplodere l'effect con un TypeError.
// Stesso stub gia' presente in tests/GlossaryPanel.test.jsx, qui necessario perche' ogni
// file di test gira nel proprio ambiente jsdom isolato.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  // Recharts' ResponsiveContainer (usato da LoanVisualizer) osserva il proprio nodo con
  // ResizeObserver per calcolare le dimensioni: jsdom non definisce questa classe affatto,
  // quindi montare RataRoom senza uno stub lancia "ResizeObserver is not defined" (non un
  // semplice 0x0 come suggerirebbe "Recharts non disegna sotto jsdom" — qui il costruttore
  // manca del tutto). Il grafico resta comunque 0x0 e non viene mai asserito.
  window.ResizeObserver = window.ResizeObserver || class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('Flusso utente completo', () => {
  it('l\'Hub presenta le 3 situazioni', () => {
    render(<App />)
    expect(screen.getByText('Cosa vuoi capire oggi?')).toBeInTheDocument()
    expect(screen.getByText('Bolletta della luce')).toBeInTheDocument()
    expect(screen.getByText('Un prestito o una rata')).toBeInTheDocument()
    // 'Glossario' compare anche nel bottone dell'header: serve il ruolo per disambiguare
    expect(screen.getByRole('heading', { name: 'Glossario' })).toBeInTheDocument()
  })

  it('una voce di bolletta apre la spiegazione corrispondente', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Bolletta della luce'))
    expect(screen.getByText('⚡ La tua bolletta della luce')).toBeInTheDocument()
    await user.click(screen.getByText('Oneri di Sistema'))
    expect(screen.getByText(/Sono costi fissi che tutti i clienti italiani pagano/)).toBeInTheDocument()
  })

  it('il link della spiegazione apre il glossario sul termine giusto', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Bolletta della luce'))
    await user.click(screen.getByText('Oneri di Sistema'))
    await user.click(screen.getByRole('button', { name: /oneri sistema/i }))
    expect(screen.getByRole('heading', { name: /Glossario/ })).toBeInTheDocument()
    // il termine deve essere espanso, non solo il pannello aperto
    expect(screen.getByText(/Costi che tutti pagano per tenere in funzione la rete italiana/)).toBeInTheDocument()
  })

  it('ogni id in terminiGlossario e correlati esiste nel glossario', async () => {
    const { bollettaVoci } = await import('../src/data/bolletta')
    const { glossario } = await import('../src/data/glossario')
    const ids = new Set(glossario.map(t => t.id))
    const riferiti = [
      ...bollettaVoci.flatMap(v => v.terminiGlossario ?? []),
      ...glossario.flatMap(t => t.correlati ?? []),
    ]
    expect([...new Set(riferiti)].filter(id => !ids.has(id))).toEqual([])
  })

  it('il LevelSelector cambia il testo delle spiegazioni', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Bolletta della luce'))
    await user.click(screen.getByText('Oneri di Sistema'))
    await user.click(screen.getByText('🔬 Tecnico'))
    expect(screen.getByText(/delibera ARERA ARG\/elt 199\/11/)).toBeInTheDocument()
  })

  it('il livello scelto viene persistito', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('🔬 Tecnico'))
    expect(localStorage.getItem('finanzachiara_level')).toBe('tecnico')
  })

  it('ai valori di default la simulazione riproduce la bolletta di esempio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Bolletta della luce'))
    // 180 kWh / 3 kW / giorno → differenza esattamente zero
    expect(screen.getByText(/\+€0\.00\/mese/)).toBeInTheDocument()
  })

  it('RataRoom calcola la rata di default', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Un prestito o una rata'))
    expect(screen.getByText('💳 Quanto costa davvero un prestito?')).toBeInTheDocument()
    // formatEuro usa lo spazio unificatore: match parziale, non stringa esatta
    expect(screen.getByText(/311,06/)).toBeInTheDocument()
  })

  it('il logo riporta all\'Hub', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('Un prestito o una rata'))
    // per nome accessibile, non per testo: il bottone ora contiene anche il logo SVG
    await user.click(screen.getByRole('button', { name: /FinanzaChiara/ }))
    expect(screen.getByText('Cosa vuoi capire oggi?')).toBeInTheDocument()
  })
})
