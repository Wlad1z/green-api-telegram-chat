import type { WebhookBody } from '../types'
import { useChatStore } from '../store/chatStore'

export function extractText(body: WebhookBody): string | null {
  const data = body.messageData
  if (!data) return null
  switch (data.typeMessage) {
    case 'textMessage':
      return data.textMessageData?.textMessage ?? null
    case 'extendedTextMessage':
      return data.extendedTextMessageData?.text ?? null
    default:
      return null
  }
}

const STATUS_MAP = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
} as const

export function handleNotification(body: WebhookBody): void {
  const store = useChatStore.getState()

  switch (body.typeWebhook) {
    case 'incomingMessageReceived': {
      const sender = body.senderData
      const text = extractText(body)
      if (!sender || !body.idMessage) return

      store.addChat({
        chatId: sender.chatId,
        name: sender.senderContactName || sender.senderName || sender.chatName || sender.chatId,
        phone: sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : undefined,
      })

      store.addMessage({
        id: body.idMessage,
        chatId: sender.chatId,
        text: text ?? '[Сообщение этого типа не поддерживается]',
        direction: 'incoming',
        timestamp: body.timestamp * 1000,
      })
      return
    }

    case 'outgoingMessageReceived': {
      const sender = body.senderData
      if (!sender || !body.idMessage) return
      // сообщения с телефона показываем только в уже открытых в приложении чатах
      if (!store.chats.some(c => c.chatId === sender.chatId)) return
      store.addMessage({
        id: body.idMessage,
        chatId: sender.chatId,
        text: extractText(body) ?? '[Сообщение этого типа не поддерживается]',
        direction: 'outgoing',
        timestamp: body.timestamp * 1000,
        status: 'sent',
      })
      return
    }

    case 'outgoingMessageStatus': {
      const status = STATUS_MAP[body.status as keyof typeof STATUS_MAP]
      if (body.chatId && body.idMessage && status) {
        store.updateMessage(body.chatId, body.idMessage, { status })
      }
      return
    }

    default:
      return
  }
}
