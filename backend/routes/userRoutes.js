import express from 'express';
import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { normalizeRole, ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, role: normalizeRole(user.role), skills: user.skills || [], capacity: user.capacity || 0, status: user.status || 'active' };
}

router.get('/', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ name: 1 });
    res.json({ success: true, data: users.map(publicUser) });
  } catch (error) { next(error); }
});

router.patch('/:id/role', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!Object.values(ROLES).includes(role)) throw new AppError('role must be ADMIN, EVENT_MANAGER, or VOLUNTEER', 400);
    if (String(req.params.id) === req.user.id) throw new AppError('Administrators cannot change their own role', 403);
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: publicUser(user) });
  } catch (error) { next(error); }
});

export default router;
