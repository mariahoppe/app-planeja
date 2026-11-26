import { useEffect, useState } from 'react';

import { RankingScreen } from '../../ranking/screens/RankingScreen';
import { DicasScreen } from './DicasScreen';

const OPCOES = [
  { valor: 'dicas', rotulo: 'Dicas' },
  { valor: 'ranking', rotulo: 'Ranking' },
];

/**
 * Aba Dicas: o título Dicas | Ranking do cabeçalho troca a tela. No protótipo era um
 * seletor abaixo do título; virou o próprio título para "Ranking" não aparecer duas vezes.
 * Cada tela mantém o próprio ScreenTemplate (e a paginação); aqui só se escolhe qual mostrar.
 * Quem navega para cá pode pedir uma das duas com route.params.aba. O Ranking (RF-16)
 * manda { aba: 'dicas', filtro } para abrir as dicas já filtradas pelo destino tocado.
 */
export function DicasTab({ navigation, route }) {
  const [aba, setAba] = useState(route.params?.aba ?? 'dicas');

  // O useState só lê o valor inicial uma vez; se a aba já estiver aberta, o pedido chega por aqui.
  // Depois de aplicado, o pedido é apagado: senão voltaria a valer ao tocar de novo na aba.
  useEffect(() => {
    if (route.params?.aba) {
      setAba(route.params.aba);
      navigation.setParams({ aba: undefined });
    }
  }, [route.params, navigation]);

  // Cada tela entrega isto ao ScreenTemplate, que desenha as abas no lugar do título.
  const abas = { opcoes: OPCOES, valor: aba, onChange: setAba };

  return aba === 'ranking' ? (
    <RankingScreen navigation={navigation} route={route} abas={abas} />
  ) : (
    <DicasScreen navigation={navigation} route={route} abas={abas} />
  );
}
