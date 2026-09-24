'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE destinos (
        id         SERIAL         PRIMARY KEY,
        usuario_id INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
        cidade     VARCHAR(80)    NOT NULL,
        pais       VARCHAR(60)    NOT NULL,
        escopo     escopo_destino NOT NULL DEFAULT 'internacional',
        periodo    VARCHAR(40),
        obs        TEXT,
        created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),

        CONSTRAINT destinos_cidade_check CHECK (btrim(cidade) <> ''),
        CONSTRAINT destinos_pais_check   CHECK (btrim(pais) <> '')
      );

      CREATE INDEX destinos_usuario_id_idx ON destinos (usuario_id);

      COMMENT ON COLUMN destinos.periodo IS 'Período pretendido em texto livre: "Abril 2026", "A definir"';
      COMMENT ON COLUMN destinos.escopo  IS 'Alimenta o filtro Nacional/Internacional da lista de destinos';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS destinos CASCADE;');
  }
};
