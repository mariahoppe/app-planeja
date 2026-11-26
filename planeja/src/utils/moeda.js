// Valores em dinheiro guardados como centavos inteiros
// Inteiro não tem problema de vírgula/ponto nem de arredondamento

export const MAX_DIGITOS = 10;

export function formatarCentavos(centavos) {
  if (centavos == null) return '';
  const texto = String(centavos).padStart(3, '0');
  const inteiro = texto.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${inteiro},${texto.slice(-2)}`;
}

// Valor que vem da API ("120.50" ou 120.5) → 12050.
export function paraCentavos(valor) {
  return Math.round(Number(valor) * 100);
}

/**
 * Novo valor do campo de moeda depois que a pessoa mexeu no texto.
 * Funciona como visor de calculadora: o dígito digitado entra sempre no fim e o
 * apagar tira o último, em qualquer posição do cursor (digitar 4-0-0-0 mostra 40,00).
 */
export function editarCentavos(atual, antes, depois, substituir) {
  let ini = 0;
  while (ini < antes.length && ini < depois.length && antes[ini] === depois[ini]) ini += 1;
  let fim = 0;
  while (
    fim < antes.length - ini &&
    fim < depois.length - ini &&
    antes[antes.length - 1 - fim] === depois[depois.length - 1 - fim]
  ) {
    fim += 1;
  }
  const digitados = depois.slice(ini, depois.length - fim).replace(/\D/g, '');
  const apagados = antes.slice(ini, antes.length - fim).replace(/\D/g, '').length;

  if (digitados) {
    const base = substituir || atual == null ? '' : String(atual);
    const juntos = (base + digitados).replace(/^0+/, '');
    if (juntos.length > MAX_DIGITOS) return atual; // passou do limite: ignora a tecla
    return juntos ? Number(juntos) : null;
  }

  if (substituir || atual == null || !/\d/.test(depois)) return null;
  const restante = Math.floor(atual / 10 ** Math.max(1, apagados));
  return restante > 0 ? restante : null;
}
