/**
 * ORGANISM — FeedList
 * Lista virtualizada. Ver listas_renderizacao_desempenho.md
 */
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { extrairChave, listaVirtualizada } from '../../constants/lista';
import { cores, espacamentos } from '../../theme';
import { Label } from '../atoms/Label';
import { PostCard } from '../molecules/PostCard';

export function FeedList({
  postagens,
  carregando,
  onRefresh,
  refreshing,
  onAbrir,
  ListHeaderComponent,
}) {
  const renderItem = useCallback(
    ({ item }) => <PostCard postagem={item} onPress={onAbrir} />,
    [onAbrir],
  );

  if (carregando && (!postagens || postagens.length === 0)) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      data={postagens}
      keyExtractor={extrairChave}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <Label variante="legenda" style={styles.vazio}>
          Nenhuma postagem no feed. Siga usuários ou publique a primeira!
        </Label>
      }
      contentContainerStyle={styles.lista}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      {...listaVirtualizada}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espacamentos.lg, paddingBottom: espacamentos.xl },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
});
