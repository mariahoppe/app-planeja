// Regras do formulário de atividade: as do protótipo, espelhando o atividadeValidator da API.
const HORARIO = /^([01]?\d|2[0-3]):[0-5]\d$/;
const LINK = /^https?:\/\/\S+$/i;

// "120,50" → 120.5 (o teclado brasileiro usa vírgula). Vazio vale 0: atividade gratuita.
export function lerCusto(texto) {
  return Number(texto.trim().replace(',', '.'));
}

// Devolve um objeto de erros por campo ({} = tudo certo).
export function validarAtividade({ titulo, data, horario, custo, link }, roteiro) {
  const e = {};

  if (!titulo.trim()) e.titulo = 'Informe a atividade';
  if (!HORARIO.test(horario.trim())) e.horario = 'Use o formato 14:30';

  if (!data) e.data = 'Escolha uma data';
  else if (data < roteiro.inicio || (roteiro.fim && data > roteiro.fim)) e.data = 'Fora do período da viagem';

  const valor = lerCusto(custo);
  if (Number.isNaN(valor)) e.custo = 'Informe um valor, ex: 120,50';
  else if (valor < 0) e.custo = 'Custo não pode ser negativo';

  if (link.trim() && !LINK.test(link.trim())) e.link = 'O link deve começar com http:// ou https://';

  return e;
}
