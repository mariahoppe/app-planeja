const grupoService = require('../services/grupoService');

const isAdmin = (req) => req.user.perfil === 'admin';

const listarMeus = async (req, res, next) => {
  try {
    const data = await grupoService.listarMeus(req.user.id);
    res.json({ data });
  } catch (err) { next(err); }
};

const buscarPorId = async (req, res, next) => {
  try {
    const data = await grupoService.buscarPorId(req.params.id, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const criar = async (req, res, next) => {
  try {
    const data = await grupoService.criar(req.body, req.user.id, isAdmin(req));
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const atualizar = async (req, res, next) => {
  try {
    const data = await grupoService.atualizar(req.params.id, req.body, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

const excluir = async (req, res, next) => {
  try {
    await grupoService.excluir(req.params.id, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

const entrar = async (req, res, next) => {
  try {
    const data = await grupoService.entrarPorCodigo(req.body.codigo_convite, req.user.id);
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const removerIntegrante = async (req, res, next) => {
  try {
    await grupoService.removerIntegrante(req.params.id, req.params.usuarioId, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

const sair = async (req, res, next) => {
  try {
    await grupoService.sair(req.params.id, req.user.id);
    res.status(204).end();
  } catch (err) { next(err); }
};

const contas = async (req, res, next) => {
  try {
    const data = await grupoService.contas(req.params.id, req.user.id, isAdmin(req));
    res.json({ data });
  } catch (err) { next(err); }
};

module.exports = {
  listarMeus, buscarPorId, criar, atualizar, excluir,
  entrar, removerIntegrante, sair, contas
};
