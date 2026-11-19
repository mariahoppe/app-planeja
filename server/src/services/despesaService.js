const { Despesa, DespesaRateio, GrupoMembro, Usuario, sequelize } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { exigirAcessoAoGrupo } = require('./permissoes');
const { rateioDe } = require('./rateio');

const CENTAVO = 0.01;

const COM_RELACOES = [
  {
    model: DespesaRateio,
    as: 'rateios',
    attributes: ['id', 'usuario_id', 'valor_devido'],
    // O nome vem junto para o app mostrar quem já saiu do grupo mas ainda está na conta
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'foto_url'] }]
  },
  { model: Usuario, as: 'pagador', attributes: ['id', 'nome', 'foto_url'] }
];

// Na ordem de entrada: é ela que decide quem fica com a sobra de centavos na divisão igual
const membrosDoGrupo = async (grupoId) => {
  const membros = await GrupoMembro.findAll({
    where: { grupo_id: grupoId },
    attributes: ['usuario_id'],
    order: [['entrou_em', 'ASC'], ['id', 'ASC']]
  });
  return membros.map((m) => m.usuario_id);
};

/**
 * Quem pagou precisa ser do grupo. Ao editar, quem já era o pagador continua
 * valendo mesmo que tenha saído: sair do grupo não apaga as despesas da pessoa.
 */
const exigirPagadorNoGrupo = (membrosIds, pagadorId, pagadorAtual) => {
  const id = Number(pagadorId);
  if (!membrosIds.includes(id) && id !== pagadorAtual) {
    throw new AppError('Quem pagou precisa ser integrante do grupo', 400);
  }
};

/**
 * Na divisão personalizada a soma por pessoa tem que fechar com o total. O
 * banco também confere isso por constraint trigger; aqui a mensagem é a que o
 * app mostra ao usuário.
 * permitidos: integrantes atuais e, ao editar, quem já estava no rateio da despesa.
 */
const exigirRateioFechado = (rateio, valor, permitidos) => {
  const soma = rateio.reduce((s, r) => s + Number(r.valor_devido), 0);
  if (Math.abs(soma - Number(valor)) > CENTAVO) {
    throw new AppError(
      `A soma por pessoa (R$ ${soma.toFixed(2)}) deve fechar com R$ ${Number(valor).toFixed(2)}`,
      400
    );
  }
  const forasteiro = rateio.find((r) => !permitidos.includes(Number(r.usuario_id)));
  if (forasteiro) {
    throw new AppError('O rateio inclui alguém que não é do grupo', 400);
  }
};

// Divisão igual entre os integrantes atuais, já no formato das linhas de despesa_rateios
const rateioIgual = (valor, membrosIds) =>
  Object.entries(rateioDe({ modo_divisao: 'igual', valor }, membrosIds))
    .map(([usuarioId, valorDevido]) => ({ usuario_id: Number(usuarioId), valor_devido: valorDevido }));

const gravarRateio = (despesaId, linhas, transaction) =>
  DespesaRateio.bulkCreate(
    linhas.map((r) => ({ despesa_id: despesaId, usuario_id: r.usuario_id, valor_devido: r.valor_devido })),
    { transaction }
  );

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
  const modo = campos.modo_divisao || 'igual';
  if (modo === 'personalizada') {
    exigirRateioFechado(rateio, campos.valor, membrosIds);
  }

  // A divisão igual também é gravada: fica valendo a divisão entre quem estava no grupo hoje
  const linhas = modo === 'personalizada' ? rateio : rateioIgual(campos.valor, membrosIds);

  const despesa = await sequelize.transaction(async (transaction) => {
    const nova = await Despesa.create({ ...campos, grupo_id: grupoId }, { transaction });
    await gravarRateio(nova.id, linhas, transaction);
    return nova;
  });

  return buscarPorId(despesa.id, userId, isAdmin);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const despesa = await buscarPorId(id, userId, isAdmin);
  const membrosIds = await membrosDoGrupo(despesa.grupo_id);
  const jaNoRateio = despesa.rateios.map((r) => r.usuario_id);

  if (dados.pagador_id) exigirPagadorNoGrupo(membrosIds, dados.pagador_id, despesa.pagador_id);

  const { rateio, ...campos } = dados;
  const modo = campos.modo_divisao || despesa.modo_divisao;
  const valor = campos.valor !== undefined ? campos.valor : despesa.valor;

  let linhas = null; // null = manter o rateio gravado
  if (modo === 'personalizada') {
    // Trocar o valor sem reenviar o rateio deixaria a soma quebrada
    if (!rateio) throw new AppError('Informe o valor de cada pessoa', 400);
    exigirRateioFechado(rateio, valor, [...new Set([...membrosIds, ...jaNoRateio])]);
    linhas = rateio;
  } else {
    // Na divisão igual, só redivide se o valor ou o modo mudarem. Editar descrição,
    // data ou categoria mantém a divisão original, mesmo que alguém tenha saído.
    const mudouValor = Math.round(Number(valor) * 100) !== Math.round(Number(despesa.valor) * 100);
    const mudouModo = despesa.modo_divisao !== 'igual';
    if (mudouValor || mudouModo) linhas = rateioIgual(valor, membrosIds);
  }

  await sequelize.transaction(async (transaction) => {
    await despesa.update(campos, { transaction });
    if (linhas) {
      await DespesaRateio.destroy({ where: { despesa_id: despesa.id }, transaction });
      await gravarRateio(despesa.id, linhas, transaction);
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
