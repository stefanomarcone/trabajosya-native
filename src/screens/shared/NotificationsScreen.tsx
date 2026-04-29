import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NotificationsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="px-4 py-3 flex-row items-center gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 dark:text-primary-400 font-medium">← Volver</Text>
        </TouchableOpacity>
        <Text className="text-base font-bold text-gray-900 dark:text-white">Notificaciones</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl mb-2">🔔</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">No hay notificaciones nuevas</Text>
      </View>
    </SafeAreaView>
  )
}
