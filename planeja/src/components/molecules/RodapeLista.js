import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../../config/theme';
import { Button } from '../atoms/Button';

/**
 * Fim de uma lista paginada (RNF-04): o indicador enquanto a próxima página
 * chega ou, se ainda há itens, um botão "Carregar mais" (a página também carrega
 * sozinha ao rolar até o fim; o botão serve a quem usa leitor de tela).
 */
export function RodapeLista({ temMais, carregando, onCarregarMais }) {
  if (carregando) return <ActivityIndicator color={colors.acento} style={styles.indicador} />;
  if (!temMais) return null;
  return (
    <View style={styles.caixa}>
      <Button titulo="Carregar mais" pequeno onPress={onCarregarMais} />
    </View>
  );
}

const styles = StyleSheet.create({
  indicador: { marginVertical: 12 },
  caixa: { alignItems: 'center', marginTop: 4 },
});
