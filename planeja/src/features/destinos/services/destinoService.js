import { get, post, put, del } from '../../../api/api';

// Lista os destinos. "filtros" é opcional: { busca, escopo } (escopo: todos | nacional | internacional).
export function listar(filtros) {
  return get('/destinos', filtros);
}

// Cria um destino. "dados": { cidade, pais, escopo?, periodo?, obs? }.
export function criar(dados) {
  return post('/destinos', dados);
}

// Busca um destino pelo id.
export function buscarPorId(id) {
  return get(`/destinos/${id}`);
}

// Atualiza um destino. "dados": qualquer um dos campos (pelo menos 1).
export function atualizar(id, dados) {
  return put(`/destinos/${id}`, dados);
}

// Exclui um destino. Na API a exclusão leva junto os roteiros vinculados.
export function excluir(id) {
  return del(`/destinos/${id}`);
}
