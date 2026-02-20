import { db } from '../models/db.js';

export async function listUsers(req, res) {
  res.json(db.users.map(u => ({
    email: u.email,
    role: u.role
  })));
}
