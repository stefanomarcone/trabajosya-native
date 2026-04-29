import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WorkerJobsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
      <Text className="text-2xl mb-2">🔍</Text>
      <Text className="text-gray-500 dark:text-gray-400">Búsqueda de trabajos</Text>
      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">Próximamente</Text>
    </SafeAreaView>
  )
}
