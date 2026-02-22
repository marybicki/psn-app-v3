import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';

export async function login(req, res) {
  const { email, password } = req.body || {};
  const user = db.users.find(u => u.email === email);

  if (!user) return res.status(401).json({ message: 'Błędne dane logowania' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Błędne dane logowania' });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: { email: user.email, role: user.role }
  });
}
