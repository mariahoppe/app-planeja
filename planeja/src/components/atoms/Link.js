import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Ação secundária em forma de texto sublinhado (ex.: "Esqueci minha senha").
 * titulo: texto do link. onPress: o que acontece ao tocar.
 */
export function Link({ titulo, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={styles.area}>
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 13,
    color: colors.acento,
    textDecorationLine: 'underline',
  },
});
