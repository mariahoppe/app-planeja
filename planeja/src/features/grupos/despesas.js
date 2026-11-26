// Regras das despesas do grupo, espelhando o despesaValidator e o rateio.js da API.

import { formatarCentavos } from '../../utils/moeda';

export const MAX_DESCRICAO = 120;

export const CATEGORIAS = [
  { valor: 'alimentacao', rotulo: 'Alimentação' },
  { valor: 'hospedagem', rotulo: 'Hospedagem' },
  { valor: 'transporte', rotulo: 'Transporte' },
  { valor: 'atividade', rotulo: 'Atividade' },
  { valor: 'outros', rotulo: 'Outros' },
];

export const MODOS_DIVISAO = [
  { valor: 'igual', rotulo: 'Igual' },
  { valor: 'personalizada', rotulo: 'Personalizada' },
];

export function rotuloCategoria(valor) {
  return CATEGORIAS.find((c) => c.valor === valor)?.rotulo ?? 'Outros';
}

const doisDigitos = (n) => String(n).padStart(2, '0');

// Data de hoje no fuso do aparelho, como "2026-11-17" (toISOString daria a data em UTC).
export function hojeISO(agora = new Date()) {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/**
 * Divisão igual em centavos, igual à da API: a sobra vai para os primeiros
 * integrantes (38000 entre três = 12667 / 12667 / 12666).
 */
export function dividirIgual(totalCentavos, ids) {
  if (!ids.length || totalCentavos == null) return {};
  const base = Math.floor(totalCentavos / ids.length);
  let sobra = totalCentavos - base * ids.length;
  const porId = {};
  ids.forEach((id) => {
    porId[id] = base + (sobra > 0 ? 1 : 0);
    if (sobra > 0) sobra -= 1;
  });
  return porId;
}

// Soma, em centavos, dos valores por pessoa (campo vazio conta zero).
export function somaRateio(valores) {
  return Object.values(valores).reduce((soma, c) => soma + (c ?? 0), 0);
}

/**
 * Devolve um objeto de erros por campo ({} = tudo certo).
 * valores: { [usuarioId]: centavos } na divisão personalizada.
 */
export function validarDespesa({ descricao, totalCentavos, data, pagadorId, modo, valores }) {
  const e = {};
  const limpa = descricao.trim();

  if (!limpa) e.descricao = 'Descreva a despesa';
  else if (limpa.length > MAX_DESCRICAO) e.descricao = `Use no máximo ${MAX_DESCRICAO} caracteres`;

  if (totalCentavos == null) e.valor = 'Informe um valor';
  else if (totalCentavos <= 0) e.valor = 'O valor deve ser maior que zero';

  if (!data) e.data = 'Informe a data da despesa';
  if (!pagadorId) e.pagador = 'Escolha quem pagou';

  if (modo === 'personalizada' && !e.valor) {
    const diferenca = totalCentavos - somaRateio(valores);
    if (diferenca > 0) e.rateio = `Faltam R$ ${formatarCentavos(diferenca)} para fechar o total`;
    else if (diferenca < 0) e.rateio = `A soma passou R$ ${formatarCentavos(-diferenca)} do total`;
  }

  return e;
}
