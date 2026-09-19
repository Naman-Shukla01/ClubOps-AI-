import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { normalizeRole, signUserToken, ROLES } from '../middleware/authMiddleware.js';

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    skills: user.skills || [],
    capacity: user.capacity || 0,
    status: user.status || 'active',
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
      throw new AppError('name, email, and a password of at least 8 characters are required', 400);
    }
    const existing = await User.exists({ email: email.trim().toLowerCase() });
    if (existing) throw new AppError('An account with that email already exists', 409);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: ROLES.VOLUNTEER,
    });
    res.status(201).json({ success: true, token: signUserToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: email?.trim().toLowerCase() }).select('+passwordHash');
    if (!user || !user.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }
    res.status(200).json({ success: true, token: signUserToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.status(200).json({ success: true, user: publicUser(req.user.user) });
}
