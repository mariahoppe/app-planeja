const { Router } = require('express');
const avaliacaoController = require('../controllers/avaliacaoController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registrar } = require('../validators/avaliacaoValidator');

const router = Router();

router.use(auth);

// Os dois rankings (países e cidades) sob o filtro ?escopo=nacional|internacional
router.get('/ranking', avaliacaoController.ranking);

router.get('/minhas', avaliacaoController.minhas);
router.post('/', validate(registrar), avaliacaoController.registrar);
router.delete('/:id', avaliacaoController.excluir);

module.exports = router;
