import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Seletor do protótipo: poucas opções lado a lado num trilho bege, a marcada em branco.
 * opcoes: [{ valor, rotulo }]. valor: a opção marcada. onChange: recebe o valor tocado.
 */
export function SeletorSegmentado({ opcoes, valor, onChange }) {
  return (
    <View style={styles.trilho} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const marcada = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: marcada }}
            style={[styles.opcao, marcada && styles.opcaoMarcada]}
          >
            <Text style={[styles.texto, marcada && styles.textoMarcado]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    backgroundColor: colors.fundoSeletor,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  opcao: {
    flex: 1,
    minHeight: 38,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoMarcada: {
    backgroundColor: colors.branco,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  texto: { fontFamily: fonts.corpo, fontSize: 12.5, color: colors.suave },
  textoMarcado: { fontFamily: fonts.corpoForte, color: colors.tinta },
});
