import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { colors, fonts } from '../../../config/theme';
import { useListaPaginada } from '../../../hooks/useListaPaginada';
import * as despesaService from '../services/despesaService';
import { DespesaItem } from './DespesaItem';
import { ResumoContas } from './ResumoContas';

/**
 * Aba Despesas do grupo, na ordem do protótipo: totais, lançamentos, saldos e
 * acerto de contas (RF-23 e RF-24).
 * - GET /contas traz totais, saldos e acerto já recalculados.
 * - Os lançamentos (mais recentes primeiro) vêm em páginas (RNF-04); como ficam
 *   no meio da aba, as páginas seguintes vêm pelo "Carregar mais".
 * Tocar num lançamento abre o formulário; tudo recarrega ao voltar dele.
 */
export function AbaDespesas({ grupo, usuarioId, navigation }) {
  const [contas, setContas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarPagina = useCallback(
    (pagina, limite) => despesaService.listar(grupo.id, { pagina, limite }),
    [grupo.id]
  );
  const lista = useListaPaginada(buscarPagina);
  const { recarregar: recarregarLista } = lista;

  const carregar = useCallback(async () => {
    recarregarLista();
    try {
      setErro(null);
      setContas(await despesaService.contas(grupo.id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [grupo.id, recarregarLista]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const nova = () => navigation.navigate('DespesaForm', { grupo });
  const abrir = (despesa) => navigation.navigate('DespesaForm', { grupo, despesa });

  if (!contas) {
    return <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={carregar} />;
  }

  if (contas.total_despesas === 0) {
    return (
      <EmptyState
        titulo="Sem despesas"
        mensagem="Registre o primeiro gasto da viagem."
        acao={<Button titulo="+ Nova despesa" variante="primario" onPress={nova} />}
      />
    );
  }

  const lancamentos = (
    <View>
      <View style={styles.cabecalho}>
        <Text style={styles.rotulo}>Lançamentos</Text>
        <Button titulo="+ Nova despesa" variante="primario" pequeno onPress={nova} />
      </View>
      {lista.erro || lista.itens === null ? (
        <EstadoCarga carregando={!lista.erro} erro={lista.erro} onTentarDeNovo={recarregarLista} />
      ) : (
        <>
          {lista.itens.map((d) => (
            <DespesaItem key={d.id} despesa={d} usuarioId={usuarioId} onPress={() => abrir(d)} />
          ))}
          <RodapeLista temMais={lista.temMais} carregando={lista.carregandoMais} onCarregarMais={lista.carregarMais} />
        </>
      )}
    </View>
  );

  return <ResumoContas contas={contas} usuarioId={usuarioId} lancamentos={lancamentos} />;
}

const styles = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
});
