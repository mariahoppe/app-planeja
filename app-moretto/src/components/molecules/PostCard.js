/**
 * MOLECULE — PostCard
 * memo: o card só redesenha se postagem / onPress / acoes mudarem.
 * onPress recebe a postagem — um callback estável serve para toda a lista.
 */
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export const PostCard = memo(function PostCard({ postagem, onPress, acoes }) {
  const autor = postagem?.usuario?.nome || 'Usuário';
  const login = postagem?.usuario?.login || '';

  return (
    <Pressable
      onPress={onPress ? () => onPress(postagem) : undefined}
      style={styles.card}>
      <Label variante="subtitulo">{autor}</Label>
      {login ? (
        <Label variante="legenda" style={styles.login}>
          {login}
        </Label>
      ) : null}
      <Label style={styles.texto}>{postagem?.postagem}</Label>
      {acoes ? <View style={styles.acoes}>{acoes}</View> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  login: { marginBottom: espacamentos.sm },
  texto: { marginTop: espacamentos.xs },
  acoes: { marginTop: espacamentos.md },
});
