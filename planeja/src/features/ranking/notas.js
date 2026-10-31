// Regras e textos das notas de custo-benefício (0 a 10, uma casa), espelhando o avaliacaoValidator da API.

// 8.3 → "8,3"
export function formatarNota(nota) {
  return Number(nota).toFixed(1).replace('.', ',');
}

// Frase curta que traduz a nota para quem está avaliando.
export function descreverNota(nota) {
  if (nota === null || nota === undefined) return 'Arraste para dar a nota';
  if (nota < 4) return 'Caro pelo que entrega';
  if (nota < 6) return 'Razoável';
  if (nota < 8) return 'Bom custo-benefício';
  if (nota < 9.5) return 'Ótimo custo-benefício';
  return 'Imperdível';
}

// Mesma regra do banco (public.norm): sem acento, sem caixa e sem espaços nas pontas.
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export function mesmoDestino(a, b) {
  return normalizar(a.cidade) === normalizar(b.cidade) && normalizar(a.pais) === normalizar(b.pais);
}

// Devolve um objeto de erros por campo ({} = tudo certo).
export function validarAvaliacao({ cidade, pais, nota }) {
  const e = {};

  if (!cidade.trim()) e.cidade = 'Informe a cidade';
  else if (cidade.trim().length > 80) e.cidade = 'Cidade deve ter no máximo 80 caracteres';

  if (!pais.trim()) e.pais = 'Informe o país';
  else if (pais.trim().length > 60) e.pais = 'País deve ter no máximo 60 caracteres';

  if (nota === null) e.nota = 'Dê uma nota de 0 a 10';
  else if (nota < 0 || nota > 10) e.nota = 'A nota vai de 0 a 10';

  return e;
}
