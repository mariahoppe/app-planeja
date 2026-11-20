import { StyleSheet, Text } from 'react-native';

import { colors, fonts, radius } from '../../config/theme';

const TIPOS = {
  neutro: { color: colors.suave, backgroundColor: colors.neutroFundo },
  acento: { color: colors.acento, backgroundColor: colors.acentoSuave },
  ok: { color: colors.ok, backgroundColor: colors.okSuave },
  aviso: { color: colors.aviso, backgroundColor: colors.avisoFundo },
};

/**
 * Etiqueta pequena em maiúsculas, o .tag do protótipo (ex.: "admin", "em grupo",
 * "confirmada", "poucas avaliações").
 * tipo: neutro (padrão), acento, ok ou aviso. children: o texto.
 */
export function Etiqueta({ tipo = 'neutro', style, children }) {
  return (
    <Text style={[styles.etiqueta, TIPOS[tipo] ?? TIPOS.neutro, style]} numberOfLines={1}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    fontFamily: fonts.corpoForte,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.etiqueta,
    overflow: 'hidden', // sem isso o fundo não arredonda no iOS
  },
});
