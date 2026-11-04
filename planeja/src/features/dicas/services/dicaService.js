import { del, get, post, put } from '../../../api/api';

// Dicas de todos os usuários, da mais recente para a mais antiga.
// "filtro": { busca, escopo }. A API compara sem acento e sem maiúsculas, na cidade e no país;
// escopo 'todos' (ou vazio) não filtra.
export function listar({ busca, escopo } = {}) {
  return get('/dicas', { busca, escopo });
}

// Uma dica com o autor ({ id, nome, foto_url }) e as fotos ({ id, bloco, url, legenda, ordem }).
export function buscarPorId(id) {
  return get(`/dicas/${id}`);
}

// Cria uma dica. "dados": { cidade, pais, escopo, onde_comer, o_que_fazer, onde_visitar, onde_ficar }.
export function criar(dados) {
  return post('/dicas', dados);
}

// Atualiza uma dica (só o autor). "dados": qualquer um dos campos (pelo menos 1).
export function atualizar(id, dados) {
  return put(`/dicas/${id}`, dados);
}

// Exclui uma dica (só o autor). As fotos dela saem junto.
export function excluir(id) {
  return del(`/dicas/${id}`);
}

// Registra na dica uma foto que já está no armazenamento. "foto": { bloco, url }.
export function adicionarFoto(id, foto) {
  return post(`/dicas/${id}/fotos`, foto);
}

// Tira uma foto da dica.
export function removerFoto(id, fotoId) {
  return del(`/dicas/${id}/fotos/${fotoId}`);
}
