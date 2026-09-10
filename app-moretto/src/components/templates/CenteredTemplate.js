/**
 * TEMPLATE — CenteredTemplate
 * Esqueleto de layout, sem dados: área segura + conteúdo centralizado
 * + tratamento do teclado. Usado pela tela de Login.
 */
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, espacamentos } from '../../theme';

export function CenteredTemplate({ cabecalho, children, rodape }) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled">
          {cabecalho ? <View style={styles.cabecalho}>{cabecalho}</View> : null}
          {children}
          {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacamentos.lg,
  },
  cabecalho: { marginBottom: espacamentos.xl },
  rodape: { marginTop: espacamentos.xl },
});
