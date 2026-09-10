/**
 * ATOM — Button
 * Menor unidade clicável do app. Não conhece regra de negócio:
 * recebe um título e um onPress, e só sabe se desenhar.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';

export function Button({
  title,
  onPress,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  style,
}) {
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        style,
      ]}>
      {carregando ? (
        <ActivityIndicator color={variante === 'secundario' ? cores.primaria : '#FFFFFF'} />
      ) : (
        <Text style={[styles.texto, variante === 'secundario' && styles.textoSecundario]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: espacamentos.lg,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  perigo: { backgroundColor: cores.perigo },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.5 },
  texto: {
    color: '#FFFFFF',
    fontSize: tipografia.corpo,
    fontWeight: '600',
  },
  textoSecundario: { color: cores.primaria },
});
