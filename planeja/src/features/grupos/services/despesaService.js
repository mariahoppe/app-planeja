import { get, post, put, del } from '../../../api/api';

// Toda despesa vive dentro de um grupo, por isso toda URL começa com /grupos/:grupoId.

export function listar(grupoId) {
  return get(`/grupos/${grupoId}/despesas`);
}

export function criar(grupoId, dados) {
  return post(`/grupos/${grupoId}/despesas`, dados);
}

export function buscarPorId(grupoId, despesaId) {
  return get(`/grupos/${grupoId}/despesas/${despesaId}`);
}

export function atualizar(grupoId, despesaId, dados) {
  return put(`/grupos/${grupoId}/despesas/${despesaId}`, dados);
}

export function excluir(grupoId, despesaId) {
  return del(`/grupos/${grupoId}/despesas/${despesaId}`);
}

// Acerto de contas pronto do backend: saldos e "quem paga a quem".
export function contas(grupoId) {
  return get(`/grupos/${grupoId}/contas`);
}
