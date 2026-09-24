'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Dicas são globais: qualquer usuário lê, só o autor edita. O destino é
      -- gravado como texto (país + cidade), não como FK para "destinos", porque
      -- "destinos" é a lista pessoal de cada usuário.
      CREATE TABLE dicas (
        id           SERIAL         PRIMARY KEY,
        autor_id     INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
        pais         VARCHAR(60)    NOT NULL,
        cidade       VARCHAR(80)    NOT NULL,
        pais_norm    TEXT GENERATED ALWAYS AS (public.norm(pais))   STORED,
        cidade_norm  TEXT GENERATED ALWAYS AS (public.norm(cidade)) STORED,
        escopo       escopo_destino NOT NULL DEFAULT 'internacional',
        onde_comer   TEXT,
        o_que_fazer  TEXT,
        onde_visitar TEXT,
        onde_ficar   TEXT,
        created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),

        CONSTRAINT dicas_cidade_check CHECK (btrim(cidade) <> ''),
        CONSTRAINT dicas_pais_check   CHECK (btrim(pais) <> ''),

        -- Regra do protótipo: pelo menos um dos quatro blocos preenchido
        CONSTRAINT dicas_algum_bloco_check CHECK (
          btrim(coalesce(onde_comer,   '')) <> '' OR
          btrim(coalesce(o_que_fazer,  '')) <> '' OR
          btrim(coalesce(onde_visitar, '')) <> '' OR
          btrim(coalesce(onde_ficar,   '')) <> ''
        )
      );

      CREATE INDEX dicas_cidade_norm_idx ON dicas (cidade_norm);
      CREATE INDEX dicas_pais_norm_idx   ON dicas (pais_norm);
      CREATE INDEX dicas_escopo_idx      ON dicas (escopo);
      CREATE INDEX dicas_autor_id_idx    ON dicas (autor_id);
      CREATE INDEX dicas_recentes_idx    ON dicas (created_at DESC);

      COMMENT ON TABLE  dicas IS 'Dicas de viagem por destino. Leitura pública, escrita só do autor.';
      COMMENT ON COLUMN dicas.cidade_norm IS 'Coluna gerada para busca sem acento/caixa';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS dicas CASCADE;');
  }
};
