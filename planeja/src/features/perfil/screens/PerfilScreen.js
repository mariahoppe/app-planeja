import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { capturarFoto, escolherImagem, obterPosicao } from '../../../services/nativos';
import { obterPerfilLocal, salvarFotoLocal, salvarLocalizacao } from '../../../services/perfilLocal';

function descreverLocal(localizacao) {
  if (!localizacao) {
    return 'Ainda não marcada';
  }
  if (localizacao.cidade || localizacao.pais) {
    return [localizacao.cidade, localizacao.pais].filter(Boolean).join(', ');
  }
  return 'Cidade não identificada';
}

function formatarCoordenadas(localizacao) {
  return `${localizacao.latitude.toFixed(5)}, ${localizacao.longitude.toFixed(5)}`;
}

/**
 * Nome e e-mail vêm da sessão (API). Foto e localização ficam só neste aparelho.
 * Cada permissão é pedida no toque do botão, pelo services/nativos.
 */
export function PerfilScreen({ navigation }) {
  const { usuario, sair } = useAuth();
  const [fotoUri, setFotoUri] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const [ocupado, setOcupado] = useState(null); // 'foto' | 'gps' | null
  const [erro, setErro] = useState(null);

  // Relê foto e localização sempre que a tela volta ao foco.
  useFocusEffect(
    useCallback(() => {
      obterPerfilLocal().then((local) => {
        setFotoUri(local.fotoUri);
        setLocalizacao(local.localizacao);
      });
    }, [])
  );

  // Liga o "carregando" do botão e transforma falha (ex.: permissão negada) em mensagem.
  async function executar(chave, acao) {
    setErro(null);
    setOcupado(chave);
    try {
      await acao();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(null);
    }
  }

  function trocarFoto(origem) {
    return executar('foto', async () => {
      const resultado = origem === 'camera' ? await capturarFoto() : await escolherImagem();
      if (!resultado) {
        return; // cancelou
      }
      await salvarFotoLocal(resultado.uri);
      setFotoUri(resultado.uri);
    });
  }

  function atualizarLocalizacao() {
    return executar('gps', async () => {
      const posicao = await obterPosicao();
      await salvarLocalizacao(posicao);
      setLocalizacao(posicao);
    });
  }

  return (
    <ScreenTemplate sobretitulo="Conta" titulo="Meu perfil" aoVoltar={() => navigation.goBack()}>
      <ErrorMessage mensagem={erro} />

      <View style={styles.topo}>
        <Avatar nome={usuario.nome} fotoUri={fotoUri} tamanho={96} />
      </View>
      <Button
        titulo="Tirar foto"
        bloco
        carregando={ocupado === 'foto'}
        desabilitado={ocupado !== null}
        onPress={() => trocarFoto('camera')}
      />
      <Button
        titulo="Escolher da galeria"
        bloco
        desabilitado={ocupado !== null}
        onPress={() => trocarFoto('galeria')}
      />

      <Card>
        <Text style={styles.rotulo}>Nome</Text>
        <Text style={styles.valor}>{usuario.nome}</Text>
        <Text style={styles.rotulo}>E-mail</Text>
        <Text style={styles.valor}>{usuario.email}</Text>
        <Text style={styles.rotulo}>Você está em</Text>
        <Text style={styles.valor}>{descreverLocal(localizacao)}</Text>
        {localizacao ? <Text style={styles.coordenadas}>{formatarCoordenadas(localizacao)}</Text> : null}
      </Card>
      <Button
        titulo="Atualizar localização"
        bloco
        carregando={ocupado === 'gps'}
        desabilitado={ocupado !== null}
        onPress={atualizarLocalizacao}
      />

      <Button titulo="Configurações" bloco onPress={() => navigation.navigate('Configuracoes')} />
      <Button titulo="Sair" bloco onPress={sair} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  topo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  valor: {
    fontFamily: fonts.corpo,
    fontSize: 15,
    color: colors.tinta,
  },
  coordenadas: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.suave,
  },
});
