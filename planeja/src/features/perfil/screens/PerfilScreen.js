import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { obterPosicao, reduzirFotoPerfil } from '../../../services/nativos';
import { obterLocalizacao, salvarLocalizacao } from '../../../services/perfilLocal';
import * as authService from '../../auth/services/authService';
import { PainelEditarPerfil } from '../components/PainelEditarPerfil';
import { PainelTrocarSenha } from '../components/PainelTrocarSenha';

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
 * Nome, e-mail e foto vêm da sessão (API). A localização fica só neste aparelho.
 * Cada permissão é pedida no toque do botão, pelo services/nativos.
 */
export function PerfilScreen({ navigation }) {
  const { usuario, atualizarPerfil, sair } = useAuth();
  const toast = useToast();

  const [localizacao, setLocalizacao] = useState(null);
  const [painel, setPainel] = useState(null); // 'editar' | 'senha' | null
  const [salvando, setSalvando] = useState(false);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erro, setErro] = useState(null);

  // Relê a localização sempre que a tela volta ao foco.
  useFocusEffect(
    useCallback(() => {
      obterLocalizacao().then(setLocalizacao);
    }, [])
  );

  // Manda só o que mudou, tudo de uma vez. foto_url null = voltar a usar a inicial.
  async function salvarPerfil({ nome, fotoUri }) {
    try {
      setSalvando(true);
      const dados = {};
      if (nome !== usuario.nome) dados.nome = nome;
      if (fotoUri !== usuario.foto_url) dados.foto_url = fotoUri ? await reduzirFotoPerfil(fotoUri) : null;
      if (Object.keys(dados).length > 0) await atualizarPerfil(dados);
      setPainel(null);
      toast('Perfil atualizado.');
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha({ senhaAtual, novaSenha }) {
    try {
      setSalvando(true);
      await authService.trocarSenha(senhaAtual, novaSenha);
      setPainel(null);
      toast('Senha alterada.');
    } catch (e) {
      Alert.alert('Não foi possível trocar a senha', e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function atualizarLocalizacao() {
    setErro(null);
    setBuscandoLocal(true);
    try {
      const posicao = await obterPosicao();
      await salvarLocalizacao(posicao);
      setLocalizacao(posicao);
    } catch (e) {
      setErro(e.message);
    } finally {
      setBuscandoLocal(false);
    }
  }

  return (
    <ScreenTemplate
      sobretitulo="Conta"
      titulo="Meu perfil"
      aoVoltar={() => navigation.goBack()}
      direita={<Button titulo="Editar" pequeno onPress={() => setPainel('editar')} />}
    >
      <ErrorMessage mensagem={erro} />

      <Card style={styles.usuario}>
        <Avatar nome={usuario.nome} fotoUri={usuario.foto_url} tamanho={52} />
        <View style={styles.usuarioTextos}>
          <Text style={styles.nome}>{usuario.nome}</Text>
          <Text style={styles.email}>{usuario.email}</Text>
        </View>
      </Card>

      <Text style={styles.secao}>Segurança</Text>
      <Button titulo="Trocar senha" bloco onPress={() => setPainel('senha')} />
      <Button titulo="Sair da conta" bloco onPress={sair} />

      <Text style={styles.secao}>Aparelho</Text>
      <Card>
        <Text style={styles.rotulo}>Você está em</Text>
        <Text style={styles.valor}>{descreverLocal(localizacao)}</Text>
        {localizacao ? <Text style={styles.coordenadas}>{formatarCoordenadas(localizacao)}</Text> : null}
      </Card>
      <Button titulo="Atualizar localização" bloco carregando={buscandoLocal} onPress={atualizarLocalizacao} />
      <Button titulo="Configurações" bloco onPress={() => navigation.navigate('Configuracoes')} />

      {painel === 'editar' ? (
        <PainelEditarPerfil
          usuario={usuario}
          onSalvar={salvarPerfil}
          onFechar={() => setPainel(null)}
          carregando={salvando}
        />
      ) : null}

      {painel === 'senha' ? (
        <PainelTrocarSenha onConfirmar={trocarSenha} onFechar={() => setPainel(null)} carregando={salvando} />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  usuario: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 13 },
  usuarioTextos: { flex: 1, minWidth: 0 },
  nome: { fontFamily: fonts.titulo, fontSize: 17, lineHeight: 21, color: colors.tinta },
  email: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
    color: colors.suave,
  },
  secao: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: -2,
    color: colors.tenue,
  },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  valor: { fontFamily: fonts.corpo, fontSize: 15, color: colors.tinta },
  coordenadas: { fontFamily: fonts.mono, fontSize: 12, color: colors.suave },
});
