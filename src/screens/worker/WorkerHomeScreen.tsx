import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import {
  Search, List, Map as MapIcon, Briefcase, Clock,
  CheckCircle2, ChevronRight, MapPin, Calendar, DollarSign, Wrench,
} from 'lucide-react-native'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { useColorScheme } from 'nativewind'
import ScreenLayout from '../../components/ScreenLayout'
import JobsMap from '../../components/JobsMap'
import type { Job, Contract } from '../../types'
import { JOB_CATEGORIES } from '../../types'

const TABS = ['Explorar', 'Mis actividades'] as const

const CATEGORY_COLORS: Record<string, string> = {
  'Pintura': '#3b82f6', 'Plomería': '#0ea5e9', 'Electricidad': '#f59e0b',
  'Jardinería': '#22c55e', 'Limpieza': '#8b5cf6', 'Mudanzas': '#f97316',
  'Fletes': '#ef4444', 'Mantención': '#6b7280', 'Apoyo en cocina': '#ec4899',
  'Asistencia General': '#8b5cf6', 'Otros': '#6b7280',
}

export default function WorkerHomeScreen({ navigation }: any) {
  const { appUser } = useAuth()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [tab, setTab] = useState<typeof TABS[number]>('Explorar')
  const [jobs, setJobs] = useState<Job[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map')
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

  const activeContracts = contracts.filter(c => c.escrow_status === 'held' || c.escrow_status === 'partial')
  const completedContracts = contracts.filter(c => c.escrow_status === 'released')

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Tab bar */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4 gap-1">
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
            {/* Filter chips + view toggle */}
            <View className="flex-row items-center gap-2 mb-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1" contentContainerStyle={{ gap: 8 }}>
                <FilterChip label="Todos" active={!categoryFilter} onPress={() => setCategoryFilter('')} />
                {JOB_CATEGORIES.map(c => (
                  <FilterChip key={c} label={c} active={categoryFilter === c} onPress={() => setCategoryFilter(c)} />
                ))}
              </ScrollView>

              <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <TouchableOpacity
                  onPress={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-700' : ''}`}
                >
                  <List size={16} color={viewMode === 'list' ? '#2563eb' : (isDark ? '#6b7280' : '#9ca3af')} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewMode('map')}
                  className={`p-1.5 rounded-md ${viewMode === 'map' ? 'bg-white dark:bg-gray-700' : ''}`}
                >
                  <MapIcon size={16} color={viewMode === 'map' ? '#2563eb' : (isDark ? '#6b7280' : '#9ca3af')} />
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View className="gap-3">
                {[1, 2, 3].map(i => <View key={i} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
              </View>
            ) : jobs.length === 0 ? (
              <View className="items-center py-16">
                <Search size={40} color={isDark ? '#374151' : '#d1d5db'} />
                <Text className="text-gray-400 dark:text-gray-500 mt-3">No hay trabajos disponibles</Text>
              </View>
            ) : viewMode === 'map' ? (
              <View className="gap-3">
                <JobsMap jobs={jobs} onJobClick={(j) => navigation.navigate('JobDetail', { jobId: j.id })} dark={isDark} />
                <DemandStats jobs={jobs} activeCategory={categoryFilter} onCategoryClick={setCategoryFilter} />
                <Text className="font-semibold text-gray-700 dark:text-gray-300 text-sm mt-1">
                  {jobs.length} trabajo{jobs.length !== 1 ? 's' : ''} {categoryFilter ? `en ${categoryFilter}` : 'disponibles'}
                </Text>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
                ))}
              </View>
            ) : (
              <View className="gap-3">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} onPress={() => navigation.navigate('JobDetail', { jobId: job.id })} />
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="gap-6">
            {/* Activos */}
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <Clock size={16} color="#f59e0b" />
                <Text className="font-semibold text-gray-900 dark:text-white">Trabajos activos</Text>
                {activeContracts.length > 0 && (
                  <View className="ml-auto bg-amber-100 dark:bg-amber-900/40 rounded-full px-2 py-0.5">
                    <Text className="text-xs text-amber-700 dark:text-amber-400 font-medium">{activeContracts.length}</Text>
                  </View>
                )}
              </View>
              {activeContracts.length === 0 ? (
                <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 items-center">
                  <Text className="text-gray-400 dark:text-gray-500 text-sm">No tenés trabajos activos</Text>
                </View>
              ) : activeContracts.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => navigation.navigate('ContractDetail', { contractId: c.id })}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-amber-100 dark:border-amber-900/40 p-4 mb-2 flex-row items-center gap-3"
                >
                  <View className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg items-center justify-center">
                    <Briefcase size={16} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                      {c.completion_confirmed_worker ? 'Esperando confirmación del empleador' : 'En progreso'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-gray-900 dark:text-white">${c.agreed_amount.toLocaleString('es-CL')}</Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Finalizados */}
            {completedContracts.length > 0 && (
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <CheckCircle2 size={16} color="#10b981" />
                  <Text className="font-semibold text-gray-900 dark:text-white">Trabajos finalizados</Text>
                </View>
                {completedContracts.map(c => (
                  <View key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-2 flex-row items-center gap-3">
                    <View className="w-9 h-9 bg-green-50 dark:bg-green-900/30 rounded-lg items-center justify-center">
                      <CheckCircle2 size={16} color="#10b981" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 dark:text-white">Completado</Text>
                    </View>
                    <Text className="font-bold text-gray-700 dark:text-gray-300">${c.agreed_amount.toLocaleString('es-CL')}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  )
}

// ─── Subcomponents ──────────────────────────────────────────────

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary-600 border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>{label}</Text>
    </TouchableOpacity>
  )
}

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Wrench size={14} color="#9ca3af" />
        <Text className="font-semibold text-gray-900 dark:text-white text-sm flex-1">{job.category}</Text>
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3" numberOfLines={2}>{job.description}</Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-1">
        {job.address && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-500 dark:text-gray-500" numberOfLines={1}>{job.address.split(',')[0]}</Text>
          </View>
        )}
        {job.date && (
          <View className="flex-row items-center gap-1">
            <Calendar size={12} color="#9ca3af" />
            <Text className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(job.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
        )}
        {job.price_fixed ? (
          <View className="flex-row items-center gap-1">
            <DollarSign size={12} color="#374151" />
            <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">${job.price_fixed.toLocaleString('es-CL')}</Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <DollarSign size={12} color="#2563eb" />
            <Text className="text-xs text-primary-600 dark:text-primary-400">A cotizar</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

function DemandStats({ jobs, activeCategory, onCategoryClick }: { jobs: Job[]; activeCategory: string; onCategoryClick: (cat: string) => void }) {
  const counts: Record<string, number> = {}
  jobs.forEach(j => { counts[j.category] = (counts[j.category] || 0) + 1 })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] || 1

  return (
    <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Demanda por categoría</Text>
      {sorted.map(([cat, count]) => {
        const color = CATEGORY_COLORS[cat] || '#6b7280'
        const pct = Math.round((count / max) * 100)
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onCategoryClick(activeCategory === cat ? '' : cat)}
            className="mb-2"
          >
            <View className="flex-row items-center justify-between mb-0.5">
              <Text className={`text-xs font-medium ${activeCategory === cat ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>{cat}</Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">{count} trabajo{count !== 1 ? 's' : ''}</Text>
            </View>
            <View className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 999 }} />
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
