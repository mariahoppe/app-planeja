const rateLimit = require('express-rate-limit');

const geral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: { message: 'Muitas requisições, tente novamente mais tarde' } },
  standardHeaders: true,
  legacyHeaders: false
});

const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { message: 'Muitas tentativas de login, aguarde 15 minutos' } },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { geral, auth };
