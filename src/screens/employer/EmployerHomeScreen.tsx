import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { Briefcase, MapPin, DollarSign, Wrench, ChevronRight } from 'lucide-react-native'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import ScreenLayout from '../../components/ScreenLayout'
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

  return (
    <ScreenLayout>
      <View className="px-4 pt-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">Mis publicaciones</Text>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1 mb-3">
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
      </View>

      <FlatList
        data={jobs}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        ListEmptyComponent={
          loading ? null : (
            <View className="items-center py-12">
              <Briefcase size={40} color="#d1d5db" />
              <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-3">
                {tab === 'open' ? 'No tenés publicaciones activas' : tab === 'in_progress' ? 'No hay trabajos en curso' : 'No hay trabajos finalizados'}
              </Text>
              {tab === 'open' && (
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1 text-center">Tocá el + abajo para publicar</Text>
              )}
            </View>
          )
        }
        renderItem={({ item: job }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('EmployerJobDetail', { jobId: job.id })}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Wrench size={14} color="#9ca3af" />
              <Text className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{job.category}</Text>
              <ChevronRight size={16} color="#9ca3af" />
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3" numberOfLines={2}>{job.description}</Text>
            <View className="flex-row flex-wrap gap-x-3 gap-y-1">
              {job.address && (
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-500" numberOfLines={1}>{job.address.split(',')[0]}</Text>
                </View>
              )}
              {job.price_fixed ? (
                <View className="flex-row items-center gap-1">
                  <DollarSign size={12} color="#374151" />
                  <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">${job.price_fixed.toLocaleString('es-CL')}</Text>
                </View>
              ) : (
                <Text className="text-xs text-primary-600 dark:text-primary-400">A cotizar</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenLayout>
  )
}
