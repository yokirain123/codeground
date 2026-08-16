<p align="center">
  <img src="./components/images/logo.png" alt="CodeQuest pixel crown" width="140" />
</p>

<h1 align="center">CodeQuest</h1>

<p align="center">
  A gamified programming-learning platform where lessons become quests,
  practice earns XP, and every bug is part of the adventure.
</p>

<p align="center">
  <strong>Learn · Practice · Level up</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.10-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16.2.10" />
  <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=061A23" alt="React 19.2.4" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-00E599?logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
</p>

[!NOTE]
CodeQuest is under active development. The core learning, progression,
social, challenge, and developer-lab systems are implemented, while content
and production infrastructure continue to evolve.

About

CodeQuest is a full-stack learning platform designed to make programming feel
like an RPG campaign. Players can enroll in beginner-friendly courses, write and
run code in interactive editors, complete challenges, earn XP, unlock
achievements, maintain streaks, and compare progress with other learners.

The project combines structured course content with practical coding tools,
AI-assisted feedback, isolated runtimes, and a pixel-inspired interface.

Features

Learning and progression

Structured courses with chapters, exercises, difficulty levels, and XP.

Sequential chapter progression and automatic completion tracking.

Personal dashboard with enrolled courses, statistics, badges, and streaks.

Achievements based on completed exercises, earned points, and activity.

Community leaderboard — the Hall of Heroes.

Server-side submission validation and one-time XP rewards.

Interactive coding

Web Playground presets for HTML/CSS/JavaScript, JavaScript, TypeScript,
React, React + TypeScript, and React + Tailwind CSS.

Sandpack live preview for browser-based projects.

Monaco-powered course editors for Python, C#, and C++.

Standard input, console output, compiler diagnostics, and runtime errors.

Python, C#, C++17, and lab execution through Judge0.

Deterministic validation with optional OpenAI-assisted exercise validation.

Challenges and developer labs

12 practical challenges for HTML, CSS, React, and Python.

Daily challenge rotation, filters, saved drafts, and completion rewards.

Git Sandbox — 4 simulated missions for commits, branches, reverts, and
merge conflicts without touching a real repository.

Bug Hunt — 8 debugging missions across JavaScript, Python, C#, and C++.

Refactor Lab — AI-assisted maintainability review with individually
applicable changes.

Error Decoder — beginner-friendly error explanations and minimal fixes.

Community and resources

Player search, friend requests, party management, and public profiles.

Notification center for friend activity, course reminders, achievements, and
system messages.

Searchable cheat sheets with 42 patterns across 7 languages.

A–Z code glossary with 66 programming terms in 6 categories.

Searchable FAQ and a Telegram-backed contact form.

Administration

Role-based course creation and editing.

Automatic curriculum synchronization for supported beginner courses.

AI exercise generation by chapter or entire course.

Structured OpenAI responses validated with Zod before database writes.

Built-in course blueprints

The repository contains complete curriculum blueprints for six beginner paths:

Course

Chapters

Exercises

HTML

12

36

CSS

10

50

React

13

65

Python

13

65

C#

13

65

C++

13

65

Total

74

346

Course templates are selected from the course title, tags, and level. A course
must include Beginner and its language name, such as Python Beginner or
C++ Beginner, to receive the matching chapters automatically.

Tech stack

Area

Technology

Framework

Next.js 16 App Router, React 19, TypeScript 5

Styling

Tailwind CSS 4, shadcn/ui, Motion, Lucide icons

Authentication

Clerk

Database

Neon PostgreSQL, Drizzle ORM

Browser editors

Sandpack, CodeMirror, Monaco Editor

Code execution

Judge0, Pyodide

AI features

OpenAI Responses API, Zod structured outputs

Feedback

Sonner notifications

Architecture

