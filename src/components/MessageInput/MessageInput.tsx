import { useState, type KeyboardEvent } from 'react'
import styles from './MessageInput.module.css'

const MAX_LENGTH = 4096

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  function submit() {
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        className={styles.input}
        placeholder="Сообщение"
        value={text}
        rows={1}
        maxLength={MAX_LENGTH}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.send} onClick={submit} disabled={!trimmed} aria-label="Отправить">
        ➤
      </button>
    </div>
  )
}
