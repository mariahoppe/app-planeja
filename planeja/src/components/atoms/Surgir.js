import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido';

/**
 * Entrada suave: o conteúdo aparece subindo um pouco. Com "atraso" diferente
 * em cada bloco, a tela se monta em cascata.
 */
export function Surgir({ atraso = 0, children, style }) {
  const reduzido = useMovimentoReduzido();
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: 560,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrada, atraso]);

  const deslocamento = entrada.interpolate({ inputRange: [0, 1], outputRange: [reduzido ? 0 : 18, 0] });

  return (
    <Animated.View style={[style, { opacity: entrada, transform: [{ translateY: deslocamento }] }]}>
      {children}
    </Animated.View>
  );
}
