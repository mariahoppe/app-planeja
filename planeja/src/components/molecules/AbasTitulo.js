import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Título que também é seletor: as telas de uma aba lado a lado, no tamanho do
 * título (ex.: Dicas | Ranking). A marcada fica em tinta, com um traço de acento
 * sobre a divisória do cabeçalho; as outras ficam em cinza e trocam a tela ao toque.
 * Assim o nome da tela não aparece duas vezes (no título e num seletor logo abaixo).
 * Feito para o cabeçalho do ScreenTemplate (prop abas).
 * opcoes: [{ valor, rotulo }]. valor: a opção marcada. onChange: recebe o valor tocado.
 */
export function AbasTitulo({ opcoes, valor, onChange }) {
  return (
    <View style={styles.linha} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const marcada = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            // O texto tem 30pt de altura; o hitSlop completa os 44pt de toque (RNF-03).
            hitSlop={8}
            accessibilityRole="tab"
            accessibilityState={{ selected: marcada }}
          >
            <Text style={[styles.texto, marcada && styles.textoMarcado]}>{o.rotulo}</Text>
            {marcada ? <View style={styles.traco} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 16 },
  // Mesma tipografia do título do ScreenTemplate, para a troca não mudar a altura do cabeçalho.
  texto: {
    fontFamily: fonts.tituloMedio,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.27,
    color: colors.suave,
  },
  textoMarcado: { color: colors.tinta },
  // Desce os 10pt de respiro do cabeçalho mais 1pt da borda: o traço fica em cima da divisória.
  traco: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -11,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.acento,
  },
});
