'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios ADD COLUMN reset_tentativas SMALLINT NOT NULL DEFAULT 0;

      COMMENT ON COLUMN usuarios.reset_tentativas IS 'Erros seguidos no código de recuperação de senha';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE usuarios DROP COLUMN reset_tentativas;');
  }
};
