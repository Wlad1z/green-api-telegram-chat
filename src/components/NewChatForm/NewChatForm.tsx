import { useState, type SubmitEvent } from 'react'
import { checkAccount, humanizeError } from '../../api/greenApi'
import { isValidPhone, normalizePhone } from '../../lib/phone'
import { useChatStore } from '../../store/chatStore'
import styles from './NewChatForm.module.css'

export function NewChatForm() {
  const credentials = useChatStore(s => s.credentials)!
  const addChat = useChatStore(s => s.addChat)
  const setActiveChat = useChatStore(s => s.setActiveChat)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const normalized = normalizePhone(phone)
    if (!isValidPhone(normalized)) {
      setError('Введите номер в международном формате, например +7 987 654-32-10')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await checkAccount(credentials, normalized)
      if (!res.exist || !res.chatId) {
        setError('У этого номера нет аккаунта Telegram (или он скрыт настройками приватности)')
        return
      }
      addChat({
        chatId: res.chatId,
        name: res.username || `+${normalized}`,
        phone: normalized,
        username: res.username,
      })
      setActiveChat(res.chatId)
      setPhone('')
    } catch (err) {
      setError(humanizeError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="tel"
        placeholder="Номер телефона получателя"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <button className={styles.button} disabled={loading || !phone}>
        {loading ? '…' : 'Создать чат'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  )
}
