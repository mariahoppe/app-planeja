const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Destino = sequelize.define('Destino', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    cidade: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { notEmpty: true }
    },
    pais: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { notEmpty: true }
    },
    escopo: {
      type: DataTypes.ENUM('nacional', 'internacional'),
      allowNull: false,
      defaultValue: 'internacional'
    },
    // Período pretendido em texto livre: "Abril 2026", "A definir"
    periodo: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    obs: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'destinos'
  });

  Destino.associate = (models) => {
    Destino.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
    Destino.hasMany(models.Roteiro, { foreignKey: 'destino_id', as: 'roteiros', onDelete: 'CASCADE', hooks: true });
  };

  return Destino;
};
