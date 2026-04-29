import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Job, Offer, User } from '../../types'
import Toast from 'react-native-toast-message'

export default function JobDetailScreen({ route, navigation }: any) {
  const { jobId } = route.params
  const { appUser } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [employer, setEmployer] = useState<User | null>(null)
  const [existingOffer, setExistingOffer] = useState<Offer | null>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const [jobSnap, offersSnap] = await Promise.all([
        getDoc(doc(db, 'jobs', jobId)),
        getDocs(query(collection(db, 'offers'), where('job_ref', '==', jobId), where('worker_ref', '==', appUser?.id))),
      ])
      if (jobSnap.exists()) {
        const j = { id: jobSnap.id, ...jobSnap.data() } as Job
        setJob(j)
        if (j.price_fixed) setAmount(String(j.price_fixed))
        const empSnap = await getDoc(doc(db, 'users', j.employer_ref))
        if (empSnap.exists()) setEmployer({ id: empSnap.id, ...empSnap.data() } as User)
      }
      if (!offersSnap.empty) {
        setExistingOffer({ id: offersSnap.docs[0].id, ...offersSnap.docs[0].data() } as Offer)
      }
      setLoading(false)
    }
    load()
  }, [jobId])

  async function handleOffer() {
    if (!appUser || !job) return
    const num = Number(amount)
    if (!num || num < 1000) {
      Toast.show({ type: 'error', text1: 'El monto mínimo es $1.000' })
      return
    }
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'offers'), {
        job_ref: jobId,
        worker_ref: appUser.id,
        worker_name: appUser.display_name,
        type: job.pricing_mode === 'quote' ? 'quote' : num === job.price_fixed ? 'accept' : 'counter',
        amount: num,
        message: message.trim() || null,
        status: 'pending',
        created_at: serverTimestamp(),
      })
      Toast.show({ type: 'success', text1: '¡Oferta enviada!' })
      navigation.goBack()
    } catch {
      Toast.show({ type: 'error', text1: 'Error al enviar la oferta' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    )
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">Trabajo no encontrado</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-primary-600 dark:text-primary-400 font-medium text-base">←</Text>
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
            {job.category}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
          {/* Job info */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-2.5 py-1">
                <Text className="text-xs font-semibold text-primary-700 dark:text-primary-300">{job.category}</Text>
              </View>
              {job.price_fixed ? (
                <Text className="text-xl font-bold text-gray-900 dark:text-white">${job.price_fixed.toLocaleString('es-CL')}</Text>
              ) : (
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">A cotizar</Text>
              )}
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{job.description}</Text>
            {job.address ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-3">📍 {job.address}</Text>
            ) : null}
            {job.date ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                📅 {new Date(job.date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </Text>
            ) : null}
            {job.tools_provided && (
              <Text className="text-xs text-green-600 dark:text-green-400 mt-1">🔧 El empleador provee las herramientas</Text>
            )}
          </View>

          {/* Employer */}
          {employer && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Empleador</Text>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                  <Text className="text-base font-bold text-blue-700 dark:text-blue-400">
                    {employer.display_name[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">{employer.display_name}</Text>
                  {employer.employer_rating?.count > 0 && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      ⭐ {employer.employer_rating.avg.toFixed(1)} · {employer.employer_rating.count} trabajos
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Offer form */}
          {existingOffer ? (
            <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
              <Text className="font-semibold text-green-700 dark:text-green-400 mb-1">✅ Oferta enviada</Text>
              <Text className="text-sm text-green-600 dark:text-green-500">
                Enviaste una oferta de ${existingOffer.amount.toLocaleString('es-CL')}
              </Text>
              {existingOffer.status === 'accepted' && (
                <Text className="text-sm font-semibold text-green-700 dark:text-green-400 mt-1">¡Tu oferta fue aceptada!</Text>
              )}
              {existingOffer.status === 'rejected' && (
                <Text className="text-sm text-red-500 mt-1">Tu oferta fue rechazada</Text>
              )}
            </View>
          ) : (
            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">
                {job.pricing_mode === 'quote' ? 'Enviar cotización' : 'Postularme'}
              </Text>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {job.pricing_mode === 'quote' ? 'Mi cotización ($)' : 'Monto ($)'}
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="25000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm mb-3"
              />
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mensaje (opcional)</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Contale al empleador sobre tu experiencia..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm mb-4"
                style={{ minHeight: 80 }}
              />
              <TouchableOpacity
                onPress={handleOffer}
                disabled={submitting}
                className="w-full bg-primary-600 rounded-xl py-4 items-center"
              >
                {submitting ? <ActivityIndicator color="white" /> : (
                  <Text className="text-white font-semibold">
                    {job.pricing_mode === 'quote' ? 'Enviar cotización' : 'Postularme'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
