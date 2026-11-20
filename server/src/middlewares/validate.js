/**
 * Valida req.body com o schema Joi e responde 400 com as mensagens.
 *
 * De propósito, NÃO troca req.body pelo valor convertido do Joi: os validators
 * usam Joi.date(), que transformaria "2026-04-12" em meia-noite UTC — com o fuso
 * -03:00 do Sequelize, a data seria gravada como 11/04. E defaults de schemas de
 * atualização (ex.: feita: false) resetariam campos numa edição parcial.
 * Defaults e normalizações ficam nos services e nos models.
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map(d => d.message);
    return res.status(400).json({
      error: { message: 'Dados inválidos', details }
    });
  }
  next();
};

module.exports = validate;
