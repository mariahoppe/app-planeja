/**
 * SERVICE — storage (versão Expo)
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHAVE_TOKEN = 'auth_token';
const CHAVE_USUARIO = 'auth_usuario';

const noWeb = Platform.OS === 'web';

async function setItem(chave, valor) {
  if (noWeb) {
    localStorage.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

async function getItem(chave) {
  if (noWeb) {
    return localStorage.getItem(chave);
  }
  return SecureStore.getItemAsync(chave);
}

async function removeItem(chave) {
  if (noWeb) {
    localStorage.removeItem(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave);
}

export async function salvarToken(token) {
  await setItem(CHAVE_TOKEN, token);
}

export async function obterToken() {
  return getItem(CHAVE_TOKEN);
}

export async function removerToken() {
  await removeItem(CHAVE_TOKEN);
  await removeItem(CHAVE_USUARIO);
}

export async function salvarUsuario(usuario) {
  await setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function obterUsuario() {
  const raw = await getItem(CHAVE_USUARIO);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
