import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Contract } from '../../types'

const ESCROW_LABELS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Pago pendiente', cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
  held: { label: 'En progreso', cls: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  released: { label: 'Completado', cls: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
  refunded: { label: 'Reembolsado', cls: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800' },
}

export default function EmployerContractsScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!appUser) return
    try {
      const snap = await getDocs(query(
        collection(db, 'contracts'),
        where('employer_ref', '==', appUser.id),
        orderBy('created_at', 'desc'),
      ))
      setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contract)))
    } catch {}
  }, [appUser?.id])

  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)) }, [load])

  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false) }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Contratos activos</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-3xl mb-3">📋</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm">No hay contratos todavía</Text>
            </View>
          }
          renderItem={({ item: c }) => {
            const badge = ESCROW_LABELS[c.escrow_status] ?? { label: c.escrow_status, cls: 'text-gray-600 bg-gray-100' }
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('EmployerContractDetail', { contractId: c.id })}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${c.agreed_amount.toLocaleString('es-CL')}
                  </Text>
                  <View className={`rounded-full px-3 py-1 ${badge.cls}`}>
                    <Text className={`text-xs font-semibold ${badge.cls}`}>{badge.label}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('es-CL')}
                </Text>
                <Text className="text-primary-600 dark:text-primary-400 text-xs font-medium mt-2">Ver detalles →</Text>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
