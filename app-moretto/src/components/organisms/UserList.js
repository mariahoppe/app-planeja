/**
 * ORGANISM — UserList
 * extraData avisa a lista quando o spinner de uma linha muda.
 * Ver listas_renderizacao_desempenho.md
 */
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { extrairChave, listaVirtualizada } from '../../constants/lista';
import { cores, espacamentos } from '../../theme';
import { Label } from '../atoms/Label';
import { UserRow } from '../molecules/UserRow';

export function UserList({
  usuarios,
  carregando,
  idCarregando,
  onToggleSeguir,
  onRefresh,
  refreshing,
}) {
  const renderItem = useCallback(
    ({ item }) => (
      <UserRow
        usuario={item}
        onToggleSeguir={onToggleSeguir}
        carregando={idCarregando === item.id}
      />
    ),
    [onToggleSeguir, idCarregando],
  );

  if (carregando && (!usuarios || usuarios.length === 0)) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      data={usuarios}
      extraData={idCarregando}
      keyExtractor={extrairChave}
      renderItem={renderItem}
      ListEmptyComponent={
        <Label variante="legenda" style={styles.vazio}>
          Nenhum usuário encontrado.
        </Label>
      }
      contentContainerStyle={styles.lista}
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...listaVirtualizada}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espacamentos.lg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
});
