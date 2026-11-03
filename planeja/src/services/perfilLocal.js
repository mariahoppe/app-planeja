import { obterLocal, removerLocal, salvarLocal } from './armazenamentoLocal';

/**
 * Última localização, guardada só neste aparelho (AsyncStorage).
 * É dado pessoal da conta, então some no logout (limparPerfilLocal).
 * A foto de perfil não fica aqui: ela é gravada no banco (usuarios.foto_url).
 */

const CHAVE_LOCALIZACAO = 'planeja_perfil_localizacao';

export function obterLocalizacao() {
  return obterLocal(CHAVE_LOCALIZACAO);
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
  await removerLocal(CHAVE_LOCALIZACAO);
}
