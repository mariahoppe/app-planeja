import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../../config/theme';
import { useMovimentoReduzido } from '../../../hooks/useMovimentoReduzido';

const ALTURA = 92;
const AVIAO = 24;
const PASSOS = 24; // pontos da curva usados na interpolação do voo
const DURACAO_VOO = 4600;

// Ícone "flight" (Material Icons, Apache 2.0), apontando para cima.
const CAMINHO_AVIAO =
  'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';

// Curva quadrática de Bézier: origem (p0), ponto de controle (c) e destino (p1).
function pontoNaCurva(t, p0, c, p1) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  };
}

// Ângulo (graus) da direção do voo naquele ponto, para o avião acompanhar a curva.
function anguloNaCurva(t, p0, c, p1) {
  const dx = 2 * (1 - t) * (c.x - p0.x) + 2 * t * (p1.x - c.x);
  const dy = 2 * (1 - t) * (c.y - p0.y) + 2 * t * (p1.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/**
 * Animação do cartão da próxima viagem: um avião faz o arco tracejado da origem
 * até o destino, em loop, com nuvens passando e o destino pulsando.
 * Com "Reduzir movimento" ligado, a cena fica parada no meio do voo.
 */
export function CenaVoo({ cor = colors.branco }) {
  const reduzido = useMovimentoReduzido();
  const [largura, setLargura] = useState(0);

  const voo = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(0)).current;
  const nuvemA = useRef(new Animated.Value(0)).current;
  const nuvemB = useRef(new Animated.Value(0)).current;

  const geometria = useMemo(() => {
    if (!largura) return null;
    const p0 = { x: 14, y: ALTURA - 16 };
    const p1 = { x: largura - 14, y: ALTURA - 16 };
    const c = { x: largura / 2, y: -ALTURA * 0.4 };

    const entradas = [];
    const xs = [];
    const ys = [];
    const giros = [];
    for (let i = 0; i <= PASSOS; i += 1) {
      const t = i / PASSOS;
      const p = pontoNaCurva(t, p0, c, p1);
      entradas.push(t);
      xs.push(p.x - AVIAO / 2);
      ys.push(p.y - AVIAO / 2);
      // +90°: o desenho do avião aponta para cima, e o ângulo 0 é para a direita.
      giros.push(`${anguloNaCurva(t, p0, c, p1) + 90}deg`);
    }

    return { p0, p1, c, entradas, xs, ys, giros, trajeto: `M${p0.x} ${p0.y} Q${c.x} ${c.y} ${p1.x} ${p1.y}` };
  }, [largura]);

  useEffect(() => {
    if (!largura) return undefined;

    if (reduzido) {
      voo.setValue(0.55);
      return undefined;
    }

    const animacoes = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(voo, {
            toValue: 1,
            duration: DURACAO_VOO,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.delay(700),
        ])
      ),
      Animated.loop(
        Animated.timing(pulso, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true })
      ),
      Animated.loop(Animated.timing(nuvemA, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(Animated.timing(nuvemB, { toValue: 1, duration: 23000, easing: Easing.linear, useNativeDriver: true })),
    ];
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [largura, reduzido, voo, pulso, nuvemA, nuvemB]);

  return (
    <View
      style={styles.cena}
      onLayout={(e) => setLargura(Math.round(e.nativeEvent.layout.width))}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {geometria ? (
        <>
          <Animated.View
            style={[
              styles.nuvem,
              styles.nuvemGrande,
              { backgroundColor: cor },
              {
                transform: [
                  { translateX: nuvemA.interpolate({ inputRange: [0, 1], outputRange: [largura * 0.7, -80] }) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.nuvem,
              styles.nuvemPequena,
              { backgroundColor: cor },
              {
                transform: [
                  { translateX: nuvemB.interpolate({ inputRange: [0, 1], outputRange: [largura + 40, -60] }) },
                ],
              },
            ]}
          />

          <Svg width={largura} height={ALTURA} style={StyleSheet.absoluteFill}>
            <Path
              d={geometria.trajeto}
              stroke={cor}
              strokeOpacity={0.55}
              strokeWidth={1.6}
              strokeDasharray="1.5 7"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={geometria.p0.x} cy={geometria.p0.y} r={3.5} fill={cor} fillOpacity={0.7} />
            <Circle cx={geometria.p1.x} cy={geometria.p1.y} r={5} fill={cor} />
          </Svg>

          <Animated.View
            style={[
              styles.pulso,
              {
                borderColor: cor,
                left: geometria.p1.x - 10,
                top: geometria.p1.y - 10,
                opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.2] }) }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.aviao,
              {
                opacity: reduzido ? 1 : voo.interpolate({ inputRange: [0, 0.05, 0.93, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateX: voo.interpolate({ inputRange: geometria.entradas, outputRange: geometria.xs }) },
                  { translateY: voo.interpolate({ inputRange: geometria.entradas, outputRange: geometria.ys }) },
                  { rotate: voo.interpolate({ inputRange: geometria.entradas, outputRange: geometria.giros }) },
                ],
              },
            ]}
          >
            <Svg width={AVIAO} height={AVIAO} viewBox="0 0 24 24">
              <Path d={CAMINHO_AVIAO} fill={cor} />
            </Svg>
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cena: {
    height: ALTURA,
    overflow: 'hidden',
  },
  nuvem: {
    position: 'absolute',
    left: 0,
    borderRadius: 999,
    opacity: 0.1,
  },
  nuvemGrande: { top: 14, width: 64, height: 18 },
  nuvemPequena: { top: 44, width: 40, height: 12 },
  pulso: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  aviao: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: AVIAO,
    height: AVIAO,
  },
});
