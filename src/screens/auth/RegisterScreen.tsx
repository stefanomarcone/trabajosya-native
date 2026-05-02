import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
  StyleSheet, Image,
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
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header azul con logo */}
        <View style={styles.bg}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Card blanca */}
        <View style={styles.card}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

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
  root: {
    flex: 1,
    backgroundColor: '#1d4ed8',
  },
  scroll: {
    flexGrow: 1,
  },
  bg: {
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  logo: {
    width: 180,
    height: 70,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  back: {
    marginBottom: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 22,
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
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: '#111827',
  },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
  },
})
