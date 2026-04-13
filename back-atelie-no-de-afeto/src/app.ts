import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: `
    -------------  API Nós de Afeto funcionando.---------------
    ` });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;