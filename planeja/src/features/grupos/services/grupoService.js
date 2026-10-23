import { get, post, put, del } from '../../../api/api';

export function listar() {
    return get('/grupos');
}

export function criar(dados) {
    return post('/grupos', dados); // dados = { nome, roteiro_id }
}

export function entrar(codigo) {
    return post('/grupos/entrar', { codigo_convite: codigo });
}

export function buscarPorId(id) {
    return get(`/grupos/${id}`);
}

export function atualizar(id, dados) {
    return put(`/grupos/${id}`, dados); // dados = { nome }
}

export function excluir(id) {
    return del(`/grupos/${id}`);
}

export function sair(id) {
    return post(`/grupos/${id}/sair`); // POST sem corpo
}

export function removerIntegrante(id, usuarioId) {
    return del(`/grupos/${id}/integrantes/${usuarioId}`);
}
