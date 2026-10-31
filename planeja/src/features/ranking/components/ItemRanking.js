import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../../config/theme';
import { formatarNota } from '../notas';

const BRANCO_SUAVE = 'rgba(255,255,255,0.72)';
const BRANCO_TENUE = 'rgba(255,255,255,0.22)';

const textoQtd = (qtd) => (qtd === 1 ? '1 avaliação' : `${qtd} avaliações`);

/**
 * Uma posição do ranking. O 1º lugar vira um cartão de destaque na cor de acento;
 * os demais são linhas com a barra da média se enchendo.
 * mostrarPais: nas cidades, o país aparece embaixo do nome.
 */
export function ItemRanking({ item, mostrarPais, atraso = 0, onPress }) {
  const barra = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barra, {
      toValue: item.media / 10,
      duration: 900,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [barra, item.media, atraso]);

  const largura = barra.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const lider = item.posicao === 1;
  const detalhe = [mostrarPais ? item.pais : null, textoQtd(item.qtd)].filter(Boolean).join(' · ');
  const rotuloAcessivel = `${item.posicao}º lugar, ${item.nome}, média ${formatarNota(item.media)}, ${textoQtd(item.qtd)}. Ver dicas`;

  if (lider) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={rotuloAcessivel}
        style={({ pressed }) => [styles.lider, pressed && styles.pressionado]}
      >
        <View style={styles.circulo} />
        <Text style={styles.liderRotulo}>1º · Melhor custo-benefício</Text>
        <View style={styles.liderLinha}>
          <View style={styles.liderNomes}>
            <Text style={styles.liderNome} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {item.nome}
            </Text>
            <Text style={styles.liderDetalhe}>{detalhe}</Text>
          </View>
          <View style={styles.liderNota}>
            <Text style={styles.liderMedia}>{formatarNota(item.media)}</Text>
            <Text style={styles.liderEscala}>/10</Text>
          </View>
        </View>
        <View style={styles.liderTrilho}>
          <Animated.View style={[styles.liderBarra, { width: largura }]} />
        </View>
        <Text style={styles.liderDica}>Toque para ver as dicas da comunidade ›</Text>
      </Pressable>
    );
  }

  const podio = item.posicao <= 3;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}
    >
      <Text style={[styles.posicao, podio && styles.posicaoPodio]}>{item.posicao}º</Text>

      <View style={styles.meio}>
        <Text style={styles.nome} numberOfLines={1}>
          {item.nome}
        </Text>
        <Text style={styles.detalhe}>
          {detalhe}
          {item.poucas_avaliacoes ? <Text style={styles.poucas}> · poucas avaliações</Text> : null}
        </Text>
        <View style={styles.trilho}>
          <Animated.View style={[styles.barra, { width: largura }, item.poucas_avaliacoes && styles.barraFraca]} />
        </View>
      </View>

      <Text style={styles.media}>{formatarNota(item.media)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressionado: { opacity: 0.88 },

  lider: {
    backgroundColor: colors.acento,
    borderRadius: 22,
    padding: 20,
    gap: 10,
    overflow: 'hidden',
    shadowColor: colors.acento,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  circulo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -100,
    right: -60,
    backgroundColor: colors.branco,
    opacity: 0.07,
  },
  liderRotulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: BRANCO_SUAVE,
  },
  liderLinha: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  liderNomes: { flex: 1, gap: 2 },
  liderNome: { fontFamily: fonts.titulo, fontSize: 34, lineHeight: 40, letterSpacing: -0.5, color: colors.branco },
  liderDetalhe: { fontFamily: fonts.corpo, fontSize: 14, color: BRANCO_SUAVE },
  liderNota: { flexDirection: 'row', alignItems: 'baseline' },
  liderMedia: { fontFamily: fonts.monoForte, fontSize: 40, lineHeight: 46, color: colors.branco },
  liderEscala: { fontFamily: fonts.mono, fontSize: 15, color: BRANCO_SUAVE },
  liderTrilho: { height: 6, borderRadius: 3, backgroundColor: BRANCO_TENUE, overflow: 'hidden' },
  liderBarra: { height: 6, borderRadius: 3, backgroundColor: colors.branco },
  liderDica: { fontFamily: fonts.corpo, fontSize: 12.5, color: BRANCO_SUAVE },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  posicao: { width: 34, fontFamily: fonts.monoForte, fontSize: 18, color: colors.tenue },
  posicaoPodio: { color: colors.acento },
  meio: { flex: 1, gap: 3 },
  nome: { fontFamily: fonts.titulo, fontSize: 17, color: colors.tinta },
  detalhe: { fontFamily: fonts.corpo, fontSize: 12.5, color: colors.suave },
  poucas: { fontFamily: fonts.corpo, color: colors.tenue },
  trilho: { height: 4, borderRadius: 2, backgroundColor: colors.linhaSuave, overflow: 'hidden', marginTop: 4 },
  barra: { height: 4, borderRadius: 2, backgroundColor: colors.acento },
  barraFraca: { opacity: 0.45 },
  media: { fontFamily: fonts.monoForte, fontSize: 19, color: colors.tinta },
});
