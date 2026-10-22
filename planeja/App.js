import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/contexts/AuthContext';
import useFontesPlaneja from './src/hooks/useFontesPlaneja';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const fontesProntas = useFontesPlaneja();

  if (!fontesProntas) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
