import { get, post, put, del } from '../../../api/api';

// Lista os destinos do usuário. "filtros" é opcional: { busca, escopo }.
// busca procura na cidade e no país; escopo: 'todos' | 'nacional' | 'internacional'.
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

// Exclui um destino. A API apaga junto os roteiros, atividades, grupo e despesas dele.
export function excluir(id) {
  return del(`/destinos/${id}`);
}
