import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms/Input';
import { EmptyState } from '../../../components/molecules/EmptyState';
import { EstadoCarga } from '../../../components/molecules/EstadoCarga';
import { SeletorSegmentado } from '../../../components/molecules/SeletorSegmentado';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { ESCOPOS } from '../../destinos/validacao';
import { CartaoDica } from '../components/CartaoDica';
import * as dicaService from '../services/dicaService';

const FILTROS = [{ valor: 'todos', rotulo: 'Todos' }, ...ESCOPOS];

// Espera a pessoa parar de digitar antes de buscar, para não chamar a API a cada letra.
const ESPERA_BUSCA_MS = 300;

/**
 * Dicas da comunidade (RF-10): busca por destino (cidade ou país, sem acento e sem
 * maiúsculas, feita pela API) e filtro nacional/internacional. Sem busca, as mais recentes.
 * Vindo do Ranking (RF-16), chega com route.params.filtro = { busca, escopo } e abre já filtrada.
 */
export function DicasScreen({ route, navigation }) {
  const filtroInicial = route.params?.filtro;

  const [busca, setBusca] = useState(filtroInicial?.busca ?? ''); // o que está escrito no campo
  const [termo, setTermo] = useState(filtroInicial?.busca?.trim() ?? ''); // o que já foi pesquisado
  const [escopo, setEscopo] = useState(filtroInicial?.escopo ?? 'todos');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [dicas, setDicas] = useState(null); // null = ainda carregando
  const [erro, setErro] = useState(null);
  const ultimaBusca = useRef(0);

  // RF-16: cada toque num destino do Ranking traz um filtro novo, mesmo com a aba já aberta.
  useEffect(() => {
    const filtro = route.params?.filtro;
    if (!filtro) return;
    setBusca(filtro.busca);
    setTermo(filtro.busca.trim());
    setEscopo(filtro.escopo ?? 'todos');
    setFiltroAberto(false);
  }, [route.params?.filtro]);

  // Cada letra reinicia a espera; só quando a pessoa para de digitar o termo muda.
  useEffect(() => {
    const espera = setTimeout(() => setTermo(busca.trim()), ESPERA_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [busca]);

  // Busca ou filtro novo: o indicador de carregamento fica no lugar da lista antiga até a resposta chegar.
  useEffect(() => {
    setDicas(null);
  }, [termo, escopo]);

  const carregar = useCallback(async () => {
    const numero = ++ultimaBusca.current;
    try {
      setErro(null);
      const lista = await dicaService.listar({ busca: termo || undefined, escopo });
      // Uma busca antiga que responda depois da nova não pode trocar o resultado.
      if (numero === ultimaBusca.current) setDicas(lista || []);
    } catch (e) {
      if (numero === ultimaBusca.current) setErro(e.message);
    }
  }, [termo, escopo]);

  // Busca ao abrir a aba, ao voltar para ela (ex.: depois de publicar) e quando busca ou filtro mudam.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const publicar = (cidade) => navigation.navigate('DicaForm', cidade ? { cidade } : undefined);

  function escolherEscopo(valor) {
    setEscopo(valor);
    setFiltroAberto(false);
  }

  function limpar() {
    setBusca('');
    setTermo('');
  }

  const filtrando = escopo !== 'todos';

  return (
    <ScreenTemplate sobretitulo="Comunidade" titulo="Dicas">
      <Button titulo="+ Publicar dica" variante="primario" bloco onPress={() => publicar()} />

      <View style={styles.buscaLinha}>
        <Input
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar destino · ex: Paris"
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Buscar destino"
          style={styles.busca}
        />
        <Pressable
          onPress={() => setFiltroAberto(!filtroAberto)}
          accessibilityRole="button"
          accessibilityLabel="Filtrar por escopo"
          accessibilityState={{ expanded: filtroAberto }}
          style={({ pressed }) => [styles.filtro, filtrando && styles.filtroLigado, pressed && styles.pressionado]}
        >
          <Svg
            width={17}
            height={17}
            viewBox="0 0 24 24"
            fill="none"
            stroke={filtrando ? colors.acento : colors.suave}
            strokeWidth={2}
            strokeLinecap="round"
          >
            <Path d="M4 5h16M7 12h10M10 19h4" />
          </Svg>
        </Pressable>
      </View>

      {filtroAberto ? <SeletorSegmentado opcoes={FILTROS} valor={escopo} onChange={escolherEscopo} /> : null}

      {erro || dicas === null ? (
        <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
      ) : (
        <>
          <View style={styles.resumo}>
            <Text style={styles.resumoTexto}>
              {termo ? `${dicas.length} ${dicas.length === 1 ? 'dica' : 'dicas'} para “${termo}”` : 'Dicas mais recentes'}
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
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  buscaLinha: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  busca: { flex: 1 },
  filtro: {
    width: 44,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 10,
    backgroundColor: colors.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroLigado: { backgroundColor: colors.acentoSuave, borderColor: colors.acentoSuave },
  pressionado: { opacity: 0.85 },
  resumo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resumoTexto: { fontFamily: fonts.corpo, fontSize: 11, color: colors.suave },
  limpar: {
    fontFamily: fonts.corpo,
    fontSize: 11.5,
    color: colors.acento,
    textDecorationLine: 'underline',
  },
});
