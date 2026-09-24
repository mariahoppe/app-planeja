'use strict';

/**
 * Row Level Security.
 *
 * A API conecta como dona das tabelas via Sequelize, e o dono passa por cima do
 * RLS — habilitar aqui não muda nada para o app, só silencia o aviso do painel
 * do Supabase sobre tabelas expostas sem política. Sem nenhuma policy criada,
 * qualquer acesso via PostgREST (anon/authenticated) fica bloqueado, que é o
 * comportamento desejado: todo acesso passa pela API.
 */
const TABELAS = [
  'usuarios',
  'destinos',
  'roteiros',
  'atividades',
  'dicas',
  'dica_fotos',
  'avaliacoes_destino',
  'grupos',
  'grupo_membros',
  'despesas',
  'despesa_rateios'
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      TABELAS.map((t) => `ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`).join('\n')
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      TABELAS.map((t) => `ALTER TABLE ${t} DISABLE ROW LEVEL SECURITY;`).join('\n')
    );
  }
};
