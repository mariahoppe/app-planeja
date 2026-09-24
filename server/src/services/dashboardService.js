const { Op } = require('sequelize');
const { Destino, Roteiro, Atividade, Dica, Grupo, GrupoMembro } = require('../models');

/**
 * Alimenta a tela de Início: o cartão da próxima viagem, os quatro contadores
 * e o atalho para o grupo da viagem em andamento.
 */
const obterDashboard = async (userId, isAdmin) => {
  const whereDest = isAdmin ? {} : { usuario_id: userId };

  const destinos = await Destino.findAll({ where: whereDest, attributes: ['id'] });
  const destinoIds = destinos.map((d) => d.id);

  const roteiros = await Roteiro.findAll({
    where: { destino_id: { [Op.in]: destinoIds } },
    include: [
      { model: Destino, as: 'destino', attributes: ['id', 'cidade', 'pais'] },
      { model: Atividade, as: 'atividades', attributes: ['id', 'feita', 'custo', 'dia', 'horario', 'titulo', 'local'] },
      { model: Grupo, as: 'grupo', attributes: ['id', 'nome'] }
    ],
    order: [['inicio', 'ASC']]
  });

  // "Próxima viagem" no protótipo é o roteiro não concluído mais próximo
  const proximaViagem = roteiros.find((r) => r.status !== 'concluido') || null;

  const resumoRoteiro = (r) => {
    const atividades = r.atividades || [];
    return {
      id: r.id,
      titulo: r.titulo,
      inicio: r.inicio,
      fim: r.fim,
      status: r.status,
      destino: r.destino,
      grupo: r.grupo || null,
      total_atividades: atividades.length,
      atividades_concluidas: atividades.filter((a) => a.feita).length,
      custo_total: atividades.reduce((s, a) => s + parseFloat(a.custo || 0), 0)
    };
  };

  const outrosRoteiros = roteiros
    .filter((r) => !proximaViagem || r.id !== proximaViagem.id)
    .slice(0, 5)
    .map(resumoRoteiro);

  const todasAtividades = roteiros.flatMap((r) =>
    r.atividades.map((a) => ({ ...a.toJSON(), roteiro_id: r.id, roteiro_titulo: r.titulo }))
  );

  // Pendentes da próxima viagem, na ordem em que aparecem no roteiro
  const proximasAtividades = (proximaViagem ? proximaViagem.atividades : [])
    .filter((a) => !a.feita)
    .sort((a, b) => a.dia - b.dia || String(a.horario).localeCompare(String(b.horario)))
    .slice(0, 5)
    .map((a) => ({ ...a.toJSON(), roteiro_id: proximaViagem.id, roteiro_titulo: proximaViagem.titulo }));

  const [dicasPublicadas, gruposParticipando] = await Promise.all([
    Dica.count({ where: { autor_id: userId } }),
    GrupoMembro.count({ where: { usuario_id: userId } })
  ]);

  return {
    totais: {
      destinos: destinos.length,
      roteiros: roteiros.length,
      atividades: todasAtividades.length,
      atividades_concluidas: todasAtividades.filter((a) => a.feita).length,
      custo_total: todasAtividades.reduce((s, a) => s + parseFloat(a.custo || 0), 0),
      dicas_publicadas: dicasPublicadas,
      grupos: gruposParticipando
    },
    proxima_viagem: proximaViagem ? resumoRoteiro(proximaViagem) : null,
    outros_roteiros: outrosRoteiros,
    proximas_atividades: proximasAtividades
  };
};

module.exports = { obterDashboard };
