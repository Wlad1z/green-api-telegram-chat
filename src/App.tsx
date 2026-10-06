import { useChatStore } from './store/chatStore'
import { useNotifications } from './hooks/useNotifications'
import { LoginForm } from './components/LoginForm/LoginForm'
import { ChatLayout } from './components/ChatLayout/ChatLayout'

export default function App() {
  const credentials = useChatStore(s => s.credentials)
  useNotifications()
  return credentials ? <ChatLayout /> : <LoginForm />
}
