import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../features/auth/services/authService';
import { obterSessao } from '../features/auth/services/sessao';

/**
 * Estado global de autenticação: quem está logado e as ações de entrar/sair.
 * Envolve o app inteiro no App.js; qualquer tela lê com useAuth().
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [restaurando, setRestaurando] = useState(true);

  useEffect(() => {
    obterSessao()
      .then((sessao) => setUsuario(sessao?.usuario ?? null))
      .finally(() => setRestaurando(false));
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
