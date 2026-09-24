const { Op } = require('sequelize');
const { Roteiro, Destino, Atividade, Grupo } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { exigirAcessoAoRoteiro } = require('./permissoes');

const listar = async (query, userId, isAdmin) => {
  const where = {};

  if (query.busca) {
    where.titulo = { [Op.iLike]: `%${query.busca}%` };
  }

  // Filtro Todos / Planejando / Confirmados
  if (query.status && query.status !== 'todos') {
    where.status = query.status;
  }

  if (query.destino_id) {
    where.destino_id = query.destino_id;
  }

  const includeDestino = {
    model: Destino,
    as: 'destino',
    attributes: ['id', 'cidade', 'pais', 'usuario_id'],
    ...(!isAdmin && { where: { usuario_id: userId } })
  };

  const ordenacao = query.ordenar === 'recentes' ? [['created_at', 'DESC']] : [['inicio', 'ASC']];

  const roteiros = await Roteiro.findAll({
    where,
    include: [
      includeDestino,
      { model: Atividade, as: 'atividades', attributes: ['id', 'feita', 'custo'] },
      { model: Grupo, as: 'grupo', attributes: ['id', 'nome'] }
    ],
    order: ordenacao
  });

  return roteiros.map((r) => {
    const json = r.toJSON();
    const atividades = json.atividades || [];
    json.total_atividades = atividades.length;
    json.atividades_concluidas = atividades.filter((a) => a.feita).length;
    json.custo_total = atividades.reduce((s, a) => s + parseFloat(a.custo || 0), 0);
    json.em_grupo = Boolean(json.grupo);
    delete json.atividades;
    delete json.destino.usuario_id;
    return json;
  });
};

const buscarPorId = async (id, userId, isAdmin) => {
  await exigirAcessoAoRoteiro(id, userId, isAdmin);

  const roteiro = await Roteiro.findByPk(id, {
    include: [
      { model: Destino, as: 'destino', attributes: ['id', 'cidade', 'pais'] },
      { model: Atividade, as: 'atividades' },
      { model: Grupo, as: 'grupo', attributes: ['id', 'nome', 'codigo_convite'] }
    ],
    // Mesma ordenação da tela de detalhe: agrupada por dia, ordenada por hora
    order: [[{ model: Atividade, as: 'atividades' }, 'dia', 'ASC'],
            [{ model: Atividade, as: 'atividades' }, 'horario', 'ASC']]
  });

  const json = roteiro.toJSON();
  json.custo_total = json.atividades.reduce((s, a) => s + parseFloat(a.custo || 0), 0);
  return json;
};

const criar = async (dados, userId, isAdmin) => {
  const destino = await Destino.findByPk(dados.destino_id);
  if (!destino) throw new AppError('Destino não encontrado', 404);
  if (!isAdmin && destino.usuario_id !== userId) {
    throw new AppError('Sem permissão para criar roteiro neste destino', 403);
  }
  return Roteiro.create(dados);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const roteiro = await exigirAcessoAoRoteiro(id, userId, isAdmin);

  if (dados.destino_id) {
    const destino = await Destino.findByPk(dados.destino_id);
    if (!destino) throw new AppError('Destino não encontrado', 404);
    if (!isAdmin && destino.usuario_id !== userId) {
      throw new AppError('Sem permissão para vincular a este destino', 403);
    }
  }

  const inicio = dados.inicio || roteiro.inicio;
  const fim = dados.fim !== undefined ? dados.fim : roteiro.fim;
  if (fim && new Date(fim) < new Date(inicio)) {
    throw new AppError('Fim antes do início', 400);
  }

  await roteiro.update(dados);
  return roteiro;
};

const excluir = async (id, userId, isAdmin) => {
  const roteiro = await exigirAcessoAoRoteiro(id, userId, isAdmin);
  await roteiro.destroy();
};

const resumo = async (id, userId, isAdmin) => {
  await exigirAcessoAoRoteiro(id, userId, isAdmin);

  const roteiro = await Roteiro.findByPk(id, {
    include: [{ model: Atividade, as: 'atividades' }]
  });

  const atividades = roteiro.atividades;
  const total = atividades.length;
  const concluidas = atividades.filter((a) => a.feita).length;
  const custoTotal = atividades.reduce((s, a) => s + parseFloat(a.custo || 0), 0);

  return {
    roteiro_id: roteiro.id,
    titulo: roteiro.titulo,
    total_atividades: total,
    concluidas,
    percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0,
    custo_total: custoTotal
  };
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir, resumo };
