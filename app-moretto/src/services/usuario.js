import { apiRequest } from './api';

export function listarUsuarios() {
  return apiRequest('/usuarios?com_status=1');
}

export function seguirUsuario(id) {
  return apiRequest(`/seguir/${id}`, { method: 'POST' });
}

export function deixarDeSeguir(id) {
  return apiRequest(`/seguir/${id}`, { method: 'DELETE' });
}

export function listarSeguindo() {
  return apiRequest('/seguindo');
}
