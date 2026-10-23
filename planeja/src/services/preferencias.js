import { obterLocal, salvarLocal } from './armazenamentoLocal';

/**
 * Preferências do aparelho (switches de Configurações) no AsyncStorage.
 * Não são segredo e não pertencem à conta: continuam depois do logout.
 */

const CHAVE = 'planeja_preferencias';

export const PREFERENCIAS_PADRAO = {
  notificacoes: true,
  modoEscuro: false,
};

// O que estiver gravado por cima do padrão (preferência nova ganha valor padrão).
export async function obterPreferencias() {
  const gravadas = await obterLocal(CHAVE);
  return { ...PREFERENCIAS_PADRAO, ...(gravadas || {}) };
}

// Grava só o que mudou, sem perder as outras preferências.
export async function salvarPreferencias(mudancas) {
  const atuais = await obterPreferencias();
  const novas = { ...atuais, ...mudancas };
  await salvarLocal(CHAVE, novas);
  return novas;
}
