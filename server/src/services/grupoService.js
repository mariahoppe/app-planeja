const { Grupo, GrupoMembro, Usuario, Roteiro, Destino, Despesa, DespesaRateio, sequelize } = require('../models');
const { AppError } = require('../utils/errorHandler');
const { exigirAcessoAoGrupo, exigirAdminDoGrupo } = require('./permissoes');
const { calcularContas } = require('./rateio');
const { paginacao } = require('../utils/paginacao');

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const INTEGRANTES = {
  model: GrupoMembro,
  as: 'membros',
  include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email', 'foto_url'] }]
};

const VIAGEM = {
  model: Roteiro,
  as: 'roteiro',
  attributes: ['id', 'titulo', 'inicio', 'fim', 'status'],
  include: [{ model: Destino, as: 'destino', attributes: ['id', 'cidade', 'pais'] }]
};

/**
 * Código de convite de seis caracteres. Tenta algumas vezes porque o código é
 * UNIQUE — com 36^6 combinações a colisão é rara, mas não impossível.
 */
const gerarCodigo = async (nome, transaction) => {
  const prefixo = (nome || '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

  for (let tentativa = 0; tentativa < 10; tentativa += 1) {
    const sufixo = Array.from({ length: 3 }, () =>
      ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
    const codigo = prefixo + sufixo;
    const existe = await Grupo.findOne({ where: { codigo_convite: codigo }, transaction });
    if (!existe) return codigo;
  }
  throw new AppError('Não foi possível gerar um código de convite. Tente de novo.', 500);
};

// Paginada com ?pagina=&limite= (RNF-04); sem limite, vem inteira como antes
const listarMeus = async (userId, query = {}) => {
  const participacoes = await GrupoMembro.findAll({
    where: { usuario_id: userId },
    attributes: ['grupo_id']
  });
  const ids = participacoes.map((p) => p.grupo_id);

  const grupos = await Grupo.findAll({
    where: { id: ids },
    include: [INTEGRANTES, VIAGEM, { model: Despesa, as: 'despesas', attributes: ['id', 'valor'] }],
    // O id desempata grupos criados no mesmo instante, para as páginas não repetirem nem pularem itens
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    ...paginacao(query)
  });

  return grupos.map((g) => {
    const json = g.toJSON();
    json.total_integrantes = json.membros.length;
    json.total_despesas = json.despesas.length;
    json.total_gasto = json.despesas.reduce((s, d) => s + Number(d.valor), 0);
    json.sou_admin = json.criador_id === userId;
    delete json.despesas;
    return json;
  });
};

const buscarPorId = async (id, userId, isAdmin) => {
  await exigirAcessoAoGrupo(id, userId, isAdmin);

  const grupo = await Grupo.findByPk(id, { include: [INTEGRANTES, VIAGEM] });
  const json = grupo.toJSON();
  json.sou_admin = json.criador_id === userId;
  return json;
};

/**
 * Cria o grupo e já inscreve o criador como admin, em uma transação: um grupo
 * sem integrantes seria inacessível até para quem o criou.
 */
const criar = async (dados, userId, isAdmin) => {
  const roteiro = await Roteiro.findByPk(dados.roteiro_id, {
    include: [{ model: Destino, as: 'destino', attributes: ['usuario_id'] }]
  });
  if (!roteiro) throw new AppError('Roteiro não encontrado', 404);
  if (!isAdmin && roteiro.destino.usuario_id !== userId) {
    throw new AppError('Só o dono da viagem pode criar um grupo para ela', 403);
  }

  const jaTem = await Grupo.findOne({ where: { roteiro_id: dados.roteiro_id } });
  if (jaTem) throw new AppError('Esta viagem já tem um grupo', 409);

  const grupo = await sequelize.transaction(async (transaction) => {
    const codigo = await gerarCodigo(dados.nome, transaction);
    const novo = await Grupo.create(
      { ...dados, criador_id: userId, codigo_convite: codigo },
      { transaction }
    );
    await GrupoMembro.create(
      { grupo_id: novo.id, usuario_id: userId, papel: 'admin' },
      { transaction }
    );
    return novo;
  });

  return buscarPorId(grupo.id, userId, isAdmin);
};

const atualizar = async (id, dados, userId, isAdmin) => {
  const grupo = await exigirAdminDoGrupo(id, userId, isAdmin);
  await grupo.update(dados);
  return buscarPorId(id, userId, isAdmin);
};

const excluir = async (id, userId, isAdmin) => {
  const grupo = await exigirAdminDoGrupo(id, userId, isAdmin);
  await grupo.destroy();
};

/** Entrada por código de convite, pela tela de Grupos */
const entrarPorCodigo = async (codigo, userId) => {
  const grupo = await Grupo.findOne({ where: { codigo_convite: codigo.trim().toUpperCase() } });
  if (!grupo) throw new AppError('Código não encontrado', 404);

  const jaEstou = await GrupoMembro.findOne({ where: { grupo_id: grupo.id, usuario_id: userId } });
  if (jaEstou) throw new AppError('Você já está nesse grupo', 409);

  await GrupoMembro.create({ grupo_id: grupo.id, usuario_id: userId, papel: 'integrante' });
  return buscarPorId(grupo.id, userId, false);
};

const removerIntegrante = async (id, usuarioId, userId, isAdmin) => {
  const grupo = await exigirAdminDoGrupo(id, userId, isAdmin);
  if (Number(usuarioId) === grupo.criador_id) {
    throw new AppError('O criador do grupo não pode ser removido', 409);
  }
  const membro = await GrupoMembro.findOne({ where: { grupo_id: id, usuario_id: usuarioId } });
  if (!membro) throw new AppError('Integrante não encontrado', 404);
  await membro.destroy();
};

/**
 * Sair do grupo. As despesas já lançadas pela pessoa continuam valendo — é por
 * isso que despesas.pagador_id referencia usuarios, e não grupo_membros.
 */
const sair = async (id, userId) => {
  const grupo = await exigirAcessoAoGrupo(id, userId, false);
  if (grupo.criador_id === userId) {
    throw new AppError('O criador não pode sair; exclua o grupo ou transfira a viagem', 409);
  }
  const membro = await GrupoMembro.findOne({ where: { grupo_id: id, usuario_id: userId } });
  await membro.destroy();
};

/**
 * Aba de despesas: lançamentos, saldos e acerto de contas, tudo recalculado
 * na hora.
 */
const contas = async (id, userId, isAdmin) => {
  await exigirAcessoAoGrupo(id, userId, isAdmin);

  const [membros, despesas] = await Promise.all([
    GrupoMembro.findAll({
      where: { grupo_id: id },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'foto_url'] }],
      order: [['entrou_em', 'ASC']]
    }),
    // Só o necessário para o cálculo: a lista de lançamentos vem paginada de
    // GET /grupos/:id/despesas (RNF-04), não daqui.
    Despesa.findAll({
      where: { grupo_id: id },
      attributes: ['id', 'valor', 'pagador_id'],
      include: [{ model: DespesaRateio, as: 'rateios', attributes: ['usuario_id', 'valor_devido'] }]
    })
  ]);

  const membrosIds = membros.map((m) => m.usuario_id);
  const resumo = calcularContas(despesas.map((d) => d.toJSON()), membrosIds);

  // Quem já saiu do grupo continua nas contas das despesas de que participou
  const exIntegrantes = resumo.saldos.filter((s) => s.saiu).map((s) => s.usuario_id);
  const usuariosQueSairam = exIntegrantes.length
    ? await Usuario.findAll({ where: { id: exIntegrantes }, attributes: ['id', 'nome', 'foto_url'] })
    : [];

  const nomePorId = Object.fromEntries([
    ...membros.map((m) => [m.usuario_id, m.usuario]),
    ...usuariosQueSairam.map((u) => [u.id, u])
  ]);

  return {
    total: resumo.total,
    total_por_pessoa: resumo.total_por_pessoa,
    total_despesas: despesas.length,
    saldos: resumo.saldos.map((s) => ({ ...s, usuario: nomePorId[s.usuario_id] })),
    acertos: resumo.acertos.map((a) => ({
      ...a,
      de_usuario: nomePorId[a.de],
      para_usuario: nomePorId[a.para]
    }))
  };
};

module.exports = {
  listarMeus, buscarPorId, criar, atualizar, excluir,
  entrarPorCodigo, removerIntegrante, sair, contas
};
