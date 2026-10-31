import { del, get, patch, post, put } from '../../../api/api';

// Lista as atividades de um roteiro, já ordenadas por dia e horário.
export function listar(roteiroId) {
  return get('/atividades', { roteiro_id: roteiroId });
}

// Cria uma atividade. "dados": { titulo, roteiro_id, dia, horario, local?, custo?, link?, obs? }.
export function criar(dados) {
  return post('/atividades', dados);
}

// Atualiza uma atividade. "dados": qualquer um dos campos (pelo menos 1).
export function atualizar(id, dados) {
  return put(`/atividades/${id}`, dados);
}

// Exclui uma atividade.
export function excluir(id) {
  return del(`/atividades/${id}`);
}

// Marca como feita ou desfaz, e devolve a atividade atualizada.
export function alternarFeita(id) {
  return patch(`/atividades/${id}/toggle`);
}
