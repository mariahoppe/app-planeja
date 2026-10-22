import AsyncStorage from '@react-native-async-storage/async-storage';

export async function salvarLocal(chave, valor) {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

// Devolve o valor gravado ou null se não existir
export async function obterLocal(chave) {
  const texto = await AsyncStorage.getItem(chave);
  if (!texto) {
    return null;
  }
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export async function removerLocal(chave) {
  await AsyncStorage.removeItem(chave);
}
