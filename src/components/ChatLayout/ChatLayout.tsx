import { useChatStore } from '../../store/chatStore'
import { Sidebar } from '../Sidebar/Sidebar'
import { ChatWindow } from '../ChatWindow/ChatWindow'
import styles from './ChatLayout.module.css'

export function ChatLayout() {
  const activeChatId = useChatStore(s => s.activeChatId)

  return (
    <div className={styles.layout} data-chat-open={Boolean(activeChatId)}>
      <Sidebar />
      <ChatWindow />
    </div>
  )
}
