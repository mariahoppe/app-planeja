import { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Subir } from '../components/atoms/Subir';
import { espacoParaBarraAbas } from '../components/organisms/BarraAbas';
import { colors, fonts } from '../config/theme';

/**
 * Aviso curto do protótipo (ex.: "Atividade adicionada."), por cima de todas as telas.
 * Qualquer tela usa assim: const toast = useToast(); toast('Mensagem');
 *
 * Um Modal (como o PainelInferior) é desenhado por cima de tudo, inclusive do
 * aviso do provider. Por isso o desenho fica no AvisoToast, que o painel também
 * renderiza dentro dele: o aviso aparece por cima do painel, como no protótipo.
 */

const DURACAO_MS = 2600;

const ToastContext = createContext(null);
const MensagemContext = createContext(null);

export function ToastProvider({ children }) {
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    if (!mensagem) return undefined;
    const temporizador = setTimeout(() => setMensagem(null), DURACAO_MS);
    return () => clearTimeout(temporizador);
  }, [mensagem]);

  return (
    <ToastContext.Provider value={setMensagem}>
      <MensagemContext.Provider value={mensagem}>
        {children}
        <AvisoToast />
      </MensagemContext.Provider>
    </ToastContext.Provider>
  );
}

/** O aviso em si; desenha nada quando não há mensagem. */
export function AvisoToast() {
  const mensagem = useContext(MensagemContext);
  // Logo acima de onde a barra de abas flutua, como o bottom:104 do protótipo
  const margens = useSafeAreaInsets();
  if (!mensagem) return null;

  return (
    <Subir key={mensagem} style={[styles.toast, { bottom: espacoParaBarraAbas(margens) - 12 }]} pointerEvents="none">
      <Text style={styles.texto} accessibilityLiveRegion="polite">
        {mensagem}
      </Text>
    </Subir>
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
