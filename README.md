# 🎓 EduSaarthi — Learning Without Barriers

> **An inclusive, multilingual, offline-first AI learning and career companion for students facing connectivity, language and guidance barriers.**

**EduSaarthi is a functional hackathon prototype/MVP.**  
The prototype focuses on validating the core user journey. Production deployment will add verified data sources, stronger AI evaluation, scalable infrastructure and real-world institutional partnerships.

---

## 🚀 What Problem Are We Solving?

Many students face more than one barrier at the same time:

- 📡 Unreliable or expensive internet
- 🌐 Limited access to learning in a comfortable language
- 🤖 No immediate academic doubt support
- 🎓 Low awareness of scholarships and opportunities
- 🧭 Unstructured career exploration
- 👨‍🏫 Limited access to mentors
- 🎙️ Text-heavy interfaces that are difficult to use

EduSaarthi brings these needs into one student-focused platform.

### Our core idea

> **Learning should adapt to the student's constraints — not force the student to adapt to the platform.**

---

## 💡 Proposed Solution

EduSaarthi combines:

**📚 Learning + 🤖 AI Tutor + 🌐 Multilingual Support + 📡 Offline Access + 🎙️ Voice + 🎓 Opportunity Discovery + 🧭 Career Guidance + 👨‍🏫 Mentorship**

The prototype is intentionally focused on **feasibility and a clear end-to-end experience**, rather than pretending to be a production-scale platform.

---

## ⭐ What Makes the Prototype Different?

### 1. 📡 Offline-first learning

Selected lessons can be downloaded and accessed through browser storage when connectivity is unavailable.

Technology direction:

- Service Worker
- Cache API
- IndexedDB
- Low-data mode
- Offline lesson API

### 2. 🌐 Multilingual learning

The interface supports multiple Indian languages, with persistent language selection.

The goal is not only translation, but making educational explanations easier to understand in the learner's preferred language.

### 3. 🤖 AI Tutor

The AI Tutor integrates the Gemini API for:

- Concept explanations
- Academic doubts
- Practice questions
- Simplified explanations
- Multilingual interaction

If an API key is unavailable, the prototype uses built-in educational fallback responses so the demo can still be explored.

**Production direction:** verified educational sources + RAG + source attribution + AI evaluation.

### 4. 🎙️ Voice interaction

The prototype explores browser-based Speech-to-Text and Text-to-Speech so students can interact without relying entirely on typing.

### 5. 🎓 Scholarship discovery

Students can filter prototype opportunity records by factors such as:

- State
- Category
- Gender
- Income
- Minimum percentage
- Disability status

> ⚠️ **Important:** Scholarship records in this prototype are demonstration data. They must not be treated as verified current government information. Production deployment will integrate and continuously verify official/authoritative sources.

### 6. 🧭 Career guidance

Students can enter their education level, subjects, interests and skills to receive a structured career roadmap.

The feature is designed as **exploration and guidance**, not a guaranteed prediction of a student's future.

### 7. 👨‍🏫 Mentorship

The prototype includes a mentor directory and mentor-request workflow.

Production scope includes verified mentors, availability, matching and moderation.

---

# 🧪 60-Second Hackathon Demo Flow

Use this exact flow during judging:

```
1. Open EduSaarthi
        ↓
2. Click "1-Click Demo Login"
        ↓
3. Open Dashboard
        ↓
4. Switch language to Hindi / another supported language
        ↓
5. Open AI Tutor
        ↓
6. Ask a simple academic question
        ↓
7. Try voice interaction
        ↓
8. Open a lesson and save it for offline access
        ↓
9. Take a short quiz
        ↓
10. Show Progress
        ↓
11. Show Scholarship filtering
        ↓
12. Show Career roadmap / Mentor discovery
```

### Demo account

- **Email:** `demo@edusaarthi.test`
- **Password:** `Demo@123`
- **Fastest option:** use **1-Click Demo Login** — no password entry required.

---

# 🏗️ Technical Architecture

```
                    STUDENT
                       │
                       ▼
              ┌─────────────────┐
              │ EduSaarthi Web  │
              │ EJS + JS + PWA  │
              └────────┬────────┘
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Learning         AI Tutor       Accessibility
       │               │                │
       │          Gemini API       Voice APIs
       │
       ▼
 Offline Layer
 Service Worker
 Cache API
 IndexedDB
       │
       ▼
 Node.js + Express
       │
       ▼
 SQLite Prototype Database
```

### Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22+ |
| Backend | Express.js |
| Frontend | EJS, HTML5, CSS3, JavaScript |
| AI | Google Gemini API |
| Database | SQLite using Node's built-in `node:sqlite` |
| Offline | Service Worker, Cache API, IndexedDB |
| Voice | Web Speech API |
| Authentication | Express Session + bcryptjs |
| Configuration | dotenv |
| Testing | Node.js test scripts |
| License | MIT |

---

# 📦 Core Modules

```
EduSaarthi
│
├── 🤖 AI Tutor
├── 📚 Learning & Lessons
├── 📝 Quizzes & Practice
├── 📊 Progress Tracking
├── 🎓 Scholarship Discovery
├── 🧭 Career Guidance
├── 👨‍🏫 Mentorship
├── 🌐 Multilingual Support
├── 🎙️ Voice Interaction
└── 📡 Offline Learning
```

