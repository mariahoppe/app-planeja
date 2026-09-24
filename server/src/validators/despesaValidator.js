const Joi = require('joi');

const CATEGORIAS = ['alimentacao', 'hospedagem', 'transporte', 'atividade', 'outros'];

const rateio = Joi.array().items(
  Joi.object({
    usuario_id: Joi.number().integer().required(),
    valor_devido: Joi.number().min(0).required()
  })
);

const base = {
  descricao: Joi.string().max(120).required()
    .messages({ 'any.required': 'Descreva a despesa' }),
  valor: Joi.number().greater(0).required()
    .messages({
      'any.required': 'Informe um valor',
      'number.greater': 'O valor deve ser maior que zero'
    }),
  data: Joi.date().required()
    .messages({ 'any.required': 'Informe a data da despesa' }),
  pagador_id: Joi.number().integer().required()
    .messages({ 'any.required': 'Informe quem pagou' }),
  categoria: Joi.string().valid(...CATEGORIAS).default('outros')
    .messages({ 'any.only': 'Categoria inválida' }),
  modo_divisao: Joi.string().valid('igual', 'personalizada').default('igual'),
  // Obrigatório apenas na divisão personalizada; a soma é conferida no service
  rateio: rateio.when('modo_divisao', {
    is: 'personalizada',
    then: Joi.required().messages({ 'any.required': 'Informe o valor de cada pessoa' }),
    otherwise: Joi.forbidden()
  })
};

const criar = Joi.object(base);

const atualizar = Joi.object({
  ...base,
  descricao: Joi.string().max(120),
  valor: Joi.number().greater(0),
  data: Joi.date(),
  pagador_id: Joi.number().integer()
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

module.exports = { criar, atualizar, CATEGORIAS };
