import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/atoms/Card';
import { colors, fonts } from '../../../config/theme';
import { dataBR } from '../../atividades/datas';
import { rotuloCategoria } from '../despesas';
import { moeda } from '../formatos';

/**
 * Uma despesa na aba Despesas: o que foi, quanto, quando e quem pagou.
 * Tocar abre a edição.
 */
export function DespesaItem({ despesa, usuarioId, onPress }) {
  const pagador = despesa.pagador_id === usuarioId ? 'você' : despesa.pagador?.nome ?? 'ex-integrante';
  const divisao = despesa.modo_divisao === 'personalizada' ? ' · personalizada' : '';

  return (
    <Card onPress={onPress}>
      <View style={styles.linha}>
        <Text style={styles.descricao} numberOfLines={2}>
          {despesa.descricao}
        </Text>
        <Text style={styles.valor}>{moeda(despesa.valor)}</Text>
      </View>
      <Text style={styles.categoria}>{rotuloCategoria(despesa.categoria)}</Text>
      <Text style={styles.sub}>
        {dataBR(despesa.data)} · pago por {pagador}
        {divisao}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  descricao: { flex: 1, fontFamily: fonts.corpoSemi, fontSize: 15, color: colors.tinta },
  valor: { fontFamily: fonts.monoMedio, fontSize: 15, color: colors.tinta },
  categoria: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
  },
  sub: { fontFamily: fonts.corpo, fontSize: 12.5, color: colors.suave },
});
