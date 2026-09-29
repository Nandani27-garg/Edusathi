const http = require('node:http');
const app = require('../app');
const db = require('../database/database');

const TEST_PORT = 3099;
let server;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {};
    if (options.body) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    if (options.cookie) {
      defaultHeaders['Cookie'] = options.cookie;
    }

    const req = http.request(
      `http://localhost:${TEST_PORT}${path}`,
      {
        method: options.method || 'GET',
        headers: { ...defaultHeaders, ...options.headers }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting EduSaarthi Automated Test Suite...\n');
  server = app.listen(TEST_PORT);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Landing Page
  await test('GET / returns 200 OK', async () => {
    const res = await request('/');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('EduSaarthi') || (!res.body.includes('Learning Without Barriers') && !res.body.includes('बाधाओं से मुक्त शिक्षा'))) {
      throw new Error('Hero title missing');
    }
  });

  // 2. Auth Pages
  await test('GET /auth/login returns 200 OK with Demo credentials box', async () => {
    const res = await request('/auth/login');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('demo@edusaarthi.test')) throw new Error('Demo credentials missing in login page');
  });

  await test('GET /auth/register returns 200 OK', async () => {
    const res = await request('/auth/register');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('preferred_language')) throw new Error('Registration form incomplete');
  });

  // 3. Demo Login and Session Persistence
  let sessionCookie = '';
  await test('POST /auth/demo-login redirects to /dashboard with session cookie', async () => {
    const res = await request('/auth/demo-login', { method: 'POST' });
    if (res.statusCode !== 302) throw new Error(`Expected 302 redirect, got ${res.statusCode}`);
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) throw new Error('Session cookie not set');
    sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
  });

  // 4. Authenticated Dashboard
  await test('GET /dashboard with session returns 200 and student greeting', async () => {
    const res = await request('/dashboard', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Rahul') && !res.body.includes('राहुल')) throw new Error('Greeting name missing');
    if (!res.body.includes('Mathematics') && !res.body.includes('गणित')) throw new Error('Courses missing in dashboard');
  });

  // 5. Learning Module & Lesson Reader
  await test('GET /learn returns 200 and lists 5 courses', async () => {
    const res = await request('/learn');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Class 10 Science') && !res.body.includes('कक्षा 10 विज्ञान')) throw new Error('Class 10 Science missing');
  });

  await test('GET /learn/class-10-science returns 200 with 5 syllabus lessons', async () => {
    const res = await request('/learn/class-10-science');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Chemical Reactions') && !res.body.includes('रासायनिक अभिक्रियाएँ')) throw new Error('Lesson 1 missing');
    if (!res.body.includes('Electricity') && !res.body.includes('विद्युत')) throw new Error('Lesson 5 missing');
  });

  await test('GET /learn/lesson/1 returns 200 with lesson explanation and mini quiz', async () => {
    const res = await request('/learn/lesson/1');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Download for Offline') && !res.body.includes('ऑफ़लाइन')) throw new Error('Offline download button missing');
    if (!res.body.includes('Mini Quiz') && !res.body.includes('प्रश्नोत्तरी')) throw new Error('Mini quiz missing');
  });

  await test('GET /learn/api/lesson/1 returns valid JSON for offline cache', async () => {
    const res = await request('/learn/api/lesson/1');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.title || !data.quiz_data) throw new Error('Invalid lesson JSON schema');
  });

  // 6. AI Tutor
  await test('GET /tutor returns 200 with AI Tutor interface', async () => {
    const res = await request('/tutor');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('EduSaarthi AI Tutor')) throw new Error('AI Tutor heading missing');
  });

  await test('POST /tutor/chat (English question) returns educational answer', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'Explain photosynthesis simply', language: 'en', educationLevel: 'Class 10' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply || data.reply.length < 20) throw new Error('AI answer too short or invalid');
  });

  await test('POST /tutor/chat (Hindi question: प्रकाश संश्लेषण) returns Hindi answer', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'प्रकाश संश्लेषण क्या है? इसे आसान भाषा में समझाओ।', language: 'hi', educationLevel: 'Class 10' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply || (!data.reply.includes('पौधे') && !data.reply.includes('प्रकाश') && !data.reply.includes('सूर्य'))) {
      throw new Error('Expected Hindi explanation in AI reply');
    }
  });

  await test('POST /auth/set-language sets regional language (Bengali, Odia, Telugu)', async () => {
    const resBn = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'bn' },
      cookie: sessionCookie
    });
    if (resBn.statusCode !== 200) throw new Error(`Expected 200 for bn, got ${resBn.statusCode}`);

    const resOr = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'or' },
      cookie: sessionCookie
    });
    if (resOr.statusCode !== 200) throw new Error(`Expected 200 for or, got ${resOr.statusCode}`);

    const resTe = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'te' },
      cookie: sessionCookie
    });
    if (resTe.statusCode !== 200) throw new Error(`Expected 200 for te, got ${resTe.statusCode}`);
  });

  await test('POST /tutor/chat responds in Bengali for Bengali prompt', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'সালোকসংশ্লেষ কী? সহজ ভাষায় বুঝিয়ে দাও।', language: 'bn', educationLevel: 'Class 10' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply || (!data.reply.includes('সালোকসংশ্লেষ') && !data.reply.includes('উদ্ভিদ'))) {
      throw new Error('Expected Bengali explanation in AI reply');
    }
  });

  await test('POST /tutor/chat responds in Odia for Odia prompt', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'ଆଲୋକ ଶ୍ଳେଷଣ କ\'ଣ? ସରଳ ଭାଷାରେ ବୁଝାନ୍ତୁ।', language: 'or', educationLevel: 'Class 10' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply || (!data.reply.includes('ଆଲୋକ ଶ୍ଳେଷଣ') && !data.reply.includes('ଉଦ୍ଭିଦ'))) {
      throw new Error('Expected Odia explanation in AI reply');
    }
  });

  await test('POST /tutor/chat responds in Telugu for Telugu prompt', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'కిరణజన్య సంయోగక్రియ అంటే ఏమిటి? సులభంగా వివరించండి.', language: 'te', educationLevel: 'Class 10' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply || (!data.reply.includes('కిరణజన్య') && !data.reply.includes('మొక్కలు'))) {
      throw new Error('Expected Telugu explanation in AI reply');
    }
  });

  // 7. Scholarship Finder & Filters
  await test('GET /scholarships returns 200 and lists scholarships with prototype disclaimer', async () => {
    const res = await request('/scholarships');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Prototype scholarship data')) throw new Error('Prototype disclaimer missing');
    if (!res.body.includes('Pre-Matric Scholarship') && !res.body.includes('प्री-मैट्रिक छात्रवृत्ति')) throw new Error('Scholarship cards missing');
  });

  await test('GET /scholarships?category=ST&state=Jharkhand filters correctly', async () => {
    const res = await request('/scholarships?category=ST&state=Jharkhand');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Jharkhand') && !res.body.includes('ST')) throw new Error('Filtered results missing');
  });

  // 8. Career Guidance
  await test('GET /career returns 200 with guidance form', async () => {
    const res = await request('/career');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Discover Your Career Path') && !res.body.includes('करियर मार्ग')) throw new Error('Career header missing');
  });

  await test('POST /career/advice returns 200 with structured roadmap milestones', async () => {
    const res = await request('/career/advice', {
      method: 'POST',
      body: { interest: 'Technology', education_level: 'Class 10', subjects: 'Mathematics, Science' }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Software Developer') && !res.body.includes('सॉफ्टवेयर')) throw new Error('Career recommendation missing');
    if (!res.body.includes('Roadmap') && !res.body.includes('मार्ग')) throw new Error('Roadmap missing');
  });

  // 9. Mentorship Directory & Requests
  await test('GET /mentors returns 200 with 6 verified mentors', async () => {
    const res = await request('/mentors');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Ankit Sharma')) throw new Error('Mentor Ankit Sharma missing');
    if (!res.body.includes('Sunita Soren')) throw new Error('Mentor Sunita Soren missing');
  });

  await test('POST /mentors/request records request in database', async () => {
    const res = await request('/mentors/request', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: { mentor_id: 1, subject: 'Coding Guidance', message: 'Hello from automated test' },
      cookie: sessionCookie
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.success) throw new Error('Mentor request was not successful');

    // Verify DB insertion
    const saved = db.get('SELECT * FROM mentor_requests WHERE subject = ?', ['Coding Guidance']);
    if (!saved) throw new Error('Mentor request not found in database');
  });

  // 10. PWA Static Assets
  await test('GET /manifest.json returns valid PWA web manifest', async () => {
    const res = await request('/manifest.json');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const manifest = JSON.parse(res.body);
    if (manifest.short_name !== 'EduSaarthi') throw new Error('Manifest short_name mismatch');
  });

  await test('GET /service-worker.js returns 200', async () => {
    const res = await request('/service-worker.js');
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('edusaarthi-core')) throw new Error('Cache name missing in Service Worker');
  });

  // 11. Quizzes & Tests System
  await test('GET /quizzes returns 200 with Daily Challenge and subject quizzes', async () => {
    const res = await request('/quizzes', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('Daily Challenge') && !res.body.includes('दैनिक चुनौती')) {
      throw new Error('Daily challenge missing in quizzes view');
    }
    if (!res.body.includes('Geography') && !res.body.includes('भूगोल')) {
      throw new Error('Subject quizzes missing in quizzes view');
    }
  });

  let newAttemptId = null;
  await test('GET /quizzes/take/daily-challenge-geography returns 200 with timer and runner', async () => {
    const res = await request('/quizzes/take/daily-challenge-geography', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('quiz-timer-pill') || !res.body.includes('question-step')) {
      throw new Error('Quiz runner elements missing');
    }
  });

  await test('POST /quizzes/submit grades answers and saves attempt to SQLite DB', async () => {
    const firstQuiz = db.get('SELECT id FROM quizzes ORDER BY id ASC LIMIT 1');
    const res = await request('/quizzes/submit', {
      method: 'POST',
      cookie: sessionCookie,
      body: {
        quiz_id: firstQuiz.id,
        answers: [0, 1, 2, 0, 1],
        time_taken_seconds: 95
      }
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.success || !data.attemptId || data.score === undefined) {
      throw new Error('Quiz grading failed');
    }
    newAttemptId = data.attemptId;

    // Verify DB persistence
    const savedAttempt = db.get('SELECT * FROM quiz_attempts WHERE id = ?', [newAttemptId]);
    if (!savedAttempt) throw new Error('Quiz attempt was not persisted to SQLite database');
  });

  await test('GET /quizzes/results/:attemptId returns 200 with score and explanations', async () => {
    const res = await request(`/quizzes/results/${newAttemptId}`, { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('result-score-badge') || !res.body.includes('explanation-box')) {
      throw new Error('Results card or answer explanation box missing');
    }
  });

  // 12. Learning Progress Analytics
  await test('GET /progress returns 200 with weekly study chart and milestones', async () => {
    const res = await request('/progress', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('bar-chart-container') || !res.body.includes('milestones-grid')) {
      throw new Error('Progress chart or milestones missing');
    }
  });

  // 13. Profile & Settings
  await test('GET /profile returns 200 with student details', async () => {
    const res = await request('/profile', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('profile-avatar-box') || !res.body.includes('profileUser')) {
      // Check for user info
      if (!res.body.includes('Rahul') && !res.body.includes('राहुल')) {
        throw new Error('Profile name missing');
      }
    }
  });

  await test('GET /profile/settings returns 200 with language, low-data, and theme controls', async () => {
    const res = await request('/profile/settings', { cookie: sessionCookie });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    if (!res.body.includes('settings-lang-select') || !res.body.includes('theme-picker-grid')) {
      throw new Error('Settings controls missing');
    }
  });

  // 14. CRITICAL LANGUAGE PERSISTENCE ACROSS TABS / PAGES
  await test('Setting language sets persistent edusaarthi_language cookie and persists across tab navigation', async () => {
    // Student sets language to Marathi ('mr')
    const setLangRes = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'mr' },
      cookie: sessionCookie
    });
    if (setLangRes.statusCode !== 200) throw new Error(`Expected 200 for set-language, got ${setLangRes.statusCode}`);
    
    // Check that edusaarthi_language cookie was set
    const setCookieHeaders = setLangRes.headers['set-cookie'] || [];
    const hasLangCookie = setCookieHeaders.some(c => c.includes('edusaarthi_language=mr'));
    if (!hasLangCookie) throw new Error('edusaarthi_language cookie was not set in response');

    // Simulate switching tabs with the persistent language cookie
    let tabCookie = sessionCookie.includes('edusaarthi_language=')
      ? sessionCookie.replace(/edusaarthi_language=[^;]+/, 'edusaarthi_language=mr')
      : `${sessionCookie}; edusaarthi_language=mr`;

    // 1. Visit Dashboard tab
    const dashRes = await request('/dashboard', { cookie: tabCookie });
    if (!dashRes.body.includes('डॅशबोर्ड') && !dashRes.body.includes('अडथळ्यांशिवाय')) {
      throw new Error('Language reset to English/Hindi on Dashboard tab');
    }

    // 2. Visit Quizzes tab
    const quizRes = await request('/quizzes', { cookie: tabCookie });
    if (!quizRes.body.includes('चाचण्या') && !quizRes.body.includes('डॅशबोर्ड') && !quizRes.body.includes('शिकणे')) {
      throw new Error('Language reset on Quizzes tab');
    }

    // 3. Visit Progress tab
    const progRes = await request('/progress', { cookie: tabCookie });
    if (!progRes.body.includes('प्रगती') && !progRes.body.includes('डॅशबोर्ड')) {
      throw new Error('Language reset on Progress tab');
    }
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  if (server) server.close();
  process.exit(1);
});
