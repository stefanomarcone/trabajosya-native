import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORIES } from '../../types'
import Toast from 'react-native-toast-message'

export default function EditProfileScreen({ navigation }: any) {
  const { appUser, refreshUser } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [mpEmail, setMpEmail] = useState('')
  const [rut, setRut] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountType, setBankAccountType] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [toolsAvailable, setToolsAvailable] = useState('')
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!appUser) return
    setDisplayName(appUser.display_name ?? '')
    setBio(appUser.bio ?? '')
    setPhone(appUser.phone ?? '')
    setMpEmail(appUser.mp_email ?? '')
    setRut(appUser.rut ?? '')
    setBankName(appUser.bank_name ?? '')
    setBankAccountType(appUser.bank_account_type ?? '')
    setBankAccountNumber(appUser.bank_account_number ?? '')
    setToolsAvailable(appUser.tools_available?.join(', ') ?? '')
    setSelectedCats(appUser.categories ?? [])
  }, [appUser])

  function toggleCat(cat: string) {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  async function handleSave() {
    if (!appUser) return
    if (!displayName.trim()) {
      Toast.show({ type: 'error', text1: 'El nombre es obligatorio' })
      return
    }
    setLoading(true)
    try {
      const updates: Record<string, any> = {
        display_name: displayName.trim(),
        bio: bio.trim(),
        categories: selectedCats,
        ...(phone ? { phone: phone.trim() } : {}),
        ...(mpEmail ? { mp_email: mpEmail.trim().toLowerCase() } : {}),
        ...(rut ? { rut: rut.trim() } : {}),
        ...(bankName ? { bank_name: bankName } : {}),
        ...(bankAccountType ? { bank_account_type: bankAccountType } : {}),
        ...(bankAccountNumber ? { bank_account_number: bankAccountNumber.trim() } : {}),
        tools_available: toolsAvailable.split(',').map(t => t.trim()).filter(Boolean),
      }
      await updateDoc(doc(db, 'users', appUser.id), updates)
      await refreshUser()
      Toast.show({ type: 'success', text1: 'Perfil actualizado' })
      navigation.goBack()
    } catch {
      Toast.show({ type: 'error', text1: 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  const isWorker = appUser?.role === 'worker'

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 flex-row items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 dark:text-primary-400 font-medium text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 dark:text-white">Editar perfil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
          {[
            { label: 'Nombre *', value: displayName, setter: setDisplayName, placeholder: 'Tu nombre', type: 'default' },
            { label: 'Teléfono', value: phone, setter: setPhone, placeholder: '+56 9 1234 5678', type: 'phone-pad' },
          ].map(f => (
            <View key={f.label}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</Text>
              <TextInput value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor="#9ca3af"
                keyboardType={f.type as any}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm" />
            </View>
          ))}

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción breve</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Cuéntanos sobre ti..." placeholderTextColor="#9ca3af"
              multiline numberOfLines={3} textAlignVertical="top" style={{ minHeight: 80 }}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm" />
          </View>

          {isWorker && (
            <>
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">MercadoPago (User ID o email)</Text>
                <TextInput value={mpEmail} onChangeText={setMpEmail} placeholder="3349555340 o tu@mp.cl" placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm" />
              </View>

              {/* Datos bancarios */}
              <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 gap-3">
                <Text className="font-medium text-gray-800 dark:text-gray-200 text-sm">Datos bancarios para retiros</Text>
                {[
                  { label: 'RUT', value: rut, setter: setRut, placeholder: '12.345.678-9' },
                  { label: 'Número de cuenta', value: bankAccountNumber, setter: setBankAccountNumber, placeholder: '00012345678' },
                ].map(f => (
                  <View key={f.label}>
                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</Text>
                    <TextInput value={f.value} onChangeText={f.setter} placeholder={f.placeholder} placeholderTextColor="#9ca3af"
                      keyboardType="default"
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm" />
                  </View>
                ))}
                <View>
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</Text>
                  <TextInput value={bankName} onChangeText={setBankName} placeholder="Banco de Chile, BCI..." placeholderTextColor="#9ca3af"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm" />
                </View>
                <View>
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de cuenta</Text>
                  <TextInput value={bankAccountType} onChangeText={setBankAccountType} placeholder="Cuenta Vista, Cuenta RUT..." placeholderTextColor="#9ca3af"
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm" />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categorías de trabajo</Text>
                <View className="flex-row flex-wrap gap-2">
                  {JOB_CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => toggleCat(cat)}
                      className={`px-3 py-1.5 rounded-full border ${selectedCats.includes(cat) ? 'bg-primary-600 border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      <Text className={`text-xs font-medium ${selectedCats.includes(cat) ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Herramientas disponibles</Text>
                <TextInput value={toolsAvailable} onChangeText={setToolsAvailable}
                  placeholder="taladro, nivel, sierra (separados por coma)" placeholderTextColor="#9ca3af"
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm" />
              </View>
            </>
          )}

          <TouchableOpacity onPress={handleSave} disabled={loading}
            className="w-full bg-primary-600 rounded-xl py-4 items-center mt-2">
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Guardar cambios</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
