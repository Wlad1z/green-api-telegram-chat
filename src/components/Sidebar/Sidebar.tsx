import { useChatStore } from '../../store/chatStore'
import { NewChatForm } from '../NewChatForm/NewChatForm'
import { ChatList } from '../ChatList/ChatList'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const logout = useChatStore(s => s.logout)
  const idInstance = useChatStore(s => s.credentials?.idInstance)
  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <span className={styles.instance}>Инстанс {idInstance}</span>
        <button className={styles.logout} onClick={logout} title="Выйти">
          Выйти
        </button>
      </header>
      <NewChatForm />
      <ChatList />
    </aside>
  )
}
