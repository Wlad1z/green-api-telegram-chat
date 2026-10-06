export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  chatId: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  chatId: string
  name: string
  phone?: string
  username?: string
  unread: number
}
// --- GREEN-API ---
export type StateInstance =
  | 'notAuthorized'
  | 'authorized'
  | 'blocked'
  | 'suspended'
  | 'starting'
  | 'pendingPassword'
  | 'yellowCard'

export interface CheckAccountResponse {
  exist: boolean
  chatId?: string
  username?: string
  phoneNumber?: number
}

export interface SenderData {
  chatId: string
  sender: string
  chatName?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface WebhookBody {
  typeWebhook: string
  timestamp: number // секунды!
  idMessage?: string
  senderData?: SenderData
  messageData?: MessageData
  chatId?: string
  status?: string
}

export interface Notification {
  receiptId: number
  body: WebhookBody
}
