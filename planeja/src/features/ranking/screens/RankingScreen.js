import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Surgir } from '../../../components/atoms/Surgir';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { ItemRanking } from '../components/ItemRanking';
import { Segmentado } from '../components/Segmentado';
import * as avaliacaoService from '../services/avaliacaoService';

const ESCOPOS = [
  { valor: 'internacional', rotulo: 'Internacional' },
  { valor: 'nacional', rotulo: 'Nacional' },
];

const LISTAS = [
  { valor: 'cidades', rotulo: 'Cidades' },
  { valor: 'paises', rotulo: 'Países' },
];

/**
 * Ranking de custo-benefício (RF-12 a RF-16): médias das avaliações da comunidade
 * por cidade ou por país, sob o filtro nacional/internacional.
 * Tocar num destino abre a aba Dicas já filtrada por ele (RF-16).
 */
export function RankingScreen({ navigation }) {
  const [escopo, setEscopo] = useState('internacional');
  const [lista, setLista] = useState('cidades');
  const [ranking, setRanking] = useState(null); // { escopo, paises, cidades }
  const [qtdMinhas, setQtdMinhas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [dados, minhas] = await Promise.all([avaliacaoService.ranking(escopo), avaliacaoService.minhas()]);
      setRanking(dados);
      setQtdMinhas((minhas || []).length);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [escopo]);

  // Recarrega ao voltar ao foco (ex.: depois de avaliar) e quando o filtro muda.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const avaliar = () => navigation.navigate('AvaliacaoForm');
  const abrirDicas = (item) =>
    navigation.navigate('Dicas', { filtro: { busca: item.nome, escopo: ranking.escopo } });

  // Ao trocar de filtro, mantém a lista antiga na tela até a nova chegar, só sem misturar escopos.
  const atualizado = ranking && ranking.escopo === escopo;
  const itens = atualizado ? ranking[lista] : [];

  return (
    <ScreenTemplate
      sobretitulo="Comunidade"
      titulo="Ranking"
      direita={<Button titulo="+ Avaliar" pequeno onPress={avaliar} />}
    >
      <Text style={styles.intro}>
        Os destinos com melhor custo-benefício, pela média das notas de quem já foi.
      </Text>

      <Segmentado opcoes={ESCOPOS} valor={escopo} onChange={setEscopo} />
      <Segmentado opcoes={LISTAS} valor={lista} onChange={setLista} />

      {erro ? (
        <>
          <ErrorMessage mensagem={erro} />
          <Button titulo="Tentar de novo" onPress={carregar} />
        </>
      ) : carregando && !atualizado ? (
        <ActivityIndicator color={colors.acento} style={styles.carregando} />
      ) : itens.length === 0 ? (
        <EmptyState
          titulo="Ninguém avaliou ainda"
          mensagem={`Seja a primeira pessoa a dar nota para um destino ${escopo}.`}
          acao={<Button titulo="+ Avaliar destino" variante="primario" onPress={avaliar} />}
        />
      ) : (
        // A "key" refaz a lista ao trocar de filtro, para a cascata e as barras animarem de novo.
        <View key={`${escopo}-${lista}`} style={styles.lista}>
          {itens.map((item, i) => (
            <Surgir key={`${item.posicao}-${item.nome}`} atraso={Math.min(i, 8) * 60}>
              <ItemRanking
                item={item}
                mostrarPais={lista === 'cidades'}
                atraso={200 + Math.min(i, 8) * 60}
                onPress={() => abrirDicas(item)}
              />
            </Surgir>
          ))}
          <Text style={styles.legenda}>
            Notas de 0 a 10. Destinos com só uma avaliação aparecem marcados como “poucas avaliações”.
          </Text>
        </View>
      )}

      <Card onPress={() => navigation.navigate('MinhasAvaliacoes')} style={styles.minhas}>
        <View style={styles.minhasTextos}>
          <Text style={styles.minhasTitulo}>Minhas avaliações</Text>
          <Text style={styles.minhasSub}>
            {qtdMinhas === 0
              ? 'Você ainda não avaliou nenhum destino'
              : `Você avaliou ${qtdMinhas} ${qtdMinhas === 1 ? 'destino' : 'destinos'}`}
          </Text>
        </View>
        <Text style={styles.seta}>›</Text>
      </Card>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: fonts.corpo, fontSize: 14, lineHeight: 20, color: colors.suave },
  carregando: { marginVertical: 24 },
  lista: { gap: 10 },
  legenda: { fontFamily: fonts.corpo, fontSize: 11.5, lineHeight: 16, color: colors.tenue, textAlign: 'center', marginTop: 4 },
  minhas: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  minhasTextos: { flex: 1, gap: 2 },
  minhasTitulo: { fontFamily: fonts.tituloMedio, fontSize: 16, color: colors.tinta },
  minhasSub: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  seta: { fontFamily: fonts.corpo, fontSize: 24, color: colors.tenue },
});
