import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

const allowedOrigin = (origin, cb) => {
  if (
    !origin || origin === 'null' || origin.startsWith('file://') ||
    origin.includes('localhost') ||
    origin === (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  ) return cb(null, true);
  cb(new Error(`Socket CORS blocked: ${origin}`));
};

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigin, credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Auth required'));
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      const user = await User.findById(payload.id);
      if (!user || !user.isActive) return next(new Error('Invalid user'));
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.patientProfile = user.patientProfile ? user.patientProfile.toString() : null;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 connected: ${socket.userRole} ${socket.userId}`);
    socket.join(`role_${socket.userRole}`);
    if (socket.userRole === 'patient' && socket.patientProfile) {
      socket.join(`patient_${socket.patientProfile}`);
    }
    socket.on('disconnect', () => console.log(`🔌 disconnected: ${socket.userId}`));
  });

  return io;
}
