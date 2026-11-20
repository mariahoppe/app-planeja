const { Op, fn, col, where: sqlWhere } = require('sequelize');
const { Dica, DicaFoto, Usuario, sequelize } = require('../models');
const { paginacao } = require('../utils/paginacao');
const { AppError } = require('../utils/errorHandler');
const { apagarFotos } = require('./storageService');

const MAX_FOTOS_POR_BLOCO = 4;

const AUTOR = { model: Usuario, as: 'autor', attributes: ['id', 'nome', 'foto_url'] };
const FOTOS = { model: DicaFoto, as: 'fotos', attributes: ['id', 'bloco', 'url', 'legenda', 'ordem'] };

/**
 * Busca por destino sem acento e sem diferenciar maiúsculas: "paris" encontra
 * "Paris". A normalização é feita pela função norm() do banco, a mesma usada
 * nas colunas geradas pais_norm e cidade_norm.
 */
const filtroBusca = (termo) => {
  const alvo = fn('public.norm', termo);
  return {
    [Op.or]: [
      sqlWhere(col('cidade_norm'), { [Op.like]: fn('concat', '%', alvo, '%') }),
      sqlWhere(col('pais_norm'), { [Op.like]: fn('concat', '%', alvo, '%') })
    ]
  };
};

const listar = async (query) => {
  const where = {};

  if (query.busca && query.busca.trim()) {
    Object.assign(where, filtroBusca(query.busca.trim()));
  }

  if (query.escopo && query.escopo !== 'todos') {
    where.escopo = query.escopo;
  }

  // Só as minhas dicas (tela "Gerenciar minhas dicas")
  if (query.autor_id) {
    where.autor_id = query.autor_id;
  }

  // Sem busca, a lista mostra as dicas mais recentes
  return Dica.findAll({
    where,
    include: [AUTOR, FOTOS],
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    ...paginacao(query)
  });
};

const buscarPorId = async (id) => {
  const dica = await Dica.findByPk(id, { include: [AUTOR, FOTOS] });
  if (!dica) throw new AppError('Dica não encontrada', 404);
  return dica;
};

const exigirAutoria = async (id, userId, isAdmin) => {
  const dica = await Dica.findByPk(id);
  if (!dica) throw new AppError('Dica não encontrada', 404);
  if (!isAdmin && dica.autor_id !== userId) {
    throw new AppError('Somente o autor pode editar ou excluir esta dica', 403);
  }
  return dica;
};

const criar = async (dados, userId) => {
  const dica = await Dica.create({ ...dados, autor_id: userId });
  return buscarPorId(dica.id);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const dica = await exigirAutoria(id, userId, isAdmin);
  await dica.update(dados);
  return buscarPorId(dica.id);
};

const excluir = async (id, userId, isAdmin) => {
  const dica = await exigirAutoria(id, userId, isAdmin);
  // As linhas das fotos saem junto (cascata); os arquivos, só depois que o banco confirmar
  const fotos = await DicaFoto.findAll({ where: { dica_id: dica.id }, attributes: ['url'] });
  await dica.destroy();
  await apagarFotos(fotos.map((f) => f.url));
};

/**
 * Anexa uma foto a um bloco. O slot (coluna ordem) é o primeiro livre de 1 a 4
 * — o banco recusa um quinto por UNIQUE(dica_id, bloco, ordem) + CHECK.
 */
const adicionarFoto = async (id, dados, userId, isAdmin) => {
  await exigirAutoria(id, userId, isAdmin);

  return sequelize.transaction(async (transaction) => {
    const usados = await DicaFoto.findAll({
      where: { dica_id: id, bloco: dados.bloco },
      attributes: ['ordem'],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    const ocupados = new Set(usados.map((f) => f.ordem));
    const livre = [1, 2, 3, 4].find((n) => !ocupados.has(n));

    if (!livre) {
      throw new AppError(`Cada bloco aceita no máximo ${MAX_FOTOS_POR_BLOCO} fotos`, 409);
    }

    return DicaFoto.create({ ...dados, dica_id: id, ordem: livre }, { transaction });
  });
};

const removerFoto = async (id, fotoId, userId, isAdmin) => {
  await exigirAutoria(id, userId, isAdmin);
  const foto = await DicaFoto.findOne({ where: { id: fotoId, dica_id: id } });
  if (!foto) throw new AppError('Foto não encontrada', 404);
  await foto.destroy();
  await apagarFotos([foto.url]);
};

module.exports = {
  listar, buscarPorId, criar, atualizar, excluir,
  adicionarFoto, removerFoto, MAX_FOTOS_POR_BLOCO
};
