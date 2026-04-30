import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StyleSheet,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#1d4ed8' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.iconBox}>
              <Text style={styles.bolt}>⚡</Text>
            </View>
            <View>
              <Text style={styles.brandName}>TrabajosYa</Text>
              <Text style={styles.brandSub}>Creá tu cuenta gratis</Text>
            </View>
          </View>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Empezá a usar TrabajosYa hoy</Text>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Juan Pérez"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Email *</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Teléfono</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+56 9 1234 5678"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Contraseña *</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.btn}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text style={styles.btnText}>Crear cuenta</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Iniciá sesión</Text>
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
    paddingTop: 60,
    paddingBottom: 44,
    paddingHorizontal: 28,
    gap: 20,
  },
  back: {
    marginBottom: 4,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bolt: {
    fontSize: 28,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
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
    marginBottom: 24,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
})
