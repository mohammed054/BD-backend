const express = require('express');
const cors = require('cors');
const categoriesRouter = require('./routes/categories');
const itemsRouter = require('./routes/items');
const guestsRouter = require('./routes/guests');
const importRouter = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/import', importRouter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'BD Backend API - Camping/Party Organizer' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
  const { query } = require('./database');
  try {
    const result = await query('SELECT 1 as test');
    res.json({ status: 'db-working', result });
  } catch (err) {
    res.status(500).json({ status: 'db-failed', error: err.message, stack: err.stack });
  }
});

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
