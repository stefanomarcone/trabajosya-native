import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import Toast from 'react-native-toast-message'

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Completá todos los campos' })
      return
    }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
    } catch {
      Toast.show({ type: 'error', text1: 'Email o contraseña incorrectos' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-8">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-primary-600 rounded-2xl items-center justify-center mb-3">
              <Text className="text-3xl">⚡</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">TrabajosYa</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">Encontrá trabajo hoy</Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Iniciar sesión</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-8">Bienvenido de vuelta</Text>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
              />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="self-end">
              <Text className="text-sm text-primary-600 dark:text-primary-400 font-medium">¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-primary-600 rounded-xl py-4 items-center mt-2"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Ingresar</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400">¿No tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-sm text-primary-600 dark:text-primary-400 font-semibold">Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
