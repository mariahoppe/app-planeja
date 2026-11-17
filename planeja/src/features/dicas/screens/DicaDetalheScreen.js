import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { BlocoDica } from '../components/BlocoDica';
import { PainelAvaliar } from '../components/PainelAvaliar';
import { mesAno, paraGrade } from '../formatos';
import * as dicaService from '../services/dicaService';
import { BLOCOS } from '../validacao';

/**
 * Uma dica inteira: autor, os blocos preenchidos com as fotos e a avaliação do destino.
 * Só o autor vê "Editar" e "Excluir minha dica" (RF-11).
 * route.params.dica vem da lista, para a tela abrir na hora; a versão nova chega da API.
 */
export function DicaDetalheScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const toast = useToast();

  const [dica, setDica] = useState(route.params.dica);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState(null);
  const [avaliando, setAvaliando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const id = route.params.dica.id;
  const minha = dica.autor_id === usuario?.id;

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setDica(await dicaService.buscarPorId(id));
    } catch (e) {
      if (e.status === 404) setNaoEncontrada(true);
      else setErro(e.message);
    }
  }, [id]);

  // Recarrega ao abrir e ao voltar da edição.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function excluir() {
    try {
      setExcluindo(true);
      await dicaService.excluir(dica.id);
      toast('Dica excluída.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Não foi possível excluir', e.message);
      setExcluindo(false);
    }
  }

  function avaliacaoRegistrada() {
    setAvaliando(false);
    toast('Avaliação registrada. Ranking atualizado.');
  }

  if (naoEncontrada) {
    return (
      <ScreenTemplate titulo="Dica" aoVoltar={() => navigation.goBack()}>
        <EmptyState titulo="Dica não encontrada" mensagem="Ela pode ter sido excluída." />
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate
      sobretitulo={dica.pais}
      titulo={dica.cidade}
      aoVoltar={() => navigation.goBack()}
      direita={minha ? <Button titulo="Editar" pequeno onPress={() => navigation.navigate('DicaForm', { dica })} /> : null}
    >
      <EstadoCarga erro={erro} onTentarDeNovo={carregar} />

      <View style={styles.autor}>
        <Avatar nome={dica.autor?.nome} fotoUri={dica.autor?.foto_url} tamanho={28} />
        <View style={styles.autorTextos}>
          <Text style={styles.autorNome}>{dica.autor?.nome ?? 'Usuário'}</Text>
          <Text style={styles.autorData}>publicou em {mesAno(dica.createdAt)}</Text>
        </View>
      </View>

      {BLOCOS.map((b) => (
        <BlocoDica
          key={b.chave}
          rotulo={b.rotulo}
          texto={dica[b.chave]}
          fotos={paraGrade(dica.fotos.filter((f) => f.bloco === b.chave))}
        />
      ))}

      <Button titulo={`Avaliar custo-benefício de ${dica.cidade}`} bloco onPress={() => setAvaliando(true)} />
      {minha ? <Button titulo="Excluir minha dica" bloco carregando={excluindo} onPress={excluir} /> : null}

      {avaliando ? (
        <PainelAvaliar dica={dica} onFechar={() => setAvaliando(false)} onRegistrada={avaliacaoRegistrada} />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  autor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  autorTextos: { flex: 1 },
  autorNome: { fontFamily: fonts.tituloMedio, fontSize: 15, color: colors.tinta },
  autorData: { fontFamily: fonts.corpo, fontSize: 11, color: colors.suave },
});
