'use strict';

/**
 * Extensões, funções de normalização e tipos ENUM compartilhados.
 *
 * As migrations usam SQL puro porque o schema depende de recursos que o DSL do
 * Sequelize não expressa: colunas geradas, CHECK constraints, tipos ENUM
 * compartilhados entre tabelas e constraint triggers.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- No Supabase as extensões ficam no schema "extensions". Em um Postgres
      -- comum, troque por: CREATE EXTENSION IF NOT EXISTS unaccent;
      CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

      -- A forma de dois argumentos de unaccent() é IMMUTABLE, o que permite
      -- usá-la em colunas geradas e índices. A de um argumento não é.
      CREATE OR REPLACE FUNCTION public.f_unaccent(text)
      RETURNS text
      LANGUAGE sql
      IMMUTABLE PARALLEL SAFE STRICT
      AS $fn$ SELECT extensions.unaccent('extensions.unaccent'::regdictionary, $1) $fn$;

      -- Espelha o norm() do protótipo: sem acento, minúsculo, sem espaços nas pontas
      CREATE OR REPLACE FUNCTION public.norm(text)
      RETURNS text
      LANGUAGE sql
      IMMUTABLE PARALLEL SAFE STRICT
      AS $fn$ SELECT lower(btrim(public.f_unaccent($1))) $fn$;

      CREATE TYPE perfil_usuario    AS ENUM ('admin', 'comum');
      CREATE TYPE escopo_destino    AS ENUM ('nacional', 'internacional');
      CREATE TYPE status_roteiro    AS ENUM ('planejando', 'confirmado', 'concluido');
      CREATE TYPE bloco_dica        AS ENUM ('onde_comer', 'o_que_fazer', 'onde_visitar', 'onde_ficar');
      CREATE TYPE papel_membro      AS ENUM ('admin', 'integrante');
      CREATE TYPE categoria_despesa AS ENUM ('alimentacao', 'hospedagem', 'transporte', 'atividade', 'outros');
      CREATE TYPE modo_divisao      AS ENUM ('igual', 'personalizada');
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS modo_divisao;
      DROP TYPE IF EXISTS categoria_despesa;
      DROP TYPE IF EXISTS papel_membro;
      DROP TYPE IF EXISTS bloco_dica;
      DROP TYPE IF EXISTS status_roteiro;
      DROP TYPE IF EXISTS escopo_destino;
      DROP TYPE IF EXISTS perfil_usuario;
      DROP FUNCTION IF EXISTS public.norm(text);
      DROP FUNCTION IF EXISTS public.f_unaccent(text);
    `);
  }
};
