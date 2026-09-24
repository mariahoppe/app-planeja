const { Despesa, DespesaRateio, GrupoMembro, Usuario, sequelize } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { exigirAcessoAoGrupo } = require('./permissoes');

const CENTAVO = 0.01;

const COM_RELACOES = [
  { model: DespesaRateio, as: 'rateios', attributes: ['id', 'usuario_id', 'valor_devido'] },
  { model: Usuario, as: 'pagador', attributes: ['id', 'nome', 'foto_url'] }
];

const membrosDoGrupo = async (grupoId) => {
  const membros = await GrupoMembro.findAll({ where: { grupo_id: grupoId }, attributes: ['usuario_id'] });
  return membros.map((m) => m.usuario_id);
};

const exigirPagadorNoGrupo = (membrosIds, pagadorId) => {
  if (!membrosIds.includes(Number(pagadorId))) {
    throw new AppError('Quem pagou precisa ser integrante do grupo', 400);
  }
};

/**
 * Na divisão personalizada a soma por pessoa tem que fechar com o total. O
 * banco também confere isso por constraint trigger; aqui a mensagem é a que o
 * app mostra ao usuário.
 */
const exigirRateioFechado = (rateio, valor, membrosIds) => {
  const soma = rateio.reduce((s, r) => s + Number(r.valor_devido), 0);
  if (Math.abs(soma - Number(valor)) > CENTAVO) {
    throw new AppError(
      `A soma por pessoa (R$ ${soma.toFixed(2)}) deve fechar com R$ ${Number(valor).toFixed(2)}`,
      400
    );
  }
  const forasteiro = rateio.find((r) => !membrosIds.includes(Number(r.usuario_id)));
  if (forasteiro) {
    throw new AppError('O rateio inclui alguém que não é do grupo', 400);
  }
};

const listar = async (grupoId, userId, isAdmin) => {
  await exigirAcessoAoGrupo(grupoId, userId, isAdmin);
  return Despesa.findAll({
    where: { grupo_id: grupoId },
    include: COM_RELACOES,
    order: [['data', 'DESC'], ['id', 'DESC']]
  });
};

const buscarPorId = async (id, userId, isAdmin) => {
  const despesa = await Despesa.findByPk(id, { include: COM_RELACOES });
  if (!despesa) throw new AppError('Despesa não encontrada', 404);
  await exigirAcessoAoGrupo(despesa.grupo_id, userId, isAdmin);
  return despesa;
};

const criar = async (grupoId, dados, userId, isAdmin) => {
  await exigirAcessoAoGrupo(grupoId, userId, isAdmin);
  const membrosIds = await membrosDoGrupo(grupoId);
  exigirPagadorNoGrupo(membrosIds, dados.pagador_id);

  const { rateio, ...campos } = dados;
  if (campos.modo_divisao === 'personalizada') {
    exigirRateioFechado(rateio, campos.valor, membrosIds);
  }

  const despesa = await sequelize.transaction(async (transaction) => {
    const nova = await Despesa.create({ ...campos, grupo_id: grupoId }, { transaction });
    if (campos.modo_divisao === 'personalizada') {
      await DespesaRateio.bulkCreate(
        rateio.map((r) => ({ despesa_id: nova.id, usuario_id: r.usuario_id, valor_devido: r.valor_devido })),
        { transaction }
      );
    }
    return nova;
  });

  return buscarPorId(despesa.id, userId, isAdmin);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const despesa = await buscarPorId(id, userId, isAdmin);
  const membrosIds = await membrosDoGrupo(despesa.grupo_id);

  if (dados.pagador_id) exigirPagadorNoGrupo(membrosIds, dados.pagador_id);

  const { rateio, ...campos } = dados;
  const modo = campos.modo_divisao || despesa.modo_divisao;
  const valor = campos.valor !== undefined ? campos.valor : despesa.valor;

  if (modo === 'personalizada') {
    // Trocar o valor sem reenviar o rateio deixaria a soma quebrada
    if (!rateio) throw new AppError('Informe o valor de cada pessoa', 400);
    exigirRateioFechado(rateio, valor, membrosIds);
  }

  await sequelize.transaction(async (transaction) => {
    await despesa.update(campos, { transaction });
    await DespesaRateio.destroy({ where: { despesa_id: despesa.id }, transaction });
    if (modo === 'personalizada') {
      await DespesaRateio.bulkCreate(
        rateio.map((r) => ({ despesa_id: despesa.id, usuario_id: r.usuario_id, valor_devido: r.valor_devido })),
        { transaction }
      );
    }
  });

  return buscarPorId(id, userId, isAdmin);
};

// Excluir recalcula saldos e acerto de contas na próxima leitura da aba
const excluir = async (id, userId, isAdmin) => {
  const despesa = await buscarPorId(id, userId, isAdmin);
  await despesa.destroy();
};

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
