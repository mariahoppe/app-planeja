import { DefaultTheme, NavigationContainer } from '@react-navigation/native';

import { colors } from '../config/theme';
import { useAuth } from '../contexts/AuthContext';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

// Fundo papel em todas as telas, para não piscar branco nas transições.
const temaPlaneja = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.papel, primary: colors.acento },
};

/**
 * Raiz da navegação: sem usuário mostra as telas de conta; com usuário, a pilha do app (abas + Perfil + Configurações).
 * Não precisa navegar para "Início" depois do login — quando o AuthContext
 * muda o usuário, este componente redesenha e troca de árvore sozinho.
 */
export function AppNavigator() {
  const { usuario, restaurando } = useAuth();

  if (restaurando) {
    return null;
  }

  return (
    <NavigationContainer theme={temaPlaneja}>
      {usuario ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
