<a id="top"></a>

<div align="center">
  <img src="./components/images/logo.png" alt="CodeQuest pixel crown" width="132" />

  <h1>CodeQuest</h1>

  <p><strong>Turn programming lessons into quests.</strong></p>
  <p>Write real code, defeat bugs, earn XP, and grow from beginner to confident developer.</p>

  <p>
    <a href="#english"><strong>🇬🇧 English</strong></a>
    &nbsp;•&nbsp;
    <a href="#ukrainian"><strong>🇺🇦 Українська</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Courses-6-899DFF?style=flat-square" alt="6 courses" />
    <img src="https://img.shields.io/badge/Chapters-74-899DFF?style=flat-square" alt="74 chapters" />
    <img src="https://img.shields.io/badge/Exercises-346-FFD400?style=flat-square&labelColor=1B1E2B" alt="346 exercises" />
    <img src="https://img.shields.io/badge/Challenges-12-FF8C00?style=flat-square" alt="12 challenges" />
    <img src="https://img.shields.io/badge/Status-Active%20development-6FFFA2?style=flat-square&labelColor=1B1E2B" alt="Active development" />
  </p>

  <p>
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-16.2.10-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 16.2.10" />
    </a>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=061A23" alt="React 19.2.4" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    </a>
    <a href="https://neon.tech/">
      <img src="https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=flat-square&logo=postgresql&logoColor=white" alt="Neon PostgreSQL" />
    </a>
  </p>
</div>

---

<a id="english"></a>

## 🇬🇧 English

<p align="center">
  <a href="#en-overview">Overview</a> ·
  <a href="#en-features">Features</a> ·
  <a href="#en-courses">Courses</a> ·
  <a href="#en-stack">Tech stack</a> ·
  <a href="#en-setup">Setup</a> ·
  <a href="#en-admin">Admin</a> ·
  <a href="#en-structure">Structure</a>
</p>

<table>
  <tr>
    <td>
      <strong>🚧 Project status</strong><br /><br />
      CodeQuest is under active development. The learning, progression,
      social, challenge, and developer-lab systems are already implemented,
      while content and production infrastructure continue to evolve.
    </td>
  </tr>
</table>

<a id="en-overview"></a>

## 🎮 Overview

CodeQuest is a full-stack learning platform that turns programming practice
into an RPG-style adventure. Players follow structured learning paths, solve
coding quests, earn XP, unlock achievements, maintain streaks, and compare
their progress in the Hall of Heroes.

It combines beginner-friendly content, interactive editors, isolated code
runtimes, AI-assisted feedback, community features, and a distinctive
pixel-inspired interface.

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>📚 Learn through quests</strong><br /><br />
      Follow guided chapters and unlock exercises step by step.
    </td>
    <td width="50%" valign="top">
      <strong>⚔️ Write real code</strong><br /><br />
      Run projects, inspect output, and fix compiler or runtime errors.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>🏆 Build your hero profile</strong><br /><br />
      Earn XP, maintain streaks, and unlock achievements.
    </td>
    <td width="50%" valign="top">
      <strong>🤝 Join the community</strong><br /><br />
      Find friends, manage your party, and climb the leaderboard.
    </td>
  </tr>
</table>

<a id="en-features"></a>

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📚 Learning &amp; progression</h3>
      <ul>
        <li>Structured courses with chapters, exercises, difficulty levels, and XP.</li>
        <li>Sequential progression and automatic completion tracking.</li>
        <li>Personal dashboard with statistics, badges, and streaks.</li>
        <li>Achievements and the Hall of Heroes leaderboard.</li>
        <li>Server-side validation with one-time XP rewards.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>💻 Interactive coding</h3>
      <ul>
        <li>Six web Playground presets for JavaScript, TypeScript, and React projects.</li>
        <li>Sandpack live preview for browser-based projects.</li>
        <li>Monaco editors for Python, C#, and C++.</li>
        <li>Standard input, console output, diagnostics, and runtime errors.</li>
        <li>Python, C#, C++17, and lab execution through Judge0.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>⚔️ Challenges &amp; labs</h3>
      <ul>
        <li>12 practical challenges for HTML, CSS, React, and Python.</li>
        <li>Daily rotation, filters, saved drafts, and completion rewards.</li>
        <li>Git Sandbox and eight Bug Hunt missions.</li>
        <li>AI-powered Refactor Lab and Error Decoder.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🤝 Community &amp; resources</h3>
      <ul>
        <li>Player search, friend requests, parties, and public profiles.</li>
        <li>English and Ukrainian interface with a persistent language switcher.</li>
        <li>Notifications for friends, courses, achievements, and system events.</li>
        <li>42 cheat-sheet patterns across seven languages.</li>
        <li>A 66-term A–Z glossary, searchable FAQ, and contact form.</li>
      </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <strong>🛡️ Administration</strong><br /><br />
      Role-based course management, automatic curriculum synchronization,
      chapter-level or full-course AI generation, and Zod-validated structured
      responses before database writes.
    </td>
  </tr>
