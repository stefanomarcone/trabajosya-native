import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  FlatList, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Job, Contract } from '../../types'
import { JOB_CATEGORIES } from '../../types'

const TABS = ['Explorar', 'Mis actividades'] as const

export default function WorkerHomeScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [tab, setTab] = useState<typeof TABS[number]>('Explorar')
  const [jobs, setJobs] = useState<Job[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadJobs = useCallback(async () => {
    try {
      const q = categoryFilter
        ? query(collection(db, 'jobs'), where('status', '==', 'open'), where('category', '==', categoryFilter), orderBy('created_at', 'desc'), limit(30))
        : query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('created_at', 'desc'), limit(30))
      const snap = await getDocs(q)
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)))
    } catch {}
  }, [categoryFilter])

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
    Promise.all([loadJobs(), loadContracts()]).finally(() => setLoading(false))
  }, [loadJobs, loadContracts])

  async function onRefresh() {
    setRefreshing(true)
    await Promise.all([loadJobs(), loadContracts()])
    setRefreshing(false)
  }

  const activeContracts = contracts.filter(c => c.escrow_status === 'held' || c.escrow_status === 'partial')
  const completedContracts = contracts.filter(c => c.escrow_status === 'released')

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Hola,</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-white">{appUser?.display_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center"
        >
          <Text className="text-base">🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-gray-100 dark:bg-gray-800 mx-4 mt-4 mb-3 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          >
            <Text className={`text-sm font-medium ${tab === t ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Explorar' ? (
        <>
          {/* Category filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-3" contentContainerStyle={{ gap: 8 }}>
            {['Todos', ...JOB_CATEGORIES].map(cat => {
              const isActive = cat === 'Todos' ? !categoryFilter : categoryFilter === cat
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat === 'Todos' ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-primary-600 border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                >
                  <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <FlatList
            data={jobs}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
            ListEmptyComponent={
              loading ? (
                <View className="gap-3">
                  {[1,2,3].map(i => <View key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
                </View>
              ) : (
                <View className="items-center py-16">
                  <Text className="text-3xl mb-3">🔍</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-sm">No hay trabajos disponibles</Text>
                </View>
              )
            }
            renderItem={({ item: job }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-2.5 py-1">
                    <Text className="text-xs font-semibold text-primary-700 dark:text-primary-300">{job.category}</Text>
                  </View>
                  {job.price_fixed ? (
                    <Text className="text-base font-bold text-gray-900 dark:text-white">${job.price_fixed.toLocaleString('es-CL')}</Text>
                  ) : (
                    <Text className="text-sm font-medium text-gray-400 dark:text-gray-500">A cotizar</Text>
                  )}
                </View>
                <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" numberOfLines={2}>
                  {job.description}
                </Text>
                {job.address ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">📍 {job.address}</Text>
                ) : null}
                {job.date ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    📅 {new Date(job.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                ) : null}
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        >
          {/* Activos */}
          <View>
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">⏳ Trabajos activos</Text>
            {activeContracts.length === 0 ? (
              <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 items-center">
                <Text className="text-gray-400 dark:text-gray-500 text-sm">No tenés trabajos activos</Text>
              </View>
            ) : activeContracts.map(c => (
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
                    {c.completion_confirmed_worker ? 'Esperando empleador' : 'En progreso'}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ${c.agreed_amount.toLocaleString('es-CL')}
                  </Text>
                </View>
                <Text className="text-gray-400 dark:text-gray-500">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Completados */}
          {completedContracts.length > 0 && (
            <View>
              <Text className="font-semibold text-gray-900 dark:text-white mb-3">✅ Finalizados</Text>
              {completedContracts.slice(0, 5).map(c => (
                <View key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-2 flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl items-center justify-center">
                    <Text className="text-lg">✅</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white text-sm">Completado</Text>
                  </View>
                  <Text className="font-bold text-gray-700 dark:text-gray-300">${c.agreed_amount.toLocaleString('es-CL')}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
