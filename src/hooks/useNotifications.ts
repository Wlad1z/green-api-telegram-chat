import { useEffect } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import { handleNotification } from '../lib/notifications'
import { useChatStore } from '../store/chatStore'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export function useNotifications() {
  const credentials = useChatStore(s => s.credentials)

  useEffect(() => {
    if (!credentials) return

    const controller = new AbortController()
    const { signal } = controller

    async function loop() {
      let retryDelay = 1000

      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials!, 20, signal)
          retryDelay = 1000
          if (!notification) continue

          try {
            handleNotification(notification.body)
          } finally {
            await deleteNotification(credentials!, notification.receiptId, signal)
          }
        } catch (e) {
          if (signal.aborted) return
          console.error('[polling]', e)
          await sleep(retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30_000)
        }
      }
    }

    loop()
    return () => controller.abort()
  }, [credentials])
}
