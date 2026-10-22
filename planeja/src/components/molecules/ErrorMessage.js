import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../../config/theme';

/**
 * Faixa de erro no topo do conteúdo (ex.: "Permissão da câmera negada.").
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
    backgroundColor: colors.erroFundo,
    borderWidth: 1,
    borderColor: colors.acento,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  texto: {
    fontFamily: fonts.corpoSemi,
    fontSize: 13,
    color: colors.acento,
  },
});
