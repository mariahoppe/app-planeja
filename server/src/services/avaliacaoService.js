const { Op, fn, col, where: sqlWhere, QueryTypes } = require('sequelize');
const { AvaliacaoDestino, sequelize } = require('../models');
const { AppError } = require('../utils/errorHandler');

// Abaixo disso o destino aparece marcado como "poucas avaliações", para não
// distorcer o ranking com uma nota isolada
const MIN_AVALIACOES = 2;

const mesmoDestino = (pais, cidade) => [
  sqlWhere(col('pais_norm'), fn('public.norm', pais)),
  sqlWhere(col('cidade_norm'), fn('public.norm', cidade))
];

/**
 * Um usuário registra uma única avaliação por destino, editável depois.
 * Repetir o destino atualiza a nota em vez de criar uma segunda linha.
 */
const registrar = async (dados, userId) => {
  const existente = await AvaliacaoDestino.findOne({
    where: {
      usuario_id: userId,
      [Op.and]: mesmoDestino(dados.pais, dados.cidade)
    }
  });

  if (existente) {
    await existente.update({ nota: dados.nota, escopo: dados.escopo, pais: dados.pais, cidade: dados.cidade });
    return { avaliacao: existente, criada: false };
  }

  const avaliacao = await AvaliacaoDestino.create({ ...dados, usuario_id: userId });
  return { avaliacao, criada: true };
};

const minhas = async (userId) =>
  AvaliacaoDestino.findAll({ where: { usuario_id: userId }, order: [['updated_at', 'DESC']] });

const excluir = async (id, userId, isAdmin) => {
  const avaliacao = await AvaliacaoDestino.findByPk(id);
  if (!avaliacao) throw new AppError('Avaliação não encontrada', 404);
  if (!isAdmin && avaliacao.usuario_id !== userId) {
    throw new AppError('Sem permissão para excluir esta avaliação', 403);
  }
  await avaliacao.destroy();
};

/**
 * Média por país ou por cidade, dentro de um escopo. Agrupa pelas colunas
 * normalizadas para que "São Paulo" e "Sao Paulo" contem como o mesmo destino,
 * e devolve a grafia mais comum para exibição.
 */
const agrupar = async (escopo, chave) => {
  const coluna = chave === 'pais' ? 'pais_norm' : 'cidade_norm';
  const rotulo = chave === 'pais' ? 'pais' : 'cidade';

  const linhas = await sequelize.query(
    `SELECT max(${rotulo}) AS nome,
            max(pais)      AS pais,
            avg(nota)      AS media,
            count(*)       AS qtd
       FROM avaliacoes_destino
      WHERE escopo = :escopo
      GROUP BY ${coluna}
      ORDER BY avg(nota) DESC, count(*) DESC`,
    { replacements: { escopo }, type: QueryTypes.SELECT }
  );

  return linhas.map((l, i) => ({
    posicao: i + 1,
    nome: l.nome,
    pais: l.pais,
    media: Number(Number(l.media).toFixed(1)),
    qtd: Number(l.qtd),
    poucas_avaliacoes: Number(l.qtd) < MIN_AVALIACOES
  }));
};

/**
 * Os dois rankings exibidos juntos na tela, sob o mesmo filtro
 * nacional/internacional.
 */
const ranking = async (query) => {
  const escopo = query.escopo === 'nacional' ? 'nacional' : 'internacional';
  const [paises, cidades] = await Promise.all([
    agrupar(escopo, 'pais'),
    agrupar(escopo, 'cidade')
  ]);
  return { escopo, paises, cidades };
};

module.exports = { registrar, minhas, excluir, ranking, MIN_AVALIACOES };
