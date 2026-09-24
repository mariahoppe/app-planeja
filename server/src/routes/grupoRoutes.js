const { Router } = require('express');
const grupoController = require('../controllers/grupoController');
const despesaController = require('../controllers/despesaController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const grupoValidator = require('../validators/grupoValidator');
const despesaValidator = require('../validators/despesaValidator');

const router = Router();

router.use(auth);

// Grupos
router.get('/', grupoController.listarMeus);
router.post('/', validate(grupoValidator.criar), grupoController.criar);
router.post('/entrar', validate(grupoValidator.entrar), grupoController.entrar);
router.get('/:id', grupoController.buscarPorId);
router.put('/:id', validate(grupoValidator.atualizar), grupoController.atualizar);
router.delete('/:id', grupoController.excluir);

// Integrantes
router.delete('/:id/integrantes/:usuarioId', grupoController.removerIntegrante);
router.post('/:id/sair', grupoController.sair);

// Aba de despesas: lançamentos, saldos e acerto de contas
router.get('/:id/contas', grupoController.contas);
router.get('/:id/despesas', despesaController.listar);
router.post('/:id/despesas', validate(despesaValidator.criar), despesaController.criar);
router.get('/:id/despesas/:despesaId', despesaController.buscarPorId);
router.put('/:id/despesas/:despesaId', validate(despesaValidator.atualizar), despesaController.atualizar);
router.delete('/:id/despesas/:despesaId', despesaController.excluir);

module.exports = router;
