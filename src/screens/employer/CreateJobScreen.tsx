import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORIES } from '../../types'
import Toast from 'react-native-toast-message'

export default function CreateJobScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [category, setCategory] = useState<string>(JOB_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [pricingMode, setPricingMode] = useState<'fixed' | 'quote'>('fixed')
  const [priceFixed, setPriceFixed] = useState('')
  const [toolsProvided, setToolsProvided] = useState(true)
  const [toolsNeeded, setToolsNeeded] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  async function handleSubmit() {
    if (!appUser) return
    if (description.length < 20) {
      Toast.show({ type: 'error', text1: 'La descripción debe tener al menos 20 caracteres' })
      return
    }
    if (pricingMode === 'fixed' && (!priceFixed || Number(priceFixed) < 1000)) {
      Toast.show({ type: 'error', text1: 'El precio mínimo es $1.000' })
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'jobs'), {
        employer_ref: appUser.id,
        category,
        job_type: 'standard',
        description,
        reference_photo_urls: [],
        address,
        tools_provided: toolsProvided,
        tools_needed: !toolsProvided && toolsNeeded
          ? toolsNeeded.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        pricing_mode: pricingMode,
        price_fixed: pricingMode === 'fixed' ? Number(priceFixed) : null,
        status: 'open',
        created_at: serverTimestamp(),
      })
      Toast.show({ type: 'success', text1: '¡Trabajo publicado!' })
      setDescription('')
      setAddress('')
      setPriceFixed('')
      navigation.navigate('Home')
    } catch {
      Toast.show({ type: 'error', text1: 'Error al publicar. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">Publicar trabajo</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">

          {/* Categoría */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Categoría *</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text className="text-sm text-gray-900 dark:text-white">{category}</Text>
              <Text className="text-gray-400">{showCategoryPicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 overflow-hidden">
                {JOB_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => { setCategory(cat); setShowCategoryPicker(false) }}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${category === cat ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  >
                    <Text className={`text-sm ${category === cat ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Descripción */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el trabajo con detalle: qué hay que hacer, condiciones, magnitud..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm"
              style={{ minHeight: 100 }}
            />
            <Text className={`text-xs mt-1 ${description.length < 20 ? 'text-gray-400' : 'text-green-500'}`}>
              {description.length}/20 mínimo
            </Text>
          </View>

          {/* Dirección */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dirección</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Av. Ejemplo 1234, Santiago"
              placeholderTextColor="#9ca3af"
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
            />
          </View>

          {/* Herramientas */}
          <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex-row items-center justify-between">
            <Text className="text-sm text-gray-700 dark:text-gray-300">Yo proporciono las herramientas</Text>
            <Switch value={toolsProvided} onValueChange={setToolsProvided} trackColor={{ true: '#2563eb' }} />
          </View>

          {!toolsProvided && (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Herramientas que necesita el trabajador</Text>
              <TextInput
                value={toolsNeeded}
                onChangeText={setToolsNeeded}
                placeholder="taladro, nivel, llaves Allen (separados por coma)"
                placeholderTextColor="#9ca3af"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
              />
            </View>
          )}

          {/* Modo de precio */}
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modo de precio *</Text>
            <View className="flex-row gap-2">
              {(['fixed', 'quote'] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setPricingMode(mode)}
                  className={`flex-1 border-2 rounded-xl p-3 items-center ${pricingMode === mode ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                >
                  <Text className={`text-sm font-semibold ${pricingMode === mode ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    {mode === 'fixed' ? 'Precio fijo' : 'A cotizar'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {pricingMode === 'fixed' && (
            <View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Precio ($) *</Text>
              <TextInput
                value={priceFixed}
                onChangeText={setPriceFixed}
                placeholder="25000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3.5 text-sm"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="w-full bg-primary-600 rounded-xl py-4 items-center mt-2"
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Publicar trabajo</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
