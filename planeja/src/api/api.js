/**
 * Cliente HTTP do Planeja: uma instância única do Axios para o app inteiro.
 * A API responde { data } no sucesso e { error: { message, details } } no erro;
 * os helpers abaixo devolvem só o "data" e transformam qualquer falha em ApiError.
 */
import axios from 'axios';
import { API_PREFIX } from './config';
import { limparSessao, obterToken } from './storage';

const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet.';

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const api = axios.create({
  baseURL: API_PREFIX,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await obterToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chamado quando a API recusa o token (401). O AuthContext registra aqui a volta ao login.
let aoExpirarSessao = null;

export function setAoExpirarSessao(fn) {
  aoExpirarSessao = fn;
}

async function tratarErro(erro) {
  const { response, config } = erro;

  if (!response) {
    throw new ApiError(MENSAGEM_SEM_CONEXAO, 0);
  }

  const { status, data } = response;

  // Só é sessão expirada se a requisição levava token: um 401 no login é senha errada.
  if (status === 401 && config?.headers?.Authorization) {
    await limparSessao();
    if (aoExpirarSessao) aoExpirarSessao();
  }

  const message = data?.error?.message || `Erro HTTP ${status}`;
  throw new ApiError(message, status, data?.error?.details);
}

async function requisitar(promessa) {
  try {
    const resposta = await promessa;
    return resposta.data?.data ?? null;
  } catch (erro) {
    return tratarErro(erro);
  }
}

export function get(url, params) {
  return requisitar(api.get(url, { params }));
}

export function post(url, body) {
  return requisitar(api.post(url, body));
}

export function put(url, body) {
  return requisitar(api.put(url, body));
}

export function patch(url, body) {
  return requisitar(api.patch(url, body));
}

export function del(url) {
  return requisitar(api.delete(url));
}

export default api;
