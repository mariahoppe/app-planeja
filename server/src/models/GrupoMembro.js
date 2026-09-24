const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GrupoMembro = sequelize.define('GrupoMembro', {
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
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    papel: {
      type: DataTypes.ENUM('admin', 'integrante'),
      allowNull: false,
      defaultValue: 'integrante'
    },
    entrou_em: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'grupo_membros',
    timestamps: false,
    indexes: [{ unique: true, fields: ['grupo_id', 'usuario_id'] }]
  });

  GrupoMembro.associate = (models) => {
    GrupoMembro.belongsTo(models.Grupo, { foreignKey: 'grupo_id', as: 'grupo' });
    GrupoMembro.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };

  return GrupoMembro;
};
