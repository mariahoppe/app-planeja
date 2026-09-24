const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Atividade = sequelize.define('Atividade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roteiro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roteiros', key: 'id' }
    },
    titulo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: true }
    },
    // Dia N da viagem, contado a partir de roteiros.inicio (1 = primeiro dia)
    dia: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1 }
    },
    horario: {
      type: DataTypes.TIME,
      allowNull: false
    },
    local: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    custo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 }
    },
    // Onde a atividade foi comprada: ingresso, passagem, reserva
    link: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { isUrl: true }
    },
    obs: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    feita: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'atividades'
  });

  Atividade.associate = (models) => {
    Atividade.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
  };

  return Atividade;
};
