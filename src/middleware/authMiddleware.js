const { verifyToken } = require('../utils/jwtHelper');

/**
 * Vérifie que la requête contient un token JWT valide.
 * Injecte req.user = { id, role, typePersonne } pour les middlewares suivants.
 *
 * Header attendu : Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou malformé' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role, typePersonne, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = authMiddleware;