---

# 📂 Project Structure

```
Edusathi/
│
├── app.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── LICENSE
│
├── database/
│   ├── database.js
│   └── seed.js
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── manifest.json
│   └── service-worker.js
│
├── routes/
│   ├── ai.js
│   ├── auth.js
│   ├── career.js
│   ├── learn.js
│   ├── mentors.js
│   ├── profile.js
│   ├── progress.js
│   ├── quizzes.js
│   └── scholarships.js
│
├── tests/
├── utils/
└── views/
```

The repository contains **one canonical project structure**. The previous duplicated nested project folder has been removed to avoid confusion when cloning or deploying.

---

# 💻 Run Locally

### 1. Clone

```bash
git clone https://github.com/Nandani27-garg/Edusathi.git
cd Edusathi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy:

```text
.env.example → .env
```

Add your Gemini API key if you want live Gemini responses:

```text
GEMINI_API_KEY=your_key_here
SESSION_SECRET=your_long_random_secret
```

The app can still demonstrate the core educational flow without a Gemini key because the prototype includes fallback responses.

### 4. Start

```bash
npm start
```

Open:

```text
http://localhost:3000
```

### 5. Reset / reseed prototype data

```bash
npm run seed
```

The SQLite file is created locally under `database/` and is ignored by Git.

---

# 🧪 Testing

Run:

```bash
npm test
```

The test suite covers important prototype flows including:

- Landing page
- Authentication
- 1-click demo login
- Dashboard
- Learning and lessons
- Offline lesson API
- AI Tutor
- Multilingual responses
- Scholarship filters
- Career guidance
- Mentor requests
- PWA assets
- Quiz grading
- Progress
- Profile and settings
- Language persistence

---

# 🔐 Security & Responsible AI

The prototype includes:

- Password hashing with bcryptjs
- Environment-based API configuration
- Session authentication
- Secret protection through `.gitignore`
- Local SQLite data isolation

### Production direction

The production version will add:

- Verified educational sources
- RAG-based answers
- Source attribution
- AI evaluation and hallucination testing
- Human verification for high-impact guidance
- Minimal collection of student data
- Role-based access control
- Stronger session/security configuration
- Privacy-by-design practices

> **AI should assist students, not become the final authority for high-impact educational or career decisions.**

---

# 🛣️ Prototype → Production Roadmap

| Area | Current Prototype | Production Direction |
|---|---|---|
| AI Tutor | Gemini + fallback responses | RAG + verified knowledge base |
| Database | Local SQLite | Scalable managed database |
| Scholarships | Prototype records + filters | Official/verified integrations |
| Career | Structured roadmaps + optional AI | Skill-gap analysis + validated pathways |
| Mentorship | Prototype directory/request flow | Verified mentor network + matching |
| Offline | PWA + browser storage | Advanced sync and offline-first architecture |
| Voice | Browser APIs | Regional-language voice capabilities |
| Analytics | Basic progress | Personalized learning analytics |
| Security | Core safeguards | RBAC, encryption, auditability |
| Accessibility | Responsive + voice direction | Formal accessibility testing |

---

# 📈 Expected Impact

### Students

- Continue learning during poor connectivity
- Learn in a more comfortable language
- Get instant academic support
- Discover opportunities in one place
- Explore structured career pathways
- Access mentor discovery

### Educators & Mentors

- Reach students beyond traditional classroom boundaries
- Provide more structured guidance

### Institutions

- A foundation for accessible digital learning support
- Centralized student learning and opportunity workflows

---

# 🌱 Future Scope

### Personalized Learning

```
Student activity
      ↓
Learning gaps
      ↓
Next best concept
      ↓
Recommended resource
      ↓
Practice + feedback
```

### Verified Opportunity Layer

The production platform can expand beyond scholarships to:

- Internships
- Competitions
- Entrance examinations
- Courses
- Government education initiatives

### Regional-language intelligence

Move from direct translation toward explanations that are naturally understandable in local languages.

### Low-connectivity ecosystem

Extend offline learning to schools, community centres and areas with intermittent connectivity.

---

# 🏆 Hackathon Positioning

EduSaarthi is **not presented as a finished national-scale platform**.

The prototype demonstrates:

- A clearly defined access problem
- A unified product concept
- A working student journey
- AI integration
- Multilingual interaction
- Offline-first technical direction
- Voice accessibility
- Opportunity discovery
- Career guidance
- Mentorship workflow
- A practical production roadmap

The key product principle is:

> **Technology should adapt to the learner — not the other way around.**

---

# 👥 Team

**EduSaarthi Team**

Built around:

- Artificial Intelligence
- Inclusive Education
- Multilingual Technology
- Offline-First Systems
- Accessibility
- Student Empowerment

---

# 📜 License

This project is licensed under the **MIT License**.

<p align="center">

### 🎓 EduSaarthi
**Learning Without Barriers.**

*Building technology that adapts to the learner — not the other way around.*

</p>