</table>

### Developer labs

| Lab | What it teaches |
| --- | --- |
| **Git Sandbox** | Four simulated missions covering commits, branches, reverts, and merge conflicts without touching a real repository. |
| **Bug Hunt** | Eight debugging missions across JavaScript, Python, C#, and C++. |
| **Refactor Lab** | AI-assisted maintainability reviews with individually applicable improvements. |
| **Error Decoder** | Beginner-friendly explanations of errors with focused, minimal fixes. |

<a id="en-courses"></a>

## 📚 Built-in course blueprints

The repository includes complete curriculum blueprints for six beginner paths:

| Course | Chapters | Exercises |
| :--- | ---: | ---: |
| HTML Beginner | 12 | 36 |
| CSS Beginner | 10 | 50 |
| React Beginner | 13 | 65 |
| Python Beginner | 13 | 65 |
| C# Beginner | 13 | 65 |
| C++ Beginner | 13 | 65 |
| **Total** | **74** | **346** |

Course templates are matched by title, tags, and level. A course must include
<code>Beginner</code> and the language name, such as
<code>Python Beginner</code> or <code>C++ Beginner</code>, to receive the
matching chapters automatically.

<a id="en-stack"></a>

## 🧰 Tech stack

| Area | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 App Router, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Motion, Lucide icons |
| **Authentication** | Clerk |
| **Database** | Neon PostgreSQL, Drizzle ORM |
| **Browser editors** | Sandpack, CodeMirror, Monaco Editor |
| **Code execution** | Judge0, Pyodide |
| **AI features** | OpenAI Responses API, Zod structured outputs |
| **Feedback** | Sonner notifications |

### Architecture

~~~mermaid
flowchart TD
  UI["Next.js App Router<br/>React 19 UI"] --> AUTH["Clerk<br/>Authentication"]
  UI --> API["Next.js<br/>Route Handlers"]
  UI --> RUNTIME["Sandpack / Pyodide<br/>Browser runtimes"]
  API --> DB["Neon PostgreSQL<br/>Drizzle ORM"]
  API --> SERVICES["OpenAI / Judge0 / Telegram<br/>External services"]
~~~

