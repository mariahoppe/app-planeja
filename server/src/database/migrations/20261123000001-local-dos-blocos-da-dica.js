'use strict';

/**
 * Um local por bloco da dica (ex.: "Café de Flore" em "Onde comer"). O app
 * mostra um card que abre o Google Maps buscando o local na cidade da dica.
 * Fica como texto para, mais adiante, poder virar coordenadas e um mapa.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE dicas
        ADD COLUMN local_onde_comer   VARCHAR(120),
        ADD COLUMN local_o_que_fazer  VARCHAR(120),
        ADD COLUMN local_onde_visitar VARCHAR(120),
        ADD COLUMN local_onde_ficar   VARCHAR(120);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE dicas
        DROP COLUMN local_onde_comer,
        DROP COLUMN local_o_que_fazer,
        DROP COLUMN local_onde_visitar,
        DROP COLUMN local_onde_ficar;
    `);
  }
};
