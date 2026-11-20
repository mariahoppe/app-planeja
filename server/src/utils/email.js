const { fn, col, where } = require('sequelize');

/**
 * E-mail sem diferença de maiúsculas. O banco já tem índice único em
 * lower(email); estas funções fazem cadastro, login e recuperação seguirem a
 * mesma regra, inclusive para contas antigas gravadas com maiúsculas.
 */
const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

// Condição de busca por e-mail que ignora maiúsculas (usa o índice lower(email))
const ondeEmail = (email) => where(fn('lower', col('email')), normalizarEmail(email));

module.exports = { normalizarEmail, ondeEmail };
