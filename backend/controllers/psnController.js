import { db, save } from '../models/db.js';

export async function listPSN(req, res) {
  res.json(db.psn);
}

export async function createPSN(req, res) {
  const year = new Date().getFullYear();
  const next = String((db.registry?.length || 0) + 1).padStart(4, '0');
  const number = `PSN-${year}-${next}`;

  const item = {
    ...req.body,
    id: 'PSN-' + Date.now(),
    number
  };

  db.psn.push(item);
  save();

  res.status(201).json(item);
}
