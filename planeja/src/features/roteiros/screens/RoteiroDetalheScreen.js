import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { CaixaResumo } from '../../../components/molecules/CaixaResumo';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { AtividadeDetalhe } from '../../atividades/components/AtividadeDetalhe';
import { ListaAtividades } from '../../atividades/components/ListaAtividades';
import { dataBR } from '../../atividades/datas';
import * as atividadeService from '../../atividades/services/atividadeService';
import { moeda } from '../../inicio/formatos';

export function RoteiroDetalheScreen({ route, navigation }) {
  // O roteiro chega por parâmetro, mandado pelo card da listagem.
  const { roteiro } = route.params;

  const [atividades, setAtividades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aberta, setAberta] = useState(null); // atividade mostrada no painel de detalhe

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await atividadeService.listar(roteiro.id);
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
      sobretitulo={`${roteiro.destino?.cidade} · ${roteiro.destino?.pais}`}
      titulo={roteiro.titulo}
      aoVoltar={() => navigation.goBack()}
    >
      <View style={styles.stats}>
        <CaixaResumo rotulo="Período" valor={dataBR(roteiro.inicio)} sub={`até ${dataBR(roteiro.fim)}`} />
        <CaixaResumo
          rotulo="Custo previsto"
          valor={moeda(custo)}
          sub={`${atividades.length} ${atividades.length === 1 ? 'atividade' : 'atividades'}`}
        />
      </View>

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
  stats: { flexDirection: 'row', gap: 10 },
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
