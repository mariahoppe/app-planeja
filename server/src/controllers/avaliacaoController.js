const avaliacaoService = require('../services/avaliacaoService');

const isAdmin = (req) => req.user.perfil === 'admin';

const ranking = async (req, res, next) => {
  try {
    const data = await avaliacaoService.ranking(req.query);
    res.json({ data });
  } catch (err) { next(err); }
};

const registrar = async (req, res, next) => {
  try {
    const { avaliacao, criada } = await avaliacaoService.registrar(req.body, req.user.id);
    res.status(criada ? 201 : 200).json({ data: avaliacao });
  } catch (err) { next(err); }
};

const minhas = async (req, res, next) => {
  try {
    const data = await avaliacaoService.minhas(req.user.id);
    res.json({ data });
  } catch (err) { next(err); }
};

const excluir = async (req, res, next) => {
  try {
    await avaliacaoService.excluir(req.params.id, req.user.id, isAdmin(req));
    res.status(204).end();
  } catch (err) { next(err); }
};

module.exports = { ranking, registrar, minhas, excluir };
