const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DespesaRateio = sequelize.define('DespesaRateio', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    despesa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'despesas', key: 'id' }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    valor_devido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    }
  }, {
    tableName: 'despesa_rateios',
    indexes: [{ unique: true, fields: ['despesa_id', 'usuario_id'] }]
  });

  DespesaRateio.associate = (models) => {
    DespesaRateio.belongsTo(models.Despesa, { foreignKey: 'despesa_id', as: 'despesa' });
    DespesaRateio.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };

  return DespesaRateio;
};
