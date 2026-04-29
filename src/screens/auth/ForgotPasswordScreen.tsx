import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Toast from 'react-native-toast-message'

export default function ForgotPasswordScreen({ navigation }: any) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (!email) { Toast.show({ type: 'error', text1: 'Ingresá tu email' }); return }
    setLoading(true)
    try {
      await resetPassword(email.trim().toLowerCase())
      Toast.show({ type: 'success', text1: 'Email enviado', text2: 'Revisá tu bandeja de entrada' })
      navigation.goBack()
    } catch {
      Toast.show({ type: 'error', text1: 'No encontramos ese email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16">
      <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
        <Text className="text-primary-600 dark:text-primary-400 text-sm font-medium">← Volver</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recuperar contraseña</Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-8">Te enviamos un link para resetearla</Text>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="tu@email.com"
        placeholderTextColor="#9ca3af"
        keyboardType="email-address"
        autoCapitalize="none"
        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm mb-4"
      />
      <TouchableOpacity onPress={handleReset} disabled={loading} className="w-full bg-primary-600 rounded-xl py-4 items-center">
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Enviar link</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}
