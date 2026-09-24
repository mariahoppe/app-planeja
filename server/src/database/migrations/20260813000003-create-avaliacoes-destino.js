'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- Uma avaliação por usuário por destino, editável depois (upsert na chave
      -- única). Os dois rankings — países e cidades — são AVG + COUNT sobre esta
      -- tabela, agrupados por pais_norm e por cidade_norm.
      CREATE TABLE avaliacoes_destino (
        id          SERIAL         PRIMARY KEY,
        usuario_id  INTEGER        NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
        pais        VARCHAR(60)    NOT NULL,
        cidade      VARCHAR(80)    NOT NULL,
        pais_norm   TEXT GENERATED ALWAYS AS (public.norm(pais))   STORED,
        cidade_norm TEXT GENERATED ALWAYS AS (public.norm(cidade)) STORED,
        escopo      escopo_destino NOT NULL DEFAULT 'internacional',
        nota        NUMERIC(3,1)   NOT NULL,
        created_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ    NOT NULL DEFAULT now(),

        CONSTRAINT avaliacoes_cidade_check CHECK (btrim(cidade) <> ''),
        CONSTRAINT avaliacoes_pais_check   CHECK (btrim(pais) <> ''),
        CONSTRAINT avaliacoes_nota_check   CHECK (nota >= 0 AND nota <= 10),
        CONSTRAINT avaliacoes_um_por_destino_unique UNIQUE (usuario_id, pais_norm, cidade_norm)
      );

      CREATE INDEX avaliacoes_ranking_pais_idx   ON avaliacoes_destino (escopo, pais_norm);
      CREATE INDEX avaliacoes_ranking_cidade_idx ON avaliacoes_destino (escopo, cidade_norm);

      COMMENT ON COLUMN avaliacoes_destino.nota IS
        'Custo-benefício de 0 a 10 com uma casa decimal. As estrelas da tela de Dica gravam estrela * 2.';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS avaliacoes_destino CASCADE;');
  }
};
