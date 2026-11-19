import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconeAba } from '../components/atoms/IconeAba';
import { colors, fonts } from '../config/theme';
import { DicasTab } from '../features/dicas/screens/DicasTab';
import { GruposScreen } from '../features/grupos/screens/GruposScreen';
import { InicioScreen } from '../features/inicio/screens/InicioScreen';
import { RoteirosTab } from '../features/roteiros/screens/RoteirosTab';

const Abas = createBottomTabNavigator();

const ALTURA_BARRA = 64;

// Botão da aba com resposta ao toque: ripple no Android e leve encolhida nos dois sistemas.
// O botão padrão não dá retorno nenhum no iOS.
function BotaoAba({ style, href, hoverEffect, pressOpacity, ...resto }) {
  return (
    <Pressable
      {...resto}
      android_ripple={{ color: colors.linha, borderless: true, radius: 36 }}
      style={({ pressed }) => [style, pressed && styles.pressionado]}
    />
  );
}

function opcoesDaAba(nome, title) {
  return {
    title,
    tabBarIcon: ({ focused, color }) => <IconeAba nome={nome} cor={color} ativo={focused} />,
  };
}

/**
 * As 4 abas inferiores de quem está logado, como no protótipo. Destinos e Ranking
 * não são abas: ficam num seletor no topo de Roteiros e de Dicas (RoteirosTab, DicasTab).
 * Quando uma seção precisar de telas internas (detalhe, formulário), troque o
 * component da aba por um stack próprio daquela feature.
 */
export function AbasNavigator() {
  const margens = useSafeAreaInsets();

  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.acento,
        tabBarInactiveTintColor: colors.suave,
        tabBarStyle: [
          styles.barra,
          { height: ALTURA_BARRA + margens.bottom, paddingBottom: margens.bottom + 6 },
        ],
        tabBarLabelStyle: styles.rotulo,
        tabBarIconStyle: styles.icone,
        tabBarLabelPosition: 'below-icon',
        tabBarButton: (props) => <BotaoAba {...props} />,
      }}
    >
      <Abas.Screen name="Inicio" component={InicioScreen} options={opcoesDaAba('inicio', 'Início')} />
      <Abas.Screen name="Roteiros" component={RoteirosTab} options={opcoesDaAba('roteiros', 'Roteiros')} />
      <Abas.Screen name="Dicas" component={DicasTab} options={opcoesDaAba('dicas', 'Dicas')} />
      <Abas.Screen name="Grupos" component={GruposScreen} options={opcoesDaAba('grupos', 'Grupos')} />
    </Abas.Navigator>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: colors.branco,
    borderTopColor: colors.linha,
    paddingTop: 6,
    elevation: 12,
    shadowColor: colors.tinta,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rotulo: {
    fontFamily: fonts.corpoSemi,
    fontSize: 11,
    marginTop: 2,
  },
  icone: {
    width: 48,
    height: 30,
  },
  pressionado: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
});
