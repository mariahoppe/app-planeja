import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';

/**
 * Alternância em pílula entre poucas opções (ex.: Cidades | Países).
 * opcoes: [{ valor, rotulo }]. valor: a opção marcada. onChange: recebe o valor tocado.
 */
export function Segmentado({ opcoes, valor, onChange }) {
  return (
    <View style={styles.pilula} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[styles.opcao, ativo && styles.opcaoAtiva]}
          >
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{o.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pilula: {
    flexDirection: 'row',
    backgroundColor: colors.linhaSuave,
    borderRadius: 999,
    padding: 3,
  },
  opcao: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: {
    backgroundColor: colors.branco,
    shadowColor: colors.tinta,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  texto: { fontFamily: fonts.corpoSemi, fontSize: 13, color: colors.suave },
  textoAtivo: { color: colors.acento },
});