flowchart TD
  UI["Next.js App Router<br/>React 19 UI"] --> AUTH["Clerk<br/>Authentication"]
  UI --> API["Next.js<br/>Route Handlers"]
  UI --> BROWSER["Sandpack / Pyodide<br/>Browser runtimes"]
  API --> DB["Neon PostgreSQL<br/>Drizzle ORM"]
  API --> SERVICES["OpenAI / Judge0 / Telegram<br/>External services"]

Getting started

Prerequisites

Node.js 20.9 or newer.

npm.

A PostgreSQL database; Neon is the intended provider.

A Clerk application.

Optional service credentials for OpenAI, Judge0, and Telegram, depending on
which features you want to run.

1. Clone the repository

git clone https://github.com/yokirain123/codeground.git
cd codeground

2. Install dependencies

npm install

3. Configure environment variables

Create .env.local in the project root:

# Clerk — required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# PostgreSQL — required
DATABASE_URL=

# OpenAI — required for AI generation, Refactor Lab, and Error Decoder
OPENAI_API_KEY=
OPENAI_EXERCISE_MODEL=gpt-5-mini
OPENAI_VALIDATION_MODEL=gpt-5-mini
OPENAI_LABS_MODEL=gpt-5-mini

# Judge0 — required for server-side code execution
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_AUTH_TOKEN=
JUDGE0_JAVASCRIPT_LANGUAGE_ID=
JUDGE0_PYTHON_LANGUAGE_ID=
JUDGE0_CSHARP_LANGUAGE_ID=
JUDGE0_CPP_LANGUAGE_ID=

# Optional RapidAPI headers for a hosted Judge0 instance
JUDGE0_RAPID_API_KEY=
JUDGE0_RAPID_API_HOST=

# Telegram — required only for the contact form
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

Do not commit .env.local or expose server-side keys through variables prefixed
with NEXT_PUBLIC_.

4. Prepare the database

The database schema is split across the following modules:

config/schema.ts
lib/friends/schema.ts
lib/notifications/schema.ts
lib/challenges/schema.ts
lib/labs/schema.ts

Before initializing a fresh database, make sure every module is included in the
schema field of drizzle.config.ts:

schema: [
  "./config/schema.ts",
  "./lib/friends/schema.ts",
  "./lib/notifications/schema.ts",
  "./lib/challenges/schema.ts",
  "./lib/labs/schema.ts",
],

Then push the schema:

npx drizzle-kit push

5. Start the development server

npm run dev

Open http://localhost:3000, create an account, and
sign in. The application will create the corresponding CodeQuest user profile.

Admin setup

New accounts receive the student role. To unlock course management and the AI
exercise generator, promote your account in PostgreSQL:

UPDATE users
SET role = 'admin'
WHERE email = 'you@example.com';

After promotion:

Open /courses and create a course.

Use a supported language name and the Beginner level to synchronize its
built-in chapters automatically.

Open /admin/exercises to generate missing exercise content by chapter or
for the entire course.

Available scripts

Command

Description

npm run dev

Start the local Next.js development server.

npm run build

Create a production build.

npm run start

Run the production server after building.

npm run lint

Run ESLint.

Project structure

app/
├── (routes)/               # Courses, dashboard, challenges, labs, and resources
├── _components/            # Shared layout and home-page components
├── api/                    # Next.js route handlers
└── sandpack/               # Sandpack templates and theme
components/                 # Shared UI, auth, friends, and lab components
config/                     # Database, Clerk appearance, and core schema
context/                    # Client-side application context
lib/                        # Domain logic, validation, schemas, and service clients
public/                     # Fonts, workers, lab artwork, and Pyodide assets

Development workflow

Create a focused branch:

git switch -c feature/your-feature

Make your changes.

Run the project checks:

npm run lint
npm run build

Open a pull request with a clear description and screenshots for UI changes.

Bug reports and feature requests are welcome in
GitHub Issues.

Roadmap

English and Ukrainian localization with an in-app language switcher.

More courses, challenges, achievements, and Git missions.

Automated tests and continuous integration.

Additional runtime hardening and production observability.

Improved mobile editing experience.