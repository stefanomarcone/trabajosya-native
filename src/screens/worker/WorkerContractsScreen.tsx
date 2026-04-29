import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Contract } from '../../types'

const TABS = [
  { label: 'Activos', statuses: ['held', 'partial', 'pending_payment'] },
  { label: 'Finalizados', statuses: ['released', 'refunded'] },
] as const

const ESCROW_LABELS: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  held: 'En progreso',
  released: 'Completado',
  refunded: 'Reembolsado',
}

export default function WorkerContractsScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [tab, setTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const filtered = contracts.filter(c => (TABS[tab].statuses as readonly string[]).includes(c.escrow_status))

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Mis contratos</Text>
      </View>

      <View className="flex-row bg-gray-100 dark:bg-gray-800 mx-4 mt-4 mb-3 rounded-xl p-1 gap-1">
        {TABS.map((t, i) => (
          <TouchableOpacity key={i} onPress={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === i ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}>
            <Text className={`text-sm font-medium ${tab === i ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-3xl mb-3">📋</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm">No hay contratos aquí</Text>
            </View>
          }
          renderItem={({ item: c }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ContractDetail', { contractId: c.id })}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${c.agreed_amount.toLocaleString('es-CL')}
                </Text>
                <View className={`rounded-full px-3 py-1 ${c.escrow_status === 'released' ? 'bg-green-50 dark:bg-green-900/20' : c.escrow_status === 'held' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  <Text className={`text-xs font-semibold ${c.escrow_status === 'released' ? 'text-green-700 dark:text-green-400' : c.escrow_status === 'held' ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    {ESCROW_LABELS[c.escrow_status] ?? c.escrow_status}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(c.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              <Text className="text-primary-600 dark:text-primary-400 text-xs font-medium mt-2">Ver detalles →</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}
