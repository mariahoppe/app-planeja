import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../../config/theme';

/**
 * Ação secundária em forma de texto sublinhado (ex.: "Esqueci minha senha").
 * titulo: texto do link. onPress: o que acontece ao tocar.
 * inline: versão menor, para ficar ao lado de outro elemento (ex.: "Trocar foto").
 */
export function Link({ titulo, onPress, inline = false }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={[styles.area, inline && styles.areaInline]}>
      <Text style={[styles.texto, inline && styles.textoInline]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  areaInline: { alignSelf: 'auto' },
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 13,
    color: colors.acento,
    textDecorationLine: 'underline',
  },
  textoInline: { fontSize: 11.5 },
});
