import express from 'express';
import passport, { isGoogleConfigured } from '../config/googleAuth.js';
import { login, me, register } from '../controllers/authController.js';
import { authenticate, signUserToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

router.get('/google', (req, res, next) => {
	if (!isGoogleConfigured()) {
		return res.status(503).json({ success: false, message: 'Google authentication is not configured' });
	}
	passport.authenticate('google', { scope: ['profile', 'email'], state: true, session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
	if (!isGoogleConfigured()) {
		return res.status(503).json({ success: false, message: 'Google authentication is not configured' });
	}
	const frontendUrl = process.env.CLIENT_URL;
	if (!frontendUrl) return res.status(500).json({ success: false, message: 'CLIENT_URL is not configured' });

	passport.authenticate('google', { state: true, session: false }, (error, user) => {
		if (error || !user) {
			const reason = encodeURIComponent(error?.message || 'Google authentication failed');
			return res.redirect(`${frontendUrl}/#oauth_error=${reason}`);
		}
		const token = encodeURIComponent(signUserToken(user));
		return res.redirect(`${frontendUrl}/#oauth_token=${token}`);
	})(req, res, next);
});

export default router;
