const { Router } = require('express');
const roteiroController = require('../controllers/roteiroController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { criar, atualizar } = require('../validators/roteiroValidator');

const router = Router();

router.use(auth);

router.get('/', roteiroController.listar);
router.post('/', validate(criar), roteiroController.criar);
router.get('/:id', roteiroController.buscarPorId);
router.put('/:id', validate(atualizar), roteiroController.atualizar);
router.delete('/:id', roteiroController.excluir);
router.get('/:id/resumo', roteiroController.resumo);

module.exports = router;
