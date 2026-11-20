import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../../config/theme';

/**
 * Faixa de erro no topo do conteúdo (ex.: "Permissão da câmera negada."), o
 * .alert do protótipo: fundo de acento suave, sem borda.
 * mensagem: texto do erro; quando vazio, não desenha nada.
 */
export function ErrorMessage({ mensagem }) {
  if (!mensagem) {
    return null;
  }

  return (
    <View style={styles.caixa} accessibilityRole="alert">
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: colors.acentoSuave,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  texto: {
    fontFamily: fonts.corpoSemi,
    fontSize: 12,
    color: colors.acento,
  },
});
