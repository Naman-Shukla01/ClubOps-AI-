import { AppError } from './errorMiddleware.js';
import { normalizeRole } from './authMiddleware.js';

export function requireRole(...roles) {
  const allowedRoles = roles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!allowedRoles.includes(normalizeRole(req.user.role))) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

export function requireSelfOrRole(getUserId, ...roles) {
  const allowedRoles = roles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (allowedRoles.includes(normalizeRole(req.user.role))) return next();
    if (String(getUserId(req)) !== String(req.user.id)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}
