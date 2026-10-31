import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '../../../components/atoms/Avatar';
import { Button } from '../../../components/atoms/Button';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { obterPerfilLocal } from '../../../services/perfilLocal';
import { CartaoViagem } from '../components/CartaoViagem';
import { Indicadores } from '../components/Indicadores';
import { OutrosRoteiros } from '../components/OutrosRoteiros';
import { ProximasAtividades } from '../components/ProximasAtividades';
import { Surgir } from '../../../components/atoms/Surgir';
import { hojePorExtenso, saudacao } from '../formatos';
import * as dashboardService from '../services/dashboardService';

const MARGEM = 18;

/**
 * Painel de quem está logado (GET /dashboard): próxima viagem em destaque,
 * contadores, atividades pendentes e os demais roteiros.
 * O avatar abre o Perfil, que fica na pilha acima das abas (AppStack).
 */
export function InicioScreen({ navigation }) {
  const { usuario } = useAuth();
  const margens = useSafeAreaInsets();

  const [fotoUri, setFotoUri] = useState(null);
  const [painel, setPainel] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setPainel(await dashboardService.obter());
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  // Ao voltar de outra tela (Perfil, roteiro, destino), atualiza foto e números.
  useFocusEffect(
    useCallback(() => {
      obterPerfilLocal().then((local) => setFotoUri(local.fotoUri));
      carregar();
    }, [carregar])
  );

  async function puxarParaAtualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  const primeiroNome = usuario.nome.trim().split(' ')[0];
  const viagem = painel?.proxima_viagem;
  const abrirRoteiro = (roteiro) => navigation.navigate('RoteiroDetalhe', { roteiro });
  const planejar = () =>
    painel?.totais.destinos ? navigation.navigate('RoteiroForm') : navigation.navigate('DestinoForm');

  return (
    <View style={styles.tela}>
      <ScrollView
        contentContainerStyle={[
          styles.corpo,
          { paddingTop: margens.top + 14, paddingBottom: margens.bottom + 28 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={puxarParaAtualizar}
            tintColor={colors.acento}
            colors={[colors.acento]}
          />
        }
      >
        <Surgir style={styles.cabecalho}>
          <View style={styles.titulos}>
            <Text style={styles.sobretitulo}>{hojePorExtenso()}</Text>
            <Text style={styles.titulo} accessibilityRole="header">
              {saudacao()},{'\n'}
              <Text style={styles.nome}>{primeiroNome}</Text>
            </Text>
          </View>
          <Avatar nome={usuario.nome} fotoUri={fotoUri} tamanho={46} onPress={() => navigation.navigate('Perfil')} />
        </Surgir>

        {erro ? (
          <View style={styles.erro}>
            <ErrorMessage mensagem={erro} />
            <Button titulo="Tentar de novo" onPress={carregar} />
          </View>
        ) : null}

        {!painel ? (
          erro ? null : <Esqueleto />
        ) : (
          <>
            <Surgir atraso={90}>
              <CartaoViagem viagem={viagem} onPress={() => abrirRoteiro(viagem)} onPlanejar={planejar} />
            </Surgir>

            <Indicadores
              atrasoInicial={220}
              itens={[
                {
                  chave: 'destinos',
                  rotulo: 'Destinos',
                  valor: painel.totais.destinos,
                  onPress: () => navigation.navigate('Destinos'),
                },
                {
                  chave: 'roteiros',
                  rotulo: 'Roteiros',
                  valor: painel.totais.roteiros,
                  onPress: () => navigation.navigate('Roteiros'),
                },
                {
                  chave: 'dicas',
                  rotulo: 'Dicas publicadas',
                  valor: painel.totais.dicas_publicadas,
                  onPress: () => navigation.navigate('Dicas'),
                },
                {
                  chave: 'grupos',
                  rotulo: 'Grupos',
                  valor: painel.totais.grupos,
                  onPress: () => navigation.navigate('Grupos'),
                },
              ]}
            />

            {painel.proximas_atividades.length > 0 ? (
              <Surgir atraso={520} style={styles.secao}>
                <Secao titulo="Próximas atividades" apoio={viagem?.destino.cidade} />
                <ProximasAtividades atividades={painel.proximas_atividades} onPress={() => abrirRoteiro(viagem)} />
              </Surgir>
            ) : null}

            {painel.outros_roteiros.length > 0 ? (
              <Surgir atraso={620} style={styles.secao}>
                <Secao titulo="Também no radar" apoio={`${painel.outros_roteiros.length} roteiros`} />
                <OutrosRoteiros roteiros={painel.outros_roteiros} onAbrir={abrirRoteiro} margem={MARGEM} />
              </Surgir>
            ) : null}

            <Surgir atraso={700} style={styles.atalhos}>
              <Button titulo="+ Destino" style={styles.atalho} onPress={() => navigation.navigate('DestinoForm')} />
              <Button
                titulo="+ Roteiro"
                variante="primario"
                style={styles.atalho}
                onPress={() => navigation.navigate('RoteiroForm')}
              />
            </Surgir>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Secao({ titulo, apoio }) {
  return (
    <View style={styles.secaoTopo}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {apoio ? <Text style={styles.secaoApoio}>{apoio}</Text> : null}
    </View>
  );
}

// Blocos pulsando no formato do painel enquanto a API responde.
function Esqueleto() {
  const pulso = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 0.5, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    animacao.start();
    return () => animacao.stop();
  }, [pulso]);

  return (
    <Animated.View style={[styles.esqueleto, { opacity: pulso }]} accessibilityLabel="Carregando painel">
      <View style={[styles.osso, styles.ossoCartao]} />
      <View style={styles.grade}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.osso, styles.ossoBloco]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.papel },
  corpo: { paddingHorizontal: MARGEM, gap: 18 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  titulos: { flex: 1 },
  sobretitulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.acento,
    marginBottom: 4,
  },
  titulo: { fontFamily: fonts.titulo, fontSize: 30, lineHeight: 35, letterSpacing: -0.4, color: colors.suave },
  nome: { fontFamily: fonts.tituloMedio, color: colors.tinta },
  erro: { gap: 10 },
  secao: { gap: 10 },
  secaoTopo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  secaoTitulo: { fontFamily: fonts.tituloMedio, fontSize: 20, color: colors.tinta },
  secaoApoio: { fontFamily: fonts.corpo, fontSize: 13, color: colors.suave },
  atalhos: { flexDirection: 'row', gap: 11 },
  atalho: { flex: 1 },
  esqueleto: { gap: 18 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  osso: { backgroundColor: colors.linhaSuave, borderRadius: 16 },
  ossoCartao: { height: 290, borderRadius: 22 },
  ossoBloco: { flexBasis: '46%', flexGrow: 1, height: 96 },
});
