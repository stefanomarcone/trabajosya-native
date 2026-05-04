import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react-native'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import ScreenLayout from '../../components/ScreenLayout'
import type { Contract } from '../../types'

export default function WorkerEarningsScreen() {
  const { appUser } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!appUser) return
    ;(async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'contracts'),
          where('worker_ref', '==', appUser.id),
          orderBy('created_at', 'desc'),
        ))
        setContracts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Contract)))
      } finally {
        setLoading(false)
      }
    })()
  }, [appUser?.id])

  const released = contracts.filter(c => c.escrow_status === 'released')
  const totalEarned = released.reduce((s, c) => s + (c.agreed_amount || 0), 0)
  const available = appUser?.available_balance ?? 0

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Mis ingresos</Text>

        {/* Balance disponible */}
        <View className="bg-primary-600 rounded-2xl p-5">
          <View className="flex-row items-center gap-2 mb-1">
            <DollarSign size={16} color="#bfdbfe" />
            <Text className="text-primary-100 text-xs font-medium">Balance disponible</Text>
          </View>
          <Text className="text-white text-3xl font-bold">${available.toLocaleString('es-CL')}</Text>
        </View>

        {/* Total ganado */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <View className="flex-row items-center gap-2 mb-1">
            <TrendingUp size={16} color="#10b981" />
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">Total ganado</Text>
          </View>
          <Text className="text-gray-900 dark:text-white text-2xl font-bold">${totalEarned.toLocaleString('es-CL')}</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {released.length} trabajo{released.length !== 1 ? 's' : ''} completado{released.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Historial */}
        <Text className="font-semibold text-gray-900 dark:text-white mt-2">Historial de pagos</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : released.length === 0 ? (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 items-center">
            <Text className="text-gray-400 dark:text-gray-500 text-sm">Aún no tenés pagos</Text>
          </View>
        ) : (
          released.map(c => (
            <View key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex-row items-center gap-3">
              <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl items-center justify-center">
                <CheckCircle2 size={18} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-white text-sm">Pago liberado</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {new Date(c.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
              <Text className="font-bold text-green-600 dark:text-green-400">${c.agreed_amount.toLocaleString('es-CL')}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  )
}
