import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { colors, fonts } from '../../../config/theme';
import { moeda } from '../formatos';
import * as despesaService from '../services/despesaService';
import { DespesaItem } from './DespesaItem';

/**
 * Aba Despesas do grupo: lista os lançamentos (mais recentes primeiro) e abre o
 * formulário para registrar, editar ou excluir. Recarrega ao voltar do formulário.
 */
export function AbaDespesas({ grupo, usuarioId, navigation }) {
  const [despesas, setDespesas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setDespesas(await despesaService.listar(grupo.id));
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

  if (!despesas) {
    return <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={carregar} />;
  }

  if (despesas.length === 0) {
    return (
      <EmptyState
        titulo="Nenhuma despesa ainda"
        mensagem="Registre o que cada um pagou na viagem; o app divide entre os integrantes."
        acao={<Button titulo="+ Nova despesa" variante="primario" onPress={nova} />}
      />
    );
  }

  const total = despesas.reduce((s, d) => s + Number(d.valor), 0);

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.rotulo}>
            {despesas.length} {despesas.length === 1 ? 'despesa' : 'despesas'}
          </Text>
          <Text style={styles.total}>{moeda(total)}</Text>
        </View>
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
  cabecalho: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.tenue,
  },
  total: { fontFamily: fonts.monoMedio, fontSize: 20, color: colors.tinta },
});
