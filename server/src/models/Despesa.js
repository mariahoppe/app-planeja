const { DataTypes } = require('sequelize');

const CATEGORIAS = ['alimentacao', 'hospedagem', 'transporte', 'atividade', 'outros'];

module.exports = (sequelize) => {
  const Despesa = sequelize.define('Despesa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'grupos', key: 'id' }
    },
    // Aponta para usuarios, não para grupo_membros: sair do grupo não apaga as
    // despesas já registradas pela pessoa.
    pagador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    descricao: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: true }
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 }
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    categoria: {
      type: DataTypes.ENUM(...CATEGORIAS),
      allowNull: false,
      defaultValue: 'outros'
    },
    modo_divisao: {
      type: DataTypes.ENUM('igual', 'personalizada'),
      allowNull: false,
      defaultValue: 'igual'
    }
  }, {
    tableName: 'despesas'
  });

  Despesa.CATEGORIAS = CATEGORIAS;

  Despesa.associate = (models) => {
    Despesa.belongsTo(models.Grupo, { foreignKey: 'grupo_id', as: 'grupo' });
    Despesa.belongsTo(models.Usuario, { foreignKey: 'pagador_id', as: 'pagador' });
    Despesa.hasMany(models.DespesaRateio, { foreignKey: 'despesa_id', as: 'rateios', onDelete: 'CASCADE', hooks: true });
  };

  return Despesa;
};
