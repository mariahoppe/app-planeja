import { StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Título de seção dentro de uma tela, o .sec-h do protótipo: pequeno, em
 * maiúsculas e espaçado (ex.: "ATALHOS", "SALDOS", "ACERTO DE CONTAS").
 */
export function TituloSecao({ style, children }) {
  return (
    <Text style={[styles.titulo, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.tenue,
    marginTop: 4,
  },
});
