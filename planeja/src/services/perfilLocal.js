import { obterLocal, removerLocal, salvarLocal } from './armazenamentoLocal';

/**
 * Foto do perfil e última localização, guardadas só neste aparelho (AsyncStorage).
 * Ainda não sobem para a API: falta a rota de upload no backend.
 * São dados pessoais da conta, então somem no logout (limparPerfilLocal).
 */

const CHAVE_FOTO = 'planeja_perfil_foto';
const CHAVE_LOCALIZACAO = 'planeja_perfil_localizacao';

export async function obterPerfilLocal() {
  const [foto, localizacao] = await Promise.all([
    obterLocal(CHAVE_FOTO),
    obterLocal(CHAVE_LOCALIZACAO),
  ]);
  return { fotoUri: foto?.uri ?? null, localizacao };
}

export async function salvarFotoLocal(uri) {
  await salvarLocal(CHAVE_FOTO, { uri });
}

export async function salvarLocalizacao(posicao) {
  await salvarLocal(CHAVE_LOCALIZACAO, {
    latitude: posicao.latitude,
    longitude: posicao.longitude,
    precisao: posicao.precisao ?? null,
    cidade: posicao.cidade ?? null,
    pais: posicao.pais ?? null,
    em: Date.now(),
  });
}

export async function limparPerfilLocal() {
  await Promise.all([removerLocal(CHAVE_FOTO), removerLocal(CHAVE_LOCALIZACAO)]);
}
