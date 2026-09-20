import mongoose from 'mongoose';
import Club from '../models/Club.js';
import { AppError } from './errorMiddleware.js';
import { normalizeRole } from './authMiddleware.js';

/**
 * Requires the user to be an ADMIN or EVENT_MANAGER (club lead),
 * or the explicit head of the specified club.
 * Unconditionally rejects VOLUNTEER role with 403 Forbidden.
 */
export async function requireClubLead(req, res, next) {
  try {
    const userRole = normalizeRole(req.user?.role);

    // Unconditionally reject volunteers from performing lead actions like task/event creation
    if (userRole === 'VOLUNTEER') {
      return next(new AppError('Volunteers are not authorized to perform this action', 403));
    }

    // ADMIN and EVENT_MANAGER are authorized
    if (['ADMIN', 'EVENT_MANAGER'].includes(userRole)) {
      return next();
    }

    const clubId = req.body?.clubId || req.query?.clubId || req.params?.clubId || req.params?.id;

    if (!clubId || !mongoose.isValidObjectId(clubId)) {
      return next(new AppError('Only club leads or event managers can perform this action', 403));
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return next(new AppError('Club not found', 404));
    }

    const isHead = String(club.head) === String(req.user?.id);
    if (!isHead) {
      return next(new AppError('Only the club lead organizer can perform this action', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
}
