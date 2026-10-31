import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido';

/**
 * Entrada do painel e do aviso do protótipo: sobe 30 pontos enquanto aparece.
 * duracao: tempo da animação em milissegundos.
 */
export function Subir({ duracao = 200, children, style, ...props }) {
  const reduzido = useMovimentoReduzido();
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: duracao,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [entrada, duracao]);

  const deslocamento = entrada.interpolate({ inputRange: [0, 1], outputRange: [reduzido ? 0 : 30, 0] });
  const opacidade = entrada.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View {...props} style={[style, { opacity: opacidade, transform: [{ translateY: deslocamento }] }]}>
      {children}
    </Animated.View>
  );
}
