/**
 * SCREEN — FeedScreen (home do blog)
 */
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Label } from '../components/atoms/Label';
import { FeedList } from '../components/organisms/FeedList';
import { NewPostForm } from '../components/organisms/NewPostForm';
import { criarPostagem, listarFeed } from '../services/postagem';
import { logout, obterSessao } from '../services/auth';
import { cores, espacamentos } from '../theme';

export function FeedScreen({ navigation }) {
  const [postagens, setPostagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [erroPost, setErroPost] = useState(null);
  const [usuario, setUsuario] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('Usuarios')} style={styles.link}>
            <Label style={styles.linkTexto}>Seguir</Label>
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert('Sair', 'Encerrar sessão?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Sair',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                    navigation.replace('Login');
                  },
                },
              ]);
            }}
            style={styles.link}>
            <Label style={styles.linkTexto}>Sair</Label>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const [feed, sessao] = await Promise.all([listarFeed(), obterSessao()]);
      setPostagens(feed || []);
      setUsuario(sessao);
    } catch (e) {
      Alert.alert('Erro', e.message);
      if (e.status === 401) navigation.replace('Login');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const handlePublicar = useCallback(async texto => {
    setPublicando(true);
    setErroPost(null);
    try {
      await criarPostagem(texto);
      await carregar(true);
    } catch (e) {
      setErroPost(e.message);
    } finally {
      setPublicando(false);
    }
  }, [carregar]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    carregar(true);
  }, [carregar]);

  const handleAbrir = useCallback(
    item => navigation.navigate('Postagem', { id: item.id }),
    [navigation],
  );

  const cabecalho = useMemo(
    () => (
      <View>
        <Label variante="legenda" style={styles.saudacao}>
          Olá, {usuario?.nome || 'blogueiro'} — feed de quem você segue
        </Label>
        <NewPostForm
          onSubmit={handlePublicar}
          carregando={publicando}
          erro={erroPost}
        />
      </View>
    ),
    [usuario, handlePublicar, publicando, erroPost],
  );

  return (
    <View style={styles.flex}>
      <FeedList
        postagens={postagens}
        carregando={carregando}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onAbrir={handleAbrir}
        ListHeaderComponent={cabecalho}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
  saudacao: { marginBottom: espacamentos.md },
  headerActions: { flexDirection: 'row', gap: 12, marginRight: 4 },
  link: { paddingHorizontal: 4 },
  linkTexto: { color: '#FFFFFF', fontWeight: '600' },
});
