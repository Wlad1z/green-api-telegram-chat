import { EMPTY_MESSAGES, useChatStore } from '../../store/chatStore'
import { formatTime } from '../../lib/format'
import type { Chat } from '../../types'
import styles from './ChatListItem.module.css'

export function ChatListItem({ chat }: { chat: Chat }) {
  const isActive = useChatStore(s => s.activeChatId === chat.chatId)
  const setActiveChat = useChatStore(s => s.setActiveChat)
  const messages = useChatStore(s => s.messages[chat.chatId] ?? EMPTY_MESSAGES)
  const last = messages.at(-1)

  return (
    <li
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => setActiveChat(chat.chatId)}
    >
      <div className={styles.avatar}>{chat.name.replace(/^[@+]/, '').charAt(0).toUpperCase()}</div>
      <div className={`${styles.body} ${chat.unread ? styles.unread : ''}`}>
        <div className={styles.top}>
          <span className={styles.name}>{chat.name}</span>
          {last && <span className={styles.time}>{formatTime(last.timestamp)}</span>}
        </div>
        <div className={styles.bottom}>
          <span className={styles.preview}>
            {last ? (last.direction === 'outgoing' ? 'Вы: ' : '') + last.text : 'Нет сообщений'}
          </span>
          {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
        </div>
      </div>
    </li>
  )
}
