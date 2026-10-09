import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../../config/theme';

/**
 * Botão padrão do Planeja.
 * variante: 'primario' (ação principal da tela) ou 'secundario' (demais ações).
 * bloco: ocupa toda a largura disponível.
 * pequeno: versão compacta, para cabeçalhos e títulos de seção.
 */
export default function Button({ titulo, onPress, variante = 'secundario', bloco = false, pequeno = false }) {
  const primario = variante === 'primario';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        pequeno && styles.pequeno,
        bloco && styles.bloco,
        pressed && styles.pressionado,
      ]}
    >
      <Text style={[styles.texto, primario && styles.textoPrimario, pequeno && styles.textoPequeno]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    backgroundColor: colors.acento,
    borderColor: colors.acento,
  },
  secundario: {
    backgroundColor: colors.branco,
    borderColor: colors.linha,
  },
  pequeno: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bloco: {
    alignSelf: 'stretch',
  },
  pressionado: {
    opacity: 0.85,
  },
  texto: {
    fontFamily: fonts.corpoSemi,
    fontSize: 13.5,
    color: colors.tinta,
  },
  textoPrimario: {
    color: colors.branco,
  },
  textoPequeno: {
    fontSize: 12,
  },
});
