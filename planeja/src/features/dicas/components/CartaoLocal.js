import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, fonts } from '../../../config/theme';

// Busca do Google Maps por texto: funciona sem chave de API, no app do Maps
// (se estiver instalado) ou no navegador.
export function linkDoMapa(local, cidade, pais) {
  const busca = [local, cidade, pais].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
}

/**
 * O local de um bloco da dica (ex.: "Café de Flore"), num card que abre o
 * Google Maps buscando o lugar na cidade da dica.
 */
export function CartaoLocal({ local, cidade, pais }) {
  async function abrir() {
    try {
      await Linking.openURL(linkDoMapa(local, cidade, pais));
    } catch {
      Alert.alert('Não foi possível abrir o mapa', 'Tente de novo ou busque o local no Google Maps.');
    }
  }

  return (
    <Pressable
      onPress={abrir}
      accessibilityRole="link"
      accessibilityLabel={`${local}, ${cidade}. Abrir no Google Maps`}
      style={({ pressed }) => [styles.cartao, pressed && styles.tocado]}
    >
      <View style={styles.pino}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.acento} strokeWidth={1.8}>
          <Path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
          <Circle cx={12} cy={10} r={2.4} />
        </Svg>
      </View>
      <View style={styles.textos}>
        <Text style={styles.local} numberOfLines={2}>
          {local}
        </Text>
        <Text style={styles.abrir}>Abrir no Google Maps ›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.linha,
    backgroundColor: colors.papel,
  },
  tocado: { backgroundColor: colors.linhaTocada },
  pino: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.acentoSuave,
  },
  textos: { flex: 1, gap: 2 },
  local: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  abrir: { fontFamily: fonts.corpoSemi, fontSize: 12, color: colors.acento },
});
