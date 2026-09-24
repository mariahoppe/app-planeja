const adminOnly = (req, res, next) => {
  if (req.user.perfil !== 'admin') {
    return res.status(403).json({
      error: { message: 'Acesso restrito a administradores' }
    });
  }
  next();
};

module.exports = adminOnly;
