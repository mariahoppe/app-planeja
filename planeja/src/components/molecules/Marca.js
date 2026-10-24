import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../config/theme';

const TRACO = 1.8;

export function Marca({ sub }) {
  return (
    <View style={styles.container}>
      <View style={styles.globo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.equador} />
        <View style={styles.meridiano} />
      </View>
      <Text style={styles.nome} accessibilityRole="header">
        planeja
      </Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },
  globo: {
    width: 44,
    height: 44,
    borderWidth: TRACO,
    borderColor: colors.acento,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equador: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACO,
    backgroundColor: colors.acento,
  },
  meridiano: {
    position: 'absolute',
    top: -TRACO / 2,
    bottom: -TRACO / 2,
    width: 18,
    borderWidth: TRACO,
    borderColor: colors.acento,
    borderRadius: '50%',
  },
  nome: {
    fontFamily: fonts.titulo,
    fontSize: 31,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: colors.tinta,
  },
  sub: {
    fontFamily: fonts.corpoSemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.suave,
  },
});
