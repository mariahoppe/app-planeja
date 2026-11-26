import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../../config/theme';
import { AbasTitulo } from '../molecules/AbasTitulo';
import { espacoParaBarraAbas } from '../organisms/BarraAbas';

// Quantos pontos antes do fim a próxima página já começa a carregar.
const DISTANCIA_DO_FIM = 300;

/**
 * Esqueleto das telas do Planeja: cabeçalho fixo (sobretítulo, título grande,
 * voltar e ação opcionais) e um corpo rolável. Nenhum dado mora aqui.
 * sobretitulo: texto pequeno acima do título (ex.: "Comunidade").
 * abas: { opcoes, valor, onChange } — quando uma aba tem duas telas (ex.: Dicas | Ranking),
 *   o título vira o seletor entre elas (AbasTitulo) e a marcada faz o papel do título.
 * direita: elemento à direita do título (ex.: um Button pequeno "Editar").
 * aoVoltar: quando informado, mostra "‹ Voltar" e chama a função ao tocar.
 * aoChegarNoFim: chamada quando a rolagem chega perto do fim (listas paginadas, RNF-04).
 * aoAtualizar: quando informada, liga o "puxar para atualizar"; pode devolver uma promessa.
 * Precisa de um SafeAreaProvider na raiz do app (App.js).
 *
 * Teclado (guia do Expo, SDK 58): o teclado não empurra a tela sozinho em
 * nenhum dos sistemas. No iOS, a rolagem abre espaço para o teclado e rola até
 * o campo em foco (automaticallyAdjustKeyboardInsets). No Android, que desenha
 * de ponta a ponta e não encolhe a janela, o KeyboardAvoidingView com padding
 * encolhe a área da rolagem, que mantém o campo em foco à vista.
 */
export function ScreenTemplate({ sobretitulo, titulo, abas, direita, aoVoltar, aoChegarNoFim, aoAtualizar, children }) {
  const margens = useSafeAreaInsets();
  const [atualizando, setAtualizando] = useState(false);

  async function puxarParaAtualizar() {
    setAtualizando(true);
    try {
      await aoAtualizar();
    } finally {
      setAtualizando(false);
    }
  }
  // Nas telas das abas, a barra flutua por cima: o fim do conteúdo precisa ficar acima dela.
  const naAba = useNavigation().getState()?.type === 'tab';
  const espacoEmbaixo = naAba ? espacoParaBarraAbas(margens) : margens.bottom + 24;

  function aoRolar({ nativeEvent }) {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - DISTANCIA_DO_FIM) aoChegarNoFim();
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'android' ? 'padding' : undefined}>
      <View style={[styles.cabecalho, { paddingTop: margens.top + 2 }]}>
        {aoVoltar ? (
          <Pressable onPress={aoVoltar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.voltar}>
            <Text style={styles.voltarTexto}>‹ Voltar</Text>
          </Pressable>
        ) : null}
        <View style={styles.linhaTitulo}>
          <View style={styles.titulos}>
            {sobretitulo ? <Text style={styles.sobretitulo}>{sobretitulo}</Text> : null}
            {abas ? (
              <AbasTitulo opcoes={abas.opcoes} valor={abas.valor} onChange={abas.onChange} />
            ) : (
              <Text style={styles.titulo} accessibilityRole="header">
                {titulo}
              </Text>
            )}
          </View>
          {direita}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.corpo, { paddingBottom: espacoEmbaixo }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        onScroll={aoChegarNoFim ? aoRolar : undefined}
        scrollEventThrottle={aoChegarNoFim ? 200 : undefined}
        refreshControl={
          aoAtualizar ? (
            <RefreshControl
              refreshing={atualizando}
              onRefresh={puxarParaAtualizar}
              tintColor={colors.acento}
              colors={[colors.acento]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: colors.papel,
  },
  cabecalho: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.linhaSuave,
  },
  voltar: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 2,
  },
  voltarTexto: {
    fontFamily: fonts.corpo,
    fontSize: 13,
    color: colors.suave,
  },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  titulos: {
    flex: 1,
  },
  sobretitulo: {
    fontFamily: fonts.corpoForte,
    fontSize: 9.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.acento,
    marginBottom: 2,
  },
  titulo: {
    fontFamily: fonts.tituloMedio,
    fontSize: 27,
    lineHeight: 30, // line-height 1.1 do protótipo
    letterSpacing: -0.27,
    color: colors.tinta,
  },
  corpo: {
    flexGrow: 1,
    paddingTop: 14,
    paddingHorizontal: 18,
    gap: 11,
  },
});
