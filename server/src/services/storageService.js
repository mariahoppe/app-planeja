/**
 * Arquivos das fotos das dicas no Supabase Storage.
 *
 * O app envia as fotos direto para o bucket público "dicas" (chave anônima) e a
 * API guarda só o endereço. Quando uma foto ou uma dica é excluída, a API apaga
 * também o arquivo, para o bucket não acumular fotos órfãs.
 *
 * Apagar exige a chave de serviço (SUPABASE_SERVICE_ROLE_KEY), que é secreta e
 * só existe no servidor. Sem ela configurada, a limpeza é pulada com um aviso no
 * log: a exclusão no banco continua funcionando.
 */

const BUCKET = 'dicas';

const configuracao = () => {
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && chave ? { url, chave } : null;
};

// ".../storage/v1/object/public/dicas/12/foto.jpg" → "12/foto.jpg" (só endereços do nosso bucket)
const caminhoNoBucket = (url, arquivoUrl) => {
  const prefixo = `${url}/storage/v1/object/public/${BUCKET}/`;
  return typeof arquivoUrl === 'string' && arquivoUrl.startsWith(prefixo)
    ? decodeURIComponent(arquivoUrl.slice(prefixo.length))
    : null;
};

/**
 * Apaga do bucket os arquivos destes endereços. Nunca lança erro: a foto já
 * saiu do banco, e um arquivo que ficou para trás não deve quebrar a exclusão.
 */
const apagarFotos = async (arquivoUrls) => {
  const config = configuracao();
  if (!config) {
    console.warn('[storage] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes: arquivos das fotos não foram apagados');
    return;
  }

  const caminhos = arquivoUrls.map((u) => caminhoNoBucket(config.url, u)).filter(Boolean);
  if (caminhos.length === 0) return;

  try {
    const resposta = await fetch(`${config.url}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: {
        apikey: config.chave,
        Authorization: `Bearer ${config.chave}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes: caminhos })
    });
    if (!resposta.ok) {
      console.warn(`[storage] falha ao apagar ${caminhos.length} foto(s): HTTP ${resposta.status}`);
    }
  } catch (err) {
    console.warn('[storage] falha ao apagar fotos:', err.message);
  }
};

module.exports = { apagarFotos, caminhoNoBucket };
