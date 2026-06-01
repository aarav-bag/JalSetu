import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';

// Setup passport with local strategy
export function setupAuth(app: Express) {
  // Configure express-session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'jalsetu-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    })
  );

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Test user for development - check first before any database calls
      if (username === 'aarav' && password === '123456') {
        const testUser = {
          id: 999,
          username: 'aarav',
          firstName: 'Aarav',
          lastName: 'Sharma',
          email: 'aarav@jalsetu.app',
          password: 'hashed_password',
          createdAt: new Date().toISOString()
        };
        return done(null, testUser);
      }

      try {
        // Try database user only if not test user
        const user = await storage.getUserByUsername(username);

        // User not found
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Password validation
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // Authentication successful
        return done(null, user);
      } catch (error) {
        return done(null, false, { message: 'Database connection error. Use aarav/123456 for development.' });
      }
    })
  );

  // Configure Google OAuth strategy (only if credentials are available)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = process.env.NODE_ENV === 'production'
      ? 'https://jalsetu.isroot.in/api/auth/google/callback'
      : '/api/auth/google/callback';

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || profile.name?.familyName || profile.username;
            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const googleId = profile.id;

            // Use email as the primary identifier
            if (!email) {
              return done(null, false, { message: 'No email found from Google profile.' });
            }

            // Try to find existing user by email
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user from Google profile
              const username = email.split('@')[0] + '_' + googleId.slice(-6);
              const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
              const hashedPassword = await bcrypt.hash(randomPassword, 10);

              user = await storage.createUser({
                username,
                password: hashedPassword,
                firstName,
                lastName,
                email,
              });
            }

            return done(null, user);
          } catch (error) {
            console.error('Google OAuth error:', error);
            return done(null, false, { message: 'Failed to authenticate with Google.' });
          }
        }
      )
    );
  }

  // Serialize user to the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Handle test user
      if (id === 999) {
        const testUser = {
          id: 999,
          username: 'aarav',
          firstName: 'Aarav',
          lastName: 'Sharma',
          email: 'aarav@jalsetu.app',
          password: 'hashed_password',
          createdAt: new Date().toISOString()
        };
        return done(null, testUser);
      }

      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      // If database fails and it's the test user, still allow it
      if (id === 999) {
        const testUser = {
          id: 999,
          username: 'aarav',
          firstName: 'Aarav',
          lastName: 'Sharma',
          email: 'aarav@jalsetu.app',
          password: 'hashed_password',
          createdAt: new Date().toISOString()
        };
        return done(null, testUser);
      }
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Helper to hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
