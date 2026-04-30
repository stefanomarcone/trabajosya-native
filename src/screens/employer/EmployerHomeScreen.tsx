import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Job, JobStatus } from '../../types'

const TABS: { label: string; status: JobStatus }[] = [
  { label: 'Activos', status: 'open' },
  { label: 'En curso', status: 'in_progress' },
  { label: 'Finalizados', status: 'completed' },
]

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
          <Text>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View className="mx-4 mt-4 mb-3 bg-primary-600 rounded-2xl p-5">
        <Text className="text-primary-200 text-xs mb-1">Tocá el <Text className="font-bold text-white">+</Text> para publicar</Text>
        <Text className="text-white text-xl font-bold leading-snug">¿Qué necesitás{'\n'}resolver hoy?</Text>
        <Text className="text-primary-200 text-xs mt-2">Encontrá al profesional ideal para tu problema</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-gray-100 dark:bg-gray-800 mx-4 mb-3 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <TouchableOpacity
            key={t.status}
            onPress={() => setTab(t.status)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t.status ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
          >
            <Text className={`text-sm font-medium ${tab === t.status ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={jobs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-3xl mb-3">💡</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {tab === 'open' ? 'No tenés publicaciones activas' : tab === 'in_progress' ? 'No hay trabajos en curso' : 'No hay trabajos finalizados'}
            </Text>
            {tab === 'open' && (
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1 text-center">
                Tocá el <Text className="font-bold">+</Text> para publicar tu necesidad
              </Text>
            )}
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
                : <Text className="text-sm text-gray-400 dark:text-gray-500">A cotizar</Text>}
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed" numberOfLines={2}>{job.description}</Text>
            {job.address ? <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">📍 {job.address}</Text> : null}
            <Text className="text-primary-600 dark:text-primary-400 text-xs font-medium mt-2">Ver postulaciones →</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}
