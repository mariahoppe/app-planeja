import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * true quando a pessoa ativou "Reduzir movimento" no celular.
 * As animações decorativas param nesse caso (acessibilidade).
 */
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduzido);
    const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzido);
    return () => assinatura.remove();
  }, []);

  return reduzido;
}
