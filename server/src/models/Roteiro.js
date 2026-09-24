const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Roteiro = sequelize.define('Roteiro', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    destino_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'destinos', key: 'id' }
    },
    titulo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true }
    },
    inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fim: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('planejando', 'confirmado', 'concluido'),
      allowNull: false,
      defaultValue: 'planejando'
    },
    obs: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'roteiros',
    validate: {
      fimDepoisDoInicio() {
        if (this.fim && this.inicio && this.fim < this.inicio) {
          throw new Error('A data de fim não pode ser anterior à de início');
        }
      }
    }
  });

  Roteiro.associate = (models) => {
    Roteiro.belongsTo(models.Destino, { foreignKey: 'destino_id', as: 'destino' });
    Roteiro.hasMany(models.Atividade, { foreignKey: 'roteiro_id', as: 'atividades', onDelete: 'CASCADE', hooks: true });
    // Um roteiro tem no máximo um grupo (UNIQUE em grupos.roteiro_id)
    Roteiro.hasOne(models.Grupo, { foreignKey: 'roteiro_id', as: 'grupo', onDelete: 'CASCADE', hooks: true });
  };

  return Roteiro;
};
