const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AvaliacaoDestino = sequelize.define('AvaliacaoDestino', {
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
    pais: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: { notEmpty: true }
    },
    cidade: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { notEmpty: true }
    },
    // Colunas geradas pelo banco (public.norm). Somente leitura.
    pais_norm: { type: DataTypes.TEXT, allowNull: true },
    cidade_norm: { type: DataTypes.TEXT, allowNull: true },
    escopo: {
      type: DataTypes.ENUM('nacional', 'internacional'),
      allowNull: false,
      defaultValue: 'internacional'
    },
    // Custo-benefício de 0 a 10 com uma casa. As estrelas da tela de Dica
    // gravam estrela * 2 (5 estrelas = 10.0).
    nota: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: { min: 0, max: 10 }
    }
  }, {
    tableName: 'avaliacoes_destino'
  });

  AvaliacaoDestino.beforeSave((avaliacao) => {
    avaliacao.changed('pais_norm', false);
    avaliacao.changed('cidade_norm', false);
  });

  AvaliacaoDestino.associate = (models) => {
    AvaliacaoDestino.belongsTo(models.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  };

  return AvaliacaoDestino;
};
