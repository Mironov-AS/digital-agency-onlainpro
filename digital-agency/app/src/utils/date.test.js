import { describe, expect, it } from 'vitest'
import { generatePaymentDates } from './date.js'

describe('generatePaymentDates', () => {
  it('generates monthly payment dates within the selected period', () => {
    expect(generatePaymentDates('2026-01-10', '2026-04-10', 'monthly')).toEqual([
      '2026-01-10',
      '2026-02-10',
      '2026-03-10',
      '2026-04-10',
    ])
  })

  it('generates quarterly and yearly recurring dates', () => {
    expect(generatePaymentDates('2026-01-15', '2026-08-01', 'quarterly')).toEqual([
      '2026-01-15',
      '2026-04-15',
      '2026-07-15',
    ])
    expect(generatePaymentDates('2026-05-01', '2028-05-01', 'yearly')).toEqual([
      '2026-05-01',
      '2027-05-01',
      '2028-05-01',
    ])
  })
})
