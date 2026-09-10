import { apiRequest } from './api';

export function listarRespostas(idPostagem) {
  return apiRequest(`/respostas?id_postagem=${idPostagem}`);
}

export function criarResposta(idPostagem, texto) {
  return apiRequest('/respostas', {
    method: 'POST',
    body: { id_postagem: idPostagem, resposta: texto },
  });
}
