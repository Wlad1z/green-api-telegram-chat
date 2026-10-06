import { beforeEach, describe, expect, it } from 'vitest'
import { extractText, handleNotification } from './notifications'
import { useChatStore } from '../store/chatStore'
import type { WebhookBody } from '../types'

const UNSUPPORTED = '[Сообщение этого типа не поддерживается]'

const sender = {
  chatId: '10000000',
  sender: '10000000',
  senderName: 'Василиса Премудрая',
  senderPhoneNumber: 79876543210,
}

const incoming = (messageData: WebhookBody['messageData'], idMessage = 'in1'): WebhookBody => ({
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1700000000,
  idMessage,
  senderData: sender,
  messageData,
})

const text = (t: string): WebhookBody['messageData'] => ({
  typeMessage: 'textMessage',
  textMessageData: { textMessage: t },
})

beforeEach(() => {
  localStorage.clear()
  useChatStore.setState({
    credentials: null,
    lastLogin: null,
    chats: [],
    messages: {},
    activeChatId: null,
  })
})

describe('extractText', () => {
  it('достаёт текст из textMessage', () => {
    expect(extractText(incoming(text('hi')))).toBe('hi')
  })

  it('достаёт текст из extendedTextMessage (сообщение со ссылкой)', () => {
    const body = incoming({
      typeMessage: 'extendedTextMessage',
      extendedTextMessageData: { text: 'https://example.com' },
    })
    expect(extractText(body)).toBe('https://example.com')
  })

  it('возвращает null для нетекстовых сообщений и пустых данных', () => {
    expect(extractText(incoming({ typeMessage: 'imageMessage' }))).toBeNull()
    expect(extractText({ typeWebhook: 'x', timestamp: 0 })).toBeNull()
  })
})

describe('handleNotification: incomingMessageReceived', () => {
  it('создаёт чат и добавляет входящее сообщение', () => {
    handleNotification(incoming(text('Привет')))

    const s = useChatStore.getState()
    expect(s.chats).toHaveLength(1)
    expect(s.chats[0]).toMatchObject({
      chatId: '10000000',
      name: 'Василиса Премудрая',
      phone: '79876543210',
      unread: 1,
    })
    expect(s.messages['10000000'][0]).toMatchObject({
      id: 'in1',
      text: 'Привет',
      direction: 'incoming',
      timestamp: 1700000000 * 1000, // секунды из API → миллисекунды
    })
  })

  it('для нетекстового сообщения показывает заглушку', () => {
    handleNotification(incoming({ typeMessage: 'videoMessage' }))
    expect(useChatStore.getState().messages['10000000'][0].text).toBe(UNSUPPORTED)
  })

  it('не дублирует сообщение при повторной доставке уведомления', () => {
    handleNotification(incoming(text('Привет')))
    handleNotification(incoming(text('Привет')))
    expect(useChatStore.getState().messages['10000000']).toHaveLength(1)
  })

  it('имя чата: приоритет у senderContactName, затем senderName, chatName и chatId', () => {
    handleNotification({
      ...incoming(text('a')),
      senderData: { ...sender, senderContactName: 'Из контактов', senderName: 'Профиль' },
    })
    expect(useChatStore.getState().chats[0].name).toBe('Из контактов')

    useChatStore.setState({ chats: [], messages: {} })
    handleNotification({ ...incoming(text('a')), senderData: { chatId: '5', sender: '5' } })
    expect(useChatStore.getState().chats[0].name).toBe('5')
  })

  it('игнорирует уведомление без senderData или idMessage', () => {
    handleNotification({ typeWebhook: 'incomingMessageReceived', timestamp: 1 })
    handleNotification({ ...incoming(text('a')), idMessage: undefined })
    expect(useChatStore.getState().chats).toHaveLength(0)
  })
})

describe('handleNotification: outgoingMessageReceived', () => {
  const fromPhone = (): WebhookBody => ({
    typeWebhook: 'outgoingMessageReceived',
    timestamp: 1700000000,
    idMessage: 'out1',
    senderData: sender,
    messageData: text('Написал с телефона'),
  })

  it('добавляет сообщение с телефона в уже открытый чат', () => {
    useChatStore.getState().addChat({ chatId: '10000000', name: 'Василиса' })
    handleNotification(fromPhone())
    expect(useChatStore.getState().messages['10000000'][0]).toMatchObject({
      id: 'out1',
      direction: 'outgoing',
      status: 'sent',
    })
  })

  it('игнорирует сообщение, если чата с этим человеком в приложении нет', () => {
    handleNotification(fromPhone())
    expect(useChatStore.getState().messages).toEqual({})
  })
})

describe('handleNotification: outgoingMessageStatus', () => {
  const setup = () => {
    const { addChat, addMessage } = useChatStore.getState()
    addChat({ chatId: '10000000', name: 'Василиса' })
    addMessage({
      id: 'm1',
      chatId: '10000000',
      text: 'hi',
      direction: 'outgoing',
      timestamp: 1,
      status: 'sent',
    })
  }
  const status = (s: string): WebhookBody => ({
    typeWebhook: 'outgoingMessageStatus',
    timestamp: 1,
    chatId: '10000000',
    idMessage: 'm1',
    status: s,
  })

  it('обновляет статус сообщения', () => {
    setup()
    handleNotification(status('read'))
    expect(useChatStore.getState().messages['10000000'][0].status).toBe('read')
  })

  it('noAccount показывается как ошибка отправки', () => {
    setup()
    handleNotification(status('noAccount'))
    expect(useChatStore.getState().messages['10000000'][0].status).toBe('failed')
  })

  it('неизвестный статус игнорируется', () => {
    setup()
    handleNotification(status('mystery'))
    expect(useChatStore.getState().messages['10000000'][0].status).toBe('sent')
  })
})

describe('handleNotification: прочие типы', () => {
  it('не падает и ничего не меняет на неизвестном typeWebhook', () => {
    handleNotification({ typeWebhook: 'stateInstanceChanged', timestamp: 1 })
    expect(useChatStore.getState().chats).toEqual([])
  })
})
