import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/atoms/Card';
import { colors, fonts } from '../../../config/theme';
import { moeda, periodoCurto, STATUS_VIAGEM } from '../../inicio/formatos';

/**
 * Um roteiro na lista: status, título, destino e período, e o andamento das
 * atividades com o custo previsto. Viagens com grupo ganham a marca "Em grupo".
 */
export function CartaoRoteiro({ roteiro, onPress }) {
  const total = roteiro.total_atividades ?? 0;
  const feitas = roteiro.atividades_concluidas ?? 0;
  const lugar = [roteiro.destino?.cidade, roteiro.destino?.pais].filter(Boolean).join(', ');

  return (
    <Card onPress={onPress}>
      <View style={styles.linha}>
        <Text style={styles.status}>{STATUS_VIAGEM[roteiro.status] ?? roteiro.status}</Text>
        {roteiro.grupo ? <Text style={styles.grupo}>Em grupo</Text> : null}
      </View>
      <Text style={styles.titulo} numberOfLines={2}>
        {roteiro.titulo}
      </Text>
      <Text style={styles.sub}>
        {lugar}
        {roteiro.inicio ? ` · ${periodoCurto(roteiro.inicio, roteiro.fim)}` : ''}
      </Text>
      <Text style={styles.numeros}>
        {total === 0
          ? 'Nenhuma atividade ainda'
          : `${feitas} de ${total} ${total === 1 ? 'atividade feita' : 'atividades feitas'} · ${moeda(roteiro.custo_total)}`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  status: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
  },
  grupo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.suave,
    backgroundColor: colors.fundoSeletor,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  titulo: { fontFamily: fonts.titulo, fontSize: 18, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  numeros: { fontFamily: fonts.mono, fontSize: 11.5, color: colors.tenue },
});
