import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '../../config/theme';

// 6 de respiro + 46 do botão + 6 de respiro + 2 de borda, como o .tabs do protótipo
const ALTURA_BARRA = 60;
// Espaço entre o fim do conteúdo e o topo da barra
const FOLGA_CONTEUDO = 16;

// Distância da barra até a base da tela: acima do gesto/home do sistema, ou 16 sem ele.
const distanciaDaBase = (margens) => Math.max(margens.bottom, 16);

/**
 * Quanto as telas das abas precisam de espaço embaixo para a barra flutuante
 * não cobrir o fim do conteúdo (o ScreenTemplate usa isso).
 */
export function espacoParaBarraAbas(margens) {
  return distanciaDaBase(margens) + ALTURA_BARRA + FOLGA_CONTEUDO;
}

// A barra some com o teclado aberto, para não flutuar por cima dele.
function useTecladoAberto() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const mostrar = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const esconder = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const assinaturas = [
      Keyboard.addListener(mostrar, () => setAberto(true)),
      Keyboard.addListener(esconder, () => setAberto(false)),
    ];
    return () => assinaturas.forEach((a) => a.remove());
  }, []);
  return aberto;
}

/**
 * Barra de abas do protótipo: uma pílula branca flutuando sobre o conteúdo, com
 * a aba ativa em fundo de acento suave (ícone e rótulo juntos).
 * Usada como tabBar do Bottom Tab Navigator; o ícone de cada aba vem de
 * options.tabBarIcon e o rótulo de options.title.
 */
export function BarraAbas({ state, descriptors, navigation }) {
  const margens = useSafeAreaInsets();
  const tecladoAberto = useTecladoAberto();

  if (tecladoAberto) return null;

  return (
    <View style={[styles.barra, { bottom: distanciaDaBase(margens) }]} accessibilityRole="tablist">
      {state.routes.map((rota, indice) => {
        const { options } = descriptors[rota.key];
        const ativa = state.index === indice;
        const rotulo = options.title ?? rota.name;
        const cor = ativa ? colors.acento : colors.suave;

        function tocar() {
          const evento = navigation.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
          if (!ativa && !evento.defaultPrevented) navigation.navigate(rota.name, rota.params);
        }

        return (
          <Pressable
            key={rota.key}
            onPress={tocar}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: rota.key })}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={rotulo}
            style={({ pressed }) => [styles.aba, ativa && styles.abaAtiva, pressed && !ativa && styles.abaTocada]}
          >
            {options.tabBarIcon?.({ focused: ativa, color: cor, size: 20 })}
            <Text style={[styles.rotulo, ativa && styles.rotuloAtivo]} numberOfLines={1}>
              {rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.linha,
    borderRadius: radius.pilula,
    // 0 8px 24px rgba(26,26,26,.14) do protótipo; no Android, a elevação faz o papel da sombra
    shadowColor: colors.tinta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 10,
  },
  aba: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
    borderRadius: radius.pilula,
  },
  abaAtiva: { backgroundColor: colors.acentoSuave },
  abaTocada: { backgroundColor: colors.linhaTocada },
  rotulo: {
    fontFamily: fonts.corpo,
    fontSize: 9.5,
    letterSpacing: 0.38,
    color: colors.suave,
  },
  rotuloAtivo: { fontFamily: fonts.corpoForte, color: colors.acento },
});
