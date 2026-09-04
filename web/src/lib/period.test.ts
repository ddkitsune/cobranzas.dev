import { describe, it, expect } from 'vitest'
import { periodoActual } from './period'

describe('periodoActual', () => {
  it('formatea como YYYY-MM', () => {
    expect(periodoActual(new Date('2026-09-04'))).toBe('2026-09')
  })
})