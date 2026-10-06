export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  }
  return digits
}
export function isValidPhone(phone: string): boolean {
  return /^\d{10,15}$/.test(phone)
}
