import { StyleSheet, Text, View } from 'react-native';

import { Input } from '../atoms/Input';
import { colors, fonts } from '../../config/theme';

/**
 * Campo de formulário: rótulo em cima, campo no meio e, embaixo, a mensagem de
 * erro ou a dica. As demais props (value, onChangeText, placeholder...) vão para o Input.
 * dica: texto de apoio, exibido quando não há erro.
 * erro: mensagem de validação; quando presente, substitui a dica e destaca o campo.
 * children: outro controle no lugar do Input (ex.: seletor, área de texto).
 */
export function FormField({ label, dica, erro, children, style, ...props }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      {children ?? <Input erro={Boolean(erro)} accessibilityLabel={label} {...props} />}
      {erro ? <Text style={styles.erro}>{erro}</Text> : dica ? <Text style={styles.dica}>{dica}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: 5,
  },
  label: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.suave,
  },
  dica: {
    fontFamily: fonts.corpo,
    fontSize: 11,
    color: colors.tenue,
  },
  erro: {
    fontFamily: fonts.corpoSemi,
    fontSize: 11,
    color: colors.acento,
  },
});
