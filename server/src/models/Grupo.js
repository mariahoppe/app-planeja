const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Grupo = sequelize.define('Grupo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // UNIQUE: uma viagem tem no máximo um grupo
    roteiro_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'roteiros', key: 'id' }
    },
    criador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' }
    },
    nome: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { notEmpty: true }
    },
    codigo_convite: {
      type: DataTypes.CHAR(6),
      allowNull: false,
      unique: true,
      validate: { is: /^[A-Z0-9]{6}$/ }
    }
  }, {
    tableName: 'grupos'
  });

  Grupo.associate = (models) => {
    Grupo.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
    Grupo.belongsTo(models.Usuario, { foreignKey: 'criador_id', as: 'criador' });
    Grupo.hasMany(models.GrupoMembro, { foreignKey: 'grupo_id', as: 'membros', onDelete: 'CASCADE', hooks: true });
    Grupo.hasMany(models.Despesa, { foreignKey: 'grupo_id', as: 'despesas', onDelete: 'CASCADE', hooks: true });
    Grupo.belongsToMany(models.Usuario, {
      through: models.GrupoMembro,
      foreignKey: 'grupo_id',
      otherKey: 'usuario_id',
      as: 'integrantes'
    });
  };

  return Grupo;
};
