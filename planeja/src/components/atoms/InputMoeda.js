import { useRef } from 'react';

import { editarCentavos, formatarCentavos } from '../../utils/moeda';
import { Input } from './Input';

/**
 * Campo de valor em dinheiro: só aceita dígitos e preenche pelos centavos.
 */
export function InputMoeda({ centavos, onChange, onFocus, ...props }) {
  const substituir = useRef(false);
  const texto = formatarCentavos(centavos);

  return (
    <Input
      placeholder="0,00"
      keyboardType="number-pad"
      selectTextOnFocus
      {...props}
      value={texto}
      onFocus={(e) => {
        substituir.current = true;
        onFocus?.(e);
      }}
      onChangeText={(novo) => {
        const valor = editarCentavos(centavos, texto, novo, substituir.current);
        substituir.current = false;
        onChange(valor);
      }}
    />
  );
}
