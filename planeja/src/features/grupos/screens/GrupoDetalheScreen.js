import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { periodoCurto, STATUS_VIAGEM } from '../../inicio/formatos';
import { AbaDespesas } from '../components/AbaDespesas';
import { IntegranteItem } from '../components/IntegranteItem';
import { nomeViagem, rotuloIntegrantes } from '../formatos';
import * as grupoService from '../services/grupoService';

const ABAS = [
  { valor: 'viagem', rotulo: 'Viagem' },
  { valor: 'integrantes', rotulo: 'Integrantes' },
  { valor: 'despesas', rotulo: 'Despesas' },
];

/**
 * Tela do grupo (RF-19 e RF-20), com as abas do protótipo:
 * - Viagem: a viagem vinculada (abre o roteiro, que todos do grupo podem editar) e o código de convite.
 * - Integrantes: quem está no grupo; o criador pode remover pessoas.
 * - Despesas: o que cada um pagou (RF-21, RF-22 e RF-25).
 * O criador renomeia ("Editar") e exclui o grupo; os demais podem sair dele.
 */
export function GrupoDetalheScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useAuth();
  const toast = useToast();

  const [grupo, setGrupo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aba, setAba] = useState('viagem');
  const [ocupado, setOcupado] = useState(null); // 'sair', 'excluir' ou o id de quem está sendo removido

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setGrupo(await grupoService.buscarPorId(id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  // Recarrega ao voltar (ex.: depois de renomear o grupo ou editar o roteiro).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const voltar = () => navigation.goBack();

  if (!grupo) {
    return (
      <ScreenTemplate sobretitulo="Viagens em grupo" titulo="Grupo" aoVoltar={voltar}>
        <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={carregar} />
      </ScreenTemplate>
    );
  }

  const souAdmin = grupo.sou_admin;
  const membros = grupo.membros || [];
  const viagem = nomeViagem(grupo.roteiro);

  async function compartilhar() {
    try {
      await Share.share({
        message: `Entre no grupo "${grupo.nome}" no Planeja: na aba Grupos, use o código ${grupo.codigo_convite}.`,
      });
    } catch {
      // Fechar o menu de compartilhar não é erro; nada a fazer.
    }
  }

  function confirmar(titulo, mensagem, rotulo, acao) {
    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: rotulo, style: 'destructive', onPress: acao },
    ]);
  }

  async function executar(chave, acao, aviso) {
    try {
      setOcupado(chave);
      await acao();
      if (aviso) toast(aviso);
      return true;
    } catch (e) {
      Alert.alert('Não foi possível concluir', e.message);
      return false;
    } finally {
      setOcupado(null);
    }
  }

  const excluir = () =>
    confirmar(
      'Excluir grupo?',
      `"${grupo.nome}" e todas as despesas dele serão apagados para todos os integrantes. A viagem continua sendo sua. Não dá para desfazer.`,
      'Excluir',
      async () => {
        if (await executar('excluir', () => grupoService.excluir(grupo.id), 'Grupo excluído.')) voltar();
      }
    );

  const sair = () =>
    confirmar(
      'Sair do grupo?',
      'Você deixa de ver a viagem e as despesas. O que você já lançou continua valendo para o grupo.',
      'Sair',
      async () => {
        if (await executar('sair', () => grupoService.sair(grupo.id), `Você saiu de ${grupo.nome}.`)) voltar();
      }
    );

  const remover = (membro) =>
    confirmar(
      'Remover integrante?',
      `${membro.usuario?.nome} deixa de ver a viagem e as despesas. O que já foi lançado continua valendo.`,
      'Remover',
      async () => {
        const ok = await executar(
          membro.usuario_id,
          () => grupoService.removerIntegrante(grupo.id, membro.usuario_id),
          `${membro.usuario?.nome} foi removido.`
        );
        if (ok) carregar();
      }
    );

  return (
    <ScreenTemplate
      sobretitulo={viagem ? `Grupo · Viagem ${viagem}` : 'Grupo'}
      titulo={grupo.nome}
      aoVoltar={voltar}
      direita={
        souAdmin ? (
          <Button titulo="Editar" pequeno onPress={() => navigation.navigate('GrupoForm', { grupo })} />
        ) : null
      }
    >
      <SeletorSegmentado opcoes={ABAS} valor={aba} onChange={setAba} />

      {aba === 'viagem' ? (
        <>
          {grupo.roteiro ? (
            <Card onPress={() => navigation.navigate('RoteiroDetalhe', { roteiro: grupo.roteiro })}>
              <Text style={styles.rotulo}>Viagem do grupo</Text>
              <Text style={styles.viagemTitulo}>{grupo.roteiro.titulo}</Text>
              <Text style={styles.sub}>
                {[grupo.roteiro.destino?.cidade, grupo.roteiro.destino?.pais].filter(Boolean).join(', ')}
                {grupo.roteiro.inicio ? ` · ${periodoCurto(grupo.roteiro.inicio, grupo.roteiro.fim)}` : ''}
              </Text>
              <View style={styles.linhaCard}>
                <Text style={styles.status}>{STATUS_VIAGEM[grupo.roteiro.status] ?? grupo.roteiro.status}</Text>
                <Text style={styles.abrir}>Abrir roteiro ›</Text>
              </View>
            </Card>
          ) : null}

          <Card>
            <Text style={styles.rotulo}>Código de convite</Text>
            <View style={styles.linhaCard}>
              <Text style={styles.codigo} selectable accessibilityLabel={`Código ${grupo.codigo_convite.split('').join(' ')}`}>
                {grupo.codigo_convite}
              </Text>
              <Button titulo="Compartilhar" pequeno onPress={compartilhar} />
            </View>
            <Text style={styles.sub}>Quem tiver o código entra pela aba Grupos e passa a ver e editar a viagem.</Text>
          </Card>

          {souAdmin ? (
            <Button titulo="Excluir grupo" bloco carregando={ocupado === 'excluir'} onPress={excluir} />
          ) : (
            <Button titulo="Sair do grupo" bloco carregando={ocupado === 'sair'} onPress={sair} />
          )}
        </>
      ) : null}

      {aba === 'integrantes' ? (
        <View>
          <Text style={styles.rotulo}>{rotuloIntegrantes(membros.length)}</Text>
          {membros.map((m) => {
            const ehCriador = m.usuario_id === grupo.criador_id;
            return (
              <IntegranteItem
                key={m.usuario_id}
                membro={m}
                ehCriador={ehCriador}
                ehVoce={m.usuario_id === usuario?.id}
                onRemover={souAdmin && !ehCriador ? () => remover(m) : undefined}
                removendo={ocupado === m.usuario_id}
              />
            );
          })}
        </View>
      ) : null}

      {aba === 'despesas' ? (
        <AbaDespesas grupo={grupo} usuarioId={usuario?.id} navigation={navigation} />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  viagemTitulo: { fontFamily: fonts.titulo, fontSize: 18, color: colors.tinta },
  sub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  linhaCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  status: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
  },
  abrir: { fontFamily: fonts.corpoSemi, fontSize: 13, color: colors.acento },
  codigo: { fontFamily: fonts.monoForte, fontSize: 26, letterSpacing: 4, color: colors.tinta },
});
