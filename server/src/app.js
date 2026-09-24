const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { geral } = require('./middlewares/rateLimiter');
const { handleSequelizeError } = require('./utils/errorHandler');

const app = express();

app.use(helmet());
app.use(geral);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const error = handleSequelizeError(err);
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ${statusCode} - ${error.message}`);
  }

  res.status(statusCode).json({
    error: {
      message: error.message || 'Erro interno do servidor',
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

module.exports = app;
