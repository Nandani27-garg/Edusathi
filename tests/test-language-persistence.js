/**
 * EduSaarthi - Strict Language Persistence Verification Suite
 * Tests all 4 scenarios mandated in Part 19 of User Specification:
 * - Test 1: Set Hindi -> navigate all 10 tabs -> language remains Hindi on all tabs & after refresh.
 * - Test 2: Set English -> navigate all 10 tabs -> language remains English.
 * - Test 3: Set Hindi -> ask AI Tutor in English -> website remains Hindi.
 * - Test 4: Set Hindi -> voice locale mapping uses hi-IN -> website remains Hindi.
 */

const http = require('http');
const app = require('../app');

let server;
let port = 3055;

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(port, () => {
      resolve();
    });
  });
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port,
      path,
      method: options.method || 'GET',
      headers: {
        'Accept': 'text/html,application/json',
        ...(options.headers || {})
      }
    };

    if (options.cookie) {
      reqOptions.headers['Cookie'] = options.cookie;
    }

    let bodyData = null;
    if (options.body) {
      bodyData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

const TABS = [
  '/dashboard',
  '/learn',
  '/tutor',
  '/quizzes',
  '/progress',
  '/scholarships',
  '/career',
  '/mentors',
  '/profile',
  '/profile/settings'
];

async function runLanguageTests() {
  await startServer();
  console.log(`\n==================================================`);
  console.log(`🌐 EDUSAARTHI PART 19 LANGUAGE PERSISTENCE TESTS`);
  console.log(`==================================================\n`);

  let passed = 0;
  let failed = 0;

  async function assert(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Authenticate demo user to get valid session
  let authCookie = '';
  await assert('Step 0: Demo login', async () => {
    const res = await request('/auth/demo-login', { method: 'POST' });
    const cookies = res.headers['set-cookie'] || [];
    authCookie = cookies.map(c => c.split(';')[0]).join('; ');
    if (!authCookie.includes('connect.sid')) throw new Error('Session cookie not created');
  });

  // ==========================================
  // TEST 1: Select Hindi -> Navigate all 10 tabs -> Refresh -> Reopen
  // ==========================================
  console.log('\n--- TEST 1: Select Hindi & Navigate All 10 Tabs ---');

  let hindiCookie = '';
  await assert('TEST 1.1: Select Hindi via /auth/set-language', async () => {
    const res = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'hi' },
      cookie: authCookie
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const setCookies = res.headers['set-cookie'] || [];
    const hasHiCookie = setCookies.some(c => c.includes('edusaarthi_language=hi'));
    if (!hasHiCookie) throw new Error('Cookie edusaarthi_language=hi was not set');
    
    // Merge cookie
    hindiCookie = authCookie.replace(/edusaarthi_language=[^;]+/, 'edusaarthi_language=hi');
    if (!hindiCookie.includes('edusaarthi_language=hi')) {
      hindiCookie += '; edusaarthi_language=hi';
    }
  });

  for (const tab of TABS) {
    await assert(`TEST 1.2: Navigate to ${tab} -> remains Hindi (<html lang="hi">)`, async () => {
      const res = await request(tab, { cookie: hindiCookie });
      if (res.statusCode !== 200 && res.statusCode !== 302) {
        throw new Error(`Tab ${tab} returned ${res.statusCode}`);
      }
      if (!res.body.includes('<html lang="hi">')) {
        throw new Error(`Tab ${tab} did not render with <html lang="hi">`);
      }
    });
  }

  await assert('TEST 1.3: Refresh page (re-request /dashboard) -> remains Hindi', async () => {
    const res = await request('/dashboard', { cookie: hindiCookie });
    if (!res.body.includes('<html lang="hi">')) throw new Error('Language reset on refresh');
  });

  await assert('TEST 1.4: Reopen browser (request with persistent cookie only) -> remains Hindi', async () => {
    const resHome = await request('/', { cookie: 'edusaarthi_language=hi' });
    if (!resHome.body.includes('<html lang="hi">')) throw new Error('Home page reset on reopening browser');
    const resDash = await request('/dashboard', { cookie: hindiCookie });
    if (!resDash.body.includes('<html lang="hi">')) throw new Error('Dashboard reset on reopening browser');
  });

  // ==========================================
  // TEST 2: Select English -> Repeat All Pages
  // ==========================================
  console.log('\n--- TEST 2: Select English & Navigate All 10 Tabs ---');

  let englishCookie = '';
  await assert('TEST 2.1: Select English via /auth/set-language', async () => {
    const res = await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'en' },
      cookie: hindiCookie
    });
    if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    const setCookies = res.headers['set-cookie'] || [];
    const hasEnCookie = setCookies.some(c => c.includes('edusaarthi_language=en'));
    if (!hasEnCookie) throw new Error('Cookie edusaarthi_language=en was not set');

    englishCookie = hindiCookie.replace(/edusaarthi_language=[^;]+/, 'edusaarthi_language=en');
  });

  for (const tab of TABS) {
    await assert(`TEST 2.2: Navigate to ${tab} -> remains English (<html lang="en">)`, async () => {
      const res = await request(tab, { cookie: englishCookie });
      if (res.statusCode !== 200 && res.statusCode !== 302) {
        throw new Error(`Tab ${tab} returned ${res.statusCode}`);
      }
      if (!res.body.includes('<html lang="en">')) {
        throw new Error(`Tab ${tab} did not render with <html lang="en">`);
      }
    });
  }

  // ==========================================
  // TEST 3: Select Hindi -> Ask AI in English -> Website remains Hindi
  // ==========================================
  console.log('\n--- TEST 3: Ask AI in English with Hindi selected -> Website stays Hindi ---');

  await assert('TEST 3.1: Switch to Hindi again', async () => {
    await request('/auth/set-language', {
      method: 'POST',
      body: { lang: 'hi' },
      cookie: englishCookie
    });
  });

  await assert('TEST 3.2: User sends question in English ("Explain gravity simply")', async () => {
    const res = await request('/tutor/chat', {
      method: 'POST',
      body: { message: 'Explain gravity simply', language: 'hi', educationLevel: 'Class 10' },
      cookie: hindiCookie
    });
    if (res.statusCode !== 200) throw new Error(`Chat returned ${res.statusCode}`);
    const data = JSON.parse(res.body);
    if (!data.reply) throw new Error('No reply from AI');
    // Check that response does NOT tell client to set English
    if (data.language && data.language !== 'hi') {
      throw new Error(`AI returned language ${data.language} instead of user preference hi`);
    }
  });

  await assert('TEST 3.3: Website tabs MUST remain Hindi after English query', async () => {
    const dashRes = await request('/dashboard', { cookie: hindiCookie });
    if (!dashRes.body.includes('<html lang="hi">')) {
      throw new Error('AI interaction inadvertently changed website language away from Hindi!');
    }

    const tutorRes = await request('/tutor', { cookie: hindiCookie });
    if (!tutorRes.body.includes('<html lang="hi">')) {
      throw new Error('AI tutor page language reset away from Hindi!');
    }
  });

  // ==========================================
  // TEST 4: Speech Recognition locale follows selected language without changing website language
  // ==========================================
  console.log('\n--- TEST 4: Voice Recognition Locale Mapping ---');

  await assert('TEST 4.1: Verify languageManager.js maps Hindi to hi-IN and English to en-IN', async () => {
    const fs = require('fs');
    const mgrCode = fs.readFileSync('public/js/languageManager.js', 'utf8');
    if (!mgrCode.includes("'hi': 'hi-IN'") && !mgrCode.includes("hi: 'hi-IN'")) {
      throw new Error('Hindi locale mapping missing in languageManager');
    }
    if (!mgrCode.includes("'en': 'en-IN'") && !mgrCode.includes("en: 'en-IN'")) {
      throw new Error('English locale mapping missing in languageManager');
    }
    if (!mgrCode.includes("DEFAULT_LANG = 'en'")) {
      throw new Error('Default language must be en on first visit');
    }
  });

  await assert('TEST 4.2: Verify voice.js reads current language without altering saved language', async () => {
    const fs = require('fs');
    const voiceCode = fs.readFileSync('public/js/voice.js', 'utf8');
    if (voiceCode.includes('localStorage.setItem')) {
      throw new Error('voice.js should never mutate localStorage!');
    }
  });

  console.log(`\n==================================================`);
  console.log(`📊 Result: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runLanguageTests().catch(err => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});
