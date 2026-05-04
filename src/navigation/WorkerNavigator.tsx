import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, TrendingUp, User } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import WorkerHomeScreen from '../screens/worker/WorkerHomeScreen'
import WorkerEarningsScreen from '../screens/worker/WorkerEarningsScreen'
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen'
import NotificationsScreen from '../screens/shared/NotificationsScreen'
import JobDetailScreen from '../screens/worker/JobDetailScreen'
import ContractDetailScreen from '../screens/shared/ContractDetailScreen'
import EditProfileScreen from '../screens/shared/EditProfileScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function WorkerTabs() {
  const insets = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Home"
        component={WorkerHomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={WorkerEarningsScreen}
        options={{
          title: 'Ingresos',
          tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={WorkerProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function WorkerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkerTabs" component={WorkerTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="ContractDetail" component={ContractDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  )
}
