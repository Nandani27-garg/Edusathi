const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = __dirname;
const DB_PATH = path.join(DATA_DIR, 'edusaarthi.sqlite');

fs.mkdirSync(DATA_DIR, { recursive: true });

const sqlite = new DatabaseSync(DB_PATH);
sqlite.exec('PRAGMA foreign_keys = ON;');

function run(sql, params = []) {
  const statement = sqlite.prepare(sql);
  const result = statement.run(...params);
  return {
    changes: Number(result.changes || 0),
    lastInsertRowid: Number(result.lastInsertRowid || 0)
  };
}

function get(sql, params = []) {
  return sqlite.prepare(sql).get(...params) || null;
}

function query(sql, params = []) {
  return sqlite.prepare(sql).all(...params);
}

function exec(sql) {
  return sqlite.exec(sql);
}

function initializeSchema() {
  exec(
    'CREATE TABLE IF NOT EXISTS users (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    'name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,' +
    "state TEXT DEFAULT 'Jharkhand', preferred_language TEXT DEFAULT 'hi', education_level TEXT DEFAULT 'Class 10'," +
    'created_at TEXT DEFAULT CURRENT_TIMESTAMP);' +

    'CREATE TABLE IF NOT EXISTS user_settings (' +
    'user_id INTEGER PRIMARY KEY, preferred_language TEXT DEFAULT \'hi\',' +
    'college_name TEXT DEFAULT \'\', target_career TEXT DEFAULT \'\', subjects TEXT DEFAULT \'\',' +
    'theme TEXT DEFAULT \'light\', low_data INTEGER DEFAULT 0, voice_enabled INTEGER DEFAULT 1,' +
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);' +

    'CREATE TABLE IF NOT EXISTS courses (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, title_hi TEXT NOT NULL,' +
    'description TEXT DEFAULT \'\', description_hi TEXT DEFAULT \'\', category TEXT NOT NULL,' +
    "icon TEXT DEFAULT '📚', color TEXT DEFAULT '#2563EB', order_index INTEGER DEFAULT 0);" +

    'CREATE TABLE IF NOT EXISTS lessons (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, course_id INTEGER NOT NULL, title TEXT NOT NULL, title_hi TEXT NOT NULL,' +
    'content TEXT DEFAULT \'\', content_hi TEXT DEFAULT \'\', key_points TEXT DEFAULT \'[]\',' +
    'key_points_hi TEXT DEFAULT \'[]\', quiz_data TEXT DEFAULT \'[]\', order_index INTEGER DEFAULT 0,' +
    'FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE);' +

    'CREATE TABLE IF NOT EXISTS progress (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, lesson_id INTEGER NOT NULL,' +
    'completed INTEGER DEFAULT 0, quiz_score INTEGER DEFAULT 0, updated_at TEXT DEFAULT CURRENT_TIMESTAMP,' +
    'UNIQUE(user_id, lesson_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,' +
    'FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE);' +

    'CREATE TABLE IF NOT EXISTS quizzes (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, title_hi TEXT NOT NULL,' +
    'category TEXT NOT NULL, icon TEXT DEFAULT \'📝\', description TEXT DEFAULT \'\', description_hi TEXT DEFAULT \'\',' +
    'time_limit_minutes INTEGER DEFAULT 10, is_daily_challenge INTEGER DEFAULT 0);' +

    'CREATE TABLE IF NOT EXISTS quiz_questions (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id INTEGER NOT NULL, question TEXT NOT NULL, question_hi TEXT NOT NULL,' +
    'options TEXT NOT NULL, options_hi TEXT NOT NULL, correct_index INTEGER NOT NULL, explanation TEXT DEFAULT \'\',' +
    'explanation_hi TEXT DEFAULT \'\', order_index INTEGER DEFAULT 0,' +
    'FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE);' +

    'CREATE TABLE IF NOT EXISTS quiz_attempts (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, quiz_id INTEGER NOT NULL, score INTEGER NOT NULL,' +
    'total_questions INTEGER NOT NULL, time_taken_seconds INTEGER DEFAULT 0, user_answers TEXT DEFAULT \'[]\',' +
    'created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,' +
    'FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE);' +

    'CREATE TABLE IF NOT EXISTS scholarships (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, name_hi TEXT NOT NULL, provider TEXT DEFAULT \'\',' +
    'description TEXT DEFAULT \'\', description_hi TEXT DEFAULT \'\', state TEXT DEFAULT \'All India\',' +
    'category TEXT DEFAULT \'All\', gender TEXT DEFAULT \'All\', disability_status TEXT DEFAULT \'No\',' +
    'max_income INTEGER DEFAULT 0, min_percentage REAL DEFAULT 0, education_level TEXT DEFAULT \'Class 10\',' +
    'amount TEXT DEFAULT \'\', deadline TEXT DEFAULT \'\', official_url TEXT DEFAULT \'\', required_documents TEXT DEFAULT \'[]\');' +

    'CREATE TABLE IF NOT EXISTS mentors (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, field TEXT NOT NULL, bio TEXT DEFAULT \'\',' +
    'language TEXT DEFAULT \'Hindi + English\', location TEXT DEFAULT \'India\', rating REAL DEFAULT 4.5,' +
    'experience TEXT DEFAULT \'\');' +

    'CREATE TABLE IF NOT EXISTS mentor_requests (' +
    'id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, mentor_id INTEGER NOT NULL,' +
    'subject TEXT NOT NULL, message TEXT DEFAULT \'\', preferred_language TEXT DEFAULT \'Hindi + English\',' +
    "status TEXT DEFAULT 'Pending', created_at TEXT DEFAULT CURRENT_TIMESTAMP," +
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE);'
  );
}

