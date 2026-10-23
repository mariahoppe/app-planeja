import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors, fonts } from '../config/theme';
import { DicasScreen } from '../features/dicas/screens/DicasScreen';
import { GruposScreen } from '../features/grupos/screens/GruposScreen';
import { InicioScreen } from '../features/inicio/screens/InicioScreen';
import { RankingScreen } from '../features/ranking/screens/RankingScreen';
import { RoteirosScreen } from '../features/roteiros/screens/RoteirosScreen';

const Abas = createBottomTabNavigator();

/**
 * As 5 abas inferiores de quem está logado.
 * Quando uma seção precisar de telas internas (detalhe, formulário), troque o
 * component da aba por um stack próprio daquela feature.
 */
export function AbasNavigator() {
  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.acento,
        tabBarInactiveTintColor: colors.suave,
        tabBarStyle: { backgroundColor: colors.papel, borderTopColor: colors.linha },
        tabBarLabelStyle: { fontFamily: fonts.corpoSemi, fontSize: 12 },
        // Ainda sem ícones: só o nome da aba, centralizado.
        tabBarIconStyle: { display: 'none' },
        tabBarLabelPosition: 'beside-icon',
      }}
    >
      <Abas.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Abas.Screen name="Roteiros" component={RoteirosScreen} />
      <Abas.Screen name="Dicas" component={DicasScreen} />
      <Abas.Screen name="Ranking" component={RankingScreen} />
      <Abas.Screen name="Grupos" component={GruposScreen} />
    </Abas.Navigator>
  );
}
