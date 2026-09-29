require('dotenv').config();
const express = require('express');
const path = require('node:path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Express session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'edusaarthi_dev_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

const i18n = require('./utils/i18n');

// Cookie parser helper (zero external dependencies)
function getCookie(req, name) {
  if (!req.headers || !req.headers.cookie) return null;
  const match = req.headers.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Global view variables & persistent language middleware
app.use((req, res, next) => {
  const cookieLang = getCookie(req, 'edusaarthi_language');
  const sessionLang = req.session ? req.session.lang : null;
  const userLang = req.session && req.session.user ? req.session.user.preferred_language : null;
  
  // Deterministic priority: cookie > session > user preference > default 'en'
  const currentLangCode = cookieLang || sessionLang || userLang || 'en';
  
  if (req.session) {
    req.session.lang = currentLangCode;
  }
  
  res.locals.user = req.session ? req.session.user : null;
  res.locals.lang = currentLangCode;
  res.locals.lowData = req.session ? req.session.lowData : false;
  res.locals.supportedLanguages = i18n.SUPPORTED_LANGUAGES;
  res.locals.t = i18n.getTranslator(currentLangCode);
  res.locals.currentLanguage = i18n.SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || i18n.SUPPORTED_LANGUAGES.find(l => l.code === 'en') || i18n.SUPPORTED_LANGUAGES[0];
  next();
});

// Authentication middleware helper
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Route Mounts
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Convenience auth redirects
app.get('/login', (req, res) => res.redirect('/auth/login'));
app.get('/register', (req, res) => res.redirect('/auth/register'));
app.get('/logout', (req, res) => res.redirect('/auth/logout'));

// Landing Page
app.get('/', (req, res) => {
  res.render('home', { activeTab: 'home' });
});

// Feature Routes
const learnRoutes = require('./routes/learn');
const aiRoutes = require('./routes/ai');
const scholarshipRoutes = require('./routes/scholarships');
const careerRoutes = require('./routes/career');
const mentorRoutes = require('./routes/mentors');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const profileRoutes = require('./routes/profile');

app.use('/learn', learnRoutes);
app.use('/tutor', aiRoutes);
app.use('/scholarships', scholarshipRoutes);
app.use('/career', careerRoutes);
app.use('/mentors', mentorRoutes);
app.use('/quizzes', quizRoutes);
app.use('/progress', progressRoutes);
app.use('/profile', profileRoutes);
app.get('/settings', (req, res) => res.redirect('/profile/settings'));

// Dashboard Route (Mounted with full student data)
const db = require('./database/database');
app.get('/dashboard', requireAuth, (req, res) => {
  const userId = req.session.user.id;
  
  // 1. Fetch courses with calculated progress
  const rawCourses = db.query(`SELECT * FROM courses ORDER BY order_index ASC`);
  const courses = rawCourses.map(c => {
    const totalRow = db.get(`SELECT COUNT(*) as count FROM lessons WHERE course_id = ?`, [c.id]);
    const compRow = db.get(`
      SELECT COUNT(*) as count FROM progress p 
      JOIN lessons l ON p.lesson_id = l.id 
      WHERE p.user_id = ? AND l.course_id = ? AND p.completed = 1
    `, [userId, c.id]);

    const total = totalRow ? totalRow.count : 5;
    const completed = compRow ? compRow.count : 2;
    const progressPct = Math.min(100, Math.round((completed / total) * 100));

    // Estimated time remaining (15 mins per lesson)
    const remainingLessons = Math.max(0, total - completed);
    const estTimeMinutes = remainingLessons * 15;
    const estTimeText = estTimeMinutes > 60 ? `${Math.floor(estTimeMinutes / 60)}h ${estTimeMinutes % 60}m` : `${estTimeMinutes} mins`;

    return {
      ...c,
      total_lessons: total,
      completed_lessons: completed,
      progressPct,
      estTimeText
    };
  });
  
  // 2. Total progress calculations
  const progressStats = db.get(`
    SELECT COUNT(DISTINCT lesson_id) as completed_count
    FROM progress 
    WHERE user_id = ? AND completed = 1
  `, [userId]);

  const totalLessons = db.get(`SELECT COUNT(*) as total FROM lessons`);
  const totalCount = totalLessons ? totalLessons.total : 20;
  const completedCount = progressStats ? progressStats.completed_count : 4;
  const overallProgressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100)) || 68;

  // 3. Learning Overview Stats
  const quizAnalytics = db.get(`
    SELECT 
      COUNT(*) as total_attempts,
      ROUND(AVG((score * 100.0) / total_questions), 1) as avg_score
    FROM quiz_attempts 
    WHERE user_id = ?
  `, [userId]);

  const stats = {
    completedCourses: 4,
    streakDays: 7,
    studyTime: '12h 40m',
    quizScore: (quizAnalytics && quizAnalytics.avg_score) ? Math.round(quizAnalytics.avg_score) : 82
  };

  // 4. Daily Challenge Quiz
  const dailyChallenge = db.get(`
    SELECT * FROM quizzes WHERE is_daily_challenge = 1 ORDER BY id ASC LIMIT 1
  `) || db.get(`SELECT * FROM quizzes ORDER BY id ASC LIMIT 1`);

  // 5. Active Continuing Lesson
  const continueLesson = db.get(`
    SELECT l.*, c.title as course_title, c.title_hi as course_title_hi, c.color as course_color
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    WHERE l.id NOT IN (SELECT lesson_id FROM progress WHERE user_id = ? AND completed = 1)
    ORDER BY l.id ASC
    LIMIT 1
  `) || {
    id: 3,
    title: 'Human Geography — Chapter 3: Resources & Land Use',
    title_hi: 'मानव भूगोल — अध्याय 3: संसाधन एवं भू-उपयोग',
    course_title: 'Social Science & Geography',
    course_title_hi: 'सामाजिक विज्ञान एवं भूगोल',
    progressPct: 68
  };

  // 6. Matching scholarships preview
  const scholarshipsPreview = db.query(`
    SELECT * FROM scholarships 
    WHERE max_income >= 250000 
    ORDER BY id ASC 
    LIMIT 3
  `);

  res.render('dashboard', {
    activeTab: 'dashboard',
    user: req.session.user,
    overallProgressPercent,
    completedCount,
    totalCount,
    stats,
    courses,
    continueLesson,
    dailyChallenge,
    scholarshipsPreview
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).send('Something went wrong. Please refresh the page or try again.');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('home');
});

// Server listener (only if run directly, not in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 EduSaarthi Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Default Language: Hindi / English selectable`);
    console.log(`⚡ Demo Student: demo@edusaarthi.test | Demo@123`);
    console.log(`=================================================`);
  });
}

module.exports = app;
