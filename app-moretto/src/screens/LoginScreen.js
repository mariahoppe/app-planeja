/**
 * SCREEN — LoginScreen
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { LoginForm } from '../components/organisms/LoginForm';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { login, sessaoAtiva } from '../services/auth';
import { cores, espacamentos } from '../theme';

export function LoginScreen({ navigation }) {
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      const temSessao = await sessaoAtiva();
      if (!ativo) return;
      if (temSessao) {
        navigation.replace('Feed');
      } else {
        setVerificandoSessao(false);
      }
    }

    verificarSessao();
    return () => {
      ativo = false;
    };
  }, [navigation]);

  async function handleLogin(email, senha) {
    setCarregando(true);
    setErro(null);
    try {
      await login(email, senha);
      navigation.replace('Feed');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  if (verificandoSessao) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Label variante="legenda" style={styles.splashTexto}>
          Verificando sessão...
        </Label>
      </View>
    );
  }

  return (
    <CenteredTemplate
      cabecalho={
        <View>
          <Label style={styles.logo}>📝</Label>
          <Label variante="titulo">Blog</Label>
          <Label variante="legenda" style={styles.subtitulo}>
            Entre para ler, publicar e seguir pessoas
          </Label>
        </View>
      }
      rodape={
        <Button
          title="Criar conta"
          variante="secundario"
          onPress={() => navigation.navigate('Cadastro')}
        />
      }>
      <LoginForm onSubmit={handleLogin} carregando={carregando} erro={erro} />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  splashTexto: { marginTop: espacamentos.md },
  logo: { fontSize: 48, marginBottom: espacamentos.sm },
  subtitulo: { marginTop: espacamentos.xs },
});
