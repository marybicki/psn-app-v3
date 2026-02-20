import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import psnRoutes from './routes/psn.js';
import regRoutes from './routes/registry.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', api: 'psn-app-v3' }));

app.use('/api/auth', authRoutes);
app.use('/api/psn', psnRoutes);
app.use('/api/registry', regRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log('API działa → http://localhost:' + port)
);
