require('dotenv').config();

const baseConfig = {
  dialect: 'postgres',
  logging: false,
  timezone: '-03:00',
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: false
  },
  // DB_SSL=false desliga o SSL (redes que bloqueiam o Postgres criptografado). Padrão: ligado.
  dialectOptions: process.env.DB_SSL === 'false' ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    ...baseConfig,
    logging: console.log
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    ...baseConfig
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...baseConfig,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
