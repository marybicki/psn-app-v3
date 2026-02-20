import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listUsers } from '../controllers/adminController.js';

const r = Router();

r.use(auth);
r.get('/users', listUsers);

export default r;
