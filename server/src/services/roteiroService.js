const { Op } = require('sequelize');
const { Roteiro, Destino, Atividade, Grupo } = require('../models');
const { paginacao } = require('../utils/paginacao');
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

  const ordenacao = query.ordenar === 'recentes' ? [['created_at', 'DESC'], ['id', 'DESC']] : [['inicio', 'ASC'], ['id', 'ASC']];

  const roteiros = await Roteiro.findAll({
    where,
    include: [
      includeDestino,
      { model: Atividade, as: 'atividades', attributes: ['id', 'feita', 'custo'] },
      { model: Grupo, as: 'grupo', attributes: ['id', 'nome'] }
    ],
    order: ordenacao,
    ...paginacao(query)
  });

  return roteiros.map((r) => {
    const json = r.toJSON();
    json.sou_dono = json.destino.usuario_id === userId;
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
      { model: Destino, as: 'destino', attributes: ['id', 'cidade', 'pais', 'usuario_id'] },
      { model: Atividade, as: 'atividades' },
      { model: Grupo, as: 'grupo', attributes: ['id', 'nome', 'codigo_convite'] }
    ],
    // Mesma ordenação da tela de detalhe: agrupada por dia, ordenada por hora
    order: [[{ model: Atividade, as: 'atividades' }, 'dia', 'ASC'],
            [{ model: Atividade, as: 'atividades' }, 'horario', 'ASC']]
  });

  const json = roteiro.toJSON();
  json.sou_dono = Boolean(roteiro.destino) && roteiro.destino.usuario_id === userId;
  delete json.destino.usuario_id;
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

  // As atividades guardam o "dia N" da viagem: encurtar o período não pode
  // deixar alguma depois do último dia.
  if (fim) {
    const UM_DIA = 24 * 60 * 60 * 1000;
    const diasNoPeriodo = Math.round((new Date(fim) - new Date(inicio)) / UM_DIA) + 1;
    const ultimoDia = await Atividade.max('dia', { where: { roteiro_id: roteiro.id } });
    if (ultimoDia && ultimoDia > diasNoPeriodo) {
      throw new AppError(
        `Há atividade no dia ${ultimoDia} da viagem; o período precisa ter pelo menos ${ultimoDia} dias`,
        400
      );
    }
  }

  await roteiro.update(dados);
  return roteiro;
};

// Excluir apaga também o grupo e as despesas (ON DELETE CASCADE): só o dono pode.
const excluir = async (id, userId, isAdmin) => {
  const roteiro = await exigirAcessoAoRoteiro(id, userId, isAdmin);
  if (!isAdmin && roteiro.destino.usuario_id !== userId) {
    throw new AppError('Só quem criou a viagem pode excluí-la', 403);
  }
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
