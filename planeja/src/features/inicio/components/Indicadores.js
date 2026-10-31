import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { NumeroAnimado } from '../../../components/atoms/NumeroAnimado';
import { Surgir } from '../../../components/atoms/Surgir';

/**
 * Os quatro contadores do painel em grade 2×2. Cada um abre a sua seção.
 * itens: [{ chave, rotulo, valor, onPress }]
 */
export function Indicadores({ itens, atrasoInicial = 0 }) {
  return (
    <View style={styles.grade}>
      {itens.map((item, i) => (
        <Surgir key={item.chave} atraso={atrasoInicial + i * 70} style={styles.celula}>
          <Pressable
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${item.valor} ${item.rotulo}`}
            style={({ pressed }) => [styles.bloco, pressed && styles.pressionado]}
          >
            <View style={styles.marca} />
            <NumeroAnimado valor={item.valor} atraso={atrasoInicial + i * 70 + 150} style={styles.numero} />
            <Text style={styles.rotulo}>{item.rotulo}</Text>
          </Pressable>
        </Surgir>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  celula: { flexBasis: '46%', flexGrow: 1 },
  bloco: {
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
    minHeight: 96,
    justifyContent: 'flex-end',
  },
  pressionado: { opacity: 0.85 },
  marca: {
    position: 'absolute',
    top: 14,
    left: 15,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.acento,
  },
  numero: { fontFamily: fonts.monoForte, fontSize: 30, lineHeight: 36, color: colors.tinta },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.suave,
  },
});
