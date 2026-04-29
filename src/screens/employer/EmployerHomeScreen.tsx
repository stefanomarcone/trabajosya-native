import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Job, JobStatus } from '../../types'

const TABS: { label: string; status: JobStatus }[] = [
  { label: 'Abiertos', status: 'open' },
  { label: 'En curso', status: 'in_progress' },
  { label: 'Finalizados', status: 'completed' },
]

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  in_progress: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  completed: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800',
  cancelled: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
}

export default function EmployerHomeScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const [tab, setTab] = useState<JobStatus>('open')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadJobs = useCallback(async () => {
    if (!appUser) return
    try {
      const snap = await getDocs(query(
        collection(db, 'jobs'),
        where('employer_ref', '==', appUser.id),
        where('status', '==', tab),
        orderBy('created_at', 'desc'),
      ))
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)))
    } catch {}
  }, [appUser?.id, tab])

  useEffect(() => {
    setLoading(true)
    loadJobs().finally(() => setLoading(false))
  }, [loadJobs])

  async function onRefresh() {
    setRefreshing(true)
    await loadJobs()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 flex-row items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Mis trabajos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
          <Text>🔔</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row bg-gray-100 dark:bg-gray-800 mx-4 mt-4 mb-3 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <TouchableOpacity key={t.status} onPress={() => setTab(t.status)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t.status ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}>
            <Text className={`text-sm font-medium ${tab === t.status ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={jobs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-3xl mb-3">💼</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm">
              {tab === 'open' ? 'No tenés trabajos abiertos' : tab === 'in_progress' ? 'No hay trabajos en curso' : 'No hay trabajos finalizados'}
            </Text>
          </View>
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EmployerJobDetail', { jobId: job.id })}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-start justify-between mb-2">
              <View className="bg-primary-50 dark:bg-primary-900/20 rounded-lg px-2.5 py-1">
                <Text className="text-xs font-semibold text-primary-700 dark:text-primary-300">{job.category}</Text>
              </View>
              {job.price_fixed
                ? <Text className="text-base font-bold text-gray-900 dark:text-white">${job.price_fixed.toLocaleString('es-CL')}</Text>
                : <Text className="text-sm text-gray-400">A cotizar</Text>}
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" numberOfLines={2}>{job.description}</Text>
            {job.address ? <Text className="text-xs text-gray-400 mt-2">📍 {job.address}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}
