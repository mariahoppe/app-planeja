'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE roteiros (
        id         SERIAL         PRIMARY KEY,
        destino_id INTEGER        NOT NULL REFERENCES destinos (id) ON UPDATE CASCADE ON DELETE CASCADE,
        titulo     VARCHAR(100)   NOT NULL,
        inicio     DATE           NOT NULL,
        fim        DATE,
        status     status_roteiro NOT NULL DEFAULT 'planejando',
        obs        TEXT,
        created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),

        CONSTRAINT roteiros_titulo_check  CHECK (btrim(titulo) <> ''),
        CONSTRAINT roteiros_periodo_check CHECK (fim IS NULL OR fim >= inicio)
      );

      CREATE INDEX roteiros_destino_id_idx ON roteiros (destino_id);
      CREATE INDEX roteiros_status_idx     ON roteiros (status);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS roteiros CASCADE;');
  }
};
