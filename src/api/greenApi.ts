import type { CheckAccountResponse, Credentials, Notification, StateInstance } from '../types'

export class GreenApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'GreenApiError'
  }
}

function buildUrl(creds: Credentials, method: string, suffix = ''): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, '')
  return `${base}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${suffix}`
}

const INVALID_RESPONSE = 'Некорректный ответ сервера. Проверьте apiUrl'

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,

    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new GreenApiError(res.status, text || res.statusText)
  }

  const text = await res.text()
  try {
    return (text ? JSON.parse(text) : null) as T
  } catch {
    // например, при неверном apiUrl вместо JSON приходит HTML-страница
    throw new GreenApiError(res.status, INVALID_RESPONSE)
  }
}

export async function getStateInstance(creds: Credentials): Promise<StateInstance> {
  const data = await request<{ stateInstance: StateInstance }>(buildUrl(creds, 'getStateInstance'))
  return data.stateInstance
}

export function checkAccount(creds: Credentials, phoneNumber: string) {
  return request<CheckAccountResponse>(buildUrl(creds, 'checkAccount'), {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: Number(phoneNumber) }),
  })
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(buildUrl(creds, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(
  creds: Credentials,
  timeoutSec = 20,
  signal?: AbortSignal
): Promise<Notification | null> {
  return request<Notification | null>(
    buildUrl(creds, 'receiveNotification', `?receiveTimeout=${timeoutSec}`),
    { signal }
  )
}

export function deleteNotification(creds: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(buildUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
    signal,
  })
}

export function humanizeError(e: unknown): string {
  if (e instanceof GreenApiError) {
    if (e.status === 401 || e.status === 403) return 'Неверный idInstance или apiTokenInstance'
    if (e.status === 429) return 'Слишком много запросов, попробуйте позже'
    if (e.status === 466) return 'Превышена квота тарифа'
    if (e.message === INVALID_RESPONSE) return INVALID_RESPONSE
    return `Ошибка API (${e.status})`
  }
  if (e instanceof TypeError) return 'Сетевая ошибка или CORS. Проверьте apiUrl и интернет'
  return 'Неизвестная ошибка'
}
