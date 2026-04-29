import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Toast from 'react-native-toast-message'

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: 'Completá nombre, email y contraseña' })
      return
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }
    setLoading(true)
    try {
      await register(email.trim().toLowerCase(), password, name.trim(), phone.trim() || undefined)
      Toast.show({ type: 'success', text1: '¡Cuenta creada! Revisá tu email para verificarla' })
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        Toast.show({ type: 'error', text1: 'Ese email ya está registrado' })
      } else {
        Toast.show({ type: 'error', text1: 'Error al crear la cuenta' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
            <Text className="text-primary-600 dark:text-primary-400 text-sm font-medium">← Volver</Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Crear cuenta</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-8">Empezá a trabajar hoy en TrabajosYa</Text>

          <View className="space-y-4">
            {[
              { label: 'Nombre completo *', value: name, setter: setName, placeholder: 'Juan Pérez', type: 'default' },
              { label: 'Email *', value: email, setter: setEmail, placeholder: 'tu@email.com', type: 'email-address' },
              { label: 'Teléfono', value: phone, setter: setPhone, placeholder: '+56 9 1234 5678', type: 'phone-pad' },
            ].map((field) => (
              <View key={field.label}>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={field.type as any}
                  autoCapitalize={field.type === 'email-address' ? 'none' : 'words'}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
                />
              </View>
            ))}

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña *</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
              />
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="w-full bg-primary-600 rounded-xl py-4 items-center mt-2"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Crear cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400">¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-sm text-primary-600 dark:text-primary-400 font-semibold">Iniciá sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
