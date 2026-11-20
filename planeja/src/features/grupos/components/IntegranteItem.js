import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { colors, fonts } from '../../../config/theme';

/**
 * Uma linha da aba Integrantes, como no protótipo: rosto, "Nome (você)", e-mail
 * e a etiqueta "admin" no criador do grupo.
 * onRemover: quando informado (só o criador vê), mostra o botão "Remover".
 */
export function IntegranteItem({ membro, ehCriador, ehVoce, onRemover, removendo }) {
  const usuario = membro.usuario || {};

  return (
    <View style={styles.linha}>
      <Avatar nome={usuario.nome} fotoUri={usuario.foto_url} tamanho={40} />
      <View style={styles.textos}>
        <Text style={styles.nome} numberOfLines={1}>
          {usuario.nome}
          {ehVoce ? <Text style={styles.voce}> (você)</Text> : null}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {usuario.email}
        </Text>
      </View>
      {ehCriador ? <Text style={styles.papel}>admin</Text> : null}
      {onRemover ? <Button titulo="Remover" pequeno carregando={removendo} onPress={onRemover} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  textos: { flex: 1, gap: 2 },
  nome: { fontFamily: fonts.corpoSemi, fontSize: 15, color: colors.tinta },
  email: { fontFamily: fonts.corpo, fontSize: 12.5, color: colors.suave },
  voce: { fontFamily: fonts.corpo, color: colors.suave },
  // A etiqueta .tag.acc do protótipo
  papel: {
    fontFamily: fonts.corpoForte,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.acento,
    backgroundColor: colors.acentoSuave,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
