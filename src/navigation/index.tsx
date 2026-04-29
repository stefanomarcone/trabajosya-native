import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import AuthNavigator from './AuthNavigator'
import WorkerNavigator from './WorkerNavigator'
import EmployerNavigator from './EmployerNavigator'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { firebaseUser, appUser, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : appUser?.role === 'employer' ? (
          <Stack.Screen name="Employer" component={EmployerNavigator} />
        ) : (
          <Stack.Screen name="Worker" component={WorkerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
