// Regras dos formulários de grupo, espelhando o grupoValidator da API.

export const MAX_NOME_GRUPO = 60;
export const TAMANHO_CODIGO = 6;

// Devolve um objeto de erros por campo ({} = tudo certo). "grupo": { nome, roteiroId }.
export function validarGrupo({ nome, roteiroId }) {
  const e = {};
  const limpo = nome.trim();

  if (!limpo) e.nome = 'Dê um nome ao grupo';
  else if (limpo.length > MAX_NOME_GRUPO) e.nome = `O nome deve ter no máximo ${MAX_NOME_GRUPO} caracteres`;

  if (!roteiroId) e.roteiro = 'Escolha a viagem vinculada';

  return e;
}

// Deixa o código só com letras e números, em maiúsculas (o que a pessoa digita ou cola).
export function limparCodigo(texto) {
  return texto.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, TAMANHO_CODIGO);
}

// Devolve a mensagem de erro do código, ou null se estiver certo.
export function validarCodigo(codigo) {
  if (!codigo) return 'Informe o código de convite';
  if (codigo.length !== TAMANHO_CODIGO) return `O código tem ${TAMANHO_CODIGO} caracteres`;
  return null;
}
