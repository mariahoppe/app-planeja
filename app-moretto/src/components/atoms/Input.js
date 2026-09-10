/**
 * ATOM — Input
 * Envolve o TextInput do React Native aplicando o estilo padrão do app.
 * Todas as demais props (value, onChangeText, secureTextEntry...)
 * são repassadas com o spread, como no material da aula.
 */
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';

export function Input({ erro = false, style, ...props }) {
  const [focado, setFocado] = useState(false);

  return (
    <TextInput
      style={[styles.input, focado && styles.focado, erro && styles.comErro, style]}
      placeholderTextColor={cores.textoSecundario}
      onFocus={() => setFocado(true)}
      onBlur={() => setFocado(false)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
    fontSize: tipografia.corpo,
    color: cores.texto,
  },
  focado: { borderColor: cores.bordaFoco },
  comErro: { borderColor: cores.perigo },
});
