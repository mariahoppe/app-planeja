const rateLimit = require('express-rate-limit');

// O app abre várias telas por minuto e, numa sala de aula, vários celulares
// saem pelo mesmo IP do Wi-Fi: em produção o limite sobe via RATE_LIMIT_MAX.
const geral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
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
