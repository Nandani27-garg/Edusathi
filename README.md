# 🎓 EduSaarthi — Learning Without Barriers

> **An inclusive, multilingual, offline-first AI learning and career companion designed to make quality education, guidance and opportunities more accessible.**

**EduSaarthi is currently a functional hackathon prototype/MVP.**  
The prototype validates the core product idea and technical direction. The full production-grade platform is planned as the next phase, with stronger AI, verified data, scalable infrastructure, accessibility and real-world deployment.

---

## 🌍 The Problem

For many students, especially those in underserved and low-connectivity communities, the challenge is not a lack of ambition — it is a lack of **access**.

Students can face:

- 📡 Unreliable or expensive internet connectivity
- 🌐 Language barriers in educational content
- 🤖 Lack of instant academic doubt support
- 🎓 Limited awareness of scholarships and opportunities
- 🧭 Lack of structured career guidance
- 👨‍🏫 Limited access to mentors
- 🎙️ Difficulty using text-heavy platforms
- 🔄 Multiple disconnected platforms for different needs

### Our question

**What if one platform could bring learning, AI assistance, accessibility, opportunities and guidance together — while still working in low-connectivity environments?**

That is the idea behind **EduSaarthi**.

---

# 💡 Our Solution

EduSaarthi is designed as a **digital education companion** rather than just another LMS or AI chatbot.

It brings together:

**📚 Learning + 🤖 AI Tutor + 🌐 Multilingual Support + 📡 Offline Access + 🎙️ Voice + 🎓 Scholarships + 🧭 Career Guidance + 👨‍🏫 Mentorship**

The platform is designed around the student, adapting to constraints such as language, connectivity and access to guidance.

---

# ⭐ Key Innovation

## AI + Accessibility + Offline-First Learning + Opportunity Discovery

Most digital learning platforms assume that students have:

- Stable internet
- Strong English proficiency
- Easy access to teachers/mentors
- Continuous access to online resources

EduSaarthi takes a different approach:

> **The platform should adapt to the learner — not the other way around.**

### 1. 🌐 Multilingual Learning

The prototype is designed for multilingual interaction and persistent language selection.

Planned language ecosystem includes major Indian languages and regional-language expansion.

This makes language a **core product capability**, not an afterthought.

---

### 2. 📡 Offline-First Learning

EduSaarthi uses PWA concepts such as:

- Service Worker
- Cache API
- IndexedDB
- Offline lesson storage
- Low-data interaction

Students can access previously saved learning material even when connectivity is temporarily unavailable.

---

### 3. 🤖 AI Tutor

The platform integrates AI-assisted learning through the **Gemini API**.

The AI Tutor is designed to help students:

- Understand difficult concepts
- Get simpler explanations
- Ask academic doubts
- Generate practice questions
- Summarize learning material
- Interact in supported languages

### Production vision

The future version will use a verified educational knowledge base and **RAG (Retrieval-Augmented Generation)** to improve factual reliability, contextual answers and source attribution.

---

### 4. 🎙️ Voice-Based Interaction

Voice interaction reduces dependence on typing.

The prototype explores:

- Speech-to-Text
- Text-to-Speech
- Language-specific voice interaction

This can make digital learning more accessible for students who are more comfortable speaking than typing.

---

### 5. 🎓 Scholarship & Opportunity Discovery

EduSaarthi aims to make important opportunities easier to discover.

The prototype provides the foundation for filtering opportunities using factors such as:

- State
- Category
- Income
- Educational background

> **Prototype note:** This is currently a concept/prototype workflow. Production deployment will require continuous verification and official/authoritative data integration.

---

### 6. 🧭 Career Guidance

Students can explore career directions based on their:

- Interests
- Strengths
- Preferences
- Goals

The platform can generate a structured roadmap showing what a student can learn next.

Future versions can evolve this into personalized **skill-gap analysis + learning pathways**.

---

### 7. 👨‍🏫 Digital Mentorship

The prototype includes the foundation for mentor discovery and mentor-request workflows.

The production vision is a verified network of:

- Teachers
- Industry professionals
- Researchers
- Engineers
- Career mentors
- Local educators

---

# 🏗️ Prototype Architecture

```
                    ┌──────────────────────┐
                    │       STUDENT        │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌─────────────────────────┐
                 │    EduSaarthi Web App   │
                 │       PWA + UI          │
                 └────────────┬────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     Learning             AI Tutor           Accessibility
          │                   │                   │
          │                   ▼                   ▼
          │              Gemini API          Voice / Speech
          │
          ▼
    Offline Layer
 Service Worker + IndexedDB
          │
          ▼
    Node.js + Express
          │
          ▼
    Application Data
```

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend | Node.js |
| Web Framework | Express.js |
| Frontend | EJS, HTML5, CSS3, JavaScript |
| AI | Google Gemini API |
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
├── 📚 Learning
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

# 🎯 Prototype User Journey

```
Student
   ↓
Select Language
   ↓
Explore Learning Content
   ↓
Download / Save Content
   ↓
Ask AI Tutor
   ↓
Use Voice Interaction
   ↓
Practice Through Quiz
   ↓
Track Progress
   ↓
Discover Opportunities
   ↓
Explore Career Roadmap
   ↓
Connect With a Mentor
```

