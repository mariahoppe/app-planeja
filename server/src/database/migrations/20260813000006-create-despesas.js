'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      -- pagador_id aponta para "usuarios", e não para "grupo_membros": é isso que
      -- faz valer a regra "sair do grupo não apaga as despesas já registradas
      -- pela pessoa".
      CREATE TABLE despesas (
        id           SERIAL            PRIMARY KEY,
        grupo_id     INTEGER           NOT NULL REFERENCES grupos (id)   ON UPDATE CASCADE ON DELETE CASCADE,
        pagador_id   INTEGER           NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        descricao    VARCHAR(120)      NOT NULL,
        valor        NUMERIC(10,2)     NOT NULL,
        data         DATE              NOT NULL DEFAULT CURRENT_DATE,
        categoria    categoria_despesa NOT NULL DEFAULT 'outros',
        modo_divisao modo_divisao      NOT NULL DEFAULT 'igual',
        created_at   TIMESTAMPTZ       NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ       NOT NULL DEFAULT now(),

        CONSTRAINT despesas_descricao_check CHECK (btrim(descricao) <> ''),
        CONSTRAINT despesas_valor_check     CHECK (valor > 0)
      );

      CREATE INDEX despesas_grupo_id_idx   ON despesas (grupo_id);
      CREATE INDEX despesas_pagador_id_idx ON despesas (pagador_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS despesas CASCADE;');
  }
};
