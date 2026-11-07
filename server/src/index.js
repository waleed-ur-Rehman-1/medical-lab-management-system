import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import testRoutes from './routes/tests.js';
import visitRoutes from './routes/visits.js';
import orderRoutes from './routes/orders.js';
import resultRoutes from './routes/results.js';
import invoiceRoutes from './routes/invoices.js';
import paymentRoutes from './routes/payments.js';
import { securityMiddleware } from './middleware/security.js';

async function tryImport(path) {
  try { return (await import(path)).default; }
  catch { return null; }
}
const whatsappRoutes = await tryImport('./routes/whatsapp.js');
const doctorRoutes   = await tryImport('./routes/doctor.js');
const financeRoutes  = await tryImport('./routes/finance.js');
const adminRoutes    = await tryImport('./routes/admin.js');

import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (
      !origin || origin === 'null' || origin.startsWith('file://') ||
      origin === (process.env.CLIENT_ORIGIN || 'http://localhost:5173') ||
      origin.includes('localhost')
    ) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'MLMIS', time: new Date().toISOString() })
);

const mounts = [
  ['/api/v1/auth',     authRoutes,     true],
  ['/api/v1/patients', patientRoutes,  true],
  ['/api/v1/tests',    testRoutes,     true],
  ['/api/v1/visits',   visitRoutes,    true],
  ['/api/v1/orders',   orderRoutes,    true],
  ['/api/v1/results',  resultRoutes,   true],
  ['/api/v1/invoices', invoiceRoutes,  true],
  ['/api/v1/payments', paymentRoutes,  true],
  ['/api/v1/whatsapp', whatsappRoutes, false],
  ['/api/v1/doctor',   doctorRoutes,   false],
  ['/api/v1/finance',  financeRoutes,  false],
  ['/api/v1/admin',    adminRoutes,    false]
];

for (const [path, router, required] of mounts) {
  if (!router) {
    if (required) { console.error(`❌ Required router missing: ${path}`); process.exit(1); }
    console.log(`⏭️  Skipped ${path}`); continue;
  }
  app.use(path, router);
  console.log(`✅ Mounted ${path}`);
}

app.use(notFound);
app.use(errorHandler);
app.use(securityMiddleware);

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// ─── Socket.IO ───
const io = initSocket(httpServer);
app.set('io', io);
console.log('🔌 Socket.IO initialized');

connectDB()
  .then(() => httpServer.listen(PORT, () =>
    console.log(`\n🚀 MLMIS API + Socket.IO on http://localhost:${PORT}\n`)
  ))
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });