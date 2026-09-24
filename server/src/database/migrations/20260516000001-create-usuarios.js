'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE usuarios (
        id                 SERIAL         PRIMARY KEY,
        nome               VARCHAR(80)    NOT NULL,
        email              VARCHAR(120)   NOT NULL,
        senha_hash         VARCHAR(255)   NOT NULL,
        perfil             perfil_usuario NOT NULL DEFAULT 'comum',
        foto_url           TEXT,
        reset_token        VARCHAR(255),
        reset_token_expira TIMESTAMPTZ,
        created_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),

        CONSTRAINT usuarios_nome_check  CHECK (btrim(nome) <> ''),
        CONSTRAINT usuarios_email_check CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\\.[a-z]{2,}$')
      );

      -- E-mail único ignorando maiúsculas
      CREATE UNIQUE INDEX usuarios_email_unique ON usuarios (lower(email));

      COMMENT ON COLUMN usuarios.foto_url IS 'Foto de perfil enviada pela galeria (tela Meu perfil)';
      COMMENT ON COLUMN usuarios.reset_token IS 'Código de 6 dígitos do fluxo "esqueci minha senha"';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS usuarios CASCADE;');
  }
};
