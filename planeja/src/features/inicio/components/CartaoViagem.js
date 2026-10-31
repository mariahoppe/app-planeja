import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/atoms/Button';
import { colors, fonts } from '../../../config/theme';
import { moeda, periodoCurto, situacaoViagem, STATUS_VIAGEM } from '../formatos';
import { CenaVoo } from './CenaVoo';
import { NumeroAnimado } from '../../../components/atoms/NumeroAnimado';

// Branco translúcido para textos secundários sobre o fundo de acento.
const BRANCO_SUAVE = 'rgba(255,255,255,0.72)';
const BRANCO_TENUE = 'rgba(255,255,255,0.22)';

/**
 * Destaque da tela Início. Com "viagem", mostra a próxima viagem com a contagem
 * regressiva e o progresso das atividades; sem ela, convida a planejar uma.
 */
export function CartaoViagem({ viagem, onPress, onPlanejar }) {
  if (!viagem) {
    return (
      <View style={styles.cartao}>
        <Decoracao />
        <Text style={styles.rotulo}>Sua próxima viagem</Text>
        <CenaVoo />
        <Text style={styles.convite}>Para onde vamos?</Text>
        <Text style={styles.detalhe}>
          Cadastre um destino e monte o roteiro da sua próxima viagem. A contagem regressiva começa aqui.
        </Text>
        <Button titulo="Planejar viagem" onPress={onPlanejar} style={styles.botao} />
      </View>
    );
  }

  const { destino } = viagem;
  const situacao = situacaoViagem(viagem.inicio, viagem.fim);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Próxima viagem: ${destino.cidade}. Abrir roteiro ${viagem.titulo}`}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
    >
      <Decoracao />

      <View style={styles.topo}>
        <Text style={styles.rotulo}>Próxima viagem</Text>
        <Text style={styles.selo}>{viagem.grupo ? viagem.grupo.nome : STATUS_VIAGEM[viagem.status]}</Text>
      </View>

      <CenaVoo />

      <View style={styles.linhaPrincipal}>
        <View style={styles.lugar}>
          <Text style={styles.cidade} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {destino.cidade}
          </Text>
          <Text style={styles.detalhe}>
            {destino.pais} · {periodoCurto(viagem.inicio, viagem.fim)}
          </Text>
        </View>
        <Contagem situacao={situacao} />
      </View>

      <Progresso feitas={viagem.atividades_concluidas} total={viagem.total_atividades} />

      <View style={styles.rodape}>
        <Text style={styles.roteiro} numberOfLines={1}>
          {viagem.titulo.trim()}
        </Text>
        {viagem.custo_total > 0 ? <Text style={styles.custo}>{moeda(viagem.custo_total)}</Text> : null}
        <Text style={styles.seta}>›</Text>
      </View>
    </Pressable>
  );
}

// Círculos translúcidos no canto: dão profundidade ao cartão sem imagem.
function Decoracao() {
  return (
    <>
      <View style={[styles.circulo, styles.circuloGrande]} />
      <View style={[styles.circulo, styles.circuloPequeno]} />
    </>
  );
}

function Contagem({ situacao }) {
  if (situacao.tipo === 'andamento') {
    return (
      <View style={styles.contagem}>
        <Text style={styles.contagemRotulo}>Em viagem</Text>
        <Text style={styles.contagemNumero}>
          {situacao.diaAtual}
          <Text style={styles.contagemDe}>/{situacao.totalDias}</Text>
        </Text>
        <Text style={styles.contagemRotulo}>dia</Text>
      </View>
    );
  }

  const faltam = situacao.tipo === 'faltam';
  return (
    <View style={styles.contagem}>
      <Text style={styles.contagemRotulo}>{faltam ? (situacao.dias === 1 ? 'Falta' : 'Faltam') : 'Foi há'}</Text>
      <NumeroAnimado valor={situacao.dias} atraso={350} style={styles.contagemNumero} />
      <Text style={styles.contagemRotulo}>{situacao.dias === 1 ? 'dia' : 'dias'}</Text>
    </View>
  );
}

function Progresso({ feitas, total }) {
  const largura = useRef(new Animated.Value(0)).current;
  const fracao = total > 0 ? feitas / total : 0;

  useEffect(() => {
    Animated.timing(largura, {
      toValue: fracao,
      duration: 1100,
      delay: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [largura, fracao]);

  if (total === 0) {
    return <Text style={styles.progressoTexto}>Nenhuma atividade ainda · toque para montar o roteiro</Text>;
  }

  return (
    <View style={styles.progresso}>
      <View style={styles.trilho}>
        <Animated.View
          style={[
            styles.barra,
            { width: largura.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      <Text style={styles.progressoTexto}>
        {feitas} de {total} {total === 1 ? 'atividade feita' : 'atividades feitas'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: colors.acento,
    borderRadius: 22,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
    shadowColor: colors.acento,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  pressionado: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  circulo: { position: 'absolute', borderRadius: 999, backgroundColor: colors.branco },
  circuloGrande: { width: 220, height: 220, top: -110, right: -70, opacity: 0.07 },
  circuloPequeno: { width: 120, height: 120, bottom: -60, left: -40, opacity: 0.05 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: BRANCO_SUAVE,
  },
  selo: {
    fontFamily: fonts.corpoSemi,
    fontSize: 11,
    color: colors.branco,
    backgroundColor: BRANCO_TENUE,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  linhaPrincipal: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  lugar: { flex: 1, gap: 2 },
  cidade: { fontFamily: fonts.titulo, fontSize: 38, lineHeight: 44, letterSpacing: -0.6, color: colors.branco },
  convite: { fontFamily: fonts.titulo, fontSize: 32, lineHeight: 38, letterSpacing: -0.4, color: colors.branco },
  detalhe: { fontFamily: fonts.corpo, fontSize: 14, lineHeight: 20, color: BRANCO_SUAVE },
  contagem: { alignItems: 'center', minWidth: 76 },
  contagemRotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: BRANCO_SUAVE,
  },
  contagemNumero: { fontFamily: fonts.monoForte, fontSize: 36, lineHeight: 42, color: colors.branco },
  contagemDe: { fontFamily: fonts.mono, fontSize: 18, color: BRANCO_SUAVE },
  progresso: { gap: 6 },
  trilho: { height: 6, borderRadius: 3, backgroundColor: BRANCO_TENUE, overflow: 'hidden' },
  barra: { height: 6, borderRadius: 3, backgroundColor: colors.branco },
  progressoTexto: { fontFamily: fonts.corpo, fontSize: 12.5, color: BRANCO_SUAVE },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BRANCO_TENUE,
  },
  roteiro: { flex: 1, fontFamily: fonts.corpoSemi, fontSize: 14, color: colors.branco },
  custo: { fontFamily: fonts.monoMedio, fontSize: 13, color: colors.branco },
  seta: { fontFamily: fonts.corpo, fontSize: 22, lineHeight: 22, color: BRANCO_SUAVE },
  botao: { alignSelf: 'flex-start', marginTop: 4, borderColor: colors.branco },
});
