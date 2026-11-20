import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Marca } from '../molecules/Marca';
import { colors } from '../../config/theme';

/**
 * Esqueleto das telas de conta (login, cadastro, esqueci a senha): a marca no
 * topo e o formulário centralizado na vertical, rolável quando o teclado abre.
 * sub: subtítulo da marca (ex.: "Criar conta").
 * Precisa de um SafeAreaProvider na raiz do app (App.js).
 * Teclado: padding nos dois sistemas — no Android, que desenha de ponta a ponta,
 * a janela não encolhe sozinha (guia de teclado do Expo, SDK 58).
 */
export function AuthTemplate({ sub, children }) {
  const margens = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.tela} behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.corpo, { paddingTop: margens.top + 70, paddingBottom: margens.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <Marca sub={sub} />
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
  corpo: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    gap: 13,
  },
});
