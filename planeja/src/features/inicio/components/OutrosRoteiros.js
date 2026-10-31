import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { periodoCurto, STATUS_VIAGEM } from '../formatos';

/**
 * Carrossel horizontal com os demais roteiros (até 5, vindos do dashboard).
 * A rolagem vai de borda a borda da tela; "margem" compensa o recuo do conteúdo.
 */
export function OutrosRoteiros({ roteiros, onAbrir, margem }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -margem }}
      contentContainerStyle={[styles.trilho, { paddingHorizontal: margem }]}
    >
      {roteiros.map((r) => (
        <Pressable
          key={r.id}
          onPress={() => onAbrir(r)}
          accessibilityRole="button"
          accessibilityLabel={`Roteiro ${r.titulo}, ${r.destino?.cidade}`}
          style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
        >
          <Text style={styles.status}>{STATUS_VIAGEM[r.status]}</Text>
          <Text style={styles.cidade} numberOfLines={1}>
            {r.destino?.cidade}
          </Text>
          <Text style={styles.titulo} numberOfLines={1}>
            {r.titulo.trim()}
          </Text>
          <Text style={styles.periodo}>{periodoCurto(r.inicio, r.fim)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  trilho: { gap: 11 },
  cartao: {
    width: 190,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 16,
    padding: 15,
    gap: 3,
  },
  pressionado: { opacity: 0.85 },
  status: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
    marginBottom: 4,
  },
  cidade: { fontFamily: fonts.titulo, fontSize: 21, lineHeight: 26, color: colors.tinta },
  titulo: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  periodo: { fontFamily: fonts.mono, fontSize: 11.5, color: colors.tenue, marginTop: 6 },
});
