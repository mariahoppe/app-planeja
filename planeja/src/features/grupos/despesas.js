// Regras das despesas do grupo, espelhando o despesaValidator e o rateio.js da API.

export const MAX_DESCRICAO = 120;

export const CATEGORIAS = [
  { valor: 'alimentacao', rotulo: 'Alimentação' },
  { valor: 'hospedagem', rotulo: 'Hospedagem' },
  { valor: 'transporte', rotulo: 'Transporte' },
  { valor: 'atividade', rotulo: 'Atividade' },
  { valor: 'outros', rotulo: 'Outros' },
];

export const MODOS_DIVISAO = [
  { valor: 'igual', rotulo: 'Dividir igual' },
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

// "1.234,56" ou "120,5" → número. Vazio ou inválido → NaN.
export function lerValor(texto) {
  const limpo = String(texto ?? '').trim().replace(/\s/g, '');
  if (!limpo) return NaN;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return /^\d+(\.\d{0,2})?$/.test(normal) ? Number(normal) : NaN;
}

// 120.5 → "120,50", para preencher o campo ao editar.
export function textoValor(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}

const centavos = (v) => Math.round(Number(v) * 100);

/**
 * Divisão igual em centavos inteiros, igual à da API: a sobra vai para os
 * primeiros integrantes (R$ 380,00 entre três = 126,67 / 126,67 / 126,66).
 */
export function dividirIgual(valor, ids) {
  if (!ids.length || Number.isNaN(valor)) return {};
  const total = centavos(valor);
  const base = Math.floor(total / ids.length);
  let sobra = total - base * ids.length;
  const porId = {};
  ids.forEach((id) => {
    porId[id] = (base + (sobra > 0 ? 1 : 0)) / 100;
    if (sobra > 0) sobra -= 1;
  });
  return porId;
}

// Soma dos valores digitados por pessoa (campos vazios contam zero).
export function somaRateio(valores) {
  return Object.values(valores).reduce((s, t) => {
    const v = lerValor(t);
    return s + (Number.isNaN(v) ? 0 : centavos(v));
  }, 0) / 100;
}

/**
 * Devolve um objeto de erros por campo ({} = tudo certo).
 * valores: { [usuarioId]: texto digitado } na divisão personalizada.
 */
export function validarDespesa({ descricao, valor, data, pagadorId, modo, valores }) {
  const e = {};
  const limpa = descricao.trim();

  if (!limpa) e.descricao = 'Descreva a despesa';
  else if (limpa.length > MAX_DESCRICAO) e.descricao = `Use no máximo ${MAX_DESCRICAO} caracteres`;

  const total = lerValor(valor);
  if (Number.isNaN(total)) e.valor = 'Informe um valor, ex: 120,50';
  else if (total <= 0) e.valor = 'O valor deve ser maior que zero';

  if (!data) e.data = 'Informe a data da despesa';
  if (!pagadorId) e.pagador = 'Escolha quem pagou';

  if (modo === 'personalizada') {
    const invalido = Object.values(valores).some((t) => String(t).trim() && Number.isNaN(lerValor(t)));
    if (invalido) {
      e.rateio = 'Use valores como 45,90';
    } else if (!e.valor) {
      const diferenca = (centavos(total) - centavos(somaRateio(valores))) / 100;
      if (diferenca > 0) e.rateio = `Faltam R$ ${textoValor(diferenca)} para fechar o total`;
      else if (diferenca < 0) e.rateio = `A soma passou R$ ${textoValor(-diferenca)} do total`;
    }
  }

  return e;
}
