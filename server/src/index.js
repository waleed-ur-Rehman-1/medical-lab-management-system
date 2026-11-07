import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import { securityMiddleware } from './middleware/security.js';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import testRoutes from './routes/tests.js';
import visitRoutes from './routes/visits.js';
import orderRoutes from './routes/orders.js';
import resultRoutes from './routes/results.js';
import invoiceRoutes from './routes/invoices.js';
import paymentRoutes from './routes/payments.js';

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

// ─────────────────────────────────────────────────────────────
// CORS — bulletproof. Matches production + ALL Vercel preview URLs
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://medical-lab-management-system.vercel.app'
].filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;                         // curl, mobile, server-to-server
  if (origin === 'null') return true;               // Electron file://
  if (origin.startsWith('file://')) return true;    // Electron
  if (allowedOrigins.includes(origin)) return true; // exact match
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;

  // Match ANY Vercel URL for this project — production, preview, branch deploy, with team slug
  // Examples that MUST match:
  //   https://medical-lab-management-system.vercel.app
  //   https://medical-lab-management-system-d56mvuxwg.vercel.app
  //   https://medical-lab-management-system-d56mvuxwg-waleed-ur-rehmans-projects.vercel.app
  if (/^https:\/\/medical-lab-management-system[\w-]*\.vercel\.app$/i.test(origin)) {
    return true;
  }

  return false;
}

app.use(cors({
  origin: function (origin, cb) {
    const allowed = isAllowedOrigin(origin);
    // Log every CORS decision so you can diagnose from Render logs
    console.log(`[CORS] origin=${origin || 'none'} allowed=${allowed}`);
    return cb(null, allowed);   // true = allow with headers, false = no headers
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ─────────────────────────────────────────────────────────────
// Body parsing + logging + rate limit + security
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(securityMiddleware);   // ← FIXED: was after errorHandler (never ran)
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'MLMIS', time: new Date().toISOString() })
);

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = initSocket(httpServer);
app.set('io', io);
console.log('🔌 Socket.IO initialized');

console.log(`🌍 NODE_ENV:     ${process.env.NODE_ENV || 'development'}`);
console.log(`🌍 PORT:         ${PORT}`);
console.log(`🌍 MONGO_URI:    ${process.env.MONGO_URI ? '✅ set' : '❌ MISSING'}`);
console.log(`🌍 JWT_SECRET:   ${process.env.JWT_SECRET ? '✅ set' : '❌ MISSING'}`);
console.log(`🌍 CLIENT_ORIGIN: ${process.env.CLIENT_ORIGIN || '❌ MISSING'}`);

connectDB()
  .then(() => httpServer.listen(PORT, '0.0.0.0', () =>
    console.log(`\n🚀 MLMIS API + Socket.IO on http://0.0.0.0:${PORT}\n`)
  ))
  .catch((err) => {
    console.error('\n❌ STARTUP FAILED');
    console.error('   Reason:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('   Hint: MongoDB unreachable. Check Atlas Network Access whitelist.');
    }
    setTimeout(() => process.exit(1), 100);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down');
  httpServer.close(() => process.exit(0));
});