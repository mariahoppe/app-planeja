const dicaService = require('../services/dicaService');

const isAdmin = (req) => req.user.perfil === 'admin';

const listar = async (req, res, next) => {
  try {
    const data = await dicaService.listar(req.query);
    res.json({ data });
  } catch (err) { next(err); }
};

const minhas = async (req, res, next) => {
  try {
    const data = await dicaService.listar({ ...req.query, autor_id: req.user.id });
    res.json({ data });
  } catch (err) { next(err); }
};

const buscarPorId = async (req, res, next) => {
  try {
    const data = await dicaService.buscarPorId(req.params.id);
    res.json({ data });
  } catch (err) { next(err); }
};

const criar = async (req, res, next) => {
  try {
    const data = await dicaService.criar(req.body, req.user.id);
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const atualizar = async (req, res, next) => {
  try {
    const data = await dicaService.atualizar(req.params.id, req.body, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const excluir = async (req, res, next) => {
  try {
    await dicaService.excluir(req.params.id, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

const adicionarFoto = async (req, res, next) => {
  try {
    const data = await dicaService.adicionarFoto(req.params.id, req.body, req.user.id, isAdmin(req));
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const removerFoto = async (req, res, next) => {
  try {
    await dicaService.removerFoto(req.params.id, req.params.fotoId, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { listar, minhas, buscarPorId, criar, atualizar, excluir, adicionarFoto, removerFoto };
