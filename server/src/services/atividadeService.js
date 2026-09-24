const { Op } = require('sequelize');
const { Atividade, Roteiro, Destino } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { exigirAcessoAoRoteiro } = require('./permissoes');

const MS_POR_DIA = 86400000;

/**
 * Quantos dias tem a viagem. Serve para recusar uma atividade fora do período,
 * como faz a mensagem "Fora do período da viagem" do protótipo.
 */
const duracaoEmDias = (roteiro) => {
  if (!roteiro.fim) return null;
  const inicio = new Date(`${roteiro.inicio}T00:00:00`);
  const fim = new Date(`${roteiro.fim}T00:00:00`);
  return Math.round((fim - inicio) / MS_POR_DIA) + 1;
};

const exigirDiaNoPeriodo = (roteiro, dia) => {
  const total = duracaoEmDias(roteiro);
  if (total !== null && (dia < 1 || dia > total)) {
    throw new AppError('Fora do período da viagem', 400);
  }
};

const carregarAtividade = async (id, userId, isAdmin) => {
  const atividade = await Atividade.findByPk(id);
  if (!atividade) throw new AppError('Atividade não encontrada', 404);
  const roteiro = await exigirAcessoAoRoteiro(atividade.roteiro_id, userId, isAdmin);
  return { atividade, roteiro };
};

const listar = async (query, userId, isAdmin) => {
  const where = {};

  if (query.roteiro_id) {
    await exigirAcessoAoRoteiro(query.roteiro_id, userId, isAdmin);
    where.roteiro_id = query.roteiro_id;
  }

  if (query.busca) {
    where[Op.or] = [
      { titulo: { [Op.iLike]: `%${query.busca}%` } },
      { local: { [Op.iLike]: `%${query.busca}%` } }
    ];
  }

  if (query.feita !== undefined) {
    where.feita = query.feita === 'true';
  }

  if (query.dia) {
    where.dia = Number(query.dia);
  }

  const include = [{
    model: Roteiro,
    as: 'roteiro',
    attributes: ['id', 'titulo', 'inicio', 'fim'],
    include: [{
      model: Destino,
      as: 'destino',
      attributes: ['id', 'cidade', 'pais', 'usuario_id'],
      ...(!isAdmin && !query.roteiro_id && { where: { usuario_id: userId } })
    }]
  }];

  const atividades = await Atividade.findAll({
    where,
    include,
    order: [['dia', 'ASC'], ['horario', 'ASC']]
  });

  return atividades.filter((a) => a.roteiro && a.roteiro.destino);
};

const buscarPorId = async (id, userId, isAdmin) => {
  const { atividade } = await carregarAtividade(id, userId, isAdmin);
  return Atividade.findByPk(atividade.id, {
    include: [{
      model: Roteiro,
      as: 'roteiro',
      attributes: ['id', 'titulo', 'inicio', 'fim'],
      include: [{ model: Destino, as: 'destino', attributes: ['id', 'cidade', 'pais'] }]
    }]
  });
};

const criar = async (dados, userId, isAdmin) => {
  const roteiro = await exigirAcessoAoRoteiro(dados.roteiro_id, userId, isAdmin);
  exigirDiaNoPeriodo(roteiro, dados.dia);
  return Atividade.create(dados);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const { atividade } = await carregarAtividade(id, userId, isAdmin);

  // Mover a atividade para outro roteiro exige permissão no destino também
  const roteiroAlvo = dados.roteiro_id
    ? await exigirAcessoAoRoteiro(dados.roteiro_id, userId, isAdmin)
    : await exigirAcessoAoRoteiro(atividade.roteiro_id, userId, isAdmin);

  if (dados.dia !== undefined) {
    exigirDiaNoPeriodo(roteiroAlvo, dados.dia);
  }

  await atividade.update(dados);
  return atividade;
};

// Marcar/desmarcar pelo círculo de check da lista
const toggle = async (id, userId, isAdmin) => {
  const { atividade } = await carregarAtividade(id, userId, isAdmin);
  await atividade.update({ feita: !atividade.feita });
  return atividade;
};

const excluir = async (id, userId, isAdmin) => {
  const { atividade } = await carregarAtividade(id, userId, isAdmin);
  await atividade.destroy();
};

module.exports = { listar, buscarPorId, criar, atualizar, toggle, excluir };
