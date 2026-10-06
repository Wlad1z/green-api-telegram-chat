import { formatTime } from '../../lib/format'
import type { Message, MessageStatus } from '../../types'
import styles from './MessageBubble.module.css'
const STATUS_ICON: Record<MessageStatus, string> = {
  sending: '🕓',
  sent: '✓',
  delivered: '✓',
  read: '✓✓',
  failed: '⚠',
}
export function MessageBubble({ message }: { message: Message }) {
  const isOut = message.direction === 'outgoing'
  return (
    <div className={`${styles.row} ${isOut ? styles.out : styles.in}`}>
      <div className={styles.bubble}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.meta}>
          <span className={styles.time}>{formatTime(message.timestamp)}</span>
          {isOut && message.status && (
            <span
              className={`${styles.status} ${message.status === 'read' ? styles.read : ''}`}
              title={message.status}
            >
              {STATUS_ICON[message.status]}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
