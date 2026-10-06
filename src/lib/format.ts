const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})
export function formatTime(ms: number): string {
  return timeFormatter.format(new Date(ms))
}
