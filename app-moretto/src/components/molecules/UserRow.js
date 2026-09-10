/**
 * MOLECULE — UserRow
 * memo: ao seguir alguém, só esta linha (ou a que perdeu o spinner) redesenha.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export const UserRow = memo(function UserRow({
  usuario,
  onToggleSeguir,
  carregando = false,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Label variante="subtitulo">{usuario.nome}</Label>
        <Label variante="legenda">{usuario.login}</Label>
      </View>
      {usuario.sou_eu ? (
        <Label variante="legenda">Você</Label>
      ) : (
        <Button
          title={usuario.seguindo ? 'Seguindo' : 'Seguir'}
          variante={usuario.seguindo ? 'secundario' : 'primario'}
          onPress={() => onToggleSeguir(usuario)}
          carregando={carregando}
          style={styles.botao}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm,
    gap: espacamentos.sm,
  },
  info: { flex: 1 },
  botao: { minHeight: 40, paddingHorizontal: espacamentos.md },
});
