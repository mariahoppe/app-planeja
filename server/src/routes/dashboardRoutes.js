const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

const router = Router();

router.get('/', auth, dashboardController.obterDashboard);

module.exports = router;
