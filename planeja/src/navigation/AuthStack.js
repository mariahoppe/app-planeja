import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CadastroScreen } from '../features/auth/screens/CadastroScreen';
import { EsqueciSenhaScreen } from '../features/auth/screens/EsqueciSenhaScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';

const Stack = createNativeStackNavigator();

// Telas de quem ainda não entrou. O cabeçalho vem do ScreenTemplate, por isso headerShown: false.
export function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
    </Stack.Navigator>
  );
}
