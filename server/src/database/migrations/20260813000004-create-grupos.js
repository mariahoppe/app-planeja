'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE grupos (
        id             SERIAL      PRIMARY KEY,
        roteiro_id     INTEGER     NOT NULL REFERENCES roteiros (id) ON UPDATE CASCADE ON DELETE CASCADE,
        criador_id     INTEGER     NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        nome           VARCHAR(60) NOT NULL,
        codigo_convite CHAR(6)     NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT grupos_nome_check   CHECK (btrim(nome) <> ''),
        CONSTRAINT grupos_codigo_check CHECK (codigo_convite ~ '^[A-Z0-9]{6}$'),

        -- "Um grupo está vinculado a exatamente uma viagem; uma viagem pode ter um grupo"
        CONSTRAINT grupos_roteiro_unique UNIQUE (roteiro_id),
        CONSTRAINT grupos_codigo_unique  UNIQUE (codigo_convite)
      );

      CREATE INDEX grupos_criador_id_idx ON grupos (criador_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS grupos CASCADE;');
  }
};
