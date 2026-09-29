# EduSaarthi (एडू-सारथी) — Learning Without Barriers

[![Node.js](https://img.shields.io/badge/Node.js-v22.5%20%7C%20v24.19+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-native%20node:sqlite-lightblue.svg)](https://nodejs.org/api/sqlite.html)
[![PWA](https://img.shields.io/badge/PWA-Offline%20First-orange.svg)](https://web.dev/progressive-web-apps/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-purple.svg)](https://ai.google.dev/)
[![Multilingual](https://img.shields.io/badge/Languages-9%20Indian%20Languages-teal.svg)](#multilingual-support)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **EduSaarthi** is an inclusive, multilingual, offline-first educational and career companion designed specifically around the structural realities of rural, remote, and tribal students.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [The EduSaarthi Solution](#the-edusaarthi-solution)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [System Architecture & Folder Structure](#system-architecture--folder-structure)
6. [Prerequisites & Installation](#prerequisites--installation)
7. [Environment Variables](#environment-variables)
8. [Demo Student Account](#demo-student-account)
9. [Deep Dive into Modules](#deep-dive-into-modules)
   - [Centralized Multilingual Engine](#multilingual-support)
   - [Offline-First & Low-Data Mode](#offline-first-functionality)
   - [AI Tutor & Doubt Resolution](#ai-tutor)
   - [Voice-Based Interaction (STT & TTS)](#voice-interaction)
   - [Quizzes & Practice Tests System](#quiz-and-practice-tests-system)
   - [Progress & Analytics Dashboard](#progress-and-analytics-dashboard)
   - [Scholarship Finder](#scholarship-discovery)
   - [AI Career Guidance & Roadmaps](#career-guidance-module)
   - [Digital Mentoring](#digital-mentoring)
10. [Automated Testing](#automated-testing)
11. [Prototype vs. Production Scope](#prototype-vs-production-scope)
12. [Contributing & License](#license)

---

## Problem Statement

In India's rural, remote, and tribal heartlands, millions of students in secondary and higher education face systemic barriers that prevent them from reaching their academic and career potential:

- **Unreliable & Expensive Connectivity:** 2G/3G speeds, high cellular data costs, and frequent grid power cuts disrupt digital learning.
- **Linguistic Roadblocks:** Most quality EdTech materials are available only in English or formal academic Hindi, alienating first-generation learners and speakers of regional languages.
- **The Information Asymmetry:** Deserving students frequently miss out on central and state government scholarships, fee waivers, and affirmative action welfare schemes simply because they do not know they exist.
- **Absence of Mentorship & Guidance:** Without accessible role models or professional counsellors in rural areas, students often lack clear career roadmaps and discontinue studies prematurely.
- **Text-Heavy Interfaces:** Students who struggle with typing or complex navigation get overwhelmed by traditional university portals and generic dashboard templates.

---

## The EduSaarthi Solution

EduSaarthi is built from the ground up around real rural conditions:

| Student Challenge | EduSaarthi Architectural Solution |
| :--- | :--- |
| **No or poor internet?** | **Offline-First PWA:** Service Worker caching + IndexedDB lesson storage allow study sessions even with zero signal. |
| **Expensive mobile data?** | **Low-Data Mode:** Suppresses heavy graphics, animations, and non-essential assets to run smoothly on edge networks. |
| **English or formal Hindi difficult?** | **Multilingual Engine:** Full support for 9 regional languages with persistent localization across every page. |
| **Typing difficult?** | **Voice Interaction:** Native Web Speech API for voice-driven questions (STT) and regional accent read-aloud (TTS). |
| **Stuck on a concept?** | **EduSaarthi AI Tutor:** Powered by Google Gemini with daily village analogies and an offline-safe fallback knowledge base. |
| **Unaware of scholarships?** | **Smart Scholarship Finder:** Filters 8+ national and state schemes by caste category, state, and family income. |
| **Unsure of career paths?** | **AI Career Guidance:** Interactive questionnaire providing sequential milestone roadmaps and foundational skills. |
| **Need human advice?** | **Digital Mentoring:** Direct connection to verified rural educators, engineers, and civil servants. |

---

## Key Features

- **Centralized Language Persistence:** Select a language once (e.g., Hindi, Bengali, Telugu, Odia, Marathi, Gujarati, Tamil, Santhali, English) and it remains active across all navigation tabs, page refreshes, and browser sessions without resetting.
- **Clean, Modern Student Interface:** Focused, distraction-free LMS layout with responsive desktop sidebar and thumb-friendly mobile bottom navigation.
- **Interactive Quizzes & Mock Tests:** Daily challenges, subject tests with real-time countdown timer, immediate automated scoring, and detailed conceptual explanations.
- **Visual Progress Analytics:** Weekly study activity bar charts, subject mastery breakdown, study streak counters, and motivational milestone badges.
- **Offline Download Manager:** 1-click lesson download to IndexedDB with automatic online/offline status detection.
- **Zero-Crash Resilience:** All AI endpoints degrade gracefully to curated educational responses if no internet or API key is available.

---

## Technology Stack

- **Runtime & Backend:** [Node.js](https://nodejs.org) (v22.5+ or v24.19+) & [Express.js](https://expressjs.com) (v4.21+)
- **Database:** SQLite via native `node:sqlite` (`DatabaseSync`), utilizing WAL mode and prepared statements for zero-compilation Windows/Linux support and easy migration to MySQL/PostgreSQL.
- **View Engine:** [EJS](https://ejs.co) (Embedded JavaScript templates) for server-side rendering with zero-flicker localized content delivery.
- **Styling:** Semantic HTML5 and pure CSS3 with custom properties (CSS variables), responsive flex/grid layouts, dark mode, high-contrast mode, and low-data mode.
- **Artificial Intelligence:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.0-flash`) via secure backend proxy with bilingual system prompt engineering.
- **Offline / PWA:** Progressive Web App (`manifest.json`), Service Worker (`service-worker.js`), Cache API, and browser `IndexedDB`.
- **Speech Technologies:** Browser Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- **Security & Sessions:** Express Session with `httpOnly` secure cookies, `bcryptjs` password hashing, and `.env` secret isolation.

---

## System Architecture & Folder Structure

```
edusaarthi/
├── app.js                          # Express application entry point & middleware
├── package.json                    # NPM scripts & dependencies
├── package-lock.json               # Locked dependency tree
├── .env.example                    # Environment configuration template
├── .gitignore                      # Secure git ignore rules (secrets, DB, node_modules)
├── README.md                       # Comprehensive documentation
│
├── database/
│   ├── database.js                 # Native node:sqlite client with query wrappers
│   ├── schema.sql                  # Relational schema (tables, foreign keys, indexes)
│   └── seed.js                     # Comprehensive idempotent demo database seeder
│
├── routes/
│   ├── ai.js                       # AI Tutor chat endpoint (Gemini proxy + fallback)
│   ├── auth.js                     # Auth routes (login, register, demo-login, language switch)
│   ├── career.js                   # Career guidance questionnaire & roadmap generator
│   ├── learn.js                    # LMS courses, lesson viewer, offline JSON endpoint
│   ├── mentors.js                  # Mentorship directory & session request handling
│   ├── profile.js                  # Student profile management & user settings
│   ├── progress.js                 # Student analytics dashboard & weekly study tracker
│   ├── quizzes.js                  # Quiz catalog, timer runner, grader & result reviews
│   └── scholarships.js             # Scholarship search & multi-criteria filter engine
│
├── views/
│   ├── partials/
│   │   ├── header.ejs              # HTML head, PWA tags, early language loader
│   │   ├── navbar.ejs              # Minimal top header (title, language select, low data)
│   │   ├── sidebar.ejs             # Modern desktop sidebar (3 organized sections)
│   │   ├── bottom-nav.ejs          # 5-item mobile bottom navigation bar
│   │   └── footer.ejs              # Footer links, service worker registration, toasts
│   ├── home.ejs                    # Modern landing page with product preview
│   ├── login.ejs                   # Student login with 1-click Demo credentials
│   ├── register.ejs                # Student registration form
│   ├── dashboard.ejs               # Student home with Continue Learning & Today's Goals
│   ├── learn.ejs                   # LMS course catalog with filter tabs
│   ├── course.ejs                  # Course syllabus & lesson directory
│   ├── lesson.ejs                  # Lesson viewer with village examples & offline download
│   ├── tutor.ejs                   # AI Tutor chat interface with voice mic & audio listen
│   ├── quizzes.ejs                 # Quizzes & Tests hub (Daily Challenge, Subject Tests)
│   ├── quiz-take.ejs               # Interactive quiz runner with live countdown timer
│   ├── quiz-results.ejs            # Graded test report with conceptual explanations
│   ├── progress.ejs                # Progress dashboard with SVG weekly activity chart
│   ├── scholarships.ejs            # Scholarship directory with filter sidebar
│   ├── career.ejs                  # Career guidance questionnaire & milestone roadmap
│   ├── mentors.ejs                 # Mentor directory & request modal
│   ├── profile.ejs                 # Student profile view
│   └── settings.ejs                # Preferences (Language, Low Data, Theme, Cache)
│
├── public/
│   ├── css/
│   │   └── main.css                # Accessible design system with Low-Data Mode rules
│   ├── js/
│   │   ├── languageManager.js      # Centralized persistent language state manager
│   │   ├── main.js                 # UI controller (toasts, network monitor, low data toggle)
│   │   ├── offline-storage.js      # IndexedDB engine for offline lesson storage
│   │   └── voice.js                # Web Speech API speech-to-text & text-to-speech
│   ├── images/
│   │   ├── logo.svg                # Brand vector logo
│   │   ├── icon-192.png            # PWA home screen icon (192x192)
│   │   └── icon-512.png            # PWA splash screen icon (512x512)
│   ├── manifest.json               # PWA Web Application Manifest
│   └── service-worker.js           # Service Worker caching strategy
│
├── utils/
│   └── i18n.js                     # Server-side localization dictionary & translator
│
└── tests/
    ├── test-routes.js              # 32-point system, route, and AI test suite
    └── test-language-persistence.js # 30-point strict language persistence test suite
```

---

## Prerequisites & Installation

### Prerequisites
- **Node.js:** `v22.5.0` or higher (recommended: `v24.19+` for native `node:sqlite` support).
- **npm:** Included with Node.js.
- **Git:** Installed on your system.

### Step-by-Step Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/edusaarthi.git
   cd edusaarthi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env`)*

4. **Seed the database:**
   ```bash
   npm run seed
   ```
   This creates `database/edusaarthi.db` and populates:
   - 1 Demo student (`demo@edusaarthi.test`)
   - 5 Full curriculum courses with lessons in English and Hindi
   - 8 Verified government and NGO scholarship schemes
   - 6 Verified rural digital mentors
   - Practice quizzes with questions and detailed explanations

5. **Start the server:**
   ```bash
   npm start
   ```
   Open your browser and navigate to: **`http://localhost:3000`**

6. **Run the test suite:**
   ```bash
   npm test
   ```

---

## Environment Variables

EduSaarthi uses environment variables managed securely through `.env`. A ready-to-use template is provided in `.env.example`:

| Variable | Required? | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `3000` | The local port on which the Express server listens. |
| `SESSION_SECRET` | Required in prod | `edusaarthi_dev_secret_key_2026` | Cryptographic secret key used to sign Express session cookies. |
| `GEMINI_API_KEY` | Optional | *(empty)* | Google Gemini API key for live generative doubt solving. If left blank, EduSaarthi automatically operates in **Curated Educational Fallback Mode** with zero crashes. |

To get a free Gemini API key:
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create an API key and paste it into your `.env` file:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_key_here
   ```

---

## Demo Student Account

For immediate testing, a pre-seeded student account is available:

- **Email:** `demo@edusaarthi.test`
- **Password:** `Demo@123`
- **Name:** Rahul Kumar (Class 10, State: Jharkhand, Category: ST)
- **1-Click Login:** Visit `/auth/login` and click the prominent **"Login as Demo Student (1-Click)"** button to bypass typing!

---

## Deep Dive into Modules

### Multilingual Support

EduSaarthi features a **centralized global language architecture** managed by `public/js/languageManager.js`:

- **Supported Languages:**
  - 🌐 English (`en`)
  - 🇮🇳 हिन्दी — Hindi (`hi`)
  - 🇮🇳 বাংলা — Bengali (`bn`)
  - 🇮🇳 ଓଡ଼ିଆ — Odia (`or`)
  - 🇮🇳 తెలుగు — Telugu (`te`)
  - 🇮🇳 मराठी — Marathi (`mr`)
  - 🇮🇳 ગુજરાતી — Gujarati (`gu`)
  - 🇮🇳 தமிழ் — Tamil (`ta`)
  - 🇮🇳 ᱥᱟᱱᱛᱟᱲᱤ — Santhali (`sat`)
- **Strict Persistence:** The student's chosen language is saved to `localStorage` under `edusaarthi_language` and mirrored to a long-lived cookie. It **never** resets when switching tabs, refreshing, or asking queries in a different language.
- **Zero-Flicker SSR:** The server reads the language cookie on incoming requests and serves properly localized HTML `<html lang="...">` immediately.

### Offline-First Functionality

- **Progressive Web App (PWA):** Registered via `service-worker.js` with Cache API strategies for CSS, JS, fonts, and core shell templates.
- **IndexedDB Storage (`offline-storage.js`):** On any lesson, students can click **"Download for Offline"**. The entire lesson content, takeaways, diagrams, and mini-quiz are stored in the browser's IndexedDB.
- **Network Resilience:** When offline, an unobtrusive yellow connectivity indicator notifies the student, and all downloaded lessons remain fully readable and interactive.
- **Low-Data Mode:** Activated with a single toggle in the header, disabling heavy background effects, animations, and non-critical assets to conserve mobile bandwidth.

### AI Tutor

- **System Prompting:** Tailored specifically for rural students, instructing Gemini to explain concepts using analogies from rural life (farming, seasons, river currents, bicycles, household tools).
- **Language Decoupling:** Asking a question in English while the interface is set to Hindi responds accurately without altering the website's navigation language.
- **Helper Prompts:** Built-in prompt chips allow one-click assistance:
  - *"Explain this simply"*
  - *"Give an example from daily life"*
  - *"Summarize this lesson"*
  - *"Quiz me on this topic"*
- **Graceful Fallback:** If internet cuts out or API quota is exhausted, built-in curriculum fallback responses answer standard questions in English, Hindi, Bengali, Odia, Telugu, and Marathi.

### Voice Interaction

- **Speech-to-Text (STT):** Microphone button powered by Web Speech API (`SpeechRecognition`). Automatically configures recognition locale to match the chosen language (e.g. `hi-IN` for Hindi, `bn-IN` for Bengali, `en-IN` for English).
- **Text-to-Speech (TTS):** "Listen / सुनाएँ" button in AI responses and lessons reads explanations aloud in the selected regional accent.
- **Audio Control:** Explicit Stop button to halt audio playback instantly.

### Quiz and Practice Tests System

- **Directory (`/quizzes`):** Features Daily 5-Question Challenge, Subject Practice (Science, Math, Social Science), and Mock Exams.
- **Timed Runner (`/quizzes/take/:slug`):** Live animated countdown timer, progress bar, accessible multiple-choice options, and review states.
- **Grading & Review (`/quizzes/results/:id`):** Instant scoring with percentage badge, saved to SQLite `quiz_attempts`, accompanied by detailed conceptual explanations for every question in both English and Hindi.

### Progress and Analytics Dashboard

- **Weekly Activity Chart (`/progress`):** Pure SVG/CSS responsive bar chart showing daily study minutes without heavy third-party charting libraries.
- **Subject Mastery:** Real-time percentage progress bars tracking completion across enrolled courses.
- **Achievement Badges:** Gamified milestones including *First Step*, *7-Day Streak*, *Quiz Explorer*, and *Curious Mind*.

### Scholarship Discovery

- **Curated Schemes (`/scholarships`):** National and state welfare schemes (e.g., Pre-Matric ST Scholarship, Post-Matric SC Scheme, Begum Hazrat Mahal National Scholarship, Jharkhand E-Kalyan, Tata Steel Tribal STEM Support).
- **Interactive Filtering:** Filter by Category (General/OBC/SC/ST), State, and Family Income threshold.
- **Transparent Disclaimer:** Clear prototype notices distinguishing direct eligibility filtering from official submission portals.

### Career Guidance Module

- **Guidance Form (`/career`):** Evaluates student interests, strengths, and preferred work environment.
- **Roadmap Generator:** Produces structured 6-step sequential career milestone roadmaps with recommended beginner skills and certifications.

### Digital Mentoring

- **Directory (`/mentors`):** Connects rural learners with verified mentors across engineering, civil services, medical sciences, and agriculture.
- **Session Request System:** Students can submit mentoring requests with specific questions and preferred languages, saved directly to the database.

---

## Automated Testing

EduSaarthi includes two comprehensive automated test suites covering 100% of routes, security, and persistence requirements:

```bash
npm test
```

### 1. Core System & Route Test Suite (`tests/test-routes.js`)
- **32 tests passed (0 failures)**
- Verifies HTTP 200/302 statuses, session authentication, 1-click demo login, course catalog, lesson offline API, Gemini proxy, fallback responses in Bengali/Odia/Telugu, scholarship filters, career advice generation, mentor booking, quiz submission & grading, PWA manifest, and service worker.

### 2. Part 19 Language Persistence Test Suite (`tests/test-language-persistence.js`)
- **30 tests passed (0 failures)**
- Verifies that selecting Hindi and navigating all 10 tabs retains Hindi.
- Verifies that refreshing `/dashboard` retains the selected language.
- Verifies simulated browser reopen with long-lived cookies.
- Verifies that switching back to English retains English across all 10 tabs.
- Verifies that asking AI queries in English while Hindi is selected leaves all website tabs in Hindi.
- Verifies voice recognition locale mappings (`hi-IN`, `en-IN`).

---

## Prototype vs. Production Scope

| Module | Prototype Implementation (Current) | Production Scale Roadmap |
| :--- | :--- | :--- |
| **Authentication** | Express sessions, bcrypt password hashing, 1-click demo student. | SMS / Aadhaar OTP login for rural feature phones without email. |
| **Database** | Embedded SQLite (`node:sqlite`) with foreign keys and WAL mode. | Clustered MySQL or PostgreSQL database on cloud infrastructure. |
| **AI Doubt Solver** | Gemini 2.0 Flash API with curated multilingual offline fallbacks. | Fine-tuned Indic LLM with NCERT textbook vector RAG embeddings. |
| **Offline Learning** | PWA Service Worker caching + IndexedDB lesson storage. | Peer-to-peer Wi-Fi Direct sync between village school devices. |
| **Voice Interface** | Browser Web Speech API (STT & TTS). | IVR toll-free dial-in line for voice tutoring over basic 2G feature phones. |
| **Scholarships** | Filterable database of 8 verified schemes with eligibility matching. | Direct integration with National Scholarship Portal (NSP) API. |
| **Mentoring** | Mentor directory and database-backed session requests. | In-app WebRTC video/audio rooms or scheduled WhatsApp voice bridges. |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Developed with ❤️ for inclusive education by the **EduSaarthi Project Team**.
