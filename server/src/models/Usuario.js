const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    perfil: {
      type: DataTypes.ENUM('admin', 'comum'),
      allowNull: false,
      defaultValue: 'comum'
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reset_token_expira: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    defaultScope: {
      attributes: { exclude: ['senha_hash', 'reset_token', 'reset_token_expira'] }
    },
    scopes: {
      comSenha: { attributes: {} }
    }
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Destino, { foreignKey: 'usuario_id', as: 'destinos' });
    Usuario.hasMany(models.Dica, { foreignKey: 'autor_id', as: 'dicas' });
    Usuario.hasMany(models.AvaliacaoDestino, { foreignKey: 'usuario_id', as: 'avaliacoes' });
    Usuario.hasMany(models.GrupoMembro, { foreignKey: 'usuario_id', as: 'participacoes' });
    Usuario.hasMany(models.Grupo, { foreignKey: 'criador_id', as: 'gruposCriados' });
    Usuario.hasMany(models.Despesa, { foreignKey: 'pagador_id', as: 'despesasPagas' });
    Usuario.belongsToMany(models.Grupo, {
      through: models.GrupoMembro,
      foreignKey: 'usuario_id',
      otherKey: 'grupo_id',
      as: 'grupos'
    });
  };

  return Usuario;
};
