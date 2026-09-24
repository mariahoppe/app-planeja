'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE grupo_membros (
        id         SERIAL       PRIMARY KEY,
        grupo_id   INTEGER      NOT NULL REFERENCES grupos (id)   ON UPDATE CASCADE ON DELETE CASCADE,
        usuario_id INTEGER      NOT NULL REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE,
        papel      papel_membro NOT NULL DEFAULT 'integrante',
        entrou_em  TIMESTAMPTZ  NOT NULL DEFAULT now(),

        CONSTRAINT grupo_membros_unique UNIQUE (grupo_id, usuario_id)
      );

      CREATE INDEX grupo_membros_usuario_id_idx ON grupo_membros (usuario_id);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS grupo_membros CASCADE;');
  }
};
