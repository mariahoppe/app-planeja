const { Router } = require('express');
const atividadeController = require('../controllers/atividadeController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { criar, atualizar } = require('../validators/atividadeValidator');

const router = Router();

router.use(auth);

router.get('/', atividadeController.listar);
router.post('/', validate(criar), atividadeController.criar);
router.get('/:id', atividadeController.buscarPorId);
router.put('/:id', validate(atualizar), atividadeController.atualizar);
router.patch('/:id/toggle', atividadeController.toggle);
router.delete('/:id', atividadeController.excluir);

module.exports = router;
