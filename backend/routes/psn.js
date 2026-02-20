import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { createPSN, listPSN } from '../controllers/psnController.js';

const r = Router();

r.use(auth);
r.get('/', listPSN);
r.post('/', createPSN);

export default r;