<a id="en-setup"></a>

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or newer
- npm
- A PostgreSQL database — [Neon](https://neon.tech/) is the intended provider
- A [Clerk](https://clerk.com/) application
- Optional credentials for OpenAI, Judge0, and Telegram, depending on the
  features you want to run

### 1. Clone and install

~~~bash
git clone https://github.com/yokirain123/codeground.git
cd codeground
npm install
~~~

### 2. Configure the environment

Create a <code>.env.local</code> file in the project root.

<details>
<summary><strong>Show the complete environment template</strong></summary>

~~~env
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
~~~

</details>

> [!CAUTION]
> Never commit <code>.env.local</code>. Keep server-side secrets out of
> variables prefixed with <code>NEXT_PUBLIC_</code>.

### 3. Prepare the database

The Drizzle schema is split across several modules:

~~~text
config/schema.ts
lib/friends/schema.ts
lib/notifications/schema.ts
lib/challenges/schema.ts
lib/labs/schema.ts
~~~

Make sure every module is included in the <code>schema</code> field of
<code>drizzle.config.ts</code>:

~~~ts
schema: [
  "./config/schema.ts",
  "./lib/friends/schema.ts",
  "./lib/notifications/schema.ts",
  "./lib/challenges/schema.ts",
  "./lib/labs/schema.ts",
],
~~~

Push the schema:

~~~bash
npx drizzle-kit push
~~~

### 4. Run CodeQuest

~~~bash
npm run dev
~~~

Open [http://localhost:3000](http://localhost:3000), create an account, and
sign in. CodeQuest will create the matching player profile automatically.

<a id="en-admin"></a>

## 🛡️ Admin setup

New accounts receive the <code>student</code> role. To unlock course management
and AI exercise generation, promote your account in PostgreSQL:

~~~sql
UPDATE users
SET role = 'admin'
WHERE email = 'you@example.com';
~~~

Then:

1. Open <code>/courses</code> and create a course.
2. Use a supported language name and the <code>Beginner</code> level to
   synchronize the built-in chapters.
3. Open <code>/admin/exercises</code> to generate missing content for one
   chapter or the entire course.

## 📜 Available scripts

| Command | Description |
| :--- | :--- |
| <code>npm run dev</code> | Start the local development server. |
| <code>npm run build</code> | Create a production build. |
| <code>npm run start</code> | Run the production server after building. |
| <code>npm run lint</code> | Run ESLint. |

<a id="en-structure"></a>

## 🗂️ Project structure

~~~text
app/
├── (routes)/               # Courses, dashboard, challenges, labs, resources
├── _components/            # Shared layout and home-page components
├── api/                    # Next.js route handlers
└── sandpack/               # Sandpack templates and theme
components/                 # Shared UI, auth, friends, and lab components
config/                     # Database, Clerk appearance, and core schema
context/                    # Client-side application context
lib/                        # Domain logic, validation, schemas, service clients
public/                     # Fonts, workers, lab artwork, and Pyodide assets
~~~

## 🤝 Development workflow

1. Create a focused branch:

   ~~~bash
   git switch -c feature/your-feature
   ~~~

2. Make your changes.
3. Run the project checks:

   ~~~bash
   npm run lint
   npm run build
   ~~~

4. Open a pull request with a clear description and screenshots for UI changes.

Bug reports and feature requests are welcome in
[GitHub Issues](https://github.com/yokirain123/codeground/issues).

<p align="right">
  <a href="#top">↑ Back to top</a>
  &nbsp;·&nbsp;
  <a href="#ukrainian">Українською ↓</a>
</p>

---

<a id="ukrainian"></a>

## 🇺🇦 Українська

<p align="center">
  <a href="#ua-overview">Про проєкт</a> ·
  <a href="#ua-features">Можливості</a> ·
  <a href="#ua-courses">Курси</a> ·
  <a href="#ua-stack">Технології</a> ·
  <a href="#ua-setup">Запуск</a> ·
  <a href="#ua-admin">Адмін</a> ·
  <a href="#ua-structure">Структура</a>
</p>

<table>
  <tr>
    <td>
      <strong>🚧 Стан проєкту</strong><br /><br />
      CodeQuest активно розвивається. Системи навчання, прогресу, друзів,
      челенджів і лабораторій уже реалізовані, а контент та інфраструктура
      розгортання продовжують удосконалюватися.
    </td>
  </tr>
</table>

<a id="ua-overview"></a>

## 🎮 Про проєкт

CodeQuest — це full-stack платформа для навчання програмуванню, яка перетворює
практику на RPG-пригоду. Гравці проходять структуровані навчальні шляхи,
виконують кодинг-квести, заробляють XP, відкривають досягнення, підтримують
серії активності та порівнюють свій прогрес у Hall of Heroes.

Проєкт поєднує зрозумілий для початківців контент, інтерактивні редактори,
ізольоване виконання коду, AI-підказки, соціальні функції та впізнаваний
піксельний інтерфейс.

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>📚 Навчайся через квести</strong><br /><br />
      Проходь послідовні глави та відкривай вправи крок за кроком.
    </td>
    <td width="50%" valign="top">
      <strong>⚔️ Пиши справжній код</strong><br /><br />
      Запускай проєкти, перевіряй результат і виправляй помилки.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>🏆 Розвивай свого героя</strong><br /><br />
      Заробляй XP, підтримуй серії активності та відкривай досягнення.
    </td>
    <td width="50%" valign="top">
      <strong>🤝 Приєднуйся до спільноти</strong><br /><br />
      Знаходь друзів, збирай команду та піднімайся в рейтингу.
    </td>
  </tr>
</table>

<a id="ua-features"></a>

## ✨ Можливості

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📚 Навчання та прогрес</h3>
      <ul>
        <li>Структуровані курси з главами, вправами, складністю та XP.</li>
        <li>Послідовне проходження й автоматичне відстеження завершення.</li>
        <li>Особиста панель зі статистикою, бейджами та серіями активності.</li>
        <li>Досягнення та рейтинг Hall of Heroes.</li>
        <li>Серверна перевірка й одноразові XP-нагороди.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>💻 Інтерактивне програмування</h3>
      <ul>
        <li>Шість режимів Playground для JavaScript, TypeScript і React.</li>
        <li>Sandpack-прев’ю для браузерних проєктів.</li>
        <li>Monaco-редактори для Python, C# і C++.</li>
        <li>Введення даних, консоль, діагностика та помилки виконання.</li>
        <li>Запуск Python, C#, C++17 і лабораторій через Judge0.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>⚔️ Челенджі та лабораторії</h3>
      <ul>
        <li>12 практичних завдань з HTML, CSS, React і Python.</li>
        <li>Щоденна ротація, фільтри, чернетки та нагороди.</li>
        <li>Git Sandbox і вісім місій Bug Hunt.</li>
        <li>AI-лабораторії Refactor Lab та Error Decoder.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🤝 Спільнота та матеріали</h3>
      <ul>
        <li>Пошук гравців, заявки в друзі, команди й публічні профілі.</li>
        <li>Англійський та український інтерфейс зі збереженням вибраної мови.</li>
        <li>Сповіщення про друзів, курси, досягнення та системні події.</li>
        <li>42 шаблони у шпаргалках для семи мов.</li>
        <li>A–Z глосарій із 66 термінами, FAQ із пошуком і контактна форма.</li>
      </ul>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <strong>🛡️ Адміністрування</strong><br /><br />
      Керування курсами за ролями, автоматична синхронізація програми,
      AI-генерація для окремої глави або всього курсу та перевірка
      структурованих відповідей через Zod перед записом у базу даних.
    </td>
  </tr>
</table>

### Лабораторії розробника

| Лабораторія | Що вона навчає |
| :--- | :--- |
| **Git Sandbox** | Чотири симульовані місії про коміти, гілки, revert і merge-конфлікти без ризику для справжнього репозиторію. |
| **Bug Hunt** | Вісім місій із пошуку помилок у JavaScript, Python, C# і C++. |
| **Refactor Lab** | AI-аналіз підтримуваності коду з покращеннями, які можна застосовувати окремо. |
| **Error Decoder** | Зрозуміле пояснення помилок для початківців і мінімальні точкові виправлення. |

<a id="ua-courses"></a>

## 📚 Вбудовані програми курсів

Репозиторій містить готові програми для шести навчальних напрямів початкового
рівня:

| Курс | Глави | Вправи |
| :--- | ---: | ---: |
| HTML Beginner | 12 | 36 |
| CSS Beginner | 10 | 50 |
| React Beginner | 13 | 65 |
| Python Beginner | 13 | 65 |
| C# Beginner | 13 | 65 |
| C++ Beginner | 13 | 65 |
| **Разом** | **74** | **346** |

Шаблон визначається за назвою, тегами та рівнем курсу. Щоб глави додалися
автоматично, курс має містити <code>Beginner</code> і назву мови, наприклад
<code>Python Beginner</code> або <code>C++ Beginner</code>.

<a id="ua-stack"></a>

## 🧰 Технології

| Частина проєкту | Технології |
| :--- | :--- |
| **Фреймворк** | Next.js 16 App Router, React 19, TypeScript 5 |
| **Стилізація** | Tailwind CSS 4, shadcn/ui, Motion, Lucide icons |
| **Авторизація** | Clerk |
| **База даних** | Neon PostgreSQL, Drizzle ORM |
| **Редактори** | Sandpack, CodeMirror, Monaco Editor |
| **Виконання коду** | Judge0, Pyodide |
| **AI-функції** | OpenAI Responses API, структуровані відповіді Zod |
| **Сповіщення в UI** | Sonner |

### Архітектура

~~~mermaid
flowchart TD
  UI["Next.js App Router<br/>Інтерфейс React 19"] --> AUTH["Clerk<br/>Авторизація"]
  UI --> API["Next.js<br/>Route Handlers"]
  UI --> RUNTIME["Sandpack / Pyodide<br/>Виконання в браузері"]
  API --> DB["Neon PostgreSQL<br/>Drizzle ORM"]
  API --> SERVICES["OpenAI / Judge0 / Telegram<br/>Зовнішні сервіси"]
~~~

<a id="ua-setup"></a>

## 🚀 Початок роботи

### Передумови

- [Node.js](https://nodejs.org/) версії 20.9 або новішої
- npm
- PostgreSQL база даних — рекомендований провайдер
  [Neon](https://neon.tech/)
- Застосунок у [Clerk](https://clerk.com/)
- За потреби — ключі OpenAI, Judge0 і Telegram для відповідних функцій

### 1. Клонування та встановлення

~~~bash
git clone https://github.com/yokirain123/codeground.git
cd codeground
npm install
~~~

### 2. Налаштування середовища

Створи файл <code>.env.local</code> у корені проєкту.

<details>
<summary><strong>Показати повний шаблон змінних середовища</strong></summary>

~~~env
# Clerk — обов’язково
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# PostgreSQL — обов’язково
DATABASE_URL=

# OpenAI — для AI-генерації, Refactor Lab та Error Decoder
OPENAI_API_KEY=
OPENAI_EXERCISE_MODEL=gpt-5-mini
OPENAI_VALIDATION_MODEL=gpt-5-mini
OPENAI_LABS_MODEL=gpt-5-mini

# Judge0 — для серверного виконання коду
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_AUTH_TOKEN=
JUDGE0_JAVASCRIPT_LANGUAGE_ID=
JUDGE0_PYTHON_LANGUAGE_ID=
JUDGE0_CSHARP_LANGUAGE_ID=
JUDGE0_CPP_LANGUAGE_ID=

# Необов’язкові RapidAPI-заголовки для хостингу Judge0
JUDGE0_RAPID_API_KEY=
JUDGE0_RAPID_API_HOST=

# Telegram — лише для контактної форми
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
~~~

</details>

> [!CAUTION]
> Не додавай <code>.env.local</code> у Git. Не передавай серверні секрети
> через змінні з префіксом <code>NEXT_PUBLIC_</code>.

### 3. Підготовка бази даних

Drizzle-схема розділена між кількома модулями:

~~~text
config/schema.ts
lib/friends/schema.ts
lib/notifications/schema.ts
lib/challenges/schema.ts
lib/labs/schema.ts
~~~

Переконайся, що всі модулі додані до поля <code>schema</code> у
<code>drizzle.config.ts</code>:

~~~ts
schema: [
  "./config/schema.ts",
  "./lib/friends/schema.ts",
  "./lib/notifications/schema.ts",
  "./lib/challenges/schema.ts",
  "./lib/labs/schema.ts",
],
~~~

Застосуй схему:

~~~bash
npx drizzle-kit push
~~~

### 4. Запуск CodeQuest

~~~bash
npm run dev
~~~

Відкрий [http://localhost:3000](http://localhost:3000), створи акаунт і увійди.
CodeQuest автоматично створить відповідний профіль гравця.

<a id="ua-admin"></a>

## 🛡️ Налаштування адміністратора

Нові акаунти отримують роль <code>student</code>. Щоб відкрити керування
курсами та AI-генерацію вправ, зміни роль свого акаунта в PostgreSQL:

~~~sql
UPDATE users
SET role = 'admin'
WHERE email = 'you@example.com';
~~~

Після цього:

1. Відкрий <code>/courses</code> і створи курс.
2. Використай підтримувану назву мови та рівень <code>Beginner</code>, щоб
   синхронізувати вбудовані глави.
3. Відкрий <code>/admin/exercises</code> і згенеруй відсутній контент для
   окремої глави або всього курсу.

## 📜 Доступні команди

| Команда | Опис |
| :--- | :--- |
| <code>npm run dev</code> | Запускає локальний сервер розробки. |
| <code>npm run build</code> | Створює production-збірку. |
| <code>npm run start</code> | Запускає зібраний production-сервер. |
| <code>npm run lint</code> | Запускає ESLint. |

<a id="ua-structure"></a>

## 🗂️ Структура проєкту

~~~text
app/
├── (routes)/               # Курси, панель, челенджі, лабораторії, матеріали
├── _components/            # Спільний макет і компоненти головної сторінки
├── api/                    # Обробники маршрутів Next.js
└── sandpack/               # Шаблони та тема Sandpack
components/                 # Спільний UI, авторизація, друзі та лабораторії
config/                     # База даних, оформлення Clerk та основна схема
context/                    # Клієнтський контекст застосунку
lib/                        # Бізнес-логіка, валідація, схеми та клієнти сервісів
public/                     # Шрифти, воркери, зображення та файли Pyodide
~~~

## 🤝 Робочий процес

1. Створи окрему гілку:

   ~~~bash
   git switch -c feature/your-feature
   ~~~

2. Внеси зміни.
3. Запусти перевірки:

   ~~~bash
   npm run lint
   npm run build
   ~~~

4. Створи pull request із чітким описом і скриншотами для UI-змін.

Повідомлення про баги та пропозиції можна залишати в
[GitHub Issues](https://github.com/yokirain123/codeground/issues).

<p align="right">
  <a href="#top">↑ На початок</a>
  &nbsp;·&nbsp;
  <a href="#english">English ↑</a>
</p>
