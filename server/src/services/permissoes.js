const { Roteiro, Destino, Grupo, GrupoMembro } = require('../models');
const { AppError } = require('../utils/errorHandler');

/**
 * Regra de acesso a um roteiro.
 *
 * No projeto web só o dono do destino acessava o roteiro. No mobile isso se
 * amplia: todos os integrantes do grupo vinculado à viagem podem ler e editar
 * o roteiro, as atividades e as despesas (RF-19).
 */
const carregarRoteiro = async (roteiroId) => {
  const roteiro = await Roteiro.findByPk(roteiroId, {
    include: [
      { model: Destino, as: 'destino', attributes: ['id', 'usuario_id', 'cidade', 'pais'] },
      { model: Grupo, as: 'grupo', attributes: ['id'] }
    ]
  });
  if (!roteiro) throw new AppError('Roteiro não encontrado', 404);
  return roteiro;
};

const ehIntegrante = async (grupoId, userId) => {
  if (!grupoId) return false;
  const membro = await GrupoMembro.findOne({ where: { grupo_id: grupoId, usuario_id: userId } });
  return Boolean(membro);
};

/**
 * Garante que o usuário pode ver/editar o roteiro. Devolve o roteiro carregado
 * para quem precisar dele em seguida (evita uma segunda consulta).
 */
const exigirAcessoAoRoteiro = async (roteiroId, userId, isAdmin) => {
  const roteiro = await carregarRoteiro(roteiroId);
  if (isAdmin) return roteiro;

  const ehDono = roteiro.destino && roteiro.destino.usuario_id === userId;
  if (ehDono) return roteiro;

  if (await ehIntegrante(roteiro.grupo && roteiro.grupo.id, userId)) return roteiro;

  throw new AppError('Sem permissão para acessar este roteiro', 403);
};

/**
 * Acesso a um grupo: qualquer integrante lê; só o criador administra.
 */
const exigirAcessoAoGrupo = async (grupoId, userId, isAdmin) => {
  const grupo = await Grupo.findByPk(grupoId);
  if (!grupo) throw new AppError('Grupo não encontrado', 404);
  if (isAdmin) return grupo;

  if (!(await ehIntegrante(grupo.id, userId))) {
    throw new AppError('Você não faz parte deste grupo', 403);
  }
  return grupo;
};

const exigirAdminDoGrupo = async (grupoId, userId, isAdmin) => {
  const grupo = await exigirAcessoAoGrupo(grupoId, userId, isAdmin);
  if (!isAdmin && grupo.criador_id !== userId) {
    throw new AppError('Apenas o criador do grupo pode fazer isso', 403);
  }
  return grupo;
};

module.exports = { exigirAcessoAoRoteiro, exigirAcessoAoGrupo, exigirAdminDoGrupo, ehIntegrante };
