const { DataTypes } = require('sequelize');

const BLOCOS = ['onde_comer', 'o_que_fazer', 'onde_visitar', 'onde_ficar'];
const MAX_POR_BLOCO = 4;

module.exports = (sequelize) => {
  const DicaFoto = sequelize.define('DicaFoto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'dicas', key: 'id' }
    },
    bloco: {
      type: DataTypes.ENUM(...BLOCOS),
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true }
    },
    legenda: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    // 1 a 4: o slot da foto dentro do bloco. O par CHECK + UNIQUE(dica_id,
    // bloco, ordem) é o que garante o limite de 4 fotos por bloco no banco.
    ordem: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { min: 1, max: MAX_POR_BLOCO }
    }
  }, {
    tableName: 'dica_fotos',
    timestamps: true,
    updatedAt: false
  });

  DicaFoto.BLOCOS = BLOCOS;
  DicaFoto.MAX_POR_BLOCO = MAX_POR_BLOCO;

  DicaFoto.associate = (models) => {
    DicaFoto.belongsTo(models.Dica, { foreignKey: 'dica_id', as: 'dica' });
  };

  return DicaFoto;
};
