import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StyleSheet,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#1d4ed8' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero section - blue background */}
        <View style={styles.hero}>
          {/* Logo integrado */}
          <View style={styles.logoRow}>
            <View style={styles.iconBox}>
              <Text style={styles.bolt}>⚡</Text>
            </View>
            <View>
              <Text style={styles.brandName}>TrabajosYa</Text>
              <Text style={styles.brandSub}>Conectamos personas con soluciones</Text>
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineBox}>
            <Text style={styles.tagline}>Trabajadores · Empleadores · Confianza</Text>
          </View>
        </View>

        {/* Form card - white */}
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          {/* Contraseña */}
          <Text style={[styles.label, { marginTop: 16 }]}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />

          {/* Olvidé contraseña */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ alignSelf: 'flex-end', marginTop: 8 }}
          >
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.btn}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.btnText}>Ingresar</Text>}
          </TouchableOpacity>

          {/* Registro */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#1d4ed8',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 28,
    gap: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bolt: {
    fontSize: 30,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  taglineBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  card: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  forgot: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
})
