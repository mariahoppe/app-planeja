import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { RodapeLista } from '../../../components/molecules/RodapeLista';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useListaPaginada } from '../../../hooks/useListaPaginada';
import { ESCOPOS } from '../../destinos/validacao';
import { CartaoDica } from '../components/CartaoDica';
import * as dicaService from '../services/dicaService';

const FILTROS = [{ valor: 'todos', rotulo: 'Todos' }, ...ESCOPOS];

// Espera a pessoa parar de digitar antes de buscar, para não chamar a API a cada letra.
const ESPERA_BUSCA_MS = 300;

/**
 * Dicas da comunidade (RF-10): busca por destino (cidade ou país, sem acento e sem
 * maiúsculas, feita pela API) e filtro nacional/internacional. Sem busca, as mais recentes.
 * O filtro fica sempre à vista, embaixo da busca (no protótipo, abria por um ícone): assim
 * ninguém fica com a lista filtrada sem perceber, por exemplo ao chegar do Ranking.
 * Vindo do Ranking (RF-16), chega com route.params.filtro = { busca, escopo } e abre já filtrada.
 * abas: vem do DicasTab e põe o seletor Dicas | Ranking no lugar do título.
 */
export function DicasScreen({ route, navigation, abas }) {
  const filtroInicial = route.params?.filtro;

  const [busca, setBusca] = useState(filtroInicial?.busca ?? ''); // o que está escrito no campo
  const [termo, setTermo] = useState(filtroInicial?.busca?.trim() ?? ''); // o que já foi pesquisado
  const [escopo, setEscopo] = useState(filtroInicial?.escopo ?? 'todos');

  // RF-16: cada toque num destino do Ranking traz um filtro novo, mesmo com a aba já aberta.
  useEffect(() => {
    const filtro = route.params?.filtro;
    if (!filtro) return;
    setBusca(filtro.busca);
    setTermo(filtro.busca.trim());
    setEscopo(filtro.escopo ?? 'todos');
  }, [route.params?.filtro]);

  // Cada letra reinicia a espera; só quando a pessoa para de digitar o termo muda.
  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), ESPERA_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [busca]);

  // Busca ou filtro novo recomeça a lista (o hook mostra o carregamento no lugar da antiga).
  const buscarPagina = useCallback(
    (pagina, limite) => dicaService.listar({ busca: termo || undefined, escopo, pagina, limite }),
    [termo, escopo]
  );
  const { itens: dicas, erro, temMais, carregandoMais, recarregar: carregar, carregarMais } =
    useListaPaginada(buscarPagina);

  // Busca ao abrir a aba, ao voltar para ela (ex.: depois de publicar) e quando busca ou filtro mudam.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const publicar = (cidade) => navigation.navigate('DicaForm', cidade ? { cidade } : undefined);

  function limpar() {
    setBusca('');
    setTermo('');
  }

  return (
    <ScreenTemplate
      sobretitulo="Comunidade"
      titulo="Dicas"
      abas={abas}
      direita={<Button titulo="+ Publicar" pequeno onPress={() => publicar()} />}
      aoChegarNoFim={carregarMais}
    >
      <Input
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar destino · ex: Paris"
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Buscar destino"
      />

      <SeletorSegmentado opcoes={FILTROS} valor={escopo} onChange={setEscopo} />

      {erro || dicas === null ? (
        <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
      ) : (
        <>
          <View style={styles.resumo}>
            <Text style={styles.resumoTexto}>
              {termo
                ? `${dicas.length}${temMais ? '+' : ''} ${dicas.length === 1 ? 'dica' : 'dicas'} para “${termo}”`
                : 'Dicas mais recentes'}
            </Text>
            {termo ? (
              <Pressable onPress={limpar} hitSlop={12} accessibilityRole="button">
                <Text style={styles.limpar}>limpar</Text>
              </Pressable>
            ) : null}
          </View>

          {dicas.length === 0 ? (
            <EmptyState
              titulo="Nada por aqui ainda"
              mensagem={
                termo
                  ? `Nenhuma dica cadastrada para “${termo}”. Você pode ser a primeira pessoa a publicar.`
                  : 'Nenhuma dica cadastrada ainda. Você pode ser a primeira pessoa a publicar.'
              }
              acao={<Button titulo="+ Publicar dica" variante="primario" onPress={() => publicar(termo)} />}
            />
          ) : (
            dicas.map((d) => (
              <CartaoDica key={d.id} dica={d} onPress={() => navigation.navigate('DicaDetalhe', { dica: d })} />
            ))
          )}
          <RodapeLista temMais={temMais} carregando={carregandoMais} onCarregarMais={carregarMais} />
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  resumo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumoTexto: { fontFamily: fonts.corpo, fontSize: 11, color: colors.suave },
  limpar: {
    fontFamily: fonts.corpo,
    fontSize: 11.5,
    color: colors.acento,
    textDecorationLine: 'underline',
  },
});
