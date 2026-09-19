import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { ROLES } from '../middleware/authMiddleware.js';

function getGoogleConfig() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) return null;
  let callbackUrl;
  try {
    callbackUrl = new URL(GOOGLE_CALLBACK_URL);
  } catch {
    throw new Error('GOOGLE_CALLBACK_URL must be a valid URL');
  }
  const isLocalHttp = callbackUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(callbackUrl.hostname);
  if (callbackUrl.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('GOOGLE_CALLBACK_URL must use HTTPS, except for localhost development');
  }
  if (callbackUrl.pathname !== '/api/auth/google/callback') {
    throw new Error('GOOGLE_CALLBACK_URL must point to /api/auth/google/callback');
  }
  return { clientID: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackURL: callbackUrl.toString() };
}

export function isGoogleConfigured() {
  return Boolean(getGoogleConfig());
}

export function configureGoogleStrategy() {
  const config = getGoogleConfig();
  if (!config) return false;

  passport.use(new GoogleStrategy(config, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.trim().toLowerCase();
      const emailVerified = profile._json?.email_verified === true;
      if (!email || !emailVerified) return done(new Error('Google account email is missing or not verified'));

      let user = await User.findOne({ googleSubject: profile.id });
      if (!user) user = await User.findOne({ email });

      if (user) {
        if (!user.googleSubject) {
          user.googleSubject = profile.id;
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName || email.split('@')[0],
        email,
        googleSubject: profile.id,
        role: ROLES.VOLUNTEER,
      });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  return true;
}

export default passport;
