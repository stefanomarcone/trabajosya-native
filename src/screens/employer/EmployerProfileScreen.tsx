import { View, Text, TouchableOpacity, ScrollView, Image, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { useAuth } from '../../context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

export default function EmployerProfileScreen({ navigation }: any) {
  const { appUser, logout, toggleMode } = useAuth()
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  async function handleLogout() {
    await logout()
    Toast.show({ type: 'success', text1: 'Sesión cerrada' })
  }

  async function handleToggleDark(val: boolean) {
    const scheme = val ? 'dark' : 'light'
    setColorScheme(scheme)
    await AsyncStorage.setItem('colorScheme', scheme)
  }

  function handleSwitchMode() {
    toggleMode()
    Toast.show({ type: 'info', text1: 'Cambiando a modo Trabajador' })
  }

  const er = appUser?.employer_rating
  const hasBuenPagador = (er?.avg ?? 0) >= 4.5 && (er?.count ?? 0) >= 3

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Mi perfil</Text>

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
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  ⭐ {er.avg.toFixed(1)} · {er.count} opinión{er.count !== 1 ? 'es' : ''}
                </Text>
              )}
            </View>
          </View>

          {appUser?.bio ? <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">{appUser.bio}</Text> : null}

          {appUser?.id_status === 'approved' && (
            <View className="flex-row items-center gap-1.5 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 mb-2">
              <Text className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Identidad verificada</Text>
            </View>
          )}

          {hasBuenPagador && (
            <View className="flex-row items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
              <Text className="text-green-600 dark:text-green-400 text-sm">💳</Text>
              <View>
                <Text className="text-sm font-semibold text-green-700 dark:text-green-400">Buen pagador</Text>
                <Text className="text-xs text-green-600/80 dark:text-green-500">Valorado positivamente por trabajadores</Text>
              </View>
            </View>
          )}
        </View>

        {/* Preferencias */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Editar perfil */}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">✏️</Text>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Editar perfil</Text>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>

          {/* Dark mode */}
          <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">{isDark ? '🌙' : '☀️'}</Text>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo oscuro</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleDark}
              trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
              thumbColor="white"
            />
          </View>

          {/* Cambiar a trabajador */}
          <TouchableOpacity
            onPress={handleSwitchMode}
            className="flex-row items-center justify-between px-4 py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-lg">🔄</Text>
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Cambiar a trabajador</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">Explorá trabajos disponibles</Text>
              </View>
            </View>
            <Text className="text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Reputación */}
        {er && er.count > 0 && (
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <Text className="font-semibold text-gray-900 dark:text-white mb-3">Reputación como empleador</Text>
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-4xl font-bold text-gray-900 dark:text-white">{er.avg.toFixed(1)}</Text>
              <View>
                <Text className="text-yellow-400 text-lg">{'★'.repeat(Math.round(er.avg))}{'☆'.repeat(5 - Math.round(er.avg))}</Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500">{er.count} {er.count === 1 ? 'opinión' : 'opiniones'}</Text>
              </View>
            </View>
            {er.dimensions && (
              <View className="gap-2.5">
                {[
                  { label: '👍 Trato durante el trabajo', val: er.dimensions.treatment },
                  { label: '💬 Claridad de instrucciones', val: er.dimensions.clarity },
                  { label: '💳 Condiciones de pago', val: er.dimensions.payment },
                ].filter(d => d.val > 0).map(d => (
                  <View key={d.label} className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600 dark:text-gray-400 flex-1">{d.label}</Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-yellow-400">{'★'.repeat(Math.round(d.val))}</Text>
                      <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 w-7 text-right">{d.val.toFixed(1)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
