// Regras dos painéis do perfil, espelhando o usuarioValidator da API.
// Cada função devolve um objeto de erros por campo ({} = tudo certo).
export function validarPerfil({ nome }) {
  const e = {};

  if (nome.trim().length < 3) e.nome = 'Informe seu nome completo';
  else if (nome.trim().length > 80) e.nome = 'Nome deve ter no máximo 80 caracteres';

  return e;
}

export function validarTrocaSenha({ senhaAtual, novaSenha, confirmacao }) {
  const e = {};

  if (!senhaAtual) e.senhaAtual = 'Informe a senha atual';
  if (novaSenha.length < 6) e.novaSenha = 'Mínimo de 6 caracteres';
  if (confirmacao !== novaSenha) e.confirmacao = 'As senhas não conferem';

  return e;
}
