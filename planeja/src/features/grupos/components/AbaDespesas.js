import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { colors, fonts } from '../../../config/theme';
import * as despesaService from '../services/despesaService';
import { DespesaItem } from './DespesaItem';
import { ResumoContas } from './ResumoContas';

/**
 * Aba Despesas do grupo: totais e acerto de contas (RF-23 e RF-24) no topo e,
 * embaixo, os lançamentos (mais recentes primeiro), que abrem o formulário para
 * editar ou excluir. Uma só chamada (GET /contas) traz tudo já recalculado;
 * recarrega ao voltar do formulário.
 */
export function AbaDespesas({ grupo, usuarioId, navigation }) {
  const [contas, setContas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setContas(await despesaService.contas(grupo.id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [grupo.id]);

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

  const despesas = contas.despesas || [];

  if (despesas.length === 0) {
    return (
      <EmptyState
        titulo="Nenhuma despesa ainda"
        mensagem="Registre o que cada um pagou na viagem; o app divide entre os integrantes e mostra quem deve para quem."
        acao={<Button titulo="+ Nova despesa" variante="primario" onPress={nova} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ResumoContas contas={contas} totalDespesas={despesas.length} usuarioId={usuarioId} />

      <View style={styles.cabecalho}>
        <Text style={styles.rotulo}>Lançamentos</Text>
        <Button titulo="+ Nova despesa" variante="primario" pequeno onPress={nova} />
      </View>

      {despesas.map((d) => (
        <DespesaItem key={d.id} despesa={d} usuarioId={usuarioId} onPress={() => abrir(d)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
});
