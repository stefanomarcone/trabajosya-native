import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text } from 'react-native'
import WorkerHomeScreen from '../screens/worker/WorkerHomeScreen'
import WorkerJobsScreen from '../screens/worker/WorkerJobsScreen'
import WorkerContractsScreen from '../screens/worker/WorkerContractsScreen'
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen'
import NotificationsScreen from '../screens/shared/NotificationsScreen'
import JobDetailScreen from '../screens/worker/JobDetailScreen'
import ContractDetailScreen from '../screens/shared/ContractDetailScreen'
import EditProfileScreen from '../screens/shared/EditProfileScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Jobs: '🔍', Contracts: '📋', Profile: '👤',
  }
  return (
    <View className="items-center">
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{icons[name]}</Text>
    </View>
  )
}

function WorkerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e5e7eb', height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen name="Home" component={WorkerHomeScreen} options={{ title: 'Inicio', tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }} />
      <Tab.Screen name="Jobs" component={WorkerJobsScreen} options={{ title: 'Explorar', tabBarIcon: ({ focused }) => <TabIcon name="Jobs" focused={focused} /> }} />
      <Tab.Screen name="Contracts" component={WorkerContractsScreen} options={{ title: 'Contratos', tabBarIcon: ({ focused }) => <TabIcon name="Contracts" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={WorkerProfileScreen} options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }} />
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
