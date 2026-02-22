import { db, save } from '../models/db.js';

export async function listRegistry(req, res) {
  res.json(db.registry);
}

export async function addRegistry(req, res) {
  const entry = { ...req.body };
  db.registry.push(entry);
  save();
  res.status(201).json(entry);
}
