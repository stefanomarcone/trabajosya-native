import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { doc, getDoc, getDocs, collection, query, where, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Job, Offer, User } from '../../types'
import Toast from 'react-native-toast-message'

export default function EmployerJobDetailScreen({ route, navigation }: any) {
  const { jobId } = route.params
  const { appUser } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [workers, setWorkers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [jobSnap, offersSnap] = await Promise.all([
        getDoc(doc(db, 'jobs', jobId)),
        getDocs(query(collection(db, 'offers'), where('job_ref', '==', jobId), where('status', '==', 'pending'))),
      ])
      if (jobSnap.exists()) setJob({ id: jobSnap.id, ...jobSnap.data() } as Job)
      const offersList = offersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Offer))
      setOffers(offersList)
      const workerMap: Record<string, User> = {}
      await Promise.all(offersList.map(async o => {
        const ws = await getDoc(doc(db, 'users', o.worker_ref))
        if (ws.exists()) workerMap[o.worker_ref] = { id: ws.id, ...ws.data() } as User
      }))
      setWorkers(workerMap)
      setLoading(false)
    }
    load()
  }, [jobId])

  async function acceptOffer(offer: Offer) {
    if (!job || !appUser) return
    Alert.alert('Aceptar oferta', `¿Contratar a ${workers[offer.worker_ref]?.display_name} por $${offer.amount.toLocaleString('es-CL')}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar', style: 'default',
        onPress: async () => {
          setAccepting(offer.id)
          try {
            await updateDoc(doc(db, 'offers', offer.id), { status: 'accepted' })
            await updateDoc(doc(db, 'jobs', jobId), { status: 'in_progress' })
            const contractRef = await addDoc(collection(db, 'contracts'), {
              job_ref: jobId,
              worker_ref: offer.worker_ref,
              employer_ref: appUser.id,
              agreed_amount: offer.amount,
              escrow_status: 'pending_payment',
              completion_confirmed_worker: false,
              completion_confirmed_employer: false,
              dispute_status: null,
              created_at: serverTimestamp(),
            })
            await Promise.all(offers.filter(o => o.id !== offer.id).map(o =>
              updateDoc(doc(db, 'offers', o.id), { status: 'rejected' })
            ))
            Toast.show({ type: 'success', text1: '¡Oferta aceptada!', text2: 'Se creó el contrato' })
            navigation.replace('EmployerContractDetail', { contractId: contractRef.id })
          } catch {
            Toast.show({ type: 'error', text1: 'Error al aceptar la oferta' })
          } finally {
            setAccepting(null)
          }
        }
      }
    ])
  }

  async function rejectOffer(offer: Offer) {
    await updateDoc(doc(db, 'offers', offer.id), { status: 'rejected' })
    setOffers(prev => prev.filter(o => o.id !== offer.id))
    Toast.show({ type: 'success', text1: 'Oferta rechazada' })
  }

  if (loading) return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
      <ActivityIndicator size="large" color="#2563eb" />
    </SafeAreaView>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 flex-row items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 dark:text-primary-400 font-medium text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>{job?.category}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Job info */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <Text className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{job?.description}</Text>
          {job?.address ? <Text className="text-xs text-gray-400">📍 {job.address}</Text> : null}
          {job?.price_fixed ? (
            <Text className="text-xl font-bold text-gray-900 dark:text-white mt-2">${job.price_fixed.toLocaleString('es-CL')}</Text>
          ) : (
            <Text className="text-sm text-gray-400 mt-2">A cotizar</Text>
          )}
        </View>

        {/* Offers */}
        <Text className="font-semibold text-gray-900 dark:text-white">
          {offers.length === 0 ? 'Sin ofertas aún' : `${offers.length} oferta${offers.length !== 1 ? 's' : ''} recibida${offers.length !== 1 ? 's' : ''}`}
        </Text>

        {offers.length === 0 ? (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 items-center">
            <Text className="text-3xl mb-2">👀</Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center">
              Los trabajadores todavía no enviaron ofertas
            </Text>
          </View>
        ) : (
          offers.map(offer => {
            const worker = workers[offer.worker_ref]
            const isFixed = job?.price_fixed
            const isExact = isFixed && offer.amount === job.price_fixed
            return (
              <View key={offer.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full items-center justify-center">
                    <Text className="font-bold text-primary-700 dark:text-primary-300">
                      {worker?.display_name?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white text-sm">{worker?.display_name ?? '...'}</Text>
                    {worker?.rating_map && Object.keys(worker.rating_map).length > 0 && (
                      <Text className="text-xs text-gray-400">
                        ⭐ {(Object.values(worker.rating_map).reduce((s, v) => s + v.stars, 0) / Object.values(worker.rating_map).length).toFixed(1)}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-900 dark:text-white">${offer.amount.toLocaleString('es-CL')}</Text>
                    {!isExact && isFixed && (
                      <Text className="text-xs text-amber-500 text-right">Contraoferta</Text>
                    )}
                  </View>
                </View>

                {offer.message ? (
                  <Text className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
                    "{offer.message}"
                  </Text>
                ) : null}

                {worker?.verified_criminal_record && (
                  <Text className="text-xs text-green-600 dark:text-green-400 mb-3">✅ Antecedentes verificados</Text>
                )}

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => rejectOffer(offer)}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-3 items-center"
                  >
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">Rechazar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => acceptOffer(offer)}
                    disabled={accepting === offer.id}
                    className="flex-1 bg-primary-600 rounded-xl py-3 items-center"
                  >
                    {accepting === offer.id
                      ? <ActivityIndicator color="white" size="small" />
                      : <Text className="text-sm font-semibold text-white">Aceptar</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
