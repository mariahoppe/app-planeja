import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../../config/theme';

/**
 * Esqueleto das telas do Planeja: cabeçalho fixo (sobretítulo, título grande,
 * voltar e ação opcionais) e um corpo rolável. Nenhum dado mora aqui.
 * sobretitulo: texto pequeno acima do título (ex.: "Comunidade").
 * direita: elemento à direita do título (ex.: um Button pequeno "Editar").
 * aoVoltar: quando informado, mostra "‹ Voltar" e chama a função ao tocar.
 * Precisa de um SafeAreaProvider na raiz do app (App.js).
 */
export function ScreenTemplate({ sobretitulo, titulo, direita, aoVoltar, children }) {
  const margens = useSafeAreaInsets();

  return (
    <View style={styles.tela}>
      <View style={[styles.cabecalho, { paddingTop: margens.top + 12 }]}>
        {aoVoltar ? (
          <Pressable onPress={aoVoltar} hitSlop={12} accessibilityRole="button" style={styles.voltar}>
            <Text style={styles.voltarTexto}>‹ Voltar</Text>
          </Pressable>
        ) : null}
        <View style={styles.linhaTitulo}>
          <View style={styles.titulos}>
            {sobretitulo ? <Text style={styles.sobretitulo}>{sobretitulo}</Text> : null}
            <Text style={styles.titulo} accessibilityRole="header">
              {titulo}
            </Text>
          </View>
          {direita}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.corpo, { paddingBottom: margens.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
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
    lineHeight: 31,
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
