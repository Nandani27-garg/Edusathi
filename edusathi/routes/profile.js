const express = require('express');
const router = express.Router();
const db = require('../database/database');
const i18n = require('../utils/i18n');

// Profile Page
router.get('/', (req, res) => {
  const user = req.session.user || {
    id: 1,
    name: 'Rahul Kumar',
    email: 'demo@edusaarthi.test',
    state: 'Jharkhand',
    education_level: 'Class 10',
    preferred_language: 'hi'
  };

  const settings = db.get('SELECT * FROM user_settings WHERE user_id = ?', [user.id]) || {
    college_name: 'Birsa Munda Inter College, Ranchi',
    target_career: 'State Administrative Services & Civil Services',
    subjects: 'Geography, Political Science, Economics, Science',
    theme: 'light',
    low_data: 0,
    voice_enabled: 1
  };

  const completedLessons = db.get(`
    SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = 1
  `, [user.id]);

  const quizAttempts = db.get(`
    SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?
  `, [user.id]);

  res.render('profile', {
    activeTab: 'profile',
    profileUser: user,
    settings,
    completedCount: completedLessons ? completedLessons.count : 5,
    quizCount: quizAttempts ? quizAttempts.count : 4,
    pageTitle: (res.locals.lang === 'hi') ? 'छात्र प्रोफ़ाइल' : 'Student Profile'
  });
});

// Update Profile
router.post('/update', (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.redirect('/auth/login');
  }

  const { name, state, education_level, college_name, target_career, subjects } = req.body;

  if (name) {
    db.run('UPDATE users SET name = ?, state = ?, education_level = ? WHERE id = ?', [
      name.trim(),
      state || 'Jharkhand',
      education_level || 'Class 10',
      user.id
    ]);
    req.session.user.name = name.trim();
    req.session.user.state = state || 'Jharkhand';
    req.session.user.education_level = education_level || 'Class 10';
  }

  db.run(`
    INSERT OR REPLACE INTO user_settings (user_id, college_name, target_career, subjects)
    VALUES (?, ?, ?, ?)
  `, [user.id, college_name || '', target_career || '', subjects || '']);

  res.redirect('/profile?updated=1');
});

// Settings Page
router.get('/settings', (req, res) => {
  const user = req.session.user || { id: 1 };
  const settings = db.get('SELECT * FROM user_settings WHERE user_id = ?', [user.id]) || {
    preferred_language: res.locals.lang || 'hi',
    low_data: req.session.lowData ? 1 : 0,
    voice_enabled: 1,
    theme: 'light'
  };

  res.render('settings', {
    activeTab: 'settings',
    settings,
    supportedLanguages: i18n.SUPPORTED_LANGUAGES,
    pageTitle: (res.locals.lang === 'hi') ? 'प्राथमिकताएं एवं सेटिंग्स' : 'Preferences & Settings'
  });
});

// Save Settings
router.post('/settings/save', (req, res) => {
  const user = req.session.user;
  const { preferred_language, low_data, voice_enabled, theme } = req.body;

  const lowDataBool = low_data === '1' || low_data === 'true' || low_data === true;
  const voiceEnabledBool = voice_enabled === '1' || voice_enabled === 'true' || voice_enabled === true;
  const selectedLang = preferred_language || 'en';

  req.session.lang = selectedLang;
  req.session.lowData = lowDataBool;
  res.cookie('edusaarthi_language', selectedLang, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false, sameSite: 'lax', path: '/' });

  if (user) {
    db.run('UPDATE users SET preferred_language = ? WHERE id = ?', [selectedLang, user.id]);
    db.run(`
      INSERT OR REPLACE INTO user_settings (user_id, preferred_language, low_data, voice_enabled, theme)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, selectedLang, lowDataBool ? 1 : 0, voiceEnabledBool ? 1 : 0, theme || 'light']);
  }

  res.redirect('/settings?saved=1');
});

module.exports = router;
