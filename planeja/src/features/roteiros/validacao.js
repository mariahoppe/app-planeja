// Regras do formulário de roteiro, espelhando o roteiroValidator da API.
import { STATUS_VIAGEM } from '../inicio/formatos';

export const MAX_TITULO = 100;

// [{ valor: 'planejando', rotulo: 'Planejando' }, ...] na ordem da viagem.
export const STATUS = Object.entries(STATUS_VIAGEM).map(([valor, rotulo]) => ({ valor, rotulo }));

// Filtro da lista de roteiros: no plural, como no protótipo ("Todos / Planejando / Confirmados")
export const FILTROS_STATUS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'planejando', rotulo: 'Planejando' },
  { valor: 'confirmado', rotulo: 'Confirmados' },
  { valor: 'concluido', rotulo: 'Concluídos' },
];

// Devolve um objeto de erros por campo ({} = tudo certo).
export function validarRoteiro({ titulo, destinoId, inicio, fim }) {
  const e = {};
  const limpo = titulo.trim();

  if (!limpo) e.titulo = 'Informe um título';
  else if (limpo.length > MAX_TITULO) e.titulo = `Use no máximo ${MAX_TITULO} caracteres`;

  if (!destinoId) e.destino = 'Escolha o destino';
  if (!inicio) e.inicio = 'Informe a data de início';
  if (inicio && fim && fim < inicio) e.fim = 'Fim antes do início';

  return e;
}
