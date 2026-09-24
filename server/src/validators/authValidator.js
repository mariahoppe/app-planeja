const Joi = require('joi');

const registro = Joi.object({
  nome: Joi.string().min(3).max(80).required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome deve ter no máximo 80 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string().email().max(120).required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  senha: Joi.string().min(6).required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

const login = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  senha: Joi.string().required()
    .messages({ 'any.required': 'Senha é obrigatória' })
});

const esqueciSenha = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    })
});

const redefinirSenha = Joi.object({
  token: Joi.string().required()
    .messages({ 'any.required': 'Token é obrigatório' }),
  senha: Joi.string().min(6).required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

module.exports = { registro, login, esqueciSenha, redefinirSenha };

// ... (outros validadores existentes)

const validarToken = Joi.object({
  token: Joi.string().required()
    .messages({ 'any.required': 'Token é obrigatório' })
});

module.exports = { registro, login, esqueciSenha, redefinirSenha, validarToken };
