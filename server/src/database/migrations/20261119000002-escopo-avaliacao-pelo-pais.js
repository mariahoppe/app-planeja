'use strict';

/**
 * "Cidades herdam o país para o filtro nacional/internacional": o escopo das
 * avaliações passa a vir do país (avaliacaoService.escopoDoPais). Esta
 * migration alinha as avaliações já gravadas com a mesma regra. Rodar de novo
 * não muda nada.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE avaliacoes_destino
         SET escopo = CASE WHEN pais_norm IN ('brasil', 'brazil') THEN 'nacional' ELSE 'internacional' END::escopo_destino
       WHERE escopo <> CASE WHEN pais_norm IN ('brasil', 'brazil') THEN 'nacional' ELSE 'internacional' END::escopo_destino;
    `);
  },

  // Não há como saber qual escopo cada pessoa tinha escolhido antes; nada a desfazer.
  async down() {}
};
