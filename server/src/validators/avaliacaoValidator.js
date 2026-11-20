const Joi = require('joi');

// Nota de custo-benefício de 0 a 10, com uma casa decimal (o slider 0–10 do
// Ranking e da Dica). O escopo é aceito por compatibilidade, mas o servidor o
// calcula pelo país (avaliacaoService.escopoDoPais).
const registrar = Joi.object({
  pais: Joi.string().max(60).required()
    .messages({ 'any.required': 'Informe o país' }),
  cidade: Joi.string().max(80).required()
    .messages({ 'any.required': 'Informe a cidade' }),
  escopo: Joi.string().valid('nacional', 'internacional'),
  nota: Joi.number().min(0).max(10).precision(1).required()
    .messages({
      'any.required': 'Informe a nota de custo-benefício',
      'number.min': 'A nota vai de 0 a 10',
      'number.max': 'A nota vai de 0 a 10'
    })
});

module.exports = { registrar };
