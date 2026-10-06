import { useChatStore } from '../../store/chatStore'
import { ChatListItem } from '../ChatListItem/ChatListItem'
import styles from './ChatList.module.css'
export function ChatList() {
  const chats = useChatStore(s => s.chats)
  if (chats.length === 0) {
    return <p className={styles.empty}>Чатов пока нет. Введите номер, чтобы начать переписку</p>
  }
  return (
    <ul className={styles.list}>
      {chats.map(chat => (
        <ChatListItem key={chat.chatId} chat={chat} />
      ))}
    </ul>
  )
}
