const express = require('express');
const router = express.Router();
const db = require('../database/database');

// User ID helper
function getUserId(req) {
  if (req.session && req.session.user) {
    return req.session.user.id;
  }
  const fallback = db.get('SELECT id FROM users ORDER BY id ASC LIMIT 1');
  return fallback ? fallback.id : 1;
}

// 1. Quizzes Directory Page
router.get('/', (req, res) => {
  const userId = getUserId(req);

  // Fetch Daily Challenge
  const dailyChallenge = db.get(`
    SELECT * FROM quizzes 
    WHERE is_daily_challenge = 1 
    ORDER BY id ASC 
    LIMIT 1
  `);

  // Fetch all other Subject Quizzes
  const subjectQuizzes = db.query(`
    SELECT * FROM quizzes 
    WHERE is_daily_challenge = 0 
    ORDER BY id ASC
  `);

  // Fetch recent attempts for the student
  let recentAttempts = [];
  if (userId) {
    recentAttempts = db.query(`
      SELECT qa.*, q.title as quiz_title, q.title_hi as quiz_title_hi, q.category, q.icon
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ?
      ORDER BY qa.created_at DESC
      LIMIT 5
    `, [userId]);
  } else {
    // Show sample attempts for demo
    recentAttempts = db.query(`
      SELECT qa.*, q.title as quiz_title, q.title_hi as quiz_title_hi, q.category, q.icon
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      ORDER BY qa.created_at DESC
      LIMIT 3
    `);
  }

  // Quiz statistics
  let stats = {
    totalTaken: recentAttempts.length,
    avgScore: 80,
    bestScore: 100
  };

  if (userId) {
    const userStats = db.get(`
      SELECT 
        COUNT(*) as total_taken,
        ROUND(AVG((score * 100.0) / total_questions), 1) as avg_score,
        MAX((score * 100.0) / total_questions) as best_score
      FROM quiz_attempts
      WHERE user_id = ?
    `, [userId]);

    if (userStats && userStats.total_taken > 0) {
      stats.totalTaken = userStats.total_taken;
      stats.avgScore = Math.round(userStats.avg_score || 80);
      stats.bestScore = Math.round(userStats.best_score || 100);
    }
  }

  res.render('quizzes', {
    activeTab: 'quizzes',
    dailyChallenge,
    subjectQuizzes,
    recentAttempts,
    stats,
    pageTitle: (res.locals.lang === 'hi') ? 'प्रश्नोत्तरी व टेस्ट' : 'Quizzes & Tests'
  });
});

// 2. Interactive Quiz Runner
router.get('/take/:identifier', (req, res) => {
  const { identifier } = req.params;
  
  let quiz = null;
  if (/^\d+$/.test(identifier)) {
    quiz = db.get('SELECT * FROM quizzes WHERE id = ?', [parseInt(identifier, 10)]);
  } else {
    quiz = db.get('SELECT * FROM quizzes WHERE slug = ?', [identifier]);
  }

  if (!quiz) {
    return res.redirect('/quizzes');
  }

  const rawQuestions = db.query(`
    SELECT * FROM quiz_questions 
    WHERE quiz_id = ? 
    ORDER BY order_index ASC
  `, [quiz.id]);

  const questions = rawQuestions.map(q => ({
    id: q.id,
    question: q.question,
    question_hi: q.question_hi,
    options: JSON.parse(q.options || '[]'),
    options_hi: JSON.parse(q.options_hi || '[]'),
    order_index: q.order_index
  }));

  res.render('quiz-take', {
    activeTab: 'quizzes',
    quiz,
    questions,
    totalQuestions: questions.length,
    pageTitle: `${quiz.title} | EduSaarthi Quiz`
  });
});

// 3. Quiz Submission & Real Grading
router.post('/submit', (req, res) => {
  try {
    const { quiz_id, answers, time_taken_seconds } = req.body;
    const quizId = parseInt(quiz_id, 10);
    const userId = getUserId(req) || 1; // Fallback to demo user if not logged in

    const questions = db.query(`
      SELECT id, correct_index 
      FROM quiz_questions 
      WHERE quiz_id = ? 
      ORDER BY order_index ASC
    `, [quizId]);

    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'Quiz not found' });
    }

    let score = 0;
    const userAnswersArr = Array.isArray(answers) ? answers : [];

    questions.forEach((q, idx) => {
      const chosen = userAnswersArr[idx];
      if (chosen !== undefined && chosen !== null && parseInt(chosen, 10) === q.correct_index) {
        score++;
      }
    });

    const totalQuestions = questions.length;
    const timeTaken = Math.max(10, parseInt(time_taken_seconds, 10) || 60);

    const result = db.run(`
      INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, time_taken_seconds, user_answers)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, quizId, score, totalQuestions, timeTaken, JSON.stringify(userAnswersArr)]);

    const attemptId = result.lastInsertRowid;

    res.json({
      success: true,
      attemptId,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      redirectUrl: `/quizzes/results/${attemptId}`
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

// 4. Quiz Results & Answer Review
router.get('/results/:attemptId', (req, res) => {
  const attemptId = parseInt(req.params.attemptId, 10);

  const attempt = db.get(`
    SELECT qa.*, q.title as quiz_title, q.title_hi as quiz_title_hi, q.category, q.icon, q.slug as quiz_slug
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.id = ?
  `, [attemptId]);

  if (!attempt) {
    return res.redirect('/quizzes');
  }

  const rawQuestions = db.query(`
    SELECT * FROM quiz_questions 
    WHERE quiz_id = ? 
    ORDER BY order_index ASC
  `, [attempt.quiz_id]);

  let userAnswers = [];
  try {
    userAnswers = JSON.parse(attempt.user_answers || '[]');
  } catch (e) {
    userAnswers = [];
  }

  const reviewedQuestions = rawQuestions.map((q, idx) => {
    const chosenIndex = userAnswers[idx] !== undefined ? parseInt(userAnswers[idx], 10) : -1;
    const isCorrect = chosenIndex === q.correct_index;
    return {
      id: q.id,
      question: q.question,
      question_hi: q.question_hi,
      options: JSON.parse(q.options || '[]'),
      options_hi: JSON.parse(q.options_hi || '[]'),
      correctIndex: q.correct_index,
      chosenIndex,
      isCorrect,
      explanation: q.explanation,
      explanation_hi: q.explanation_hi
    };
  });

  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);

  res.render('quiz-results', {
    activeTab: 'quizzes',
    attempt,
    percentage,
    questions: reviewedQuestions,
    pageTitle: (res.locals.lang === 'hi') ? 'क्विज़ परिणाम एवं समीक्षा' : 'Quiz Results & Review'
  });
});

module.exports = router;
