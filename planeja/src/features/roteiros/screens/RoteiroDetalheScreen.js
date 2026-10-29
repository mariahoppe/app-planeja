import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../components/molecules/EmptyState';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';

export function RoteiroDetalheScreen({ route, navigation }) {
  // O roteiro chega por parâmetro, mandado pelo card da listagem.
  const { roteiro } = route.params;

  const periodo = roteiro.fim
    ? `${roteiro.inicio} — ${roteiro.fim}`
    : `A partir de ${roteiro.inicio}`;
  const custo = Number(roteiro.custo_total || 0).toFixed(2);

  return (
    <ScreenTemplate
      sobretitulo={roteiro.destino?.cidade}
      titulo={roteiro.titulo}
      aoVoltar={() => navigation.goBack()}
    >
      <View style={styles.bloco}>
        <Text style={styles.linha}>
          {roteiro.destino?.cidade} · {roteiro.destino?.pais}
        </Text>
        <Text style={styles.linha}>{periodo}</Text>
        <Text style={styles.linha}>Status: {roteiro.status}</Text>
        <Text style={styles.custo}>Custo previsto: R$ {custo}</Text>
      </View>

      {/* ==========================================================
          ATIVIDADES — encaixe para a Ana (CRUD de Atividades).
          Ana, cole aqui o seu bloco. No topo deste arquivo, importe:
            import { useState } from 'react';
            import { useAtividades } from '../../atividades/hooks/useAtividades';
            import { ListaAtividades } from '../../atividades/components/ListaAtividades';
            import { AtividadeDetalhe } from '../../atividades/components/AtividadeDetalhe';
          Dentro do componente:
            const { atividades, carregando, erro, recarregar, alternarFeita } = useAtividades(roteiro.id);
            const [aberta, setAberta] = useState(null);
          E troque o EmptyState abaixo por:
            <ListaAtividades
              atividades={atividades} carregando={carregando} erro={erro}
              aoNova={() => navigation.navigate('AtividadeForm', { roteiro })}
              aoAlternar={alternarFeita}
              aoAbrir={setAberta}
              aoTentarDeNovo={recarregar}
            />
            <AtividadeDetalhe
              atividade={aberta} roteiro={roteiro}
              aoFechar={() => setAberta(null)}
              aoEditar={(a) => { setAberta(null); navigation.navigate('AtividadeForm', { roteiro, atividade: a }); }}
            />
          ========================================================== */}
      <EmptyState
        titulo="Atividades"
        mensagem="A seção de atividades será integrada aqui (Ana)."
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: 4, marginBottom: 8 },
  linha: { fontFamily: fonts.corpo, fontSize: 14, color: colors.suave },
  custo: { fontFamily: fonts.monoMedio, fontSize: 14, color: colors.tinta, marginTop: 4 },
});
