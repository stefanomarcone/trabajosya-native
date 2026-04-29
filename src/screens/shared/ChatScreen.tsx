import { useEffect, useRef, useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
interface Message { id: string; contract_ref: string; sender_ref: string; sender_name: string; text: string; created_at: any }

interface Props {
  contractId: string
}

export default function ChatScreen({ contractId }: Props) {
  const { appUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('created_at', 'asc'),
    )
    // Filter by contract_ref client-side to avoid composite index requirement
    const unsub = onSnapshot(
      query(collection(db, 'messages'), orderBy('created_at', 'asc')),
      snap => {
        const msgs = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Message))
          .filter(m => m.contract_ref === contractId)
        setMessages(msgs)
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
      }
    )
    return unsub
  }, [contractId])

  async function sendMessage() {
    if (!text.trim() || !appUser) return
    setSending(true)
    const msg = text.trim()
    setText('')
    try {
      await addDoc(collection(db, 'messages'), {
        contract_ref: contractId,
        sender_ref: appUser.id,
        sender_name: appUser.display_name,
        text: msg,
        created_at: serverTimestamp(),
      })
    } catch {}
    setSending(false)
  }

  return (
    <View className="flex-1">
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            No hay mensajes aún. ¡Empezá la conversación!
          </Text>
        }
        renderItem={({ item: msg }) => {
          const isMine = msg.sender_ref === appUser?.id
          return (
            <View className={`flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
              <View className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-primary-600' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                {!isMine && (
                  <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">{msg.sender_name}</Text>
                )}
                <Text className={`text-sm leading-relaxed ${isMine ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {msg.text}
                </Text>
              </View>
            </View>
          )
        }}
      />
      <View className="flex-row items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribí un mensaje..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim() || sending}
          className={`w-10 h-10 rounded-full items-center justify-center ${text.trim() ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          {sending ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white text-base">↑</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}
