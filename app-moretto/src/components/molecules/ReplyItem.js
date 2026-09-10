/**
 * MOLECULE — ReplyItem
 * memo: o formulário de resposta pode re-renderizar sem redesenhar cada item.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export const ReplyItem = memo(function ReplyItem({ resposta }) {
  const autor = resposta?.usuarioResposta?.nome || 'Usuário';

  return (
    <View style={styles.item}>
      <Label variante="subtitulo" style={styles.autor}>
        {autor}
      </Label>
      <Label>{resposta?.resposta}</Label>
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    backgroundColor: cores.superficie,
    borderLeftWidth: 3,
    borderLeftColor: cores.primaria,
    borderRadius: raios.sm,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm,
  },
  autor: { marginBottom: espacamentos.xs, fontSize: 15 },
});
