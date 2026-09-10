import { apiRequest } from './api';

export function listarFeed() {
  return apiRequest('/postagens?feed=seguindo');
}

export function listarTodas() {
  return apiRequest('/postagens');
}

export function buscarPostagem(id) {
  return apiRequest(`/postagens/${id}`);
}

export function criarPostagem(texto) {
  return apiRequest('/postagens', {
    method: 'POST',
    body: { postagem: texto },
  });
}

export function removerPostagem(id) {
  return apiRequest(`/postagens/${id}`, { method: 'DELETE' });
}
