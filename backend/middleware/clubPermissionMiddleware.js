import Club from '../models/Club.js';
import { AppError } from './errorMiddleware.js';

/**
 * Requires the user to be the head (lead organizer) of the club
 * referenced in req.body.clubId, or to be an ADMIN/EVENT_MANAGER.
 */
export function requireClubLead(req, res, next) {
  if (req.user?.role === 'ADMIN') return next();

  const clubId = req.body?.clubId || req.query?.clubId || req.params?.clubId;

  if (!clubId) {
    if (req.user?.role !== 'EVENT_MANAGER') {
      return next(new AppError('Only club leads can perform this action', 403));
    }
    return next();
  }

  Club.findById(clubId)
    .then((club) => {
      if (!club) return next(new AppError('Club not found', 404));
      const isHead = String(club.head) === String(req.user?.id);
      if (!isHead) {
        return next(new AppError('Only the club lead organizer can perform this action', 403));
      }
      next();
    })
    .catch(next);
}
