import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Caixa de resumo do protótipo (ex.: "Custo previsto · R$ 820,00 · 4 atividades").
 * Para duas lado a lado, coloque numa View com flexDirection 'row' e gap 10.
 */
export function CaixaResumo({ rotulo, valor, sub }) {
  return (
    <View style={styles.caixa}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    flex: 1,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  valor: {
    fontFamily: fonts.titulo,
    fontSize: 21,
    lineHeight: 25,
    marginTop: 3,
    color: colors.tinta,
  },
  sub: {
    fontFamily: fonts.corpo,
    fontSize: 10.5,
    marginTop: 2,
    color: colors.suave,
  },
});
