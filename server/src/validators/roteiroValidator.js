const Joi = require('joi');

const criar = Joi.object({
  titulo: Joi.string().max(100).required()
    .messages({ 'any.required': 'Informe um título' }),
  destino_id: Joi.number().integer().required()
    .messages({ 'any.required': 'Destino é obrigatório' }),
  inicio: Joi.date().required()
    .messages({ 'any.required': 'Informe a data de início' }),
  // O protótipo só valida a data de fim quando ela é preenchida
  fim: Joi.date().min(Joi.ref('inicio')).allow(null)
    .messages({ 'date.min': 'Fim antes do início' }),
  status: Joi.string().valid('planejando', 'confirmado', 'concluido').default('planejando')
    .messages({ 'any.only': 'Status inválido' }),
  obs: Joi.string().allow('', null)
});

const atualizar = Joi.object({
  titulo: Joi.string().max(100),
  destino_id: Joi.number().integer(),
  inicio: Joi.date(),
  fim: Joi.date().allow(null),
  status: Joi.string().valid('planejando', 'confirmado', 'concluido'),
  obs: Joi.string().allow('', null)
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

module.exports = { criar, atualizar };
