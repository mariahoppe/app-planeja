import { get, post, put, del } from '../../../api/api';

// Lista os roteiros. "filtros" é opcional: { busca, status, destino_id, ordenar }.
export function listar(filtros) {
  return get('/roteiros', filtros);
}

// Cria um roteiro. "dados": { titulo, destino_id, inicio, fim?, status?, obs? }.
export function criar(dados) {
  return post('/roteiros', dados);
}

// Busca um roteiro pelo id (vem com atividades, destino e custo_total).
export function buscarPorId(id) {
  return get(`/roteiros/${id}`);
}

// Atualiza um roteiro. "dados": qualquer um dos campos (pelo menos 1).
export function atualizar(id, dados) {
  return put(`/roteiros/${id}`, dados);
}

// Exclui um roteiro.
export function excluir(id) {
  return del(`/roteiros/${id}`);
}

// Resumo do roteiro: { total_atividades, concluidas, percentual, custo_total }.
export function resumo(id) {
  return get(`/roteiros/${id}/resumo`);
}
