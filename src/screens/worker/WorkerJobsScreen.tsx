import { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Job } from '../../types'
import { JOB_CATEGORIES } from '../../types'

export default function WorkerJobsScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadJobs = useCallback(async () => {
    try {
      const q = categoryFilter
        ? query(collection(db, 'jobs'), where('status', '==', 'open'), where('category', '==', categoryFilter), orderBy('created_at', 'desc'), limit(40))
        : query(collection(db, 'jobs'), where('status', '==', 'open'), orderBy('created_at', 'desc'), limit(40))
      const snap = await getDocs(q)
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)))
    } catch {}
  }, [categoryFilter])

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
      {/* Header */}
      <View className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">Encontrá trabajo</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">Seleccioná una categoría o explorá todo</Text>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {['Todos', ...JOB_CATEGORIES].map(cat => {
          const isActive = cat === 'Todos' ? !categoryFilter : categoryFilter === cat
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat === 'Todos' ? '' : cat)}
              className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-primary-600 border-primary-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
            >
              <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>{cat}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <FlatList
        data={jobs}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        ListEmptyComponent={
          loading ? (
            <View className="gap-3">
              {[1, 2, 3].map(i => <View key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
            </View>
          ) : (
            <View className="items-center py-16">
              <Text className="text-3xl mb-3">🔍</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-sm">No hay trabajos disponibles</Text>
              <Text className="text-gray-300 dark:text-gray-600 text-xs mt-1">Probá con otra categoría</Text>
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
            {job.address ? <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">📍 {job.address}</Text> : null}
            {job.date ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                📅 {new Date(job.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </Text>
            ) : null}
            <Text className="text-primary-600 dark:text-primary-400 text-xs font-medium mt-2">Ver y postularme →</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}
