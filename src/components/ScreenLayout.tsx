import { View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ArrowLeftRight, Sun, Moon, Bell } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  /** Show back button instead of logo */
  showBack?: boolean
  title?: string
}

export default function ScreenLayout({ children, showBack, title }: Props) {
  const navigation = useNavigation<any>()
  const { activeMode, toggleMode } = useAuth()
  const { colorScheme, setColorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isEmployer = activeMode === 'employer'

  async function handleToggleDark() {
    const next = isDark ? 'light' : 'dark'
    setColorScheme(next)
    await AsyncStorage.setItem('colorScheme', next)
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      {/* Top header */}
      <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex-row items-center justify-between">
        {/* Logo / back / title */}
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center gap-2">
            <Text className="text-primary-600 dark:text-primary-400 text-base">←</Text>
            {title && <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>}
          </TouchableOpacity>
        ) : (
          <Image
            source={isDark
              ? require('../../assets/logo-dark.png')
              : require('../../assets/logo.png')}
            style={{ width: 120, height: 32 }}
            resizeMode="contain"
          />
        )}

        {/* Right actions */}
        <View className="flex-row items-center gap-1">
          {/* Mode toggle */}
          <TouchableOpacity
            onPress={toggleMode}
            className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeftRight size={13} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {isEmployer ? 'Empleador' : 'Trabajador'}
            </Text>
          </TouchableOpacity>

          {/* Dark mode */}
          <TouchableOpacity onPress={handleToggleDark} className="p-2 rounded-full">
            {isDark
              ? <Sun size={20} color="#facc15" />
              : <Moon size={20} color="#6b7280" />}
          </TouchableOpacity>

          {/* Bell */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            className="p-2 rounded-full"
          >
            <Bell size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  )
}
