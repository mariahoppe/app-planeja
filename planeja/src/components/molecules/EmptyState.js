import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Estado vazio: aviso exibido no lugar de uma lista sem itens (RNF-07).
 * titulo: frase curta (ex.: "Nada por aqui ainda").
 * mensagem: explica o que falta ou o que a pessoa pode fazer.
 * acao: elemento opcional abaixo da mensagem (ex.: um Button para criar o primeiro item).
 */
export function EmptyState({ titulo, mensagem, acao, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.titulo}>{titulo}</Text>
      {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
      {acao}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 14,
    gap: 8,
  },
  titulo: {
    fontFamily: fonts.titulo,
    fontSize: 18,
    color: colors.tinta,
    textAlign: 'center',
  },
  mensagem: {
    fontFamily: fonts.corpo,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.suave,
    textAlign: 'center',
    maxWidth: 250,
  },
});
