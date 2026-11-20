import { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Subir } from '../components/atoms/Subir';
import { espacoParaBarraAbas } from '../components/organisms/BarraAbas';
import { colors, fonts } from '../config/theme';

/**
 * Aviso curto do protótipo (ex.: "Atividade adicionada."), por cima de todas as telas.
 * Qualquer tela usa assim: const toast = useToast(); toast('Mensagem');
 */

const DURACAO_MS = 2600;

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [mensagem, setMensagem] = useState(null);
  // Logo acima de onde a barra de abas flutua, como o bottom:104 do protótipo
  const margens = useSafeAreaInsets();
  const bottom = espacoParaBarraAbas(margens) - 12;

  useEffect(() => {
    if (!mensagem) return undefined;
    const temporizador = setTimeout(() => setMensagem(null), DURACAO_MS);
    return () => clearTimeout(temporizador);
  }, [mensagem]);

  return (
    <ToastContext.Provider value={setMensagem}>
      {children}
      {mensagem ? (
        <Subir key={mensagem} style={[styles.toast, { bottom }]} pointerEvents="none">
          <Text style={styles.texto} accessibilityLiveRegion="polite">
            {mensagem}
          </Text>
        </Subir>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: colors.tinta,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  texto: {
    fontFamily: fonts.corpo,
    fontSize: 12.5,
    color: colors.branco,
  },
});
