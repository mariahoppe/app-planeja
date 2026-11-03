import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Subir } from '../atoms/Subir';
import { colors, fonts } from '../../config/theme';

/**
 * Painel que sobe da parte de baixo da tela, igual ao do protótipo.
 * Fica aberto enquanto estiver na tela: {aberto && <PainelInferior ... />}.
 * titulo: texto do topo. onFechar: toque no "×", fora do painel ou no voltar do Android.
 * rodape: elemento fixo embaixo (ex.: um Button).
 */
export function PainelInferior({ titulo, onFechar, rodape, children }) {
  const margens = useSafeAreaInsets();

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onFechar}
    >
      <View style={styles.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onFechar} accessibilityLabel="Fechar" />
        <Subir duracao={220} style={[styles.painel, { paddingBottom: Math.max(margens.bottom, 34) }]}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo} accessibilityRole="header">
              {titulo}
            </Text>
            <Pressable onPress={onFechar} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={styles.fechar}>×</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.rolagem} contentContainerStyle={styles.corpo}>
            {children}
          </ScrollView>
          {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
        </Subir>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(26,26,26,0.4)',
  },
  painel: {
    maxHeight: '86%',
    backgroundColor: colors.branco,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 14,
    paddingHorizontal: 18,
    gap: 11,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titulo: {
    flex: 1,
    fontFamily: fonts.titulo,
    fontSize: 18,
    color: colors.tinta,
  },
  fechar: {
    fontFamily: fonts.corpo,
    fontSize: 22,
    lineHeight: 24,
    paddingHorizontal: 4,
    color: colors.suave,
  },
  rolagem: { flexShrink: 1 },
  corpo: { gap: 11 },
  rodape: { paddingTop: 2 },
});
