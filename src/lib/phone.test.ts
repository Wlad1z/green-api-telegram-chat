import { describe, expect, it } from 'vitest'
import { isValidPhone, normalizePhone } from './phone'

describe('normalizePhone', () => {
  it('убирает форматирование', () => {
    expect(normalizePhone('+7 (987) 654-32-10')).toBe('79876543210')
  })

  it('заменяет ведущую 8 на 7 у 11-значного номера', () => {
    expect(normalizePhone('89876543210')).toBe('79876543210')
  })

  it('не трогает 8 в номерах другой длины', () => {
    expect(normalizePhone('8123456')).toBe('8123456')
  })

  it('возвращает пустую строку, если цифр нет', () => {
    expect(normalizePhone('abc')).toBe('')
  })
})

describe('isValidPhone', () => {
  it('принимает номер из 10–15 цифр', () => {
    expect(isValidPhone('79876543210')).toBe(true)
    expect(isValidPhone('1234567890')).toBe(true)
    expect(isValidPhone('123456789012345')).toBe(true)
  })

  it('отклоняет слишком короткий и слишком длинный номер', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('1234567890123456')).toBe(false)
  })

  it('отклоняет нецифровые символы и пустую строку', () => {
    expect(isValidPhone('+79876543210')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})
