import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../../api/config';
import * as dicaService from './dicaService';

// O arquivo vai para o bucket público "dicas" do Supabase Storage; a API guarda só o endereço.
const BUCKET = 'dicas';

// Envia uma foto do aparelho para o bucket e devolve o endereço público dela.
async function enviarArquivo(uri, caminho) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('O envio de fotos não está configurado (faltam as chaves do Supabase no .env).');
  }

  // A foto vai como o próprio corpo da requisição (bytes do JPEG). Não dá para usar
  // FormData com { uri }: no SDK 58 o fetch global é o expo/fetch, que não aceita esse formato.
  let bytes;
  try {
    bytes = new Uint8Array(await (await fetch(uri)).arrayBuffer());
  } catch {
    throw new Error('Não foi possível ler a foto no aparelho. Escolha outra.');
  }

  let resposta;
  try {
    resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${caminho}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'image/jpeg',
      },
      body: bytes,
    });
  } catch {
    throw new Error('Não foi possível enviar a foto. Verifique sua internet.');
  }

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => null);
    throw new Error(erro?.message || `Erro ao enviar a foto (HTTP ${resposta.status})`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${caminho}`;
}

/**
 * Aplica na dica as mudanças de fotos do formulário: primeiro tira as removidas (libera
 * espaço no bloco), depois envia e registra as novas. Uma de cada vez, porque a API
 * escolhe o primeiro espaço livre do bloco para cada foto que chega.
 * Devolve { falhas, motivo }: quantas não deram certo e a mensagem da primeira.
 */
export async function salvarFotos(dicaId, { novas, removidas }) {
  let falhas = 0;
  let motivo = null;
  const registrarFalha = (e) => {
    falhas += 1;
    motivo = motivo ?? e.message;
  };

  for (const fotoId of removidas) {
    try {
      await dicaService.removerFoto(dicaId, fotoId);
    } catch (e) {
      registrarFalha(e);
    }
  }

  for (const foto of novas) {
    try {
      const nome = `${foto.bloco}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const url = await enviarArquivo(foto.uri, `${dicaId}/${nome}`);
      await dicaService.adicionarFoto(dicaId, { bloco: foto.bloco, url });
    } catch (e) {
      registrarFalha(e);
    }
  }

  return { falhas, motivo };
}
