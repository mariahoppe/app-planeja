import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { CartaoLocal } from './CartaoLocal';
import { Fotos } from './Fotos';

/**
 * Um dos quatro blocos da dica no detalhe (ex.: "Onde comer"), com as fotos dele
 * e, se houver, o card do local, que abre no Google Maps.
 * Bloco sem texto nem local não aparece, como no protótipo.
 * fotos: [{ chave, uri }], no formato da grade. cidade e pais: da dica, para a busca no mapa.
 */
export function BlocoDica({ rotulo, texto, local, cidade, pais, fotos }) {
  const temTexto = Boolean(texto?.trim());
  const temLocal = Boolean(local?.trim());
  if (!temTexto && !temLocal) return null;

  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      {temTexto ? <Text style={styles.texto}>{texto}</Text> : null}
      {fotos.length > 0 ? <Fotos fotos={fotos} /> : null}
      {temLocal ? <CartaoLocal local={local.trim()} cidade={cidade} pais={pais} /> : null}
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
