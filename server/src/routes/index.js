const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const destinoRoutes = require('./destinoRoutes');
const roteiroRoutes = require('./roteiroRoutes');
const atividadeRoutes = require('./atividadeRoutes');
const dicaRoutes = require('./dicaRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');
const grupoRoutes = require('./grupoRoutes');

router.get('/', (req, res) => {
  res.json({
    message: 'API Planeja',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      usuarios: '/api/usuarios',
      destinos: '/api/destinos',
      roteiros: '/api/roteiros',
      atividades: '/api/atividades',
      dicas: '/api/dicas',
      avaliacoes: '/api/avaliacoes',
      ranking: '/api/avaliacoes/ranking',
      grupos: '/api/grupos',
      despesas: '/api/grupos/:id/despesas',
      contas: '/api/grupos/:id/contas'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/destinos', destinoRoutes);
router.use('/roteiros', roteiroRoutes);
router.use('/atividades', atividadeRoutes);
router.use('/dicas', dicaRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/grupos', grupoRoutes);

module.exports = router;
