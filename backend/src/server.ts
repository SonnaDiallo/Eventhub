import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import eventRoutes from './routes/eventRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/events', eventRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});