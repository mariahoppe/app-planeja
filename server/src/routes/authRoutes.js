const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { auth: authLimiter } = require('../middlewares/rateLimiter');
const { registro, login, esqueciSenha, redefinirSenha, validarToken } = require('../validators/authValidator'); // Adicionado 'validarToken' aqui

const router = Router();

router.post('/registro', authLimiter, validate(registro), authController.registro);
router.post('/login', authLimiter, validate(login), authController.login);
router.post('/esqueci-senha', authLimiter, validate(esqueciSenha), authController.esqueciSenha);
router.post('/redefinir-senha', authLimiter, validate(redefinirSenha), authController.redefinirSenha);

// Rota de Validação do Token (Adicionada aqui)
router.post('/validar-token', authLimiter, validate(validarToken), authController.validarToken);

module.exports = router;
