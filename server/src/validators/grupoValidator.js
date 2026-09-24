const Joi = require('joi');

const criar = Joi.object({
  nome: Joi.string().max(60).required()
    .messages({ 'any.required': 'Dê um nome ao grupo' }),
  roteiro_id: Joi.number().integer().required()
    .messages({ 'any.required': 'Escolha a viagem vinculada' })
});

const atualizar = Joi.object({
  nome: Joi.string().max(60)
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

const entrar = Joi.object({
  codigo_convite: Joi.string().length(6).uppercase().required()
    .messages({
      'any.required': 'Informe o código de convite',
      'string.length': 'O código tem seis caracteres'
    })
});

module.exports = { criar, atualizar, entrar };
