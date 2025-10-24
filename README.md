<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://firebasestorage.googleapis.com/v0/b/vietfurniture-38c34.appspot.com/o/image%2FScreenshot%20(136).png?alt=media&token=690c39fe-3d2c-4e78-a38e-a26e1bafa845" />

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`
# 📘 Vocabulary Trainer

A **desktop vocabulary learning application** built with **Angular** (frontend) and **Electron + Node.js** (runtime).  
This app helps users **create topics, manage vocabulary, and practice words** using **flashcards, quizzes, and fill-in-the-blank exercises** — with local progress tracking and reporting.

---

## 🧭 Overview

**Vocabulary Trainer** is designed for English learners who want to:
- Build personalized word lists grouped by topic.
- Practice vocabulary interactively.
- Track progress over time through detailed reports.

The app operates fully offline after installation and stores all data locally using a relational database.

---

## ✨ Key Features

### 🗂️ Topic Management
- Create, edit, and delete topics.
- Configure practice settings (ratio of multiple-choice vs fill-in-the-blank).
- View topic summaries including word counts.

### 🧠 Vocabulary Management
- Add new words manually with the following fields:
  - **Word**
  - **Phonetic transcription**
  - **Part of Speech**
  - **Meaning (Vietnamese translation)**
- Edit or delete existing entries.
- Import and export word lists from Excel (`.xlsx`).
- View all vocabularies in a paginated table.

### 🎯 Practice Module
- Practice through **Meaning → English** quizzes:
  - **Multiple Choice:** “Which vocabulary word means *‘đáng kể’*?”
  - **Fill-in-the-Blank:** “What word means *‘đáng kể’*?”
- Adjustable question ratio (default: 50% MCQ / 50% Fill-in).
- Visual and sound feedback on correct answers.
- Randomized question generation.

### 🪧 Flashcard Mode
- Flip cards to review words and meanings.
- Pronunciation playback via **Text-to-Speech (TTS)**.
- Navigate easily between cards with “Previous / Next” controls.

### 📊 Reporting & Analytics
- Dashboard summarizing user performance:
  - **Total sessions**, **mastery rate**, **recall accuracy**.
  - Word-level statistics with **frequency**, **recall rate**, **next review date**.
- Graphical progress visualization (charts and bars).

---

## 💻 Technical Details

| Component | Technology |
|------------|-------------|
| **Frontend** | Angular 17+, Tailwind CSS |
| **Backend / Runtime** | Node.js 20+ (Electron embedded) |
| **Database** | Local PostgreSQL |
| **External Services** | Google Text-to-Speech API, XLSX library |
| **Packaging** | Electron (Windows, macOS, Linux) |

---

## ⚙️ Installation

### Prerequisites
- Node.js ≥ 20
- PostgreSQL installed locally
- npm or yarn package manager

### Steps
```bash
# Clone repository
git clone https://github.com/yourusername/vocabulary-trainer.git
cd vocabulary-trainer

# Install dependencies
npm install

# Run development server
npm run start

# Build desktop app
npm run electron:build
