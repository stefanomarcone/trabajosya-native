import './global.css'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useColorScheme } from 'nativewind'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider } from './src/context/AuthContext'
import RootNavigator from './src/navigation'

function AppInner() {
  const { setColorScheme, colorScheme } = useColorScheme()

  useEffect(() => {
    AsyncStorage.getItem('colorScheme').then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setColorScheme(saved)
      }
    })
  }, [])

  return (
    <>
      <RootNavigator />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
