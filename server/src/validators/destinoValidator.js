const Joi = require('joi');

const criar = Joi.object({
  cidade: Joi.string().max(80).required()
    .messages({
      'any.required': 'Informe a cidade',
      'string.max': 'Cidade deve ter no máximo 80 caracteres'
    }),
  pais: Joi.string().max(60).required()
    .messages({
      'any.required': 'Informe o país',
      'string.max': 'País deve ter no máximo 60 caracteres'
    }),
  escopo: Joi.string().valid('nacional', 'internacional').default('internacional')
    .messages({ 'any.only': 'Escopo deve ser nacional ou internacional' }),
  periodo: Joi.string().max(40).allow('', null),
  obs: Joi.string().allow('', null)
});

const atualizar = Joi.object({
  cidade: Joi.string().max(80),
  pais: Joi.string().max(60),
  escopo: Joi.string().valid('nacional', 'internacional'),
  periodo: Joi.string().max(40).allow('', null),
  obs: Joi.string().allow('', null)
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

module.exports = { criar, atualizar };
