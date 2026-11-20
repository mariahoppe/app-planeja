import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Surgir } from '../../../components/atoms/Surgir';
import { TituloSecao } from '../../../components/atoms/TituloSecao';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { ItemRanking } from '../components/ItemRanking';
import * as avaliacaoService from '../services/avaliacaoService';

const ESCOPOS = [
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

/**
 * Ranking de custo-benefício (RF-12 a RF-16): os dois rankings simultâneos do
 * escopo — países (RF-13) e cidades (RF-14) — sob o filtro nacional/internacional
 * (RF-15), pelas médias das avaliações da comunidade.
 * Tocar num destino abre a aba Dicas já filtrada por ele (RF-16).
 */
export function RankingScreen({ navigation, seletor }) {
  const [escopo, setEscopo] = useState('internacional');
  const [ranking, setRanking] = useState(null); // { escopo, paises, cidades }
  const [qtdMinhas, setQtdMinhas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    // "Minhas avaliações" é um extra: se falhar, o ranking aparece mesmo assim.
    const [dados, minhas] = await Promise.allSettled([avaliacaoService.ranking(escopo), avaliacaoService.minhas()]);
    if (dados.status === 'fulfilled') setRanking(dados.value);
    else setErro(dados.reason?.message ?? 'Não foi possível carregar o ranking.');
    setQtdMinhas(minhas.status === 'fulfilled' ? (minhas.value || []).length : null);
    setCarregando(false);
  }, [escopo]);

  // Recarrega ao voltar ao foco (ex.: depois de avaliar) e quando o filtro muda.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const avaliar = () => navigation.navigate('AvaliacaoForm');
  const abrirDicas = (item) =>
    navigation.navigate('Dicas', { aba: 'dicas', filtro: { busca: item.nome, escopo: ranking.escopo } });

  // Ao trocar de filtro, mantém a lista antiga na tela até a nova chegar, só sem misturar escopos.
  const atualizado = ranking && ranking.escopo === escopo;
  const paises = atualizado ? ranking.paises : [];
  const cidades = atualizado ? ranking.cidades : [];

  return (
    <ScreenTemplate sobretitulo="Custo-benefício" titulo="Ranking">
      {seletor}

      <Button titulo="+ Avaliar destino" variante="primario" bloco onPress={avaliar} />

      <SeletorSegmentado opcoes={ESCOPOS} valor={escopo} onChange={setEscopo} />

      {erro ? (
        <>
          <ErrorMessage mensagem={erro} />
          <Button titulo="Tentar de novo" onPress={carregar} />
        </>
      ) : carregando && !atualizado ? (
        <ActivityIndicator color={colors.acento} style={styles.carregando} />
      ) : paises.length === 0 && cidades.length === 0 ? (
        <EmptyState titulo="Sem avaliações" mensagem="Avalie um destino para começar o ranking." />
      ) : (
        // A "key" refaz as listas ao trocar de filtro, para a cascata e as barras animarem de novo.
        <View key={escopo} style={styles.listas}>
          <Lista titulo="Países" itens={paises} onAbrir={abrirDicas} />
          <Lista titulo="Cidades" itens={cidades} mostrarPais onAbrir={abrirDicas} atrasoBase={4} />
          <Text style={styles.rodape}>Toque em um destino para ver todas as dicas cadastradas sobre ele.</Text>
          <Text style={styles.legenda}>
            Notas de 0 a 10. Destinos com só uma avaliação aparecem como “poucas avaliações”.
          </Text>
        </View>
      )}

      <Card onPress={() => navigation.navigate('MinhasAvaliacoes')} style={styles.minhas}>
        <View style={styles.minhasTextos}>
          <Text style={styles.minhasTitulo}>Minhas avaliações</Text>
          {qtdMinhas !== null ? (
            <Text style={styles.minhasSub}>
              {qtdMinhas === 0
                ? 'Você ainda não avaliou nenhum destino'
                : `Você avaliou ${qtdMinhas} ${qtdMinhas === 1 ? 'destino' : 'destinos'}`}
            </Text>
          ) : null}
        </View>
        <Text style={styles.seta}>›</Text>
      </Card>
    </ScreenTemplate>
  );
}

// Um dos dois rankings (países ou cidades), com o título de seção do protótipo.
function Lista({ titulo, itens, mostrarPais = false, onAbrir, atrasoBase = 0 }) {
  if (itens.length === 0) return null;
  return (
    <View style={styles.lista}>
      <TituloSecao>{titulo}</TituloSecao>
      {itens.map((item, i) => {
        const ordem = Math.min(atrasoBase + i, 8);
        return (
          <Surgir key={`${item.posicao}-${item.nome}-${item.pais}`} atraso={ordem * 60}>
            <ItemRanking item={item} mostrarPais={mostrarPais} atraso={200 + ordem * 60} onPress={() => onAbrir(item)} />
          </Surgir>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  carregando: { marginVertical: 24 },
  listas: { gap: 18 },
  lista: { gap: 10 },
  rodape: { fontFamily: fonts.corpo, fontSize: 12.5, lineHeight: 18, color: colors.suave, fontStyle: 'italic', textAlign: 'center' },
  legenda: { fontFamily: fonts.corpo, fontSize: 11.5, lineHeight: 16, color: colors.tenue, textAlign: 'center', marginTop: -10 },
  minhas: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  minhasTextos: { flex: 1, gap: 2 },
  minhasTitulo: { fontFamily: fonts.tituloMedio, fontSize: 16, color: colors.tinta },
  minhasSub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  seta: { fontFamily: fonts.corpo, fontSize: 24, color: colors.tenue },
});
