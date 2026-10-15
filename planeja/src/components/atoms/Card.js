import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../config/theme';

/**
 * Card padrão do Planeja: caixa de borda fina para itens de lista e blocos de conteúdo.
 * onPress: quando informado, o card é tocável (ex.: abre o detalhe do item).
 */
export function Card({ children, onPress, style }) {
  const pressable = Boolean(onPress);

  return pressable ? (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressionado, style]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 7,
  },
  pressionado: {
    opacity: 0.85,
  },
});
