const { Op } = require('sequelize');
const { Destino } = require('../models');
const { AppError } = require('../utils/errorHandler');

const listar = async (query, userId, isAdmin) => {
  const where = isAdmin ? {} : { usuario_id: userId };

  // Busca única por cidade ou país, como o campo "Buscar cidade ou país"
  if (query.busca) {
    where[Op.or] = [
      { cidade: { [Op.iLike]: `%${query.busca}%` } },
      { pais: { [Op.iLike]: `%${query.busca}%` } }
    ];
  }

  // Filtro Todos / Nacional / Internacional
  if (query.escopo && query.escopo !== 'todos') {
    where.escopo = query.escopo;
  }

  return Destino.findAll({ where, order: [['created_at', 'DESC']] });
};

const buscarPorId = async (id, userId, isAdmin) => {
  const destino = await Destino.findByPk(id);
  if (!destino) throw new AppError('Destino não encontrado', 404);
  if (!isAdmin && destino.usuario_id !== userId) {
    throw new AppError('Sem permissão para acessar este destino', 403);
  }
  return destino;
};

const criar = async (dados, userId) => {
  return Destino.create({ ...dados, usuario_id: userId });
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const destino = await buscarPorId(id, userId, isAdmin);
  await destino.update(dados);
  return destino;
};

// Exclusão em cascata: leva junto roteiros, atividades, grupo e despesas
// vinculados. É o comportamento do botão "Excluir destino" do protótipo.
const excluir = async (id, userId, isAdmin) => {
  const destino = await buscarPorId(id, userId, isAdmin);
  await destino.destroy();
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
