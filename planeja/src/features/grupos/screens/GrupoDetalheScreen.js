import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { PainelInferior } from '../../../components/molecules/PainelInferior';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import * as atividadeService from '../../atividades/services/atividadeService';
import { periodoCurto, STATUS_VIAGEM } from '../../inicio/formatos';
import { AbaDespesas } from '../components/AbaDespesas';
import { IntegranteItem } from '../components/IntegranteItem';
import { moeda, nomeViagem, rotuloIntegrantes } from '../formatos';
import * as grupoService from '../services/grupoService';

// Quantas atividades a aba Viagem mostra em "Atividades recentes", como no protótipo
const ATIVIDADES_NA_ABA = 4;

const ABAS = [
  { valor: 'viagem', rotulo: 'Viagem' },
  { valor: 'integrantes', rotulo: 'Integrantes' },
  { valor: 'despesas', rotulo: 'Despesas' },
];

/**
 * Tela do grupo (RF-19 e RF-20), com as abas do protótipo (abre em Despesas):
 * - Viagem: a viagem vinculada (abre o roteiro, que todos do grupo podem editar)
 *   e as primeiras atividades dela.
 * - Integrantes: quem está no grupo, o convite por código (RF-18); o criador
 *   remove pessoas e exclui o grupo, os demais podem sair.
 * - Despesas: o que cada um pagou (RF-21, RF-22 e RF-25).
 * O criador também renomeia o grupo ("Editar", fora da aba Despesas).
 */
export function GrupoDetalheScreen({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useAuth();
  const toast = useToast();

  const [grupo, setGrupo] = useState(null);
  const [atividades, setAtividades] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aba, setAba] = useState(route.params?.aba ?? 'despesas');
  const [convidando, setConvidando] = useState(false);
  const [ocupado, setOcupado] = useState(null); // 'sair', 'excluir' ou o id de quem está sendo removido

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const dados = await grupoService.buscarPorId(id);
      setGrupo(dados);
      // As atividades só enfeitam a aba Viagem: se falharem, a tela segue sem elas.
      if (dados.roteiro) {
        atividadeService.listar(dados.roteiro.id).then(setAtividades, () => setAtividades([]));
      }
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

  async function copiarCodigo() {
    await Clipboard.setStringAsync(grupo.codigo_convite);
    setConvidando(false);
    toast('Código copiado.');
  }

  const novaDespesa = () => navigation.navigate('DespesaForm', { grupo });

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
        aba === 'despesas' ? (
          <Button titulo="+ Despesa" variante="primario" pequeno onPress={novaDespesa} />
        ) : souAdmin ? (
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

          <Text style={styles.nota}>
            Todos os integrantes podem inserir e editar o roteiro, as atividades e as despesas desta viagem.
          </Text>

          {grupo.roteiro ? (
            <View>
              <Text style={styles.rotulo}>Atividades recentes</Text>
              {atividades === null ? (
                <EstadoCarga carregando />
              ) : atividades.length === 0 ? (
                <Text style={styles.vazio}>Nenhuma atividade no roteiro ainda.</Text>
              ) : (
                atividades.slice(0, ATIVIDADES_NA_ABA).map((a) => (
                  <View key={a.id} style={styles.atividade}>
                    <View style={styles.atividadeTextos}>
                      <Text style={styles.atividadeTitulo} numberOfLines={1}>{a.titulo}</Text>
                      <Text style={styles.sub}>
                        Dia {a.dia}{a.horario ? ` · ${String(a.horario).slice(0, 5)}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.atividadeCusto}>{Number(a.custo) ? moeda(a.custo) : 'grátis'}</Text>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </>
      ) : null}

      {aba === 'integrantes' ? (
        <>
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

          <Button titulo="Convidar integrantes" variante="primario" bloco onPress={() => setConvidando(true)} />
          {souAdmin ? (
            <Button titulo="Excluir grupo" bloco carregando={ocupado === 'excluir'} onPress={excluir} />
          ) : (
            <Button titulo="Sair do grupo" bloco carregando={ocupado === 'sair'} onPress={sair} />
          )}
        </>
      ) : null}

      {convidando ? (
        <PainelInferior
          titulo="Código de convite"
          onFechar={() => setConvidando(false)}
          rodape={
            <View style={styles.acoesConvite}>
              <Button titulo="Copiar código" variante="primario" bloco onPress={copiarCodigo} />
              <Button titulo="Compartilhar" bloco onPress={compartilhar} />
            </View>
          }
        >
          <Text style={styles.nota}>
            Quem receber este código entra no grupo pela tela de Grupos e passa a ter acesso à viagem.
          </Text>
          <Text
            style={styles.codigo}
            selectable
            accessibilityLabel={`Código ${grupo.codigo_convite.split('').join(' ')}`}
          >
            {grupo.codigo_convite}
          </Text>
        </PainelInferior>
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
  codigo: {
    fontFamily: fonts.monoForte,
    fontSize: 32,
    letterSpacing: 6,
    color: colors.tinta,
    textAlign: 'center',
    paddingVertical: 12,
  },
  nota: { fontFamily: fonts.corpo, fontSize: 12.5, lineHeight: 18, color: colors.suave },
  vazio: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave, paddingVertical: 8 },
  atividade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  atividadeTextos: { flex: 1, gap: 2 },
  atividadeTitulo: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  atividadeCusto: { fontFamily: fonts.mono, fontSize: 12.5, color: colors.tinta },
  acoesConvite: { gap: 8 },
});
