import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import Toast from 'react-native-toast-message'

export default function WorkerProfileScreen() {
  const { appUser, logout } = useAuth()

  async function handleLogout() {
    await logout()
    Toast.show({ type: 'success', text1: 'Sesión cerrada' })
  }

  const tools = appUser?.tools_available ?? []
  const ratingEntries = Object.entries(appUser?.rating_map ?? {})
  const totalJobs = ratingEntries.reduce((s, [, v]) => s + v.count, 0)

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Mi perfil</Text>

        {/* Header */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full items-center justify-center overflow-hidden">
              {appUser?.avatar_url ? (
                <Image source={{ uri: appUser.avatar_url }} className="w-full h-full" />
              ) : (
                <Text className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {appUser?.display_name?.[0]?.toUpperCase()}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">{appUser?.display_name}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Trabajador</Text>
              {totalJobs > 0 && (
                <Text className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5">
                  {totalJobs} trabajo{totalJobs !== 1 ? 's' : ''} completado{totalJobs !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
          {appUser?.bio ? <Text className="text-sm text-gray-600 dark:text-gray-400">{appUser.bio}</Text> : null}
          {appUser?.id_status === 'approved' && (
            <View className="mt-3 flex-row items-center gap-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
              <Text className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Identidad verificada</Text>
            </View>
          )}
        </View>

        {/* Balance */}
        {(appUser?.available_balance ?? 0) > 0 && (
          <View className="bg-primary-600 rounded-2xl p-5">
            <Text className="text-primary-100 text-xs font-medium mb-1">Balance disponible</Text>
            <Text className="text-white text-3xl font-bold">${(appUser?.available_balance ?? 0).toLocaleString('es-CL')}</Text>
          </View>
        )}

        {/* Herramientas */}
        {tools.length > 0 && (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">🔧 Herramientas</Text>
            <View className="flex-row flex-wrap gap-2">
              {tools.map((tool, i) => (
                <View key={i} className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-full px-3 py-1">
                  <Text className="text-xs font-medium text-primary-700 dark:text-primary-300">{tool}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reputación */}
        {ratingEntries.length > 0 && (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">⭐ Reputación</Text>
            <View className="gap-3">
              {ratingEntries.map(([cat, data]) => (
                <View key={cat} className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat}</Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-yellow-400">{'★'.repeat(Math.round(data.stars))}</Text>
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white">{data.stars.toFixed(1)}</Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">({data.count})</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full border border-red-200 dark:border-red-900 rounded-2xl py-3.5 items-center mt-2"
        >
          <Text className="text-red-500 dark:text-red-400 font-medium text-sm">Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
