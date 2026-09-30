const db = require('./database');

db.seed();
console.log('EduSaarthi database initialized and seeded:', db.dbPath);
