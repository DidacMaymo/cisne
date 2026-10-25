import { describe, expect, it } from 'vitest'
import { foldText, normalizePoemText, normalizeTag, slugify } from './normalize'

describe('normalizeTag', () => {
  it('pasa a minúsculas y quita espacios sobrantes', () => {
    expect(normalizeTag('  Luna   Llena ')).toBe('luna llena')
  })
  it('quita el # inicial', () => {
    expect(normalizeTag('#Amor')).toBe('amor')
    expect(normalizeTag('##  amor')).toBe('amor')
  })
  it('conserva las tildes', () => {
    expect(normalizeTag('Corazón')).toBe('corazón')
  })
  it('unifica formas Unicode equivalentes', () => {
    expect(normalizeTag('Corazón')).toBe(normalizeTag('Corazón'))
  })
  it('limita a 30 caracteres y vacía lo que solo es #', () => {
    expect(normalizeTag('a'.repeat(40))).toHaveLength(30)
    expect(normalizeTag('#')).toBe('')
  })
})

describe('foldText y slugify', () => {
  it('foldText ignora tildes y mayúsculas', () => {
    expect(foldText('Corazón')).toBe('corazon')
  })
  it('slugify da un nombre de cuenta válido', () => {
    expect(slugify('Ana Lía')).toBe('ana-lia')
  })
})

describe('normalizePoemText', () => {
  it('conserva estrofas y normaliza saltos de línea', () => {
    expect(normalizePoemText('uno\r\ndos\r\n\r\ntres\n\n')).toBe('uno\ndos\n\ntres')
  })
  it('quita saltos iniciales pero no la sangría del primer verso', () => {
    expect(normalizePoemText('\n\n  verso')).toBe('  verso')
  })
})
