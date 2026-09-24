class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const handleSequelizeError = (err) => {
  if (err.isOperational) return err;

  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(e => e.message);
    return new AppError('Erro de validação', 400, details);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return new AppError('Registro duplicado', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new AppError('Não é possível excluir: existem registros vinculados', 409);
  }

  if (err.name === 'SequelizeDatabaseError') {
    return new AppError('Erro no banco de dados', 500);
  }

  return err;
};

module.exports = { AppError, handleSequelizeError };
