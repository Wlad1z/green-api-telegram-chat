import { useEffect, useRef } from 'react'
import type { Message } from '../../types'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import styles from './MessageList.module.css'
export function MessageList({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  useEffect(() => {
    // при открытии чата прыгаем вниз мгновенно, новые сообщения — плавно
    bottomRef.current?.scrollIntoView({ behavior: isFirstRender.current ? 'auto' : 'smooth' })
    isFirstRender.current = false
  }, [messages.length])
  return (
    <div className={styles.list}>
      {messages.map(m => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
