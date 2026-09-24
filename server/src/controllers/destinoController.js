const destinoService = require('../services/destinoService');

const isAdmin = (req) => req.user.perfil === 'admin';

const listar = async (req, res, next) => {
  try {
    const data = await destinoService.listar(req.query, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const buscarPorId = async (req, res, next) => {
  try {
    const data = await destinoService.buscarPorId(req.params.id, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const criar = async (req, res, next) => {
  try {
    const data = await destinoService.criar(req.body, req.user.id);
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const atualizar = async (req, res, next) => {
  try {
    const data = await destinoService.atualizar(req.params.id, req.body, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const excluir = async (req, res, next) => {
  try {
    await destinoService.excluir(req.params.id, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
