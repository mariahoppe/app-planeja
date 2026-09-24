const Joi = require('joi');

const BLOCOS = ['onde_comer', 'o_que_fazer', 'onde_visitar', 'onde_ficar'];

// Pelo menos um dos quatro blocos preenchido — a mesma regra do banco e do
// protótipo ("Preencha pelo menos um dos quatro blocos")
const exigirUmBloco = (valor, helpers) => {
  const preenchido = BLOCOS.some((b) => valor[b] && String(valor[b]).trim());
  return preenchido ? valor : helpers.error('dica.blocos');
};

const criar = Joi.object({
  pais: Joi.string().max(60).required()
    .messages({ 'any.required': 'Informe o país' }),
  cidade: Joi.string().max(80).required()
    .messages({ 'any.required': 'Informe a cidade' }),
  escopo: Joi.string().valid('nacional', 'internacional').default('internacional'),
  onde_comer: Joi.string().allow('', null),
  o_que_fazer: Joi.string().allow('', null),
  onde_visitar: Joi.string().allow('', null),
  onde_ficar: Joi.string().allow('', null)
})
  .custom(exigirUmBloco)
  .messages({ 'dica.blocos': 'Preencha pelo menos um dos quatro blocos' });

const atualizar = Joi.object({
  pais: Joi.string().max(60),
  cidade: Joi.string().max(80),
  escopo: Joi.string().valid('nacional', 'internacional'),
  onde_comer: Joi.string().allow('', null),
  o_que_fazer: Joi.string().allow('', null),
  onde_visitar: Joi.string().allow('', null),
  onde_ficar: Joi.string().allow('', null)
}).min(1).messages({ 'object.min': 'Informe ao menos um campo para atualizar' });

const adicionarFoto = Joi.object({
  bloco: Joi.string().valid(...BLOCOS).required()
    .messages({ 'any.required': 'Informe o bloco da foto' }),
  url: Joi.string().uri().required()
    .messages({ 'any.required': 'Informe a URL da foto' }),
  legenda: Joi.string().max(120).allow('', null)
});

module.exports = { criar, atualizar, adicionarFoto, BLOCOS };
