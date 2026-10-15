import { limparSessao, salvarSessao } from './sessao';

/**
 * Autenticação do app — VERSÃO FALSA, enquanto o cliente da API não existe.
 * Devolve o mesmo formato da API real ({ usuario, token }), então quem usa
 * este arquivo não muda quando trocarmos pelas chamadas de verdade:
 *   POST /auth/login · POST /auth/registro · POST /auth/esqueci-senha
 */

const SENHA_FALSA = 'planeja123'; // a mesma das contas de teste do seed

// Simula a demora da rede, para as telas mostrarem o "carregando".
function esperar(ms = 800) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

function tokenFalso() {
  return `token-falso-${Date.now()}`;
}

export async function login(email, senha) {
  await esperar();
  if (senha !== SENHA_FALSA) {
    throw new Error('Email ou senha incorretos');
  }
  const usuario = { id: 1, nome: email.split('@')[0], email, perfil: 'comum' };
  const token = tokenFalso();
  await salvarSessao(token, usuario);
  return { usuario, token };
}

export async function cadastrar(nome, email, senha) {
  await esperar();
  const usuario = { id: 2, nome, email, perfil: 'comum' };
  const token = tokenFalso();
  await salvarSessao(token, usuario);
  return { usuario, token };
}

export async function esqueciSenha(email) {
  await esperar();
  return { message: 'Se o email estiver cadastrado, você receberá instruções para redefinir a senha' };
}

export async function sair() {
  await limparSessao();
}
