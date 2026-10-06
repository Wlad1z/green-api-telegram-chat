import { sendMessage } from '../../api/greenApi'
import { EMPTY_MESSAGES, useChatStore } from '../../store/chatStore'
import { MessageList } from '../MessageList/MessageList'
import { MessageInput } from '../MessageInput/MessageInput'
import styles from './ChatWindow.module.css'

export function ChatWindow() {
  const credentials = useChatStore(s => s.credentials)!
  const activeChatId = useChatStore(s => s.activeChatId)
  const chat = useChatStore(s => s.chats.find(c => c.chatId === s.activeChatId))
  const messages = useChatStore(s =>
    s.activeChatId ? (s.messages[s.activeChatId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES
  )
  const addMessage = useChatStore(s => s.addMessage)
  const updateMessage = useChatStore(s => s.updateMessage)
  const setActiveChat = useChatStore(s => s.setActiveChat)

  if (!activeChatId || !chat) {
    return (
      <main className={styles.placeholder}>
        <span>Выберите чат или создайте новый</span>
      </main>
    )
  }

  async function handleSend(text: string) {
    const chatId = chat!.chatId
    const tempId = crypto.randomUUID()

    addMessage({
      id: tempId,
      chatId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    })

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text)
      updateMessage(chatId, tempId, { id: idMessage, status: 'sent' })
    } catch {
      updateMessage(chatId, tempId, { status: 'failed' })
    }
  }
  return (
    <main className={styles.window}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => setActiveChat(null)} aria-label="Назад">
          ←
        </button>
        <div className={styles.nameWrapper}>
          <div className={styles.name}>{chat.name}</div>
          {chat.phone && <div className={styles.sub}>+{chat.phone}</div>}
        </div>
      </header>
      {/* key пересоздаёт список при смене чата, чтобы сразу прокрутить его вниз */}
      <MessageList key={chat.chatId} messages={messages} />
      <MessageInput onSend={handleSend} />
    </main>
  )
}
