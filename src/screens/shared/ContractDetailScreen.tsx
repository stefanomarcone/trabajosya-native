import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Contract, Job, User } from '../../types'
import Toast from 'react-native-toast-message'
import ChatScreen from './ChatScreen'

export default function ContractDetailScreen({ route, navigation }: any) {
  const { contractId } = route.params
  const { appUser } = useAuth()
  const [contract, setContract] = useState<Contract | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info')

  async function reload() {
    const snap = await getDoc(doc(db, 'contracts', contractId))
    if (snap.exists()) setContract({ id: snap.id, ...snap.data() } as Contract)
  }

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'contracts', contractId))
      if (!snap.exists()) { setLoading(false); return }
      const c = { id: snap.id, ...snap.data() } as Contract
      setContract(c)
      const isWorker = appUser?.id === c.worker_ref
      const [jobSnap, otherSnap] = await Promise.all([
        getDoc(doc(db, 'jobs', c.job_ref)),
        getDoc(doc(db, 'users', isWorker ? c.employer_ref : c.worker_ref)),
      ])
      if (jobSnap.exists()) setJob({ id: jobSnap.id, ...jobSnap.data() } as Job)
      if (otherSnap.exists()) setOtherUser({ id: otherSnap.id, ...otherSnap.data() } as User)
      setLoading(false)
    }
    load()
  }, [contractId])

  async function confirmCompletion() {
    if (!contract || !appUser) return
    const isWorker = appUser.id === contract.worker_ref
    setConfirming(true)
    try {
      const workerConfirmed = isWorker ? true : contract.completion_confirmed_worker
      const employerConfirmed = !isWorker ? true : contract.completion_confirmed_employer
      const bothDone = workerConfirmed && employerConfirmed
      await updateDoc(doc(db, 'contracts', contractId), {
        ...(isWorker ? { completion_confirmed_worker: true } : { completion_confirmed_employer: true }),
        ...(bothDone ? { escrow_status: 'released' } : {}),
      })
      if (bothDone) {
        await updateDoc(doc(db, 'jobs', contract.job_ref), { status: 'completed' })
      }
      Toast.show({ type: 'success', text1: '¡Confirmado!', text2: bothDone ? 'El trabajo fue completado' : 'Esperando la otra parte' })
      await reload()
    } catch {
      Toast.show({ type: 'error', text1: 'Error al confirmar' })
    } finally {
      setConfirming(false)
    }
  }

  function openConfirmDialog() {
    Alert.alert('Confirmar finalización', '¿Estás seguro de que el trabajo fue completado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', style: 'default', onPress: confirmCompletion },
    ])
  }

  if (loading) return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
      <ActivityIndicator size="large" color="#2563eb" />
    </SafeAreaView>
  )

  if (!contract) return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
      <Text className="text-gray-500 dark:text-gray-400">Contrato no encontrado</Text>
    </SafeAreaView>
  )

  const isWorker = appUser?.id === contract.worker_ref
  const myConfirmed = isWorker ? contract.completion_confirmed_worker : contract.completion_confirmed_employer
  const otherConfirmed = isWorker ? contract.completion_confirmed_employer : contract.completion_confirmed_worker
  const isCompleted = contract.escrow_status === 'released'

  const escrowBadge: Record<string, { label: string; cls: string }> = {
    pending_payment: { label: '⏳ Pago pendiente', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
    held: { label: '🔒 En progreso', cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
    released: { label: '✅ Completado', cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    refunded: { label: '↩️ Reembolsado', cls: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
  }
  const badge = escrowBadge[contract.escrow_status] ?? { label: contract.escrow_status, cls: 'bg-gray-100 text-gray-600' }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 dark:text-primary-400 font-medium text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">{job?.category ?? 'Contrato'}</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-gray-100 dark:bg-gray-800 mx-4 mt-3 mb-0 rounded-xl p-1 gap-1">
        {(['info', 'chat'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg items-center ${activeTab === t ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}>
            <Text className={`text-sm font-medium ${activeTab === t ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {t === 'info' ? '📋 Detalles' : '💬 Mensajes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'chat' ? (
        <ChatScreen contractId={contractId} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* Amount + Status */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                ${contract.agreed_amount.toLocaleString('es-CL')}
              </Text>
              <View className={`rounded-full px-3 py-1 ${badge.cls}`}>
                <Text className={`text-xs font-semibold ${badge.cls}`}>{badge.label}</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-400 dark:text-gray-500">Monto acordado</Text>
          </View>

          {/* Other user */}
          {otherUser && (
            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {isWorker ? 'Empleador' : 'Trabajador'}
              </Text>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                  <Text className="font-bold text-blue-700 dark:text-blue-300">{otherUser.display_name[0].toUpperCase()}</Text>
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white">{otherUser.display_name}</Text>
              </View>
            </View>
          )}

          {/* Address */}
          {job?.address && (
            <View className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl px-4 py-3">
              <Text className="text-sm text-primary-700 dark:text-primary-300">📍 {job.address}</Text>
            </View>
          )}

          {/* Confirmations */}
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">Confirmación de finalización</Text>
            <View className="gap-2 mb-4">
              <View className="flex-row items-center gap-2">
                <Text>{contract.completion_confirmed_worker ? '✅' : '⏳'}</Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">Trabajador confirmó</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text>{contract.completion_confirmed_employer ? '✅' : '⏳'}</Text>
                <Text className="text-sm text-gray-700 dark:text-gray-300">Empleador confirmó</Text>
              </View>
            </View>

            {!isCompleted && !myConfirmed && contract.escrow_status === 'held' && (
              <TouchableOpacity
                onPress={openConfirmDialog}
                disabled={confirming}
                className="w-full bg-green-600 rounded-xl py-3.5 items-center"
              >
                {confirming
                  ? <ActivityIndicator color="white" />
                  : <Text className="text-white font-semibold">Confirmar que el trabajo terminó</Text>}
              </TouchableOpacity>
            )}

            {!isCompleted && myConfirmed && !otherConfirmed && (
              <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <Text className="text-amber-700 dark:text-amber-400 text-sm text-center font-medium">
                  ⏳ Esperando confirmación de la otra parte
                </Text>
              </View>
            )}

            {isCompleted && (
              <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 items-center">
                <Text className="text-2xl mb-1">🎉</Text>
                <Text className="text-green-700 dark:text-green-400 font-semibold">¡Trabajo completado!</Text>
              </View>
            )}

            {contract.escrow_status === 'pending_payment' && (
              <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <Text className="text-amber-700 dark:text-amber-400 text-sm text-center">
                  ⏳ Esperando que el empleador realice el pago
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
