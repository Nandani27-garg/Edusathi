const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET /mentors - View all mentors
router.get('/', (req, res) => {
  const mentors = db.query('SELECT * FROM mentors ORDER BY rating DESC');

  // If user is logged in, check their sent requests
  let myRequests = [];
  if (req.session.user) {
    myRequests = db.query(
      `SELECT mr.*, m.name as mentor_name, m.field as mentor_field
       FROM mentor_requests mr
       JOIN mentors m ON mr.mentor_id = m.id
       WHERE mr.user_id = ?
       ORDER BY mr.created_at DESC`,
      [req.session.user.id]
    );
  }

  res.render('mentors', {
    activeTab: 'mentors',
    mentors,
    myRequests
  });
});

// POST /mentors/request - Submit a mentoring request
router.post('/request', (req, res) => {
  const { mentor_id, subject, message, preferred_language } = req.body;
  const mentorId = parseInt(mentor_id, 10);

  // If not logged in, fallback to first available user
  const fallbackUser = db.get('SELECT id FROM users ORDER BY id ASC LIMIT 1');
  const userId = req.session.user ? req.session.user.id : (fallbackUser ? fallbackUser.id : 1);

  try {
    db.run(
      `INSERT INTO mentor_requests (user_id, mentor_id, subject, message, preferred_language, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [userId, mentorId, subject || 'General Career & Academic Guidance', message || 'Seeking guidance on study planning and opportunities.', preferred_language || 'Hindi + English']
    );

    if (req.headers['accept']?.includes('application/json')) {
      return res.json({ success: true, message: 'Mentoring request sent successfully.' });
    }

    res.redirect('/mentors?status=success');
  } catch (err) {
    console.error('Mentor request error:', err);
    if (req.headers['accept']?.includes('application/json')) {
      return res.status(500).json({ error: 'Failed to record request' });
    }
    res.redirect('/mentors?status=error');
  }
});

module.exports = router;