This demonstrates the central product idea:

> **EduSaarthi does not only help students learn. It helps them understand what to learn, how to learn, what opportunities exist, and what they can do next.**

---

# 🔐 Security & Responsible AI

The prototype follows basic security practices including:

- Password hashing using bcryptjs
- Environment variables for secrets
- Session-based authentication
- Sensitive configuration kept outside source code
- `.env` protection through `.gitignore`

### Responsible AI — Production Direction

The production version will prioritize:

- Verified educational sources
- RAG-based responses
- Source attribution
- AI evaluation and testing
- Hallucination reduction
- Human verification for high-impact guidance
- Minimal collection of student data
- Role-based access control
- Auditability and privacy-by-design

> **AI should assist students, not become the final authority for high-impact educational or career decisions.**

---

# 🚀 Prototype → Production Roadmap

The current repository intentionally focuses on **proof of concept and validation**.

| Area | Prototype | Production Vision |
|---|---|---|
| AI | Gemini API integration | RAG + verified knowledge base |
| Data | Prototype data | Verified official/partner data |
| Database | Lightweight prototype storage | Scalable cloud database |
| Offline | PWA + browser storage | Advanced sync & offline-first architecture |
| Voice | Browser speech APIs | Regional-language voice/IVR capabilities |
| Scholarships | Discovery workflow | Verified official integrations |
| Mentorship | Request workflow | Verified mentor ecosystem |
| Analytics | Basic progress | Personalized learning analytics |
| Infrastructure | Prototype deployment | Cloud-native scalable architecture |
| Security | Core safeguards | RBAC, encryption, audit & compliance |
| Accessibility | Responsive + voice | Comprehensive accessibility testing |

---

# 🌱 Future Scope

### 🔹 Personalized Learning Engine

Use student performance to identify:

```
What the student knows
        ↓
Where the student struggles
        ↓
What should be learned next
        ↓
Which resource should be recommended
```

### 🔹 Regional-Language Intelligence

Move beyond direct translation toward educational explanations that are naturally understandable in local languages.

### 🔹 Low-Connectivity Ecosystem

Extend offline learning to schools, community centres and areas with intermittent connectivity.

### 🔹 Verified Opportunity Layer

Bring together:

- Scholarships
- Competitions
- Internships
- Entrance examinations
- Courses
- Government education initiatives

### 🔹 Verified Mentorship Network

Match students and mentors using:

- Subject
- Career interest
- Language
- Location
- Availability

---

# 📈 Expected Impact

EduSaarthi aims to reduce the **access gap** in education.

### For Students

- More accessible learning
- Reduced language barriers
- Learning during poor connectivity
- Faster doubt resolution
- Better opportunity awareness
- Structured career exploration

### For Educators & Mentors

- Wider student reach
- Structured interaction
- Better visibility into student progress

### For Institutions

- Centralized digital learning support
- Better student engagement
- A foundation for scalable educational technology

---

# 🏆 Why EduSaarthi?

EduSaarthi combines several needs that are usually scattered across different platforms:

```
Learning
   +
AI Assistance
   +
Local Languages
   +
Offline Access
   +
Voice
   +
Scholarships
   +
Career Guidance
   +
Mentorship
        ↓
   EduSaarthi
```

The prototype demonstrates the **feasibility of this unified approach**.

The next phase will focus on scale, verification, personalization and real-world deployment.

---

# 🧪 Testing

The project includes automated test scripts for important application workflows.

Run:

```bash
npm test
```

---

# 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Nandani27-garg/Edusathi.git
cd Edusathi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy:

```text
.env.example → .env
```

Then add the required API keys and configuration values.

**Never commit real API keys or secrets to GitHub.**

### 4. Start the application

```bash
npm start
```

### 5. Run tests

```bash
npm test
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
├── edusathi/
├── public/
├── routes/
├── tests/
├── utils/
└── views/
```

---

# 🟡 Project Status

## Functional Hackathon Prototype / MVP

The current version is **not claimed to be a production-ready national-scale platform**.

It is a working prototype intended to demonstrate:

- Product concept
- Core user journeys
- AI integration
- Accessibility direction
- Offline-first approach
- Technical feasibility
- Scalability roadmap

The next development phase will turn this foundation into a production-grade platform through stronger infrastructure, verified data, real-world testing, improved AI reliability and institutional/educational partnerships.

---

# 🔮 Vision

> ### **"Learning should not depend on where a student is born, which language they speak, or how strong their internet connection is."**

EduSaarthi envisions a future where a student can access:

**Knowledge → Guidance → Opportunity → Mentorship**

through one accessible digital companion.

---

## 👥 Team

**EduSaarthi Team**

Built with a focus on:

- Artificial Intelligence
- Inclusive Education
- Multilingual Technology
- Offline-First Systems
- Accessibility
- Student Empowerment

---

## 📜 License

This project is licensed under the **MIT License**.

---

<p align="center">

### 🎓 EduSaarthi
**Learning Without Barriers.**

*Building technology that adapts to the learner — not the other way around.*

</p>
