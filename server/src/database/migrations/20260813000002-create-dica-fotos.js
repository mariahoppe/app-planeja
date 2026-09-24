'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Fotos organizadas por bloco, no máximo 4 por bloco. O limite é garantido
      -- pelo par CHECK(ordem BETWEEN 1 AND 4) + UNIQUE(dica_id, bloco, ordem):
      -- não existe combinação possível que permita uma quinta foto no mesmo bloco.
      CREATE TABLE dica_fotos (
        id         SERIAL       PRIMARY KEY,
        dica_id    INTEGER      NOT NULL REFERENCES dicas (id) ON UPDATE CASCADE ON DELETE CASCADE,
        bloco      bloco_dica   NOT NULL,
        url        TEXT         NOT NULL,
        legenda    VARCHAR(120),
        ordem      SMALLINT     NOT NULL,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

        CONSTRAINT dica_fotos_url_check   CHECK (btrim(url) <> ''),
        CONSTRAINT dica_fotos_ordem_check CHECK (ordem BETWEEN 1 AND 4),
        CONSTRAINT dica_fotos_slot_unique UNIQUE (dica_id, bloco, ordem)
      );

      CREATE INDEX dica_fotos_dica_id_idx ON dica_fotos (dica_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS dica_fotos CASCADE;');
  }
};
