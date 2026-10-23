import { get, post } from '../../../api/api';
import { limparSessao, salvarToken, salvarUsuario } from '../../../api/storage';
import { limparPerfilLocal } from '../../../services/perfilLocal';

/**
 * Autenticação do app contra a API real (server/):
 *   POST /auth/login · POST /auth/registro · POST /auth/esqueci-senha · GET /usuarios/perfil
 * Login e cadastro devolvem { usuario, token }: o token vai para o cofre e o
 * usuário para o AsyncStorage (ver api/storage.js). A senha só viaja no corpo do POST.
 * Erros chegam como ApiError, com a mensagem pronta da API (ex.: "Email ou senha incorretos").
 */

async function persistirSessao({ usuario, token }) {
  await Promise.all([salvarToken(token), salvarUsuario(usuario)]);
  return { usuario, token };
}

export async function login(email, senha) {
  const resposta = await post('/auth/login', { email, senha });
  return persistirSessao(resposta);
}

export async function cadastrar(nome, email, senha) {
  const resposta = await post('/auth/registro', { nome, email, senha });
  return persistirSessao(resposta);
}

export async function esqueciSenha(email) {
  return post('/auth/esqueci-senha', { email });
}

// Confere com a API se o token salvo ainda vale e devolve o usuário atualizado.
export async function perfil() {
  const usuario = await get('/usuarios/perfil');
  await salvarUsuario(usuario);
  return usuario;
}

// Apaga o que é da conta: token, usuário, foto e localização.
// As preferências (services/preferencias) são do aparelho e ficam.
export async function sair() {
  await Promise.all([limparSessao(), limparPerfilLocal()]);
}
