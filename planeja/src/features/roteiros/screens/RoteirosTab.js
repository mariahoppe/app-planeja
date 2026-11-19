import { useEffect, useState } from 'react';

import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { DestinosScreen } from '../../destinos/screens/DestinosScreen';
import { RoteirosScreen } from './RoteirosScreen';

const OPCOES = [
  { valor: 'roteiros', rotulo: 'Roteiros' },
  { valor: 'destinos', rotulo: 'Destinos' },
];

/**
 * Aba Roteiros do protótipo: o seletor Roteiros | Destinos no topo troca a tela.
 * Cada tela mantém o próprio ScreenTemplate (e a paginação); aqui só se escolhe qual mostrar.
 * Quem navega para cá pode pedir uma das duas com route.params.aba (ex.: { aba: 'destinos' }).
 */
export function RoteirosTab({ navigation, route }) {
  const [aba, setAba] = useState(route.params?.aba ?? 'roteiros');

  // O useState só lê o valor inicial uma vez; se a aba já estiver aberta, o pedido chega por aqui.
  useEffect(() => {
    if (route.params?.aba) setAba(route.params.aba);
  }, [route.params]);

  const seletor = <SeletorSegmentado opcoes={OPCOES} valor={aba} onChange={setAba} />;

  return aba === 'destinos' ? (
    <DestinosScreen navigation={navigation} route={route} seletor={seletor} />
  ) : (
    <RoteirosScreen navigation={navigation} route={route} seletor={seletor} />
  );
}
