// tests/GlossaryPanel.test.jsx
//
// Test di regressione per due bug reali del GlossaryPanel (Issue #4, PR #14),
// trovati dal Code Review Agent e poi corretti. Non sono verifiche di cortesia
// sull'accessibilita': ognuno dei due describe qui sotto e' la rete su un
// difetto che si e' gia' manifestato una volta.
//
// 1. "ripristino del focus alla chiusura" copre l'ordinamento autoFocus vs
//    useEffect: React applica autoFocus in fase di commit, prima che giri lo
//    useEffect che cattura document.activeElement. Se il pannello si apriva
//    senza termine attivo, l'effect catturava l'input di ricerca appena
//    auto-focussato invece del bottone che aveva aperto il pannello; alla
//    chiusura quell'input era smontato e il focus finiva su <body>. Il fix
//    toglie autoFocus dal JSX e da' il focus in modo imperativo, nello stesso
//    effect, subito dopo la cattura.
//
// 2. "link ai termini correlati con ricerca attiva" copre il reset mirato
//    della query: openGlossaryTerm aggiorna solo il Context, non la query
//    locale del pannello. Se il termine di destinazione era escluso dal
//    filtro corrente, il suo <GlossaryTerm> non veniva mai renderizzato --
//    niente scroll, niente espansione. Il fix azzera la query SOLO quando il
//    termine attivo non e' tra quelli visibili, per non rompere il caso
//    normale (cerca, clicca un risultato gia' visibile, il filtro resta).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider, useApp } from '../src/context/AppContext'
import GlossaryPanel from '../src/components/Glossario/GlossaryPanel'

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

// Harness minimo: i due modi in cui l'app apre il pannello davvero -- un
// bottone che lo apre "vuoto" e un link che lo apre gia' su un termine.
function Harness() {
  const { setGlossaryOpen, openGlossaryTerm } = useApp()
  return (
    <div>
      <button onClick={() => setGlossaryOpen(true)}>apri-senza-termine</button>
      <button onClick={() => openGlossaryTerm('accisa')}>apri-con-termine</button>
      <GlossaryPanel />
    </div>
  )
}

// Ogni test chiama renderHarness() da se': niente stato condiviso tra test,
// niente dipendenza dall'ordine di esecuzione.
function renderHarness() {
  render(<AppProvider><Harness /></AppProvider>)
}

describe('GlossaryPanel — ripristino del focus alla chiusura', () => {
  const aperture = [
    ['senza termine attivo', 'apri-senza-termine'],
    ['con termine attivo', 'apri-con-termine'],
  ]
  const chiusure = [
    ['Esc', (user) => user.keyboard('{Escape}')],
    ['backdrop', (user) => user.click(document.querySelector('.glossary-backdrop'))],
    ['bottone X', (user) => user.click(screen.getByLabelText('Chiudi il glossario'))],
  ]

  describe.each(aperture)('apertura %s', (_l, triggerText) => {
    it.each(chiusure)('chiusura via %s riporta il focus sul trigger', async (_cl, closeFn) => {
      const user = userEvent.setup()
      renderHarness()
      const trigger = screen.getByText(triggerText)
      trigger.focus()
      expect(document.activeElement).toBe(trigger)
      await user.click(trigger)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      await closeFn(user)
      expect(document.activeElement).toBe(trigger)
    })
  })
})

describe('GlossaryPanel — link ai termini correlati con ricerca attiva', () => {
  it('correlato escluso dal filtro: cerca "accisa" -> espandi "Accisa" -> click su "iva" -> IVA compare espanso', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('apri-senza-termine'))

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'accisa')
    await user.click(screen.getByText('Accisa'))
    await user.click(screen.getByRole('button', { name: 'iva' }))

    expect(screen.getByText('IVA')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /IVA/ })).toHaveAttribute('aria-expanded', 'true')
  })

  it('caso normale: cerca "TAN", clicca il risultato visibile, il filtro resta', async () => {
    const user = userEvent.setup()
    renderHarness()
    await user.click(screen.getByText('apri-senza-termine'))

    const searchInput = screen.getByRole('searchbox')
    await user.type(searchInput, 'TAN')
    await user.click(screen.getByRole('button', { name: /^TAN/ }))

    expect(searchInput).toHaveValue('TAN')
  })
})
