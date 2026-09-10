import { apiRequest } from './api';
import {
  obterToken,
  obterUsuario,
  removerToken,
  salvarToken,
  salvarUsuario,
} from './storage';

function persistirSessao(data) {
  const usuario = {
    id: data.id_usuario,
    nome: data.nome,
    login: data.login,
  };
  return Promise.all([salvarToken(data.token), salvarUsuario(usuario)]).then(
    () => ({ token: data.token, usuario }),
  );
}

export async function login(loginOuEmail, senha) {
  const data = await apiRequest('/rpc/login', {
    method: 'POST',
    auth: false,
    body: { login: loginOuEmail, senha },
  });
  return persistirSessao(data);
}

export async function registrar({ nome, login: loginEmail, senha }) {
  const data = await apiRequest('/usuarios', {
    method: 'POST',
    auth: false,
    body: { nome, login: loginEmail, senha },
  });
  return persistirSessao(data);
}

export async function sessaoAtiva() {
  const token = await obterToken();
  if (!token) return false;
  try {
    await apiRequest('/rpc/me');
    return true;
  } catch {
    await removerToken();
    return false;
  }
}

export async function obterSessao() {
  return obterUsuario();
}

export async function logout() {
  await removerToken();
}
