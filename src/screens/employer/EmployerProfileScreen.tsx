import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { Pencil, LogOut, CheckCircle2, CreditCard, Star } from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import ScreenLayout from '../../components/ScreenLayout'
import Toast from 'react-native-toast-message'

export default function EmployerProfileScreen({ navigation }: any) {
  const { appUser, logout } = useAuth()

  async function handleLogout() {
    await logout()
    Toast.show({ type: 'success', text1: 'Sesión cerrada' })
  }

  const er = appUser?.employer_rating
  const hasBuenPagador = (er?.avg ?? 0) >= 4.5 && (er?.count ?? 0) >= 3

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Header */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full items-center justify-center overflow-hidden">
              {appUser?.avatar_url
                ? <Image source={{ uri: appUser.avatar_url }} className="w-full h-full" />
                : <Text className="text-2xl font-bold text-blue-700 dark:text-blue-400">{appUser?.display_name?.[0]?.toUpperCase()}</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">{appUser?.display_name}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Empleador</Text>
              {er && er.count > 0 && (
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Star size={12} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {er.avg.toFixed(1)} · {er.count} opinión{er.count !== 1 ? 'es' : ''}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              className="p-2 rounded-full"
            >
              <Pencil size={18} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {appUser?.bio ? <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">{appUser.bio}</Text> : null}

          {appUser?.id_status === 'approved' && (
            <View className="flex-row items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 mb-2">
              <CheckCircle2 size={16} color="#10b981" />
              <Text className="text-green-600 dark:text-green-400 text-sm font-medium">Identidad verificada</Text>
            </View>
          )}

          {hasBuenPagador && (
            <View className="flex-row items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
              <CreditCard size={16} color="#10b981" />
              <View>
                <Text className="text-sm font-semibold text-green-700 dark:text-green-400">Buen pagador</Text>
                <Text className="text-xs text-green-600/80 dark:text-green-500">Valorado positivamente por trabajadores</Text>
              </View>
            </View>
          )}
        </View>

        {/* Reputación */}
        {er && er.count > 0 && (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">Reputación como empleador</Text>
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-4xl font-bold text-gray-900 dark:text-white">{er.avg.toFixed(1)}</Text>
              <View className="flex-row items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star
                    key={n}
                    size={16}
                    color="#f59e0b"
                    fill={n <= Math.round(er.avg) ? '#f59e0b' : 'transparent'}
                  />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full border border-red-200 dark:border-red-900 rounded-2xl py-3.5 items-center mt-2 flex-row justify-center gap-2"
        >
          <LogOut size={16} color="#ef4444" />
          <Text className="text-red-500 dark:text-red-400 font-medium text-sm">Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  )
}
