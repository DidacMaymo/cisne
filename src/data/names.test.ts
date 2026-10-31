import { describe, expect, it } from 'vitest'
import { formatDateEs, isReservedName, nextNameChange, normalizeName } from './names'

describe('normalizeName', () => {
  it('minúsculas, sin tildes ni diéresis, espacios colapsados', () => {
    expect(normalizeName('  ANA   LÍA ')).toBe('ana lia')
    expect(normalizeName('Pingüino Ñandú')).toBe('pinguino nandu')
  })
  it('unifica formas Unicode equivalentes', () => {
    expect(normalizeName('Lía')).toBe(normalizeName('Lía'))
  })
  it('una cadena en blanco queda vacía', () => {
    expect(normalizeName('   ')).toBe('')
  })
})

describe('isReservedName', () => {
  it('detecta los reservados con cualquier forma', () => {
    for (const n of ['CISNE', 'Anónimo', 'sin   nombre', 'Administración', 'Equipo de Cisne', 'Admin']) {
      expect(isReservedName(n)).toBe(true)
    }
  })
  it('no confunde nombres parecidos', () => {
    expect(isReservedName('Cisne Azul')).toBe(false)
    expect(isReservedName('Ana')).toBe(false)
  })
})

describe('nextNameChange', () => {
  const now = Date.parse('2026-11-10T12:00:00Z')
  it('sin cambio previo, puede cambiarlo ya', () => {
    expect(nextNameChange(undefined, now)).toBeNull()
  })
  it('antes de 30 días devuelve la fecha del próximo cambio', () => {
    const next = nextNameChange('2026-11-01T12:00:00Z', now)
    expect(next && formatDateEs(next)).toBe('1 de diciembre de 2026')
  })
  it('pasados 30 días puede cambiarlo', () => {
    expect(nextNameChange('2026-10-01T12:00:00Z', now)).toBeNull()
  })
})
