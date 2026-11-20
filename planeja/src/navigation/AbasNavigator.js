import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { IconeAba } from '../components/atoms/IconeAba';
import { BarraAbas } from '../components/organisms/BarraAbas';
import { DicasTab } from '../features/dicas/screens/DicasTab';
import { GruposScreen } from '../features/grupos/screens/GruposScreen';
import { InicioScreen } from '../features/inicio/screens/InicioScreen';
import { RoteirosTab } from '../features/roteiros/screens/RoteirosTab';

const Abas = createBottomTabNavigator();

function opcoesDaAba(nome, title) {
  return {
    title,
    tabBarIcon: ({ color }) => <IconeAba nome={nome} cor={color} />,
  };
}

/**
 * As 4 abas inferiores de quem está logado, como no protótipo. Destinos e Ranking
 * não são abas: ficam num seletor no topo de Roteiros e de Dicas (RoteirosTab, DicasTab).
 * A barra é a pílula flutuante do protótipo (BarraAbas), por cima do conteúdo.
 * Quando uma seção precisar de telas internas (detalhe, formulário), troque o
 * component da aba por um stack próprio daquela feature.
 */
export function AbasNavigator() {
  return (
    <Abas.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BarraAbas {...props} />}>
      <Abas.Screen name="Inicio" component={InicioScreen} options={opcoesDaAba('inicio', 'Início')} />
      <Abas.Screen name="Roteiros" component={RoteirosTab} options={opcoesDaAba('roteiros', 'Roteiros')} />
      <Abas.Screen name="Dicas" component={DicasTab} options={opcoesDaAba('dicas', 'Dicas')} />
      <Abas.Screen name="Grupos" component={GruposScreen} options={opcoesDaAba('grupos', 'Grupos')} />
    </Abas.Navigator>
  );
}
