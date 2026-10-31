import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';

/**
 * Número que "conta" do valor anterior até o novo (ex.: 0 → 137 dias).
 * formatar: transforma o número em texto (padrão: inteiro).
 */
export function NumeroAnimado({ valor, duracao = 1100, atraso = 0, formatar = Math.round, style }) {
  const animado = useRef(new Animated.Value(0)).current;
  const [texto, setTexto] = useState(String(formatar(0)));

  useEffect(() => {
    const ouvinte = animado.addListener(({ value }) => setTexto(String(formatar(value))));
    Animated.timing(animado, {
      toValue: valor,
      duration: duracao,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animado.removeListener(ouvinte);
    // "formatar" fica de fora: costuma ser uma função nova a cada render.
  }, [animado, valor, duracao, atraso]);

  return (
    <Text style={style} accessibilityLabel={String(formatar(valor))}>
      {texto}
    </Text>
  );
}
