const usuarioService = require('../services/usuarioService');

const listar = async (req, res, next) => {
  try {
    const data = await usuarioService.listar();
    res.json({ data });
  } catch (err) { next(err); }
};

const buscarPorId = async (req, res, next) => {
  try {
    const data = await usuarioService.buscarPorId(req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
};

const perfil = async (req, res, next) => {
  try {
    const data = await usuarioService.perfil(req.user.id);
    res.json({ data });
  } catch (err) { next(err); }
};

const atualizar = async (req, res, next) => {
  try {
    const data = await usuarioService.atualizar(req.params.id, req.body, req.user);
    res.json({ data });
  } catch (err) { next(err); }
};

const trocarSenha = async (req, res, next) => {
  try {
    const data = await usuarioService.trocarSenha(req.user.id, req.body);
    res.json({ data });
  } catch (err) { next(err); }
};

const excluir = async (req, res, next) => {
  try {
    await usuarioService.excluir(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { listar, buscarPorId, perfil, atualizar, trocarSenha, excluir };
