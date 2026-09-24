const { Router } = require('express');
const destinoController = require('../controllers/destinoController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { criar, atualizar } = require('../validators/destinoValidator');

const router = Router();

router.use(auth);

router.get('/', destinoController.listar);
router.post('/', validate(criar), destinoController.criar);
router.get('/:id', destinoController.buscarPorId);
router.put('/:id', validate(atualizar), destinoController.atualizar);
router.delete('/:id', destinoController.excluir);

module.exports = router;
