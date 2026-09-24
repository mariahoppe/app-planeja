const authService = require('../services/authService');

const registro = async (req, res, next) => {
  try {
    const data = await authService.registro(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const esqueciSenha = async (req, res, next) => {
  try {
    const data = await authService.esqueciSenha(req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const redefinirSenha = async (req, res, next) => {
  try {
    const data = await authService.redefinirSenha(req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// ... (outros métodos do controller)

const validarToken = async (req, res, next) => {
  try {
    const data = await authService.validarToken(req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = { registro, login, esqueciSenha, redefinirSenha, validarToken };