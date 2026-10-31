import { useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { descreverNota, formatarNota } from '../notas';

const POLEGAR = 28;

const limitar = (n) => Math.round(Math.min(Math.max(n, 0), 10) * 10) / 10;

/**
 * Nota de 0 a 10 com uma casa: arrastar (ou tocar) na trilha escolhe a nota,
 * e os botões − / + ajustam de 0,1 em 0,1. Leitores de tela usam os gestos de "ajustável".
 * valor: número ou null (ainda sem nota). onChange: recebe a nova nota.
 */
export function NotaSlider({ valor, onChange, erro }) {
  const [largura, setLargura] = useState(0);
  const larguraRef = useRef(0);
  const inicioX = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const escolher = (x) => {
    if (larguraRef.current) onChangeRef.current(limitar((x / larguraRef.current) * 10));
  };

  const gesto = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Não deixa a rolagem da tela "roubar" o arraste no meio do caminho.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        inicioX.current = e.nativeEvent.locationX;
        escolher(inicioX.current);
      },
      onPanResponderMove: (_, g) => escolher(inicioX.current + g.dx),
    })
  ).current;

  const ajustar = (passo) => onChange(limitar((valor ?? 5) + passo));
  const fracao = valor === null ? 0 : valor / 10;

  return (
    <View style={styles.container}>
      <View style={styles.mostrador}>
        <Text style={[styles.numero, valor === null && styles.numeroVazio]}>
          {valor === null ? '–' : formatarNota(valor)}
        </Text>
        <Text style={styles.escala}>/10</Text>
      </View>
      <Text style={[styles.frase, erro && styles.fraseErro]}>{erro || descreverNota(valor)}</Text>

      <View style={styles.linha}>
        <Botao rotulo="−" descricao="Diminuir nota" onPress={() => ajustar(-0.1)} />

        <View
          style={styles.area}
          onLayout={(e) => {
            larguraRef.current = e.nativeEvent.layout.width;
            setLargura(e.nativeEvent.layout.width);
          }}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Nota de custo-benefício"
          accessibilityValue={{ min: 0, max: 10, now: valor ?? 0, text: valor === null ? 'sem nota' : formatarNota(valor) }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => ajustar(e.nativeEvent.actionName === 'increment' ? 0.5 : -0.5)}
          {...gesto.panHandlers}
        >
          {/* Os filhos não recebem toque: assim o locationX é sempre relativo à trilha. */}
          <View style={styles.trilho} pointerEvents="none">
            <View style={[styles.preenchido, { width: `${fracao * 100}%` }]} />
          </View>
          {valor !== null && largura ? (
            <View pointerEvents="none" style={[styles.polegar, { left: fracao * largura - POLEGAR / 2 }]} />
          ) : null}
        </View>

        <Botao rotulo="+" descricao="Aumentar nota" onPress={() => ajustar(0.1)} />
      </View>

      <View style={styles.marcas} pointerEvents="none">
        {[0, 5, 10].map((n) => (
          <Text key={n} style={styles.marca}>
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Botao({ rotulo, descricao, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={descricao}
      hitSlop={6}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <Text style={styles.botaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  mostrador: { flexDirection: 'row', alignItems: 'baseline' },
  numero: { fontFamily: fonts.monoForte, fontSize: 48, lineHeight: 56, color: colors.acento },
  numeroVazio: { color: colors.linha },
  escala: { fontFamily: fonts.mono, fontSize: 18, color: colors.tenue, marginLeft: 2 },
  frase: { fontFamily: fonts.corpoSemi, fontSize: 13.5, color: colors.suave, marginBottom: 14 },
  fraseErro: { color: colors.acento },
  linha: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 12 },
  area: { flex: 1, height: 44, justifyContent: 'center' },
  trilho: { height: 8, borderRadius: 4, backgroundColor: colors.linhaSuave, overflow: 'hidden' },
  preenchido: { height: 8, backgroundColor: colors.acento },
  polegar: {
    position: 'absolute',
    top: (44 - POLEGAR) / 2,
    width: POLEGAR,
    height: POLEGAR,
    borderRadius: POLEGAR / 2,
    backgroundColor: colors.branco,
    borderWidth: 3,
    borderColor: colors.acento,
    shadowColor: colors.tinta,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  botao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.linha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.7 },
  botaoTexto: { fontFamily: fonts.corpoSemi, fontSize: 20, lineHeight: 22, color: colors.tinta },
  marcas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingHorizontal: 52,
    marginTop: 2,
  },
  marca: { fontFamily: fonts.mono, fontSize: 11, color: colors.tenue },
});
