import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DestinoFormScreen } from '../features/destinos/screens/DestinoFormScreen';
import { DestinosScreen } from '../features/destinos/screens/DestinosScreen';
import { ConfiguracoesScreen } from '../features/perfil/screens/ConfiguracoesScreen';
import { PerfilScreen } from '../features/perfil/screens/PerfilScreen';
import { AbasNavigator } from './AbasNavigator';

const Stack = createNativeStackNavigator();

/**
 * Telas de quem está logado. As abas são a base da pilha; Perfil,
 * Configurações e Destinos abrem por cima delas (com "‹ Voltar"), sem ocupar uma aba.
 */
export function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Abas" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Abas" component={AbasNavigator} />
      <Stack.Screen name="Perfil" component={PerfilScreen} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      <Stack.Screen name="Destinos" component={DestinosScreen} />
      <Stack.Screen name="DestinoForm" component={DestinoFormScreen} />
    </Stack.Navigator>
  );
}
