/**
 * SCREEN — PostDetailScreen
 * Lista virtualizada: header = post + formulário; data = respostas.
 */
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Label } from '../components/atoms/Label';
import { PostCard } from '../components/molecules/PostCard';
import { ReplyItem } from '../components/molecules/ReplyItem';
import { ReplyForm } from '../components/organisms/ReplyForm';
import { extrairChave, listaVirtualizada } from '../constants/lista';
import { buscarPostagem } from '../services/postagem';
import { criarResposta, listarRespostas } from '../services/resposta';
import { cores, espacamentos } from '../theme';

export function PostDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [postagem, setPostagem] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [post, lista] = await Promise.all([
        buscarPostagem(id),
        listarRespostas(id),
      ]);
      setPostagem(post);
      setRespostas(lista || []);
    } catch (e) {
      Alert.alert('Erro', e.message);
      if (e.status === 401) navigation.replace('Login');
    } finally {
      setCarregando(false);
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const handleResponder = useCallback(
    async texto => {
      setEnviando(true);
      setErro(null);
      try {
        await criarResposta(id, texto);
        await carregar();
      } catch (e) {
        setErro(e.message);
      } finally {
        setEnviando(false);
      }
    },
    [id, carregar],
  );

  const renderResposta = useCallback(
    ({ item }) => <ReplyItem resposta={item} />,
    [],
  );

  const cabecalho = useMemo(
    () => (
      <View>
        {postagem ? <PostCard postagem={postagem} /> : null}

        <Label variante="subtitulo" style={styles.tituloRespostas}>
          Respostas
        </Label>
        <Label variante="legenda" style={styles.dica}>
          Você só pode responder postagens suas ou de quem você segue.
        </Label>

        <ReplyForm onSubmit={handleResponder} carregando={enviando} erro={erro} />
      </View>
    ),
    [postagem, handleResponder, enviando, erro],
  );

  if (carregando && !postagem) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <FlatList
      data={respostas}
      keyExtractor={extrairChave}
      renderItem={renderResposta}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={
        <Label variante="legenda">Ainda não há respostas.</Label>
      }
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      {...listaVirtualizada}
    />
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
    flexGrow: 1,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  tituloRespostas: { marginBottom: espacamentos.xs },
  dica: { marginBottom: espacamentos.sm },
});
