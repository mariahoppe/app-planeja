import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../../config/theme';

/**
 * Botão padrão do Planeja.
 * variante: 'primario' (ação principal da tela) ou 'secundario' (demais ações).
 * bloco: ocupa toda a largura disponível.
 * pequeno: versão compacta, para cabeçalhos e títulos de seção.
 * carregando: troca o texto por um indicador e bloqueia o toque (ex.: enquanto a API responde).
 * desabilitado: bloqueia o toque.
 */
export function Button({
  titulo,
  onPress,
  variante = 'secundario',
  bloco = false,
  pequeno = false,
  carregando = false,
  desabilitado = false,
  style,
}) {
  const primario = variante === 'primario';
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        pequeno && styles.pequeno,
        bloco && styles.bloco,
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={primario ? colors.branco : colors.tinta} />
      ) : (
        <Text style={[styles.texto, primario && styles.textoPrimario, pequeno && styles.textoPequeno]}>
          {titulo}
        </Text>
      )}
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
  inativo: {
    opacity: 0.5,
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
