const rateLimit = require('express-rate-limit');

// O app abre várias telas por minuto (cada tela recarrega ao voltar e algumas
// fazem várias chamadas) e, numa sala de aula, vários celulares saem pelo mesmo
// IP do Wi-Fi: com 100 a cada 15 min, uns minutos de uso já bloqueavam o teste.
// O padrão é 1000; RATE_LIMIT_MAX continua permitindo ajustar por ambiente.
const geral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 1000,
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
