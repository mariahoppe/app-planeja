const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const db = { sequelize, Sequelize };

// Herdados do projeto web
db.Usuario = require('./Usuario')(sequelize);
db.Destino = require('./Destino')(sequelize);
db.Roteiro = require('./Roteiro')(sequelize);
db.Atividade = require('./Atividade')(sequelize);

// Novos do mobile
db.Dica = require('./Dica')(sequelize);
db.DicaFoto = require('./DicaFoto')(sequelize);
db.AvaliacaoDestino = require('./AvaliacaoDestino')(sequelize);
db.Grupo = require('./Grupo')(sequelize);
db.GrupoMembro = require('./GrupoMembro')(sequelize);
db.Despesa = require('./Despesa')(sequelize);
db.DespesaRateio = require('./DespesaRateio')(sequelize);

Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;
