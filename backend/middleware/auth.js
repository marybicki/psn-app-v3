import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu' });
  }

  try {
    const d = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = d;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Nieprawidłowy token' });
  }
}
