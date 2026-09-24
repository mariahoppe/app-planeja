const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dica = sequelize.define('Dica', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    autor_id: {
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
    // Colunas geradas pelo banco (public.norm) para busca sem acento/caixa.
    // Somente leitura: nunca são enviadas em INSERT/UPDATE.
    pais_norm: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cidade_norm: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    escopo: {
      type: DataTypes.ENUM('nacional', 'internacional'),
      allowNull: false,
      defaultValue: 'internacional'
    },
    onde_comer: { type: DataTypes.TEXT, allowNull: true },
    o_que_fazer: { type: DataTypes.TEXT, allowNull: true },
    onde_visitar: { type: DataTypes.TEXT, allowNull: true },
    onde_ficar: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'dicas',
    validate: {
      peloMenosUmBloco() {
        const blocos = [this.onde_comer, this.o_que_fazer, this.onde_visitar, this.onde_ficar];
        if (!blocos.some((b) => b && String(b).trim())) {
          throw new Error('Preencha pelo menos um dos quatro blocos');
        }
      }
    }
  });

  // As colunas geradas são calculadas pelo Postgres — o Sequelize não pode escrevê-las
  Dica.beforeSave((dica) => {
    dica.changed('pais_norm', false);
    dica.changed('cidade_norm', false);
  });

  Dica.associate = (models) => {
    Dica.belongsTo(models.Usuario, { foreignKey: 'autor_id', as: 'autor' });
    Dica.hasMany(models.DicaFoto, { foreignKey: 'dica_id', as: 'fotos', onDelete: 'CASCADE', hooks: true });
  };

  return Dica;
};