function reset() {
  exec(
    'DELETE FROM mentor_requests; DELETE FROM quiz_attempts; DELETE FROM quiz_questions; DELETE FROM quizzes;' +
    'DELETE FROM progress; DELETE FROM lessons; DELETE FROM courses; DELETE FROM scholarships; DELETE FROM mentors;' +
    'DELETE FROM user_settings; DELETE FROM users; DELETE FROM sqlite_sequence;'
  );
}

function seed() {
  initializeSchema();
  reset();

  const demoPasswordHash = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  run('INSERT INTO users (name, email, password_hash, state, preferred_language, education_level) VALUES (?, ?, ?, ?, ?, ?)',
    ['Rahul Kumar', 'demo@edusaarthi.test', demoPasswordHash, 'Jharkhand', 'hi', 'Class 10']);

  run('INSERT INTO user_settings (user_id, preferred_language, college_name, target_career, subjects, theme, low_data, voice_enabled) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
    ['hi', 'Birsa Munda Inter College, Ranchi', 'Technology & Civil Services Exploration', 'Mathematics, Science, English, Social Science', 'light', 0, 1]);

  const courses = [
    ['class-10-science', 'Class 10 Science', 'कक्षा 10 विज्ञान', 'Science', '🔬', '#2563EB', 1],
    ['class-10-mathematics', 'Class 10 Mathematics', 'कक्षा 10 गणित', 'Mathematics', '📐', '#7C3AED', 2],
    ['class-10-english', 'Class 10 English', 'कक्षा 10 अंग्रेज़ी', 'English', '📖', '#059669', 3],
    ['social-science-foundations', 'Social Science Foundations', 'सामाजिक विज्ञान की नींव', 'Social Science', '🌍', '#D97706', 4],
    ['computer-science-basics', 'Computer Science Basics', 'कंप्यूटर विज्ञान की मूल बातें', 'Computer Science', '💻', '#DC2626', 5]
  ];

  for (const [slug, title, titleHi, category, icon, color, order] of courses) {
    run('INSERT INTO courses (slug, title, title_hi, description, description_hi, category, icon, color, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, title, titleHi, 'Short, practical lessons designed for concept clarity and practice.',
       'अवधारणाओं को आसान तरीके से समझने और अभ्यास करने के लिए छोटे व्यावहारिक पाठ।', category, icon, color, order]);
  }

  const lessonSets = [
    [1, ['Chemical Reactions', 'Acids, Bases and Salts', 'Metals and Non-metals', 'Life Processes', 'Electricity']],
    [2, ['Real Numbers', 'Polynomials', 'Pair of Linear Equations', 'Quadratic Equations', 'Trigonometry']],
    [3, ['Reading Skills', 'Grammar Essentials', 'Writing Skills', 'Literature', 'Communication Practice']],
    [4, ['Resources and Development', 'Power Sharing', 'Development', 'Sectors of Economy', 'Civics and Governance']],
    [5, ['Computer Fundamentals', 'Internet and Networks', 'Programming Logic', 'Data and Algorithms', 'Digital Safety']]
  ];

  let lessonId = 1;
  for (const [courseId, titles] of lessonSets) {
    titles.forEach((title, index) => {
      const titleHi = title === 'Chemical Reactions' ? 'रासायनिक अभिक्रियाएँ' : (title === 'Electricity' ? 'विद्युत' : title);
      const points = JSON.stringify(['Understand the core concept', 'Connect it with a real-life example', 'Practice one question']);
      const pointsHi = JSON.stringify(['मुख्य अवधारणा समझें', 'इसे वास्तविक जीवन के उदाहरण से जोड़ें', 'एक प्रश्न का अभ्यास करें']);
      const quiz = JSON.stringify([{ question: 'Quick check', options: ['A', 'B', 'C', 'D'], answer: 0 }]);
      run('INSERT INTO lessons (id, course_id, title, title_hi, content, content_hi, key_points, key_points_hi, quiz_data, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [lessonId++, courseId, title, titleHi,
         'This prototype lesson uses short explanations, key points and a mini quiz to support low-data learning.',
         'यह प्रोटोटाइप पाठ छोटे स्पष्टीकरण, मुख्य बिंदुओं और मिनी क्विज़ के माध्यम से कम-डेटा सीखने में मदद करता है।',
         points, pointsHi, quiz, index + 1]);
    });
  }

  for (let courseId = 1; courseId <= 5; courseId++) {
    for (let offset = 0; offset < 2; offset++) {
      const currentLessonId = (courseId - 1) * 5 + offset + 1;
      run('INSERT INTO progress (user_id, lesson_id, completed, quiz_score) VALUES (1, ?, 1, ?)',
        [currentLessonId, 80 + offset * 10]);
    }
  }

  const quizzes = [
    ['daily-challenge-geography', 'Daily Challenge: Geography', 'दैनिक चुनौती: भूगोल', 'Geography', '🌍', 10, 1],
    ['science-basics', 'Science Basics', 'विज्ञान की मूल बातें', 'Science', '🔬', 8, 0],
    ['mathematics-foundations', 'Mathematics Foundations', 'गणित की नींव', 'Mathematics', '📐', 8, 0],
    ['english-communication', 'English Communication', 'अंग्रेज़ी संचार', 'English', '🗣️', 8, 0]
  ];

  for (const [slug, title, titleHi, category, icon, minutes, daily] of quizzes) {
    const result = run('INSERT INTO quizzes (slug, title, title_hi, category, icon, description, description_hi, time_limit_minutes, is_daily_challenge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, title, titleHi, category, icon, 'A short practice quiz to check understanding.',
       'समझ को जाँचने के लिए छोटा अभ्यास क्विज़।', minutes, daily]);
    for (let i = 0; i < 5; i++) {
      const q = i + 1;
      const options = ['Option A', 'Option B', 'Option C', 'Option D'];
      run('INSERT INTO quiz_questions (quiz_id, question, question_hi, options, options_hi, correct_index, explanation, explanation_hi, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [result.lastInsertRowid, title + ': Question ' + q, titleHi + ': प्रश्न ' + q,
         JSON.stringify(options), JSON.stringify(['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D']),
         i % 4, 'Review the lesson concept and try the question again.',
         'पाठ की अवधारणा दोहराएँ और प्रश्न फिर से हल करें।', q]);
    }
  }

  for (let i = 0; i < 4; i++) {
    run('INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, time_taken_seconds, user_answers) VALUES (1, ?, ?, 5, ?, ?)',
      [i + 1, 4 - i, 60 + i * 10, JSON.stringify([0, 1, 2, 3, 0])]);
  }

  const scholarships = [
    ['Pre-Matric Scholarship', 'प्री-मैट्रिक छात्रवृत्ति', 'Prototype Education Support', 'Support for eligible school students.', 'पात्र स्कूली विद्यार्थियों के लिए सहायता।', 'Jharkhand', 'ST', 'All', 'No', 250000, 50, 'Class 10', '₹5,000–₹15,000', 'Prototype', '[]'],
    ['Post-Matric Scholarship', 'पोस्ट-मैट्रिक छात्रवृत्ति', 'Prototype Education Support', 'Financial assistance for eligible post-matric learners.', 'पात्र पोस्ट-मैट्रिक विद्यार्थियों के लिए आर्थिक सहायता।', 'Jharkhand', 'ST', 'All', 'No', 300000, 50, 'Class 11+', 'Varies', 'Prototype', '[]'],
    ['National Merit Scholarship', 'राष्ट्रीय मेधा छात्रवृत्ति', 'Prototype Education Support', 'Merit-oriented scholarship discovery example.', 'मेधा आधारित छात्रवृत्ति खोज का उदाहरण।', 'All India', 'All', 'All', 'No', 300000, 75, 'Class 10+', 'Varies', 'Prototype', '[]'],
    ['Girls in STEM Support', 'STEM छात्राओं के लिए सहायता', 'Prototype Education Support', 'Prototype opportunity for girls exploring STEM.', 'STEM सीखने वाली छात्राओं के लिए प्रोटोटाइप अवसर।', 'All India', 'All', 'Female', 'No', 400000, 60, 'Class 10+', 'Varies', 'Prototype', '[]'],
    ['Inclusive Learner Grant', 'समावेशी शिक्षार्थी अनुदान', 'Prototype Education Support', 'Prototype listing for learners with disabilities.', 'दिव्यांग विद्यार्थियों के लिए प्रोटोटाइप सूची।', 'All India', 'All', 'All', 'Yes', 500000, 50, 'Class 10+', 'Varies', 'Prototype', '[]']
  ];
  for (const row of scholarships) {
    run('INSERT INTO scholarships (name, name_hi, provider, description, description_hi, state, category, gender, disability_status, max_income, min_percentage, education_level, amount, deadline, required_documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', row);
  }

  const mentors = [
    ['Ankit Sharma', 'Software Development', 'Helps students start with coding and practical projects.', 'Hindi + English', 'India', 4.9, '7+ years'],
    ['Sunita Soren', 'Education & Scholarships', 'Guides students on education opportunities and study planning.', 'Hindi + English', 'Jharkhand', 4.8, '6+ years'],
    ['Ravi Kumar', 'Mathematics', 'Focuses on school mathematics and problem-solving habits.', 'Hindi', 'India', 4.7, '5+ years'],
    ['Priya Verma', 'Career Exploration', 'Supports early career exploration and skill roadmaps.', 'Hindi + English', 'India', 4.7, '6+ years'],
    ['Aman Das', 'Digital Skills', 'Introduces students to digital literacy and safe internet use.', 'Hindi + Bengali', 'West Bengal', 4.6, '4+ years'],
    ['Meera Singh', 'Communication Skills', 'Helps students build confidence in communication.', 'Hindi + English', 'India', 4.6, '5+ years']
  ];
  for (const row of mentors) {
    run('INSERT INTO mentors (name, field, bio, language, location, rating, experience) VALUES (?, ?, ?, ?, ?, ?, ?)', row);
  }
}

initializeSchema();

module.exports = { get, query, run, exec, initializeSchema, seed, reset, dbPath: DB_PATH };
