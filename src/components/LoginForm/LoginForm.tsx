import { useState, type SubmitEvent } from 'react';
import { getStateInstance, humanizeError } from '../../api/greenApi'
import { useChatStore } from '../../store/chatStore'
import styles from './LoginForm.module.css'

const STATE_TEXT: Record<string, string> = {
  notAuthorized: 'Инстанс не авторизован. Отсканируйте QR-код в личном кабинете',
  blocked: 'Инстанс заблокирован',
  starting: 'Инстанс запускается, попробуйте через минуту'
}

export function LoginForm() {
  const login = useChatStore(s => s.login)
  const [apiUrl, setApiUrl] = useState('https://api.green-api.com')
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const creds = {
      apiUrl: apiUrl.trim(),
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim()
    }

    try {
      const state = await getStateInstance(creds)
      if (state !== 'authorized') {
        setError(STATE_TEXT[state] ?? `Состояние инстанса: ${state}`)
        return
      }
      login(creds)
    } catch (err) {
      setError(humanizeError(err))
    } finally {
      setLoading(false)
    }
  }

  const disabled = loading || !idInstance || !apiTokenInstance
  
  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Вход в GREEN-API</h1>
        <p className={styles.hint}>
          Данные инстанса из личного кабинета console.green-api.com
        </p>
        <label className={styles.field}>
          apiUrl
          <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
        </label>
        <label className={styles.field}>
          idInstance
          <input
            value={idInstance}
            onChange={e => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoFocus
          />
        </label>
        <label className={styles.field}>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={e => setApiTokenInstance(e.target.value)}
          />
        </label>
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.button} disabled={disabled}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
