import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { create_user, get_user } from './utils/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(session({
  secret: process.env.SESSION_SECRET || 'wikilinks_secret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    let user = await get_user(id);
    if (!user) {
      await create_user(id, displayName, emails[0]?.value);
      user = await get_user(id);
    }
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.uid);
});

passport.deserializeUser(async (id, done) => {
  const user = await get_user(id);
  done(null, user);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
