const dashboardService = require('../services/dashboardService');

const obterDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.perfil === 'admin';
    const data = await dashboardService.obterDashboard(req.user.id, isAdmin);
    res.json({ data });
  } catch (err) { next(err); }
};

module.exports = { obterDashboard };
