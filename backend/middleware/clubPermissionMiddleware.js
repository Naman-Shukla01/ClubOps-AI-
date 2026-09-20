import mongoose from 'mongoose';
import Club from '../models/Club.js';
import { AppError } from './errorMiddleware.js';

/**
 * Requires the user to be the head (lead organizer) of the club
 * referenced in req.body.clubId, or to be an ADMIN/EVENT_MANAGER.
 */
export async function requireClubLead(req, res, next) {
  try {
    if (['ADMIN', 'EVENT_MANAGER'].includes(req.user?.role)) {
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
