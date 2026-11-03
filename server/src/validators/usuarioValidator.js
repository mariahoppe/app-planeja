const Joi = require('joi');

// A foto de perfil vai direto em usuarios.foto_url: imagem em base64 ou link https.
// O limite (cerca de 150 KB) evita pesar as rotas que devolvem esse campo.
const FOTO_TAMANHO_MAXIMO = 200000;
const FOTO_FORMATO = /^(data:image\/(jpeg|png|webp);base64,|https:\/\/)/;

const atualizar = Joi.object({
  nome: Joi.string().min(3).max(80)
    .messages({ 'string.min': 'Nome deve ter no mínimo 3 caracteres' }),
  email: Joi.string().email().max(120)
    .messages({ 'string.email': 'Email inválido' }),
  perfil: Joi.string().valid('admin', 'comum')
    .messages({ 'any.only': 'Perfil inválido' }),
  foto_url: Joi.string().max(FOTO_TAMANHO_MAXIMO).pattern(FOTO_FORMATO).allow(null)
    .messages({
      'string.max': 'Foto muito grande',
      'string.pattern.base': 'Formato de foto inválido'
    })
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

const trocarSenha = Joi.object({
  senha_atual: Joi.string().required()
    .messages({ 'any.required': 'Senha atual é obrigatória' }),
  nova_senha: Joi.string().min(6).required()
    .messages({
      'string.min': 'Nova senha deve ter no mínimo 6 caracteres',
      'any.required': 'Nova senha é obrigatória'
    })
});

module.exports = { atualizar, trocarSenha };
