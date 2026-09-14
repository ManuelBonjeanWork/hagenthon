import { describe, it, expect } from 'vitest'
import { calcolaRata, calcolaPianoAmmortamento } from '../src/utils/loanCalculator'

describe('calcolaRata', () => {
  it('€10.000, 36 mesi, 7.5% → ~€311.06', () => {
    expect(calcolaRata(10000, 7.5, 36)).toBeCloseTo(311.06, 1)
  })
  it('tasso zero → P / mesi', () => {
    expect(calcolaRata(12000, 0, 12)).toBeCloseTo(1000, 1)
  })
  it('risultato positivo per input validi', () => {
    expect(calcolaRata(5000, 5, 24)).toBeGreaterThan(0)
  })
})

describe('calcolaPianoAmmortamento', () => {
  it('lunghezza array = mesi', () => {
    expect(calcolaPianoAmmortamento(10000, 7.5, 36)).toHaveLength(36)
  })
  it('ogni elemento ha i campi attesi', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano[0]).toMatchObject({ mese: 1, rata: expect.any(Number), capitale: expect.any(Number), interessi: expect.any(Number), debitoResiduo: expect.any(Number) })
  })
  it('debito residuo ultimo mese ≈ 0', () => {
    expect(calcolaPianoAmmortamento(10000, 7.5, 36)[35].debitoResiduo).toBeCloseTo(0, 0)
  })
  it('somma capitale = P', () => {
    const piano = calcolaPianoAmmortamento(10000, 7.5, 36)
    expect(piano.reduce((s, r) => s + r.capitale, 0)).toBeCloseTo(10000, 0)
  })
})
