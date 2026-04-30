import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Contract } from '../../types'

export default function WorkerHomeScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadContracts = useCallback(async () => {
    if (!appUser) return
    try {
      const snap = await getDocs(query(
        collection(db, 'contracts'),
        where('worker_ref', '==', appUser.id),
        orderBy('created_at', 'desc'),
      ))
      setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contract)))
    } catch {}
  }, [appUser?.id])

  useEffect(() => {
    setLoading(true)
    loadContracts().finally(() => setLoading(false))
  }, [loadContracts])

  async function onRefresh() {
    setRefreshing(true)
    await loadContracts()
    setRefreshing(false)
  }

  const activeContracts = contracts.filter(c => c.escrow_status === 'held' || c.escrow_status === 'partial')
  const completedContracts = contracts.filter(c => c.escrow_status === 'released')
  const balance = appUser?.available_balance ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{greeting},</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">{appUser?.display_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
        >
          <Text className="text-base">🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      >
        {/* Hero card */}
        <View className="bg-primary-600 rounded-2xl p-5">
          <Text className="text-primary-100 text-sm mb-1">Tocá el <Text className="font-bold text-white">+</Text> para buscar</Text>
          <Text className="text-white text-xl font-bold leading-snug">Encontrá trabajos{'\n'}cerca tuyo</Text>
          {balance > 0 && (
            <View className="mt-4 pt-4 border-t border-primary-500">
              <Text className="text-primary-200 text-xs">Balance disponible</Text>
              <Text className="text-white text-2xl font-bold">${balance.toLocaleString('es-CL')}</Text>
            </View>
          )}
        </View>

        {/* Trabajos activos */}
        <View>
          <Text className="font-semibold text-gray-900 dark:text-white mb-3">
            ⏳ Trabajos activos {activeContracts.length > 0 && <Text className="text-primary-600 dark:text-primary-400">({activeContracts.length})</Text>}
          </Text>
          {loading ? (
            <View className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-20 animate-pulse" />
          ) : activeContracts.length === 0 ? (
            <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 items-center">
              <Text className="text-2xl mb-2">💼</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">No tenés trabajos activos{'\n'}Tocá el + para explorar</Text>
            </View>
          ) : (
            activeContracts.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => navigation.navigate('ContractDetail', { contractId: c.id })}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-amber-100 dark:border-amber-900/40 p-4 mb-2 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl items-center justify-center">
                  <Text className="text-lg">💼</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">
                    {c.completion_confirmed_worker ? 'Esperando confirmación' : 'En progreso'}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ${c.agreed_amount.toLocaleString('es-CL')}
                  </Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Historial */}
        {completedContracts.length > 0 && (
          <View>
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">✅ Completados</Text>
            {completedContracts.slice(0, 3).map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => navigation.navigate('ContractDetail', { contractId: c.id })}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-2 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl items-center justify-center">
                  <Text className="text-lg">✅</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white text-sm">Trabajo finalizado</Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text className="font-bold text-gray-700 dark:text-gray-300">${c.agreed_amount.toLocaleString('es-CL')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
