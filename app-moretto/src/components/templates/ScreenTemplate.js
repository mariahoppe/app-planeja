/**
 * TEMPLATE — ScreenTemplate
 * Esqueleto das telas internas: título, subtítulo opcional e um corpo
 * rolável. Nenhum dado real mora aqui — só a estrutura visual.
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Label } from '../atoms/Label';
import { cores, espacamentos } from '../../theme';

export function ScreenTemplate({ titulo, subtitulo, children, rodape }) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Label variante="titulo">{titulo}</Label>
          {subtitulo ? (
            <Label variante="legenda" style={styles.subtitulo}>
              {subtitulo}
            </Label>
          ) : null}
        </View>

        {children}

        {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    flexGrow: 1,
    padding: espacamentos.lg,
  },
  cabecalho: { marginBottom: espacamentos.lg },
  subtitulo: { marginTop: espacamentos.xs },
  rodape: { marginTop: 'auto', paddingTop: espacamentos.lg },
});
