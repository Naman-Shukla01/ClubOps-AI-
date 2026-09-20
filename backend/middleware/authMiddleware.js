import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  EVENT_MANAGER: 'EVENT_MANAGER',
  VOLUNTEER: 'VOLUNTEER',
});

const LEGACY_ROLE_MAP = {
  admin: ROLES.ADMIN,
  lead: ROLES.EVENT_MANAGER,
  'event lead': ROLES.EVENT_MANAGER,
  'club-head': ROLES.EVENT_MANAGER,
  'club head': ROLES.EVENT_MANAGER,
  event_manager: ROLES.EVENT_MANAGER,
  manager: ROLES.EVENT_MANAGER,
  volunteer: ROLES.VOLUNTEER,
};

export function normalizeRole(role) {
  if (!role) return ROLES.VOLUNTEER;
  const normalized = String(role).trim().toUpperCase();
  return Object.values(ROLES).includes(normalized)
    ? normalized
    : LEGACY_ROLE_MAP[String(role).trim().toLowerCase()] || ROLES.VOLUNTEER;
}

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  return process.env.JWT_SECRET;
}

export function signUserToken(user) {
  return jwt.sign({ sub: String(user._id), role: normalizeRole(user.role) }, jwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
}

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication required', 401);

    const payload = jwt.verify(token, jwtSecret());
    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) throw new AppError('Authentication required', 401);

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      user,
    };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired authentication token', 401));
    }
    next(error);
  }
}

export function optionalAuthenticate(req, res, next) {
  if (!req.headers.authorization) return next();
  return authenticate(req, res, next);
}
