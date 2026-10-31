import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { colors, fonts } from '../../../config/theme';
import { AtividadeItem } from './AtividadeItem';

/**
 * Atividades do roteiro agrupadas por dia, com os estados de carregando, erro e vazio.
 * Fica dentro do ScrollView do ScreenTemplate, por isso usa map: uma FlatList
 * dentro de um ScrollView perde a virtualização, e um roteiro tem poucas atividades.
 */
export function ListaAtividades({ atividades, carregando, erro, onTentarDeNovo, onAlternar, onAbrir }) {
  const semDados = atividades.length === 0;

  if ((carregando && semDados) || (erro && semDados)) {
    return <EstadoCarga carregando={carregando && !erro} erro={erro} onTentarDeNovo={onTentarDeNovo} />;
  }

  if (semDados) {
    return <EmptyState titulo="Sem atividades" mensagem="Adicione o que fazer em cada dia da viagem." />;
  }

  const dias = [...new Set(atividades.map((atividade) => atividade.dia))];

  return dias.map((dia) => (
    <View key={dia}>
      <Text style={styles.dia}>Dia {dia}</Text>
      {atividades
        .filter((atividade) => atividade.dia === dia)
        .map((atividade) => (
          <AtividadeItem key={atividade.id} atividade={atividade} onAlternar={onAlternar} onAbrir={onAbrir} />
        ))}
    </View>
  ));
}

const styles = StyleSheet.create({
  dia: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingVertical: 6,
    color: colors.acento,
  },
});
