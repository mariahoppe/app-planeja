const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: { message: 'Token não fornecido' } });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res.status(401).json({ error: { message: 'Token mal formatado' } });
  }

  jwt.verify(parts[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: { message: 'Token inválido ou expirado' } });
    }

    req.user = { id: decoded.id, email: decoded.email, perfil: decoded.perfil };
    req.userId = decoded.id;
    return next();
  });
};

module.exports = authMiddleware;
