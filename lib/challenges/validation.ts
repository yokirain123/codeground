import "server-only";

import { getChallengeBySlug } from "./catalog";

interface ValidationRule {
  file?: string;
  pattern: RegExp;
  message: string;
}

interface ChallengeValidation {
  rules: ValidationRule[];
  outputRule?: {
    pattern: RegExp;
    message: string;
  };
  referenceFiles: Record<string, string>;
  referenceOutput?: string;
}

const CHALLENGE_VALIDATIONS: Record<string, ChallengeValidation> = {
  "accessible-profile-card": {
    rules: [
      {
        file: "index.html",
        pattern: /<article\b[^>]*>[\s\S]*<\/article>/i,
        message: "Keep the profile inside an article element.",
      },
      {
        file: "index.html",
        pattern: /<h1\b[^>]*>[\s\S]*?<\/h1>/i,
        message: "Add the player name as an h1 heading.",
      },
      {
        file: "index.html",
        pattern: /<img\b(?=[^>]*\balt\s*=\s*["'][^"']+["'])[^>]*>/i,
        message: "Add an image with meaningful alt text.",
      },
      {
        file: "index.html",
        pattern: /<a\b(?=[^>]*\bhref\s*=\s*["'][^"'#][^"']*["'])[^>]*>/i,
        message: "Add a link with a real href destination.",
      },
    ],
    referenceFiles: {
      "/index.html": `<article class="profile-card">
  <h1>Nova Byte</h1>
  <img src="avatar.png" alt="Nova Byte wearing a yellow explorer jacket" />
  <a href="/players/nova-byte">View profile</a>
</article>`,
    },
  },
  "semantic-blog-preview": {
    rules: [
      {
        file: "index.html",
        pattern: /<article\b[^>]*>[\s\S]*<\/article>/i,
        message: "Wrap the preview in an article element.",
      },
      {
        file: "index.html",
        pattern:
          /<header\b[^>]*>[\s\S]*<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>[\s\S]*?<\/header>/i,
        message: "Add an article header containing a heading.",
      },
      {
        file: "index.html",
        pattern: /<time\b(?=[^>]*\bdatetime\s*=\s*["'][^"']+["'])[^>]*>/i,
        message: "Add a time element with a datetime attribute.",
      },
      {
        file: "index.html",
        pattern: /<footer\b[^>]*>[\s\S]*?<\/footer>/i,
        message: "Add an article footer with author information.",
      },
    ],
    referenceFiles: {
      "/index.html": `<main>
  <article>
    <header>
      <h1>New quests have arrived</h1>
      <time datetime="2026-08-13">August 13, 2026</time>
    </header>
    <p>Open the quest board and choose your next challenge.</p>
    <footer>Written by the CodeQuest Guild</footer>
  </article>
</main>`,
    },
  },
  "registration-form-raid": {
    rules: [
      {
        file: "index.html",
        pattern: /<form\b[^>]*>[\s\S]*<\/form>/i,
        message: "Create a form element.",
      },
      {
        file: "index.html",
        pattern:
          /<label\b(?=[^>]*\bfor\s*=)[^>]*>[\s\S]*?<\/label>[\s\S]*<label\b(?=[^>]*\bfor\s*=)[^>]*>[\s\S]*?<\/label>/i,
        message: "Add connected visible labels for both fields.",
      },
      {
        file: "index.html",
        pattern:
          /<input\b(?=[^>]*\btype\s*=\s*["']email["'])(?=[^>]*\brequired\b)[^>]*>/i,
        message: "Use a required email input.",
      },
      {
        file: "index.html",
        pattern: /\brequired\b[\s\S]*\brequired\b/i,
        message: "Make both fields required.",
      },
      {
        file: "index.html",
        pattern: /<button\b(?=[^>]*\btype\s*=\s*["']submit["'])[^>]*>/i,
        message: "Add a submit button.",
      },
    ],
    referenceFiles: {
      "/index.html": `<main>
  <h1>Join the Guild</h1>
  <form>
    <label for="player-name">Player name</label>
    <input id="player-name" name="playerName" required />
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required />
    <button type="submit">Join</button>
  </form>
</main>`,
    },
  },
  "center-the-portal": {
    rules: [
      {
        file: "styles.css",
        pattern:
          /body\s*\{(?=[^}]*min-height\s*:\s*100(?:vh|svh))(?=[^}]*display\s*:\s*(?:flex|grid))(?:(?=[^}]*place-items\s*:\s*center)|(?=[^}]*justify-content\s*:\s*center)(?=[^}]*align-items\s*:\s*center))[^}]*\}/i,
        message:
          "Center the portal inside the full-height body with Grid or Flexbox.",
      },
    ],
    referenceFiles: {
      "/styles.css": `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.portal { width: 180px; }`,
    },
  },
  "responsive-quest-grid": {
    rules: [
      {
        file: "styles.css",
        pattern: /\.quest-grid\s*\{[^}]*display\s*:\s*grid/i,
        message: "Use display: grid on .quest-grid.",
      },
      {
        file: "styles.css",
        pattern: /grid-template-columns\s*:/i,
        message: "Define grid-template-columns.",
      },
      {
        file: "styles.css",
        pattern: /@media\s*\([^)]*(?:min|max)-width[^)]*\)\s*\{/i,
        message: "Add a responsive media query.",
      },
      {
        file: "styles.css",
        pattern: /(?:gap|column-gap|row-gap)\s*:/i,
        message: "Add visible spacing between the quest cards.",
      },
    ],
    referenceFiles: {
      "/styles.css": `.quest-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 800px) {
  .quest-grid { grid-template-columns: repeat(3, 1fr); }
}`,
    },
  },
  "adaptive-dashboard": {
    rules: [
      {
        file: "styles.css",
        pattern: /:root\s*\{[^}]*--[\w-]+\s*:/i,
        message: "Declare at least one custom property in :root.",
      },
      {
        file: "styles.css",
        pattern: /\.dashboard\s*\{[^}]*display\s*:\s*grid/i,
        message: "Use CSS Grid for .dashboard.",
      },
      {
        file: "styles.css",
        pattern: /grid-template-columns\s*:[^;}]*(?:repeat|minmax)\s*\(/i,
        message: "Use repeat() or minmax() for the dashboard columns.",
      },
      {
        file: "styles.css",
        pattern: /@media\s*\([^)]*(?:min|max)-width[^)]*\)\s*\{/i,
        message: "Add a media query for a layout adjustment.",
      },
    ],
    referenceFiles: {
      "/styles.css": `:root { --panel: #10152a; }

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.dashboard section { background: var(--panel); }

@media (min-width: 900px) {
  .dashboard { gap: 28px; }
}`,
    },
  },
  "quest-counter": {
    rules: [
      {
        file: "App.js",
        pattern:
          /const\s*\[\s*\w+\s*,\s*set[A-Z]\w*\s*\]\s*=\s*useState\s*\(\s*0\s*\)/,
        message: "Create numeric state with useState(0).",
      },
      {
        file: "App.js",
        pattern: /onClick\s*=\s*\{[\s\S]*?set[A-Z]\w*\s*\(/,
        message: "Call the state setter from the button onClick handler.",
      },
      {
        file: "App.js",
        pattern: /<strong\b[^>]*>\s*\{[^}]+\}\s*<\/strong>/i,
        message: "Display the current state value in the strong element.",
      },
    ],
    referenceFiles: {
      "/App.js": `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  return <main><strong>{count}</strong><button onClick={() => setCount((value) => value + 1)}>Complete quest</button></main>;
}`,
    },
  },
  "filter-the-inventory": {
    rules: [
      {
        file: "App.js",
        pattern: /const\s*\[\s*\w+\s*,\s*set[A-Z]\w*\s*\]\s*=\s*useState\s*\(/,
        message: "Store the search text with useState.",
      },
      {
        file: "App.js",
        pattern:
          /<input\b(?=[^>]*\bvalue\s*=\s*\{)(?=[^>]*\bonChange\s*=\s*\{)[^>]*>/i,
        message: "Make the search input controlled with value and onChange.",
      },
      {
        file: "App.js",
        pattern: /\.filter\s*\(/,
        message: "Filter the inventory based on the search text.",
      },
      {
        file: "App.js",
        pattern: /\.map\s*\(/,
        message: "Render the filtered result with map().",
      },
    ],
    referenceFiles: {
      "/App.js": `import { useState } from "react";
const inventory = ["Iron Sword", "Health Potion"];
export default function App() {
  const [query, setQuery] = useState("");
  const visibleItems = inventory.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return <main><input value={query} onChange={(event) => setQuery(event.target.value)} />{visibleItems.map((item) => <p key={item}>{item}</p>)}</main>;
}`,
    },
  },
  "interactive-quest-board": {
    rules: [
      {
        file: "App.js",
        pattern: /const\s*\[\s*\w+\s*,\s*set[A-Z]\w*\s*\]\s*=\s*useState\s*\(/,
        message: "Store the quest array in state.",
      },
      {
        file: "App.js",
        pattern: /\.filter\s*\(/,
        message: "Use filter() to derive visible quests.",
      },
      {
        file: "App.js",
        pattern: /\.map\s*\(/,
        message: "Render the visible quests with map().",
      },
      {
        file: "App.js",
        pattern: /onClick\s*=\s*\{[\s\S]*?set[A-Z]\w*\s*\(/,
        message: "Update quest state from an onClick handler.",
      },
    ],
    referenceFiles: {
      "/App.js": `import { useState } from "react";
const starterQuests = [{ id: 1, title: "Learn JSX", completed: false }];
export default function App() {
  const [quests, setQuests] = useState(starterQuests);
  const [filter, setFilter] = useState("all");
  const visibleQuests = quests.filter((quest) => filter === "all" || quest.completed);
  return <main><button onClick={() => setFilter("completed")}>Completed</button>{visibleQuests.map((quest) => <button key={quest.id} onClick={() => setQuests((items) => items.map((item) => item.id === quest.id ? { ...item, completed: true } : item))}>{quest.title}</button>)}</main>;
}`,
    },
  },
  "even-or-odd": {
    rules: [
      {
        file: "main.py",
        pattern: /input\s*\(/,
        message: "Read a value with input().",
      },
      {
        file: "main.py",
        pattern: /int\s*\(/,
        message: "Convert the input to an integer.",
      },
      {
        file: "main.py",
        pattern: /%\s*2/,
        message: "Use the modulo operator with 2.",
      },
      {
        file: "main.py",
        pattern: /\bif\b[\s\S]*\belse\b/,
        message: "Use an if/else conditional.",
      },
      {
        file: "main.py",
        pattern: /print\s*\(/,
        message: "Print the result.",
      },
    ],
    outputRule: {
      pattern: /^\s*(?:Even|Odd)\s*$/i,
      message: "Run the current code and produce exactly Even or Odd.",
    },
    referenceFiles: {
      "/main.py": `number = int(input())
if number % 2 == 0:
    print("Even")
else:
    print("Odd")`,
    },
    referenceOutput: "Odd",
  },
  "count-the-words": {
    rules: [
      {
        file: "main.py",
        pattern: /input\s*\(/,
        message: "Read a sentence with input().",
      },
      {
        file: "main.py",
        pattern: /\.split\s*\(/,
        message: "Split the sentence into words.",
      },
      {
        file: "main.py",
        pattern: /len\s*\(/,
        message: "Count the resulting list with len().",
      },
      {
        file: "main.py",
        pattern: /print\s*\(/,
        message: "Print the numeric result.",
      },
    ],
    outputRule: {
      pattern: /^\s*\d+\s*$/,
      message: "Run the current code and print only the numeric word count.",
    },
    referenceFiles: {
      "/main.py": `words = input().split()
print(len(words))`,
    },
    referenceOutput: "4",
  },
  "inventory-value-report": {
    rules: [
      {
        file: "main.py",
        pattern: /inventory\s*=\s*\{/,
        message: "Keep the inventory in a dictionary.",
      },
      {
        file: "main.py",
        pattern: /(?:\bfor\b[\s\S]*\bin\b|\bsum\s*\()/,
        message: "Process the inventory with a loop, comprehension or sum().",
      },
      {
        file: "main.py",
        pattern: /(?:\.items\s*\(|\.values\s*\()/,
        message: "Read values from the inventory dictionary.",
      },
      {
        file: "main.py",
        pattern: /print\s*\(/,
        message: "Print the final total.",
      },
    ],
    outputRule: {
      pattern: /\b145\b/,
      message: "The finished program should calculate a total value of 145.",
    },
    referenceFiles: {
      "/main.py": `inventory = {
    "potion": {"quantity": 3, "price": 15},
    "torch": {"quantity": 5, "price": 4},
    "moon_key": {"quantity": 1, "price": 80},
}
total = sum(item["quantity"] * item["price"] for item in inventory.values())
print(f"Total inventory value: {total}")`,
    },
    referenceOutput: "Total inventory value: 145",
  },
};

function normalizeFilename(filename: string) {
  return filename.trim().replaceAll("\\", "/").replace(/^\/+/, "");
}

function normalizeFiles(files: Record<string, unknown>) {
  const normalized: Record<string, string> = {};

  for (const [rawFilename, rawCode] of Object.entries(files)) {
    const filename = normalizeFilename(rawFilename);

    if (!filename || typeof rawCode !== "string") {
      continue;
    }

    normalized[filename] = rawCode;
  }

  return normalized;
}

function runRules(
  validation: ChallengeValidation,
  files: Record<string, string>,
  executionOutput: string,
) {
  const combinedCode = Object.entries(files)
    .map(([filename, code]) => `/* FILE: ${filename} */\n${code}`)
    .join("\n\n");

  const errors: string[] = [];

  for (const rule of validation.rules) {
    const target = rule.file
      ? (files[normalizeFilename(rule.file)] ?? "")
      : combinedCode;

    rule.pattern.lastIndex = 0;

    if (!rule.pattern.test(target)) {
      errors.push(rule.message);
    }
  }

  if (validation.outputRule) {
    validation.outputRule.pattern.lastIndex = 0;

    if (!validation.outputRule.pattern.test(executionOutput.trim())) {
      errors.push(validation.outputRule.message);
    }
  }

  return errors;
}

export function validateChallengeSubmission(
  slug: string,
  rawFiles: Record<string, unknown>,
  executionOutput = "",
) {
  const challenge = getChallengeBySlug(slug);
  const validation = CHALLENGE_VALIDATIONS[slug];

  if (!challenge || !validation) {
    return {
      valid: false,
      errors: ["Challenge validation is not configured."],
    };
  }

  const files = normalizeFiles(rawFiles);
  const entries = Object.entries(files);

  if (entries.length === 0 || entries.length > 10) {
    return {
      valid: false,
      errors: ["Submit between 1 and 10 code files."],
    };
  }

  if (entries.some(([, code]) => code.length > 100_000)) {
    return {
      valid: false,
      errors: ["One of the submitted files is too large."],
    };
  }

  const errors = runRules(validation, files, executionOutput);

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateChallengeReferences() {
  return Object.entries(CHALLENGE_VALIDATIONS).flatMap(([slug, validation]) => {
    const files = normalizeFiles(validation.referenceFiles);
    const errors = runRules(
      validation,
      files,
      validation.referenceOutput ?? "",
    );

    return errors.map((error) => `${slug}: ${error}`);
  });
}
