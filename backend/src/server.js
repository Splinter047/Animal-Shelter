import express from 'express';
import cors from 'cors';
import config from './config.js';
import authRoutes from './routes/auth.js';
import animalsRoutes from './routes/animals.js';
import adoptionsRoutes from './routes/adoptions.js';
import rescuesRoutes from './routes/rescues.js';
import careLogsRoutes from './routes/careLogs.js';
import employeesRoutes from './routes/employees.js';
import { surrenderAnimal } from './controllers/surrender.js';
import { authenticate, authorize } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/animals', animalsRoutes);
app.use('/api/v1/adoptions', adoptionsRoutes);
app.use('/api/v1/rescues', rescuesRoutes);
app.use('/api/v1/animals', careLogsRoutes);
app.use('/api/v1/employees', employeesRoutes);

app.post('/api/v1/animals/surrender', 
  authenticate, 
  authorize('Manager', 'Admin'), 
  surrenderAnimal
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
