const Joi = require('joi');

// O app envia o horário como HH:MM, igual à validação do protótipo
const HORARIO = /^([01]?\d|2[0-3]):[0-5]\d$/;

const criar = Joi.object({
  titulo: Joi.string().max(120).required()
    .messages({ 'any.required': 'Informe a atividade' }),
  roteiro_id: Joi.number().integer().required()
    .messages({ 'any.required': 'Roteiro é obrigatório' }),
  // Dia N da viagem. O app converte a data escolhida para o dia usando
  // roteiros.inicio; o service confere se o dia cabe no período.
  dia: Joi.number().integer().min(1).required()
    .messages({
      'any.required': 'Escolha uma data',
      'number.min': 'O dia da viagem começa em 1'
    }),
  horario: Joi.string().pattern(HORARIO).required()
    .messages({
      'any.required': 'Informe o horário',
      'string.pattern.base': 'Use o formato 14:30'
    }),
  local: Joi.string().max(150).allow('', null),
  custo: Joi.number().min(0).default(0)
    .messages({ 'number.min': 'Custo não pode ser negativo' }),
  link: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null)
    .messages({ 'string.uri': 'O link deve começar com http:// ou https://' }),
  obs: Joi.string().allow('', null),
  feita: Joi.boolean().default(false)
});

const atualizar = Joi.object({
  titulo: Joi.string().max(120),
  roteiro_id: Joi.number().integer(),
  dia: Joi.number().integer().min(1),
  horario: Joi.string().pattern(HORARIO)
    .messages({ 'string.pattern.base': 'Use o formato 14:30' }),
  local: Joi.string().max(150).allow('', null),
  custo: Joi.number().min(0),
  link: Joi.string().uri({ scheme: ['http', 'https'] }).allow('', null)
    .messages({ 'string.uri': 'O link deve começar com http:// ou https://' }),
  obs: Joi.string().allow('', null),
  feita: Joi.boolean()
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

module.exports = { criar, atualizar };
