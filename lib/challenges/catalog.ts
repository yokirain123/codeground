import type { ChallengeDefinition, ChallengeSummary } from "./types";

export const CHALLENGES: readonly ChallengeDefinition[] = [
  {
    slug: "accessible-profile-card",
    title: "Accessible Profile Card",
    description:
      "Build a semantic profile card that works for keyboard and screen-reader users.",
    language: "HTML",
    difficulty: "easy",
    environment: "html",
    xp: 40,
    estimatedMinutes: 10,
    tags: ["semantic HTML", "accessibility", "links"],
    learn: `
      <p>Semantic elements describe the purpose of your content, not only its appearance.</p>
      <p>An <code>&lt;article&gt;</code> can stand on its own, useful images need meaningful <code>alt</code> text, and links need a real destination.</p>
    `,
    task: `
      <p>Complete the player profile card using semantic HTML.</p>
      <p>The finished card must introduce the player, show an accessible avatar, and provide a working profile link.</p>
    `,
    requirements: [
      "Keep the card inside an <article> element.",
      "Add the player name as an <h1> heading.",
      "Add an image with meaningful alt text.",
      "Add a link with a real href destination.",
    ],
    hint: "Start with the heading, then add the image and link inside the existing article.",
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Player Profile</title>
  </head>
  <body>
    <article class="profile-card">
      <!-- TODO: Add the player name, avatar and profile link. -->
    </article>
  </body>
</html>`,
    },
  },
  {
    slug: "semantic-blog-preview",
    title: "Semantic Blog Preview",
    description:
      "Structure a compact article preview with meaningful document landmarks.",
    language: "HTML",
    difficulty: "medium",
    environment: "html",
    xp: 65,
    estimatedMinutes: 15,
    tags: ["article", "time", "document structure"],
    learn: `
      <p>A clear document outline helps browsers and assistive technology understand how content is connected.</p>
      <p>Use <code>&lt;header&gt;</code> for introductory content, <code>&lt;time&gt;</code> for machine-readable dates, and <code>&lt;footer&gt;</code> for article metadata.</p>
    `,
    task: `
      <p>Turn the starter markup into a semantic preview for a CodeQuest news article.</p>
    `,
    requirements: [
      "Wrap the preview in an <article>.",
      "Add an article <header> with a heading.",
      "Include a <time> element with a datetime attribute.",
      "Add an article <footer> containing author information.",
    ],
    hint: "The header and footer belong inside the article. Put the visible date inside the time element.",
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quest News</title>
  </head>
  <body>
    <main>
      <!-- TODO: Build the semantic article preview here. -->
    </main>
  </body>
</html>`,
    },
  },
  {
    slug: "registration-form-raid",
    title: "Registration Form Raid",
    description:
      "Create an accessible registration form with labels and browser validation.",
    language: "HTML",
    difficulty: "hard",
    environment: "html",
    xp: 100,
    estimatedMinutes: 25,
    tags: ["forms", "validation", "accessibility"],
    learn: `
      <p>Every form control should have a label, and native input types give users better keyboards and built-in validation.</p>
      <p>The <code>required</code> attribute prevents an empty submission without writing JavaScript.</p>
    `,
    task: `
      <p>Build a small guild-registration form that collects a name and email address.</p>
    `,
    requirements: [
      "Create a <form> element.",
      "Connect visible labels to both inputs.",
      "Use an email input and make both fields required.",
      "Add a submit button.",
    ],
    hint: 'Match each label\'s for value with its input id. Use type="email" for the email field.',
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Join the Guild</title>
  </head>
  <body>
    <main>
      <h1>Join the Guild</h1>
      <!-- TODO: Add the accessible registration form. -->
    </main>
  </body>
</html>`,
    },
  },
  {
    slug: "center-the-portal",
    title: "Center the Portal",
    description:
      "Use modern CSS layout tools to center a portal on the screen.",
    language: "CSS",
    difficulty: "easy",
    environment: "css",
    xp: 40,
    estimatedMinutes: 10,
    tags: ["flexbox", "grid", "centering"],
    learn: `
      <p>Flexbox and Grid can center content without margins or absolute positioning.</p>
      <p>With Grid, <code>place-items: center</code> handles both axes. With Flexbox, combine <code>justify-content</code> and <code>align-items</code>.</p>
    `,
    task: `
      <p>Center the portal horizontally and vertically inside the full viewport.</p>
    `,
    requirements: [
      "Give the body at least the full viewport height.",
      "Use either Flexbox or Grid.",
      "Center the portal on both axes.",
    ],
    hint: "Try display: grid with place-items: center, or use the equivalent Flexbox properties.",
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="styles.css" />
    <title>Portal</title>
  </head>
  <body>
    <div class="portal">ENTER</div>
  </body>
</html>`,
      "/styles.css": `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #07080c;
  /* TODO: Center the portal on both axes. */
}

.portal {
  display: grid;
  width: 180px;
  aspect-ratio: 1;
  place-items: center;
  border: 4px solid #ffd400;
  border-radius: 50%;
  color: #ffd400;
  font: 700 24px monospace;
}`,
    },
  },
  {
    slug: "responsive-quest-grid",
    title: "Responsive Quest Grid",
    description:
      "Turn a vertical quest list into a responsive CSS Grid layout.",
    language: "CSS",
    difficulty: "medium",
    environment: "css",
    xp: 65,
    estimatedMinutes: 15,
    tags: ["grid", "responsive design", "media queries"],
    learn: `
      <p>CSS Grid defines columns with <code>grid-template-columns</code>. A media query can change that structure when more screen space becomes available.</p>
    `,
    task: `
      <p>Create a one-column quest grid on small screens and at least three columns on larger screens.</p>
    `,
    requirements: [
      "Use display: grid on .quest-grid.",
      "Define grid-template-columns.",
      "Add a media query that changes the columns for larger screens.",
      "Keep visible spacing between cards.",
    ],
    hint: "Start mobile-first with one column, then redefine grid-template-columns inside @media (min-width: ...).",
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="styles.css" />
    <title>Quest Grid</title>
  </head>
  <body>
    <main class="quest-grid">
      <article>HTML Quest</article>
      <article>CSS Quest</article>
      <article>React Quest</article>
      <article>Python Quest</article>
    </main>
  </body>
</html>`,
      "/styles.css": `body {
  margin: 0;
  padding: 24px;
  background: #07080c;
  color: white;
}

.quest-grid {
  /* TODO: Create the responsive grid. */
}

.quest-grid article {
  border: 2px solid #899dff;
  background: #10152a;
  padding: 24px;
}`,
    },
  },
  {
    slug: "adaptive-dashboard",
    title: "Adaptive Dashboard",
    description:
      "Build a fluid dashboard using Grid, custom properties and responsive rules.",
    language: "CSS",
    difficulty: "hard",
    environment: "css",
    xp: 100,
    estimatedMinutes: 30,
    tags: ["CSS variables", "grid", "fluid layout"],
    learn: `
      <p>Custom properties keep a visual system consistent, while <code>repeat()</code> and <code>minmax()</code> let Grid adapt without hardcoding every screen size.</p>
    `,
    task: `
      <p>Style the dashboard as an adaptive card grid with reusable theme values and a responsive breakpoint.</p>
    `,
    requirements: [
      "Declare at least one custom property in :root.",
      "Use CSS Grid for .dashboard.",
      "Use repeat() or minmax() when defining columns.",
      "Add a media query for a layout adjustment.",
    ],
    hint: "Put colors or spacing in :root, then use repeat(auto-fit, minmax(...)) for the dashboard columns.",
    starterCode: {
      "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="styles.css" />
    <title>Player Dashboard</title>
  </head>
  <body>
    <main class="dashboard">
      <section>Level 12</section>
      <section>1,450 XP</section>
      <section>7 Day Streak</section>
      <section>18 Quests</section>
    </main>
  </body>
</html>`,
      "/styles.css": `/* TODO: Add theme variables and build the adaptive grid. */

body {
  margin: 0;
  min-height: 100vh;
  padding: 24px;
  background: #07080c;
  color: white;
}

.dashboard section {
  border: 2px solid #899dff;
  padding: 24px;
}`,
    },
  },
  {
    slug: "quest-counter",
    title: "Quest Counter",
    description:
      "Create a React counter that tracks completed quests with component state.",
    language: "React",
    difficulty: "easy",
    environment: "react",
    xp: 40,
    estimatedMinutes: 10,
    tags: ["useState", "events", "JSX"],
    learn: `
      <p>The <code>useState</code> Hook stores a value between renders. Calling its setter updates the value and renders the component again.</p>
    `,
    task: `
      <p>Make the button increase the completed-quest counter by one each time it is clicked.</p>
    `,
    requirements: [
      "Create count state with useState.",
      "Display the current count in the interface.",
      "Add a button with an onClick handler.",
      "Use the state setter to increase the count.",
    ],
    hint: "Store the number with useState(0), then call the setter from the button's onClick handler.",
    starterCode: {
      "/App.js": `import { useState } from "react";
import "./styles.css";

export default function App() {
  // TODO: Create count state and make the button increase it.

  return (
    <main className="counter-card">
      <p>Quests completed</p>
      <strong>0</strong>
      <button type="button">Complete quest</button>
    </main>
  );
}`,
      "/styles.css": `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #07080c;
  color: white;
  font-family: system-ui, sans-serif;
}

.counter-card {
  width: min(320px, 90vw);
  border: 2px solid #899dff;
  background: #10152a;
  padding: 32px;
  text-align: center;
}

strong {
  display: block;
  margin: 12px;
  color: #ffd400;
  font-size: 48px;
}

button {
  border: 0;
  background: #ffd400;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}`,
    },
  },
  {
    slug: "filter-the-inventory",
    title: "Filter the Inventory",
    description:
      "Build a searchable React inventory using state, filter and map.",
    language: "React",
    difficulty: "medium",
    environment: "react",
    xp: 65,
    estimatedMinutes: 20,
    tags: ["lists", "filter", "controlled input"],
    learn: `
      <p>A controlled input stores its value in state. You can derive a visible list by calling <code>filter()</code>, then render the result with <code>map()</code>.</p>
    `,
    task: `
      <p>Connect the search field and show only inventory items whose names contain the search text.</p>
    `,
    requirements: [
      "Store the search text with useState.",
      "Make the input controlled with value and onChange.",
      "Filter the inventory based on the search text.",
      "Render the filtered items with map().",
    ],
    hint: "Convert both strings to lowercase before using includes(), then map over the filtered array.",
    starterCode: {
      "/App.js": `import { useState } from "react";
import "./styles.css";

const inventory = ["Iron Sword", "Health Potion", "Moon Key", "Torch"];

export default function App() {
  // TODO: Add search state and create the filtered list.

  return (
    <main>
      <h1>Inventory</h1>
      <input placeholder="Search items" />
      <ul>
        {inventory.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}`,
      "/styles.css": `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #07080c;
  color: white;
  font-family: system-ui, sans-serif;
}

main {
  width: min(420px, 90vw);
  border: 2px solid #899dff;
  background: #10152a;
  padding: 28px;
}

input {
  width: 100%;
  padding: 10px;
}

li {
  margin-top: 8px;
}`,
    },
  },
  {
    slug: "interactive-quest-board",
    title: "Interactive Quest Board",
    description:
      "Manage and filter quest completion state in a React interface.",
    language: "React",
    difficulty: "hard",
    environment: "react",
    xp: 100,
    estimatedMinutes: 30,
    tags: ["state updates", "derived data", "components"],
    learn: `
      <p>Complex interfaces often store an array of objects in state. Update one object by mapping the array and returning a changed copy for the selected item.</p>
    `,
    task: `
      <p>Let the player complete quests and switch between all, active and completed quests.</p>
    `,
    requirements: [
      "Store the quest array in state.",
      "Render quests with map().",
      "Update a quest from an onClick handler.",
      "Use filter() to support at least two visible states.",
    ],
    hint: "Keep both quests and the active filter in state. Derive visibleQuests before returning the JSX.",
    starterCode: {
      "/App.js": `import { useState } from "react";
import "./styles.css";

const starterQuests = [
  { id: 1, title: "Learn JSX", completed: true },
  { id: 2, title: "Master state", completed: false },
  { id: 3, title: "Defeat the final bug", completed: false },
];

export default function App() {
  // TODO: Add quest state, filtering and completion controls.

  return (
    <main>
      <h1>Quest Board</h1>
      <p>Build the interactive board here.</p>
    </main>
  );
}`,
      "/styles.css": `body {
  margin: 0;
  min-height: 100vh;
  background: #07080c;
  color: white;
  font-family: system-ui, sans-serif;
}

main {
  width: min(680px, 92vw);
  margin: 40px auto;
}

button {
  cursor: pointer;
}`,
    },
  },
  {
    slug: "even-or-odd",
    title: "Even or Odd",
    description:
      "Read a number and use a conditional to identify whether it is even or odd.",
    language: "Python",
    difficulty: "easy",
    environment: "python",
    xp: 40,
    estimatedMinutes: 10,
    tags: ["input", "conditionals", "modulo"],
    learn: `
      <p>The modulo operator <code>%</code> returns the remainder after division. An even number has a remainder of zero when divided by two.</p>
    `,
    task: `
      <p>Read one integer and print <code>Even</code> or <code>Odd</code>.</p>
    `,
    requirements: [
      "Read a value with input().",
      "Convert the value to an integer.",
      "Use the modulo operator with 2.",
      "Print exactly Even or Odd for the entered number.",
    ],
    hint: "Compare number % 2 with zero inside an if statement.",
    exampleOutput: "Input: 7\nOutput: Odd",
    starterCode: {
      "/main.py": `# TODO: Read an integer and print whether it is Even or Odd.
`,
    },
  },
  {
    slug: "count-the-words",
    title: "Count the Words",
    description:
      "Split a sentence into words and report how many words it contains.",
    language: "Python",
    difficulty: "medium",
    environment: "python",
    xp: 65,
    estimatedMinutes: 15,
    tags: ["strings", "split", "len"],
    learn: `
      <p><code>split()</code> breaks a string into a list of words. <code>len()</code> then reports how many items are in that list.</p>
    `,
    task: `
      <p>Read a sentence and print the number of words it contains.</p>
    `,
    requirements: [
      "Read the sentence with input().",
      "Split the sentence into words.",
      "Count the resulting list.",
      "Print the numeric result.",
    ],
    hint: "Save input().split() in a variable, then pass it to len().",
    exampleOutput: "Input: Code quests are fun\nOutput: 4",
    starterCode: {
      "/main.py": `# TODO: Read a sentence and print its word count.
`,
    },
  },
  {
    slug: "inventory-value-report",
    title: "Inventory Value Report",
    description:
      "Calculate the total value of an inventory stored in a dictionary.",
    language: "Python",
    difficulty: "hard",
    environment: "python",
    xp: 100,
    estimatedMinutes: 25,
    tags: ["dictionaries", "loops", "aggregation"],
    learn: `
      <p>A dictionary connects keys to values. Iterate over <code>items()</code> when you need both parts, and accumulate a result as the loop runs.</p>
    `,
    task: `
      <p>Calculate and print the combined gold value of every inventory item.</p>
    `,
    requirements: [
      "Keep the inventory data in a dictionary.",
      "Process the dictionary values with a loop, comprehension or sum().",
      "Store or calculate the total value.",
      "Print the final numeric total.",
    ],
    hint: "Each value contains quantity and price. Multiply them, then add the results together.",
    exampleOutput: "Total inventory value: 145",
    starterCode: {
      "/main.py": `inventory = {
    "potion": {"quantity": 3, "price": 15},
    "torch": {"quantity": 5, "price": 4},
    "moon_key": {"quantity": 1, "price": 80},
}

# TODO: Calculate and print the total inventory value.
`,
    },
  },
] as const;

const challengeBySlug = new Map(
  CHALLENGES.map((challenge) => [challenge.slug, challenge]),
);

export function getChallengeBySlug(slug: string) {
  return challengeBySlug.get(slug);
}

export function getChallengeSummaries(): ChallengeSummary[] {
  return CHALLENGES.map(
    ({
      slug,
      title,
      description,
      language,
      difficulty,
      xp,
      estimatedMinutes,
      tags,
    }) => ({
      slug,
      title,
      description,
      language,
      difficulty,
      xp,
      estimatedMinutes,
      tags: [...tags],
    }),
  );
}
