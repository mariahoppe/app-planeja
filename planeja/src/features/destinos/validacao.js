// Regras do formulário de destino, espelhando o destinoValidator da API.
export const ESCOPOS = [
  { valor: 'nacional', rotulo: 'Nacional' },
  { valor: 'internacional', rotulo: 'Internacional' },
];

export function rotuloEscopo(valor) {
  return ESCOPOS.find((e) => e.valor === valor)?.rotulo ?? valor;
}

// Devolve um objeto de erros por campo ({} = tudo certo).
export function validarDestino({ cidade, pais, periodo }) {
  const e = {};

  if (!cidade.trim()) e.cidade = 'Informe a cidade';
  else if (cidade.trim().length > 80) e.cidade = 'Cidade deve ter no máximo 80 caracteres';

  if (!pais.trim()) e.pais = 'Informe o país';
  else if (pais.trim().length > 60) e.pais = 'País deve ter no máximo 60 caracteres';

  if (periodo.trim().length > 40) e.periodo = 'Período deve ter no máximo 40 caracteres';

  return e;
}
