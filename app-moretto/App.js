/**
 * App.js — Blog com Atomic Design + API JWT
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FeedScreen } from './src/screens/FeedScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PostDetailScreen } from './src/screens/PostDetailScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { UsersScreen } from './src/screens/UsersScreen';
import { cores } from './src/theme';

const Stack = createNativeStackNavigator();

const opcoesPadrao = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: cores.fundo },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={opcoesPadrao}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Cadastro"
            component={RegisterScreen}
            options={{ title: 'Cadastro' }}
          />
          <Stack.Screen
            name="Feed"
            component={FeedScreen}
            options={{ title: 'Feed', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Postagem"
            component={PostDetailScreen}
            options={{ title: 'Postagem' }}
          />
          <Stack.Screen
            name="Usuarios"
            component={UsersScreen}
            options={{ title: 'Seguir pessoas' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
