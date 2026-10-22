import { createContext, useContext, useEffect, useState } from 'react';
import { setAoExpirarSessao } from '../api/api';
import { obterToken, obterUsuario } from '../api/storage';
import * as authService from '../features/auth/services/authService';

/**
 * Estado global de autenticação: quem está logado e as ações de entrar/sair.
 * Envolve o app inteiro no App.js; qualquer tela lê com useAuth().
 */

const AuthContext = createContext(null);

// Ao abrir o app: sem token → login. Com token → confere na API (GET /usuarios/perfil).
// Sem internet, entra com o usuário salvo; token recusado (401) → login.
async function restaurarSessao() {
  const token = await obterToken();
  if (!token) {
    return null;
  }
  try {
    return await authService.perfil();
  } catch (erro) {
    if (erro.status === 401) {
      return null; // o api.js já limpou a sessão
    }
    return obterUsuario();
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [restaurando, setRestaurando] = useState(true);

  useEffect(() => {
    // Se a API recusar o token no meio do uso, o api.js chama isto e o app volta ao login.
    setAoExpirarSessao(() => setUsuario(null));

    restaurarSessao()
      .then(setUsuario)
      .finally(() => setRestaurando(false));

    return () => setAoExpirarSessao(null);
  }, []);

  async function entrar(email, senha) {
    const resposta = await authService.login(email, senha);
    setUsuario(resposta.usuario);
  }

  async function cadastrar(nome, email, senha) {
    const resposta = await authService.cadastrar(nome, email, senha);
    setUsuario(resposta.usuario);
  }

  async function sair() {
    await authService.sair();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, restaurando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
