import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { Fotos } from './Fotos';

/**
 * Um dos quatro blocos da dica no detalhe (ex.: "Onde comer"), com as fotos dele.
 * Bloco sem texto não aparece, como no protótipo.
 * fotos: [{ chave, uri }], no formato da grade.
 */
export function BlocoDica({ rotulo, texto, fotos }) {
  if (!texto?.trim()) return null;

  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
      {fotos.length > 0 ? <Fotos fotos={fotos} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: {
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.acento,
    marginBottom: 5,
  },
  texto: { fontFamily: fonts.corpo, fontSize: 13.5, lineHeight: 20, color: colors.tintaSuave },
});
