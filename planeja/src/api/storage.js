/**
 * Sessão no dispositivo, em duas gavetas — cada dado no lugar certo:
 *   - token   → expo-secure-store (cofre do sistema): é segredo, abre a conta
 *   - usuario → AsyncStorage (services/armazenamentoLocal): não é segredo
 * No web o SecureStore não existe, então o token cai no localStorage.
 * Senha nunca é gravada.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { obterLocal, removerLocal, salvarLocal } from '../services/armazenamentoLocal';

const CHAVE_TOKEN = 'planeja_token';
const CHAVE_USUARIO = 'planeja_usuario';

const noWeb = Platform.OS === 'web';

// O cofre só abre com o aparelho desbloqueado e o token não vai para backup/outro aparelho.
const opcoesCofre = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export async function salvarToken(token) {
  if (noWeb) {
    localStorage.setItem(CHAVE_TOKEN, token);
    return;
  }
  await SecureStore.setItemAsync(CHAVE_TOKEN, token, opcoesCofre);
}

export async function obterToken() {
  if (noWeb) {
    return localStorage.getItem(CHAVE_TOKEN);
  }
  return SecureStore.getItemAsync(CHAVE_TOKEN);
}

async function removerToken() {
  if (noWeb) {
    localStorage.removeItem(CHAVE_TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}

export async function salvarUsuario(usuario) {
  await salvarLocal(CHAVE_USUARIO, usuario);
}

export async function obterUsuario() {
  return obterLocal(CHAVE_USUARIO);
}

export async function limparSessao() {
  await Promise.all([removerToken(), removerLocal(CHAVE_USUARIO)]);
}
