'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE atividades (
        id         SERIAL        PRIMARY KEY,
        roteiro_id INTEGER       NOT NULL REFERENCES roteiros (id) ON UPDATE CASCADE ON DELETE CASCADE,
        titulo     VARCHAR(120)  NOT NULL,
        dia        SMALLINT      NOT NULL,
        horario    TIME          NOT NULL,
        local      VARCHAR(150),
        custo      NUMERIC(10,2) NOT NULL DEFAULT 0,
        link       TEXT,
        obs        TEXT,
        feita      BOOLEAN       NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),

        CONSTRAINT atividades_titulo_check CHECK (btrim(titulo) <> ''),
        CONSTRAINT atividades_dia_check    CHECK (dia >= 1),
        CONSTRAINT atividades_custo_check  CHECK (custo >= 0),
        CONSTRAINT atividades_link_check   CHECK (link IS NULL OR link ~* '^https?://')
      );

      -- Ordenação da tela de detalhe do roteiro: agrupada por dia, ordenada por hora
      CREATE INDEX atividades_roteiro_dia_horario_idx ON atividades (roteiro_id, dia, horario);

      COMMENT ON COLUMN atividades.dia  IS 'Dia N da viagem, contado a partir de roteiros.inicio (1 = primeiro dia)';
      COMMENT ON COLUMN atividades.link IS 'Link opcional de compra: ingresso, passagem, reserva';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS atividades CASCADE;');
  }
};
