import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Guarda a sessão (token + usuário) no aparelho, para o app abrir já logado.
 * No celular usa o SecureStore (armazenamento criptografado do sistema).
 * No navegador o SecureStore não existe, então cai no localStorage.
 */

const CHAVE = 'planeja_sessao';
const noWeb = Platform.OS === 'web';

export async function salvarSessao(token, usuario) {
  const texto = JSON.stringify({ token, usuario });
  if (noWeb) {
    localStorage.setItem(CHAVE, texto);
    return;
  }
  await SecureStore.setItemAsync(CHAVE, texto);
}

// Devolve { token, usuario } ou null se não houver sessão salva.
export async function obterSessao() {
  const texto = noWeb ? localStorage.getItem(CHAVE) : await SecureStore.getItemAsync(CHAVE);
  if (!texto) {
    return null;
  }
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export async function limparSessao() {
  if (noWeb) {
    localStorage.removeItem(CHAVE);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE);
}
