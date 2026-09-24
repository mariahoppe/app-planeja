const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const validate = require('../middlewares/validate');
const { atualizar, trocarSenha } = require('../validators/usuarioValidator');

const router = Router();

router.use(auth);

router.get('/perfil', usuarioController.perfil);
router.put('/trocar-senha', validate(trocarSenha), usuarioController.trocarSenha);
router.get('/', adminOnly, usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id', validate(atualizar), usuarioController.atualizar);
router.delete('/:id', adminOnly, usuarioController.excluir);

module.exports = router;
