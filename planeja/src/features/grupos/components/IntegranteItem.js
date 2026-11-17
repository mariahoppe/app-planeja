import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { colors, fonts } from '../../../config/theme';

/**
 * Uma linha da aba Integrantes: rosto, nome, e-mail e o papel.
 * onRemover: quando informado (só o criador vê), mostra o botão "Remover".
 */
export function IntegranteItem({ membro, ehCriador, ehVoce, onRemover, removendo }) {
  const usuario = membro.usuario || {};
  const papel = [ehCriador ? 'Criador' : null, ehVoce ? 'Você' : null].filter(Boolean).join(' · ');

  return (
    <View style={styles.linha}>
      <Avatar nome={usuario.nome} fotoUri={usuario.foto_url} tamanho={40} />
      <View style={styles.textos}>
        <Text style={styles.nome} numberOfLines={1}>
          {usuario.nome}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {usuario.email}
        </Text>
      </View>
      {papel ? <Text style={styles.papel}>{papel}</Text> : null}
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
  papel: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
  },
});
