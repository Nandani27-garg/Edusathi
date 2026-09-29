const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/database');

// Render Login Page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Process Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login', { error: 'Please enter both email and password.' });
    }

    const user = db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // Set session user (exclude password hash)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      state: user.state,
      education_level: user.education_level,
      preferred_language: user.preferred_language
    };
    const existingCookie = req.headers && req.headers.cookie ? (req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/) ? decodeURIComponent(req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/)[1]) : null) : null;
    req.session.lang = existingCookie || user.preferred_language || 'en';
    res.cookie('edusaarthi_language', req.session.lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

// Instant 1-Click Demo Login
router.post('/demo-login', async (req, res) => {
  try {
    const demoUser = db.get('SELECT * FROM users WHERE email = ?', ['demo@edusaarthi.test']);
    if (!demoUser) {
      return res.render('login', { error: 'Demo account not initialized. Please run seed script.' });
    }

    const existingCookie = req.headers && req.headers.cookie ? (req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/) ? decodeURIComponent(req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/)[1]) : null) : null;
    req.session.user = {
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      state: demoUser.state,
      education_level: demoUser.education_level,
      preferred_language: demoUser.preferred_language
    };
    req.session.lang = existingCookie || demoUser.preferred_language || 'en';
    res.cookie('edusaarthi_language', req.session.lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Demo login error:', err);
    return res.redirect('/auth/login');
  }
});

// Render Register Page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null });
});

// Process Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, state, education_level, preferred_language } = req.body;
    if (!name || !email || !password) {
      return res.render('register', { error: 'Please fill in all required fields.' });
    }

    const existing = db.get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.render('register', { error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = db.run(
      `INSERT INTO users (name, email, password_hash, state, preferred_language, education_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, state || 'Jharkhand', preferred_language || 'hi', education_level || 'Class 10']
    );

    req.session.user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      state: state || 'Jharkhand',
      education_level: education_level || 'Class 10',
      preferred_language: preferred_language || 'hi'
    };
    const existingCookie = req.headers && req.headers.cookie ? (req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/) ? decodeURIComponent(req.headers.cookie.match(/(?:^|;\s*)edusaarthi_language=([^;]*)/)[1]) : null) : null;
    req.session.lang = preferred_language || existingCookie || 'en';
    res.cookie('edusaarthi_language', req.session.lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });

    // Initialize user_settings
    db.run(
      `INSERT OR REPLACE INTO user_settings (user_id, preferred_language) VALUES (?, ?)`,
      [result.lastInsertRowid, req.session.lang]
    );

    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    return res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

const { SUPPORTED_LANGUAGES } = require('../utils/i18n');

// Set Language Preference API
router.post('/set-language', (req, res) => {
  const { lang } = req.body;
  const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === lang);
  if (isSupported) {
    req.session.lang = lang;
    res.cookie('edusaarthi_language', lang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });
    if (req.session.user) {
      req.session.user.preferred_language = lang;
      db.run('UPDATE users SET preferred_language = ? WHERE id = ?', [lang, req.session.user.id]);
      db.run('INSERT OR REPLACE INTO user_settings (user_id, preferred_language) VALUES (?, ?)', [req.session.user.id, lang]);
    }
    return res.json({ success: true, lang });
  }
  res.status(400).json({ error: 'Invalid language' });
});

// Set Low Data Mode Preference API
router.post('/set-low-data', (req, res) => {
  const { enabled } = req.body;
  req.session.lowData = !!enabled;
  res.json({ success: true, lowData: req.session.lowData });
});

module.exports = router;
