import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { listRegistry, addRegistry } from '../controllers/registryController.js';

const r = Router();

r.use(auth);
r.get('/', listRegistry);
r.post('/', addRegistry);

export default r;
