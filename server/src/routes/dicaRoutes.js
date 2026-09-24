const express = require('express');
const router = express.Router();

const dicaController = require('../controllers/dicaController');
const dicaValidator = require('../validators/dicaValidator');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Dicas são globais, mas toda rota exige sessão (RNF-05)
router.use(auth);

router.get('/', dicaController.listar);
router.get('/minhas', dicaController.minhas);
router.get('/:id', dicaController.buscarPorId);

router.post('/', validate(dicaValidator.criar), dicaController.criar);
router.put('/:id', validate(dicaValidator.atualizar), dicaController.atualizar);
router.delete('/:id', dicaController.excluir);

router.post('/:id/fotos', validate(dicaValidator.adicionarFoto), dicaController.adicionarFoto);
router.delete('/:id/fotos/:fotoId', dicaController.removerFoto);

module.exports = router;
