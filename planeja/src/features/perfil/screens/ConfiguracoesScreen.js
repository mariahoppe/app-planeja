import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import {
  configurarNotificacoes,
  enviarAvisoLocal,
  pedirPermissaoNotificacao,
  statusPermissoes,
} from '../../../services/nativos';
import { obterPreferencias, salvarPreferencias } from '../../../services/preferencias';

function rotuloPermissao(status) {
  if (status === 'granted') return 'concedida';
  if (status === 'denied') return 'negada';
  if (status === 'undetermined') return 'ainda não pedida';
  if (status === 'indisponivel') return 'indisponível';
  return '—';
}

/**
 * Preferências gravadas no aparelho (sobrevivem ao logout), situação de cada
 * permissão e um aviso local de teste. Ligar "Notificações" já pede a permissão.
 */
export function ConfiguracoesScreen({ navigation }) {
  const [preferencias, setPreferencias] = useState(null);
  const [permissoes, setPermissoes] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    configurarNotificacoes();
    obterPreferencias().then(setPreferencias);
  }, []);

  const atualizarPermissoes = useCallback(() => {
    statusPermissoes()
      .then(setPermissoes)
      .catch(() => setPermissoes(null));
  }, []);

  // Relê ao voltar para a tela: a pessoa pode ter mudado a permissão nos Ajustes do sistema.
  useFocusEffect(atualizarPermissoes);

  async function mudarNotificacoes(ligar) {
    setErro(null);
    setPreferencias((atuais) => ({ ...atuais, notificacoes: ligar }));
    if (ligar) {
      const permitido = await pedirPermissaoNotificacao().catch(() => false);
      atualizarPermissoes();
      if (!permitido) {
        setPreferencias((atuais) => ({ ...atuais, notificacoes: false }));
        await salvarPreferencias({ notificacoes: false });
        setErro('Permissão de notificação negada. Libere nos ajustes do aparelho.');
        return;
      }
    }
    await salvarPreferencias({ notificacoes: ligar });
  }

  async function mudarModoEscuro(ligar) {
    setPreferencias((atuais) => ({ ...atuais, modoEscuro: ligar }));
    await salvarPreferencias({ modoEscuro: ligar });
  }

  async function testarAviso() {
    setErro(null);
    setEnviando(true);
    try {
      await enviarAvisoLocal({
        titulo: 'Planeja',
        corpo: 'Os lembretes de viagem estão ligados.',
      });
      Alert.alert('Aviso agendado', 'Em alguns segundos ele aparece na barra de notificações.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
      atualizarPermissoes();
    }
  }

  const opcoes = [
    {
      id: 'notificacoes',
      titulo: 'Notificações',
      descricao: 'Avisos locais do Planeja, gerados pelo próprio aparelho.',
      aoMudar: mudarNotificacoes,
    },
    {
      id: 'modoEscuro',
      titulo: 'Modo escuro',
      descricao: 'Preferência já é gravada; o tema escuro ainda não foi aplicado.',
      aoMudar: mudarModoEscuro,
    },
  ];

  const linhasPermissao = [
    { rotulo: 'Câmera', status: permissoes?.camera },
    { rotulo: 'Galeria', status: permissoes?.galeria },
    { rotulo: 'Localização', status: permissoes?.localizacao },
    { rotulo: 'Notificações', status: permissoes?.notificacoes },
  ];

  return (
    <ScreenTemplate sobretitulo="Conta" titulo="Configurações" aoVoltar={() => navigation.goBack()}>
      <ErrorMessage mensagem={erro} />

      <Text style={styles.secao}>Preferências</Text>
      <Card>
        {opcoes.map((opcao) => (
          <View key={opcao.id} style={styles.linha}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>{opcao.titulo}</Text>
              <Text style={styles.descricao}>{opcao.descricao}</Text>
            </View>
            <Switch
              value={preferencias?.[opcao.id] ?? false}
              onValueChange={opcao.aoMudar}
              disabled={!preferencias}
              trackColor={{ true: colors.acento, false: colors.linha }}
              thumbColor={colors.branco}
            />
          </View>
        ))}
      </Card>
      {preferencias?.notificacoes ? (
        <Button titulo="Testar aviso" bloco carregando={enviando} onPress={testarAviso} />
      ) : null}

      <Text style={styles.secao}>Permissões</Text>
      <Card>
        <Text style={styles.descricao}>O aparelho pergunta na hora do uso, não na abertura do app.</Text>
        {linhasPermissao.map((linha) => (
          <View key={linha.rotulo} style={styles.linhaPermissao}>
            <Text style={styles.titulo}>{linha.rotulo}</Text>
            <Text style={styles.status}>{rotuloPermissao(linha.status)}</Text>
          </View>
        ))}
      </Card>
      <Button titulo="Atualizar status" bloco onPress={atualizarPermissoes} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  secao: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tenue,
    marginTop: 4,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontFamily: fonts.corpoSemi,
    fontSize: 15,
    color: colors.tinta,
  },
  descricao: {
    fontFamily: fonts.corpo,
    fontSize: 12.5,
    color: colors.suave,
  },
  linhaPermissao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  status: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.suave,
  },
});
