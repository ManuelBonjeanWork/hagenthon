// tests/AppContext.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useApp } from '../src/context/AppContext'

function Probe() {
  const { currentLevel, setLevel, activeView, setView, glossaryOpen, setGlossaryOpen } = useApp()
  return (
    <div>
      <span data-testid="level">{currentLevel}</span>
      <span data-testid="view">{activeView}</span>
      <span data-testid="glossary">{String(glossaryOpen)}</span>
      <button onClick={() => setLevel('tecnico')}>setLevel</button>
      <button onClick={() => setView('bolletta')}>setView</button>
      <button onClick={() => setGlossaryOpen(true)}>openGlossary</button>
    </div>
  )
}

describe('AppContext', () => {
  it('valori iniziali corretti', () => {
    render(<AppProvider><Probe /></AppProvider>)
    expect(screen.getByTestId('level')).toHaveTextContent('semplice')
    expect(screen.getByTestId('view')).toHaveTextContent('hub')
    expect(screen.getByTestId('glossary')).toHaveTextContent('false')
  })
  it('aggiorna currentLevel', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('setLevel'))
    expect(screen.getByTestId('level')).toHaveTextContent('tecnico')
  })
  it('aggiorna activeView', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('setView'))
    expect(screen.getByTestId('view')).toHaveTextContent('bolletta')
  })
  it('apre il glossario', async () => {
    render(<AppProvider><Probe /></AppProvider>)
    await userEvent.click(screen.getByText('openGlossary'))
    expect(screen.getByTestId('glossary')).toHaveTextContent('true')
  })
})
