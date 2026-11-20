import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { CaixaResumo } from '../../../components/molecules/CaixaResumo';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { AtividadeDetalhe } from '../../atividades/components/AtividadeDetalhe';
import { ListaAtividades } from '../../atividades/components/ListaAtividades';
import { dataBR } from '../../atividades/datas';
import * as atividadeService from '../../atividades/services/atividadeService';
import { moeda, STATUS_VIAGEM } from '../../inicio/formatos';
import * as roteiroService from '../services/roteiroService';

/**
 * Detalhe do roteiro (RF-06 e RF-07): período, custo, status e as atividades.
 * O roteiro chega por parâmetro (para a tela abrir na hora) e é recarregado da
 * API ao focar, para mostrar o que mudou em "Editar" ou por outro integrante do grupo.
 */
export function RoteiroDetalheScreen({ route, navigation }) {
  const [roteiro, setRoteiro] = useState(route.params.roteiro);
  // "Editar" espera os dados da API: só eles dizem se a pessoa é a dona (pode trocar o destino).
  const [atualizado, setAtualizado] = useState(false);

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aberta, setAberta] = useState(null); // atividade mostrada no painel de detalhe

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [atual, lista] = await Promise.all([
        roteiroService.buscarPorId(roteiro.id),
        atividadeService.listar(roteiro.id),
      ]);
      if (atual) {
        setRoteiro(atual);
        setAtualizado(true);
      }
      setAtividades(lista || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [roteiro.id]);

  // Recarrega ao voltar ao foco (ex.: depois de salvar no formulário).
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const alternarFeita = useCallback(async (atividade) => {
    try {
      const atualizada = await atividadeService.alternarFeita(atividade.id);
      setAtividades((lista) => lista.map((a) => (a.id === atualizada.id ? atualizada : a)));
    } catch (e) {
      Alert.alert('Não foi possível atualizar', e.message);
    }
  }, []);

  function editar() {
    const atividade = aberta;
    setAberta(null);
    navigation.navigate('AtividadeForm', { roteiro, atividade });
  }

  const custo = atividades.reduce((soma, atividade) => soma + Number(atividade.custo), 0);

  return (
    <ScreenTemplate
      sobretitulo={[roteiro.destino?.cidade, roteiro.destino?.pais].filter(Boolean).join(' · ')}
      titulo={roteiro.titulo}
      aoVoltar={() => navigation.goBack()}
      direita={<Button titulo="Editar" pequeno desabilitado={!atualizado} onPress={() => navigation.navigate('RoteiroForm', { roteiro })} />}
    >
      <Text style={styles.status}>{STATUS_VIAGEM[roteiro.status] ?? roteiro.status}</Text>

      <View style={styles.stats}>
        <CaixaResumo
          rotulo="Período"
          valor={dataBR(roteiro.inicio)}
          sub={roteiro.fim ? `até ${dataBR(roteiro.fim)}` : 'sem data de fim'}
        />
        <CaixaResumo
          rotulo="Custo previsto"
          valor={moeda(custo)}
          sub={`${atividades.length} ${atividades.length === 1 ? 'atividade' : 'atividades'}`}
        />
      </View>

      {roteiro.grupo ? (
        <Card onPress={() => navigation.navigate('GrupoDetalhe', { id: roteiro.grupo.id, aba: 'despesas' })}>
          <View style={styles.linhaGrupo}>
            <Text style={styles.grupoNome}>{roteiro.grupo.nome}</Text>
            <Text style={styles.etiqueta}>em grupo</Text>
          </View>
          <View style={styles.linhaGrupo}>
            <Text style={styles.compartilhada}>Viagem compartilhada</Text>
            <Text style={styles.abrir}>ver despesas ›</Text>
          </View>
        </Card>
      ) : null}

      {roteiro.obs ? <Text style={styles.obs}>{roteiro.obs}</Text> : null}

      <View style={styles.secao}>
        <Text style={styles.secaoTitulo}>Atividades</Text>
        <Button
          titulo="+ Nova"
          variante="primario"
          pequeno
          onPress={() => navigation.navigate('AtividadeForm', { roteiro })}
        />
      </View>

      <ListaAtividades
        atividades={atividades}
        carregando={carregando}
        erro={erro}
        onTentarDeNovo={carregar}
        onAlternar={alternarFeita}
        onAbrir={setAberta}
      />

      {aberta ? (
        <AtividadeDetalhe
          atividade={aberta}
          roteiro={roteiro}
          onFechar={() => setAberta(null)}
          onEditar={editar}
        />
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  status: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.acento,
    marginBottom: -4,
  },
  stats: { flexDirection: 'row', gap: 10 },
  linhaGrupo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  grupoNome: { flex: 1, fontFamily: fonts.titulo, fontSize: 17, color: colors.tinta },
  abrir: { fontFamily: fonts.corpoSemi, fontSize: 13, color: colors.acento },
  compartilhada: { fontFamily: fonts.corpo, fontSize: 12.5, color: colors.suave },
  // A etiqueta .tag.ok do protótipo
  etiqueta: {
    fontFamily: fonts.corpoForte,
    fontSize: 9,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.ok,
    backgroundColor: colors.okSuave,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  obs: { fontFamily: fonts.corpo, fontSize: 14, lineHeight: 20, color: colors.tintaSuave },
  secao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: -2,
  },
  secaoTitulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
});
