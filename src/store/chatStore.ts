import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chat, Credentials, Message } from '../types'

interface ChatState {
  credentials: Credentials | null
  // остаётся после выхода, чтобы заново не вводить apiUrl и idInstance (токен не храним)
  lastLogin: Pick<Credentials, 'apiUrl' | 'idInstance'> | null
  chats: Chat[]
  messages: Record<string, Message[]> // chatId -> сообщения
  activeChatId: string | null
  login: (creds: Credentials) => void
  logout: () => void
  addChat: (chat: Omit<Chat, 'unread'>) => void
  setActiveChat: (chatId: string | null) => void
  addMessage: (msg: Message) => void
  updateMessage: (chatId: string, id: string, patch: Partial<Message>) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      credentials: null,
      lastLogin: null,
      chats: [],
      messages: {},
      activeChatId: null,

      login: credentials =>
        set({
          credentials,
          lastLogin: { apiUrl: credentials.apiUrl, idInstance: credentials.idInstance },
        }),

      logout: () => set({ credentials: null, chats: [], messages: {}, activeChatId: null }),
      addChat: chat => {
        if (get().chats.some(c => c.chatId === chat.chatId)) return
        set(s => ({ chats: [{ ...chat, unread: 0 }, ...s.chats] }))
      },

      setActiveChat: chatId =>
        set(s => ({
          activeChatId: chatId,
          chats: s.chats.map(c => (c.chatId === chatId ? { ...c, unread: 0 } : c)),
        })),

      addMessage: msg =>
        set(s => {
          const list = s.messages[msg.chatId] ?? []
          if (list.some(m => m.id === msg.id)) return s // дедупликация по idMessage
          const isActive = s.activeChatId === msg.chatId
          const chats = s.chats
            .map(c =>
              c.chatId === msg.chatId && msg.direction === 'incoming' && !isActive
                ? { ...c, unread: c.unread + 1 }
                : c
            )
            // чат с новым сообщением поднимаем наверх
            .sort((a, b) => (a.chatId === msg.chatId ? -1 : b.chatId === msg.chatId ? 1 : 0))
          return {
            chats,
            messages: { ...s.messages, [msg.chatId]: [...list, msg] },
          }
        }),

      updateMessage: (chatId, id, patch) =>
        set(s => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] ?? []).map(m => (m.id === id ? { ...m, ...patch } : m)),
          },
        })),
    }),
    { name: 'green-api-chat' }
  )
)

export const EMPTY_MESSAGES: Message[] = []
