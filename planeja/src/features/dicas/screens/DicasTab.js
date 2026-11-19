import { useEffect, useState } from 'react';

import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { RankingScreen } from '../../ranking/screens/RankingScreen';
import { DicasScreen } from './DicasScreen';

const OPCOES = [
  { valor: 'dicas', rotulo: 'Dicas' },
  { valor: 'ranking', rotulo: 'Ranking' },
];

/**
 * Aba Dicas do protótipo: o seletor Dicas | Ranking no topo troca a tela.
 * Cada tela mantém o próprio ScreenTemplate (e a paginação); aqui só se escolhe qual mostrar.
 * Quem navega para cá pode pedir uma das duas com route.params.aba. O Ranking (RF-16)
 * manda { aba: 'dicas', filtro } para abrir as dicas já filtradas pelo destino tocado.
 */
export function DicasTab({ navigation, route }) {
  const [aba, setAba] = useState(route.params?.aba ?? 'dicas');

  // O useState só lê o valor inicial uma vez; se a aba já estiver aberta, o pedido chega por aqui.
  useEffect(() => {
    if (route.params?.aba) setAba(route.params.aba);
  }, [route.params]);

  const seletor = <SeletorSegmentado opcoes={OPCOES} valor={aba} onChange={setAba} />;

  return aba === 'ranking' ? (
    <RankingScreen navigation={navigation} route={route} seletor={seletor} />
  ) : (
    <DicasScreen navigation={navigation} route={route} seletor={seletor} />
  );
}
