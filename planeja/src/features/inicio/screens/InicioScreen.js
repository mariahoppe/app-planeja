import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { Card } from '../../../components/atoms/Card';
import { Surgir } from '../../../components/atoms/Surgir';
import { TituloSecao } from '../../../components/atoms/TituloSecao';
import { ErrorMessage } from '../../../components/molecules/ErrorMessage';
import { ScreenTemplate } from '../../../components/templates/ScreenTemplate';
import { colors, fonts } from '../../../config/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { CartaoViagem } from '../components/CartaoViagem';
import { Indicadores } from '../components/Indicadores';
import { OutrosRoteiros } from '../components/OutrosRoteiros';
import { ProximasAtividades } from '../components/ProximasAtividades';
import * as dashboardService from '../services/dashboardService';

const MARGEM = 18;

/**
 * Painel de quem está logado (GET /dashboard), com o cabeçalho do protótipo
 * ("Olá, Maria" / Início): próxima viagem em destaque, contadores,
 * atalhos, atividades pendentes e os demais roteiros.
 * O Perfil é a última aba da barra (AbasNavigator).
 */
export function InicioScreen({ navigation }) {
  const { usuario } = useAuth();

  const [painel, setPainel] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setPainel(await dashboardService.obter());
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  // Ao voltar de outra tela (Perfil, roteiro, destino), atualiza os números.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const primeiroNome = usuario.nome.trim().split(' ')[0];
  const viagem = painel?.proxima_viagem;
  const abrirRoteiro = (roteiro) => navigation.navigate('RoteiroDetalhe', { roteiro });
  const planejar = () =>
    painel?.totais.destinos ? navigation.navigate('RoteiroForm') : navigation.navigate('DestinoForm');

  return (
    <ScreenTemplate
      sobretitulo={`Olá, ${primeiroNome}`}
      titulo="Início"
      aoAtualizar={carregar}
    >
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
                onPress: () => navigation.navigate('Roteiros', { aba: 'destinos' }),
              },
              {
                chave: 'roteiros',
                rotulo: 'Roteiros',
                valor: painel.totais.roteiros,
                onPress: () => navigation.navigate('Roteiros', { aba: 'roteiros' }),
              },
              {
                chave: 'dicas',
                rotulo: 'Dicas publicadas',
                valor: painel.totais.dicas_publicadas,
                onPress: () => navigation.navigate('Dicas', { aba: 'dicas' }),
              },
              {
                chave: 'grupos',
                rotulo: 'Grupos',
                valor: painel.totais.grupos,
                onPress: () => navigation.navigate('Grupos'),
              },
            ]}
          />

          <Surgir atraso={420} style={styles.secao}>
            <TituloSecao>Atalhos</TituloSecao>
            <View style={styles.grade}>
              <Atalho
                titulo="Meus destinos"
                sub={`${painel.totais.destinos} ${painel.totais.destinos === 1 ? 'cidade cadastrada' : 'cidades cadastradas'}`}
                onPress={() => navigation.navigate('Roteiros', { aba: 'destinos' })}
              />
              <Atalho
                titulo="Buscar dicas"
                sub="Veja o que outros viajantes recomendam"
                onPress={() => navigation.navigate('Dicas', { aba: 'dicas' })}
              />
              <Atalho
                titulo="Ranking custo-benefício"
                sub="Países e cidades melhor avaliados"
                onPress={() => navigation.navigate('Dicas', { aba: 'ranking' })}
              />
              {viagem?.grupo ? (
                <Atalho
                  titulo={viagem.grupo.nome}
                  sub={`${viagem.grupo.total_integrantes} integrantes · despesas da viagem`}
                  onPress={() => navigation.navigate('GrupoDetalhe', { id: viagem.grupo.id, aba: 'despesas' })}
                />
              ) : null}
            </View>
          </Surgir>

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
        </>
      )}
    </ScreenTemplate>
  );
}

// Um card de atalho do protótipo (.atalhos): título curto e uma linha de apoio.
function Atalho({ titulo, sub, onPress }) {
  return (
    <Card onPress={onPress} style={styles.atalho}>
      <Text style={styles.atalhoTitulo} numberOfLines={2}>
        {titulo}
      </Text>
      <Text style={styles.atalhoSub} numberOfLines={2}>
        {sub}
      </Text>
    </Card>
  );
}

function Secao({ titulo, apoio }) {
  return (
    <View style={styles.secaoTopo}>
      <TituloSecao>{titulo}</TituloSecao>
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
  erro: { gap: 10 },
  secao: { gap: 10 },
  secaoTopo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  secaoApoio: { fontFamily: fonts.corpo, fontSize: 12, color: colors.suave },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  atalho: { flexBasis: '46%', flexGrow: 1 },
  atalhoTitulo: { fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.tinta },
  atalhoSub: { fontFamily: fonts.corpo, fontSize: 11.5, lineHeight: 15, color: colors.suave },
  esqueleto: { gap: 18 },
  osso: { backgroundColor: colors.linhaSuave, borderRadius: 16 },
  ossoCartao: { height: 290, borderRadius: 22 },
  ossoBloco: { flexBasis: '46%', flexGrow: 1, height: 96 },
});
