import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { colors, fonts, radius } from '../../config/theme';

/**
 * Campo de texto padrão do Planeja. Envolve o TextInput aplicando o estilo do app;
 * as demais props (value, onChangeText, placeholder, secureTextEntry...) são repassadas.
 * erro: destaca o campo quando a validação falha.
 */
export function Input({ erro = false, style, ...props }) {
  const [focado, setFocado] = useState(false);

  return (
    <TextInput
      style={[styles.input, focado && styles.focado, erro && styles.comErro, style]}
      placeholderTextColor={colors.suave}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    alignSelf: 'stretch',
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: radius.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
    fontFamily: fonts.corpo,
    fontSize: 14,
    color: colors.tinta,
  },
  focado: { borderColor: colors.acento },
  comErro: { borderColor: colors.acento, backgroundColor: colors.erroFundo },
});
