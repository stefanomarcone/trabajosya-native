import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, TouchableOpacity, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, Plus, User } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import EmployerHomeScreen from '../screens/employer/EmployerHomeScreen'
import CreateJobScreen from '../screens/employer/CreateJobScreen'
import EmployerProfileScreen from '../screens/employer/EmployerProfileScreen'
import EmployerJobDetailScreen from '../screens/employer/EmployerJobDetailScreen'
import EmployerContractsScreen from '../screens/employer/EmployerContractsScreen'
import NotificationsScreen from '../screens/shared/NotificationsScreen'
import ContractDetailScreen from '../screens/shared/ContractDetailScreen'
import EditProfileScreen from '../screens/shared/EditProfileScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

/** Big floating + button used as middle tab */
function PlusTabButton({ onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: focused ? '#1d4ed8' : '#2563eb',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 10,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          marginTop: -16,
        })}
      >
        <Plus size={26} color="white" strokeWidth={2.5} />
      </Pressable>
    </View>
  )
}

function EmployerTabs() {
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
        component={EmployerHomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateJobScreen}
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: (props) => <PlusTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={EmployerProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default function EmployerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployerTabs" component={EmployerTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EmployerJobDetail" component={EmployerJobDetailScreen} />
      <Stack.Screen name="EmployerContractDetail" component={ContractDetailScreen} />
      <Stack.Screen name="EmployerContracts" component={EmployerContractsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  )
}
