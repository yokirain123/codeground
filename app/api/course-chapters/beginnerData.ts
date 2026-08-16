import {
  DATA as HTML_DATA,
  type ChapterSeed,
} from "@/app/api/course-chapters/data";
import { CPP_DATA } from "@/app/api/course-chapters/cppData";
import { CSHARP_DATA } from "@/app/api/course-chapters/csharpData";

const exercise = (
  name: string,
  slug: string,
  xp: number,
  difficulty: "easy" | "medium" | "hard",
) => ({ name, slug, xp, difficulty });

export const CSS_DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "CSS Foundations",
    desc: "Connect stylesheets, write valid rules, and target page elements with practical selectors.",
    exercises: [
      exercise("Connect the Stylesheet", "connect-the-stylesheet", 20, "easy"),
      exercise("Color the Heading", "color-the-heading", 20, "easy"),
      exercise("Class Selector Power", "class-selector-power", 25, "easy"),
      exercise("Unique Hero ID", "unique-hero-id", 30, "easy"),
      exercise("Selector Combo", "selector-combo", 40, "medium"),
    ],
  },
  {
    id: 2,
    name: "Cascade, Inheritance & Specificity",
    desc: "Predict which declaration wins by understanding source order, inheritance, and selector specificity.",
    exercises: [
      exercise("Follow Source Order", "follow-source-order", 25, "easy"),
      exercise("Inherit the Theme", "inherit-the-theme", 30, "easy"),
      exercise("Win the Cascade", "win-the-cascade", 35, "medium"),
      exercise("Specificity Showdown", "specificity-showdown", 40, "medium"),
      exercise("Refactor the Override", "refactor-the-override", 50, "hard"),
    ],
  },
  {
    id: 3,
    name: "Colors, Units & Backgrounds",
    desc: "Build flexible visual systems with color formats, relative units, backgrounds, and gradients.",
    exercises: [
      exercise("Color Palette Quest", "color-palette-quest", 25, "easy"),
      exercise("Alpha Overlay", "alpha-overlay", 30, "easy"),
      exercise("Rem Unit Upgrade", "rem-unit-upgrade", 35, "medium"),
      exercise(
        "Fluid Percentage Panel",
        "fluid-percentage-panel",
        40,
        "medium",
      ),
      exercise("Gradient Hero", "gradient-hero", 50, "medium"),
    ],
  },
  {
    id: 4,
    name: "Typography & Readability",
    desc: "Create readable interfaces using font stacks, scale, spacing, alignment, and text decoration.",
    exercises: [
      exercise("Choose a Font Stack", "choose-a-font-stack", 25, "easy"),
      exercise("Readable Type Scale", "readable-type-scale", 30, "easy"),
      exercise(
        "Comfortable Line Height",
        "comfortable-line-height",
        35,
        "medium",
      ),
      exercise("Style the Quest Copy", "style-the-quest-copy", 40, "medium"),
      exercise("Responsive Hero Type", "responsive-hero-type", 50, "hard"),
    ],
  },
  {
    id: 5,
    name: "The Box Model & Sizing",
    desc: "Control content, padding, borders, margins, dimensions, and predictable element sizing.",
    exercises: [
      exercise("Build a Loot Box", "build-a-loot-box", 25, "easy"),
      exercise("Pad the Profile", "pad-the-profile", 25, "easy"),
      exercise("Separate the Cards", "separate-the-cards", 30, "easy"),
      exercise("Predictable Sizing", "predictable-sizing", 40, "medium"),
      exercise(
        "Profile Card Dimensions",
        "profile-card-dimensions",
        45,
        "medium",
      ),
    ],
  },
  {
    id: 6,
    name: "Display, Positioning & Overflow",
    desc: "Control layout participation, offsets, stacking, sticky elements, and overflowing content.",
    exercises: [
      exercise("Block and Inline", "block-and-inline", 30, "easy"),
      exercise("Relative Badge", "relative-badge", 35, "medium"),
      exercise("Absolute Notification", "absolute-notification", 40, "medium"),
      exercise("Sticky Quest Header", "sticky-quest-header", 45, "medium"),
      exercise("Layered Modal", "layered-modal", 55, "hard"),
    ],
  },
  {
    id: 7,
    name: "Flexbox Layouts",
    desc: "Arrange, align, distribute, and wrap interface elements with Flexbox.",
    exercises: [
      exercise("Flex Quest Row", "flex-quest-row", 30, "easy"),
      exercise("Switch the Main Axis", "switch-the-main-axis", 35, "easy"),
      exercise("Center the Portal", "center-the-portal", 35, "easy"),
      exercise("Space the Party", "space-the-party", 40, "medium"),
      exercise("Wrapping Inventory", "wrapping-inventory", 50, "medium"),
    ],
  },
  {
    id: 8,
    name: "CSS Grid Layouts",
    desc: "Create two-dimensional page and card layouts using tracks, gaps, and spanning.",
    exercises: [
      exercise("Achievement Grid", "achievement-grid", 35, "easy"),
      exercise("Inventory Columns", "inventory-columns", 40, "medium"),
      exercise("Auto Fit Gallery", "auto-fit-gallery", 45, "medium"),
      exercise("Featured Card Span", "featured-card-span", 50, "medium"),
      exercise("Dashboard Layout", "dashboard-layout", 60, "hard"),
    ],
  },
  {
    id: 9,
    name: "Responsive & Accessible UI",
    desc: "Adapt layouts to different screens and preserve keyboard, focus, and motion accessibility.",
    exercises: [
      exercise("Mobile Stack", "mobile-stack", 45, "medium"),
      exercise("Responsive Navigation", "responsive-navigation", 55, "medium"),
      exercise("Fluid Card Grid", "fluid-card-grid", 55, "medium"),
      exercise(
        "Visible Keyboard Focus",
        "visible-keyboard-focus",
        45,
        "medium",
      ),
      exercise("Respect Reduced Motion", "respect-reduced-motion", 60, "hard"),
    ],
  },
  {
    id: 10,
    name: "Interactions, Variables & Final Project",
    desc: "Use states, transitions, transforms, and custom properties to build a polished final interface.",
    exercises: [
      exercise("Interactive Button", "interactive-button", 30, "easy"),
      exercise(
        "Smooth Card Transition",
        "smooth-card-transition",
        40,
        "medium",
      ),
      exercise("Transform the Badge", "transform-the-badge", 45, "medium"),
      exercise(
        "Theme with CSS Variables",
        "theme-with-css-variables",
        55,
        "medium",
      ),
      exercise(
        "Final Responsive Quest Page",
        "final-responsive-quest-page",
        90,
        "hard",
      ),
    ],
  },
];

export const REACT_DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "React & JSX Foundations",
    desc: "Understand React's component model and describe interfaces using JSX expressions and attributes.",
    exercises: [
      exercise("Render the First App", "render-the-first-app", 20, "easy"),
      exercise("Create a JSX Element", "create-a-jsx-element", 20, "easy"),
      exercise("JSX Attribute Quest", "jsx-attribute-quest", 25, "easy"),
      exercise("Embed JavaScript", "embed-javascript", 30, "easy"),
      exercise("Fragment the Layout", "fragment-the-layout", 35, "medium"),
    ],
  },
  {
    id: 2,
    name: "Components & Imports",
    desc: "Split an interface into focused function components and connect them with imports and exports.",
    exercises: [
      exercise("Your First Component", "your-first-component", 25, "easy"),
      exercise(
        "Name Components Correctly",
        "name-components-correctly",
        25,
        "easy",
      ),
      exercise("Split the Interface", "split-the-interface", 35, "medium"),
      exercise(
        "Export the Player Card",
        "export-the-player-card",
        35,
        "medium",
      ),
      exercise(
        "Assemble the Dashboard",
        "assemble-the-dashboard",
        45,
        "medium",
      ),
    ],
  },
  {
    id: 3,
    name: "Props & Reusable Components",
    desc: "Pass data into components and design reusable interfaces with clear, predictable props.",
    exercises: [
      exercise("Pass a Quest Prop", "pass-a-quest-prop", 25, "easy"),
      exercise("Multiple Player Props", "multiple-player-props", 30, "easy"),
      exercise("Default Badge Value", "default-badge-value", 35, "medium"),
      exercise("Reusable Quest Card", "reusable-quest-card", 45, "medium"),
      exercise(
        "Configure the Action Button",
        "configure-the-action-button",
        50,
        "medium",
      ),
    ],
  },
  {
    id: 4,
    name: "Composition & Children",
    desc: "Combine small components, pass nested content, and design flexible interface containers.",
    exercises: [
      exercise("Nest the Player Badge", "nest-the-player-badge", 30, "easy"),
      exercise("Panel Children", "panel-children", 35, "medium"),
      exercise("Compose the Profile", "compose-the-profile", 40, "medium"),
      exercise("Reusable Panel", "reusable-panel", 45, "medium"),
      exercise("Card Layout API", "card-layout-api", 55, "hard"),
    ],
  },
  {
    id: 5,
    name: "Lists & Conditional Rendering",
    desc: "Render collections with stable keys and show different interfaces from application data.",
    exercises: [
      exercise("Render a Quest List", "render-a-quest-list", 30, "easy"),
      exercise("Stable Item Keys", "stable-item-keys", 35, "medium"),
      exercise("Empty State", "empty-state", 30, "easy"),
      exercise(
        "Conditional Rank Badge",
        "conditional-rank-badge",
        40,
        "medium",
      ),
      exercise("Filtered Inventory", "filtered-inventory", 50, "medium"),
    ],
  },
  {
    id: 6,
    name: "Events & User Interaction",
    desc: "Respond to clicks, input, keyboard actions, and form events using React event handlers.",
    exercises: [
      exercise("Handle the Click", "handle-the-click", 30, "easy"),
      exercise("Pass an Event Handler", "pass-an-event-handler", 35, "easy"),
      exercise("Read the Input Event", "read-the-input-event", 40, "medium"),
      exercise("Keyboard Shortcut", "keyboard-shortcut", 45, "medium"),
      exercise("Stop the Form Reload", "stop-the-form-reload", 45, "medium"),
    ],
  },
  {
    id: 7,
    name: "State Fundamentals",
    desc: "Store changing values with useState and update the interface from previous state safely.",
    exercises: [
      exercise("XP Counter", "xp-counter", 40, "medium"),
      exercise("Toggle the Hint", "toggle-the-hint", 40, "medium"),
      exercise(
        "Choose a Character Class",
        "choose-a-character-class",
        40,
        "medium",
      ),
      exercise(
        "Functional Counter Update",
        "functional-counter-update",
        50,
        "medium",
      ),
      exercise("Reset the Quest State", "reset-the-quest-state", 50, "medium"),
    ],
  },
  {
    id: 8,
    name: "Objects & Arrays in State",
    desc: "Update nested state without mutation and build interactive collections of application data.",
    exercises: [
      exercise("Update an Object", "update-an-object", 45, "medium"),
      exercise("Add an Inventory Item", "add-an-inventory-item", 45, "medium"),
      exercise(
        "Remove a Completed Quest",
        "remove-a-completed-quest",
        50,
        "medium",
      ),
      exercise("Edit a Party Member", "edit-a-party-member", 55, "hard"),
      exercise("Inventory State", "inventory-state", 65, "hard"),
    ],
  },
  {
    id: 9,
    name: "Forms & Controlled Inputs",
    desc: "Read, validate, and submit text, select, checkbox, and multi-field input using React state.",
    exercises: [
      exercise("Controlled Player Name", "controlled-player-name", 35, "easy"),
      exercise(
        "Character Class Select",
        "character-class-select",
        40,
        "medium",
      ),
      exercise(
        "Accept the Quest Checkbox",
        "accept-the-quest-checkbox",
        40,
        "medium",
      ),
      exercise("Validate the Form", "validate-the-form", 55, "medium"),
      exercise("Create a Quest Form", "create-a-quest-form", 65, "hard"),
    ],
  },
  {
    id: 10,
    name: "Effects & Synchronization",
    desc: "Use effects only when synchronizing React with browser APIs, storage, timers, and other outside systems.",
    exercises: [
      exercise("Document Title Effect", "document-title-effect", 40, "easy"),
      exercise("Effect Dependencies", "effect-dependencies", 45, "medium"),
      exercise("Save Player Settings", "save-player-settings", 50, "medium"),
      exercise(
        "Quest Countdown Cleanup",
        "quest-countdown-cleanup",
        55,
        "medium",
      ),
      exercise(
        "Remove the Unnecessary Effect",
        "remove-the-unnecessary-effect",
        60,
        "hard",
      ),
    ],
  },
  {
    id: 11,
    name: "Fetching & Async UI",
    desc: "Load remote-style data and represent loading, success, empty, and error states clearly.",
    exercises: [
      exercise("Loading State", "loading-state", 40, "easy"),
      exercise("Fetch the Quest Log", "fetch-the-quest-log", 50, "medium"),
      exercise("Data State Trio", "data-state-trio", 55, "medium"),
      exercise(
        "Retry the Failed Request",
        "retry-the-failed-request",
        60,
        "hard",
      ),
      exercise(
        "Search with Request Cleanup",
        "search-with-request-cleanup",
        70,
        "hard",
      ),
    ],
  },
  {
    id: 12,
    name: "Sharing State & Reusable Logic",
    desc: "Lift state, pass callbacks, avoid duplicated state, and extract reusable behavior into a custom hook.",
    exercises: [
      exercise("Pass a Callback", "pass-a-callback", 40, "medium"),
      exercise(
        "Lift the Selected Quest",
        "lift-the-selected-quest",
        50,
        "medium",
      ),
      exercise("Shared Party Score", "shared-party-score", 55, "medium"),
      exercise(
        "Derive the Visible Quests",
        "derive-the-visible-quests",
        55,
        "medium",
      ),
      exercise("Extract a Toggle Hook", "extract-a-toggle-hook", 70, "hard"),
    ],
  },
  {
    id: 13,
    name: "React Final Project",
    desc: "Combine components, props, lists, state, forms, effects, and shared logic in a complete application.",
    exercises: [
      exercise(
        "Plan the Component Tree",
        "plan-the-component-tree",
        40,
        "easy",
      ),
      exercise("Build the Quest List", "build-the-quest-list", 50, "medium"),
      exercise("Add Quest Controls", "add-quest-controls", 55, "medium"),
      exercise("Add and Filter Quests", "add-and-filter-quests", 65, "hard"),
      exercise("Final Quest Tracker", "final-quest-tracker", 90, "hard"),
    ],
  },
];

export const PYTHON_DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "Python Foundations",
    desc: "Write first programs and work with statements, values, variables, comments, and printed output.",
    exercises: [
      exercise("Hello, CodeQuest!", "hello-codequest", 20, "easy"),
      exercise("Hero Variables", "hero-variables", 25, "easy"),
      exercise(
        "Print a Character Sheet",
        "print-a-character-sheet",
        30,
        "easy",
      ),
      exercise(
        "Comment the Battle Plan",
        "comment-the-battle-plan",
        25,
        "easy",
      ),
      exercise(
        "Inspect the Value Types",
        "inspect-the-value-types",
        35,
        "medium",
      ),
    ],
  },
  {
    id: 2,
    name: "Input, Numbers & Operators",
    desc: "Read user input, convert values, calculate results, and use Python's numeric operators.",
    exercises: [
      exercise("Ask the Adventurer", "ask-the-adventurer", 25, "easy"),
      exercise("XP Calculator", "xp-calculator", 30, "easy"),
      exercise("Damage Formula", "damage-formula", 35, "medium"),
      exercise(
        "Convert the Level Input",
        "convert-the-level-input",
        40,
        "medium",
      ),
      exercise("Split the Gold Reward", "split-the-gold-reward", 45, "medium"),
    ],
  },
  {
    id: 3,
    name: "Strings & Text Processing",
    desc: "Build, format, inspect, slice, and transform text using strings and their methods.",
    exercises: [
      exercise("Player Status Message", "player-status-message", 25, "easy"),
      exercise(
        "Format the Battle Report",
        "format-the-battle-report",
        35,
        "easy",
      ),
      exercise(
        "Normalize the Hero Name",
        "normalize-the-hero-name",
        40,
        "medium",
      ),
      exercise("Slice the Secret Code", "slice-the-secret-code", 45, "medium"),
      exercise("Count the Rune Words", "count-the-rune-words", 50, "medium"),
    ],
  },
  {
    id: 4,
    name: "Conditions",
    desc: "Make programs choose a path using comparisons, Boolean logic, and conditional branches.",
    exercises: [
      exercise("Level Gate", "level-gate", 30, "easy"),
      exercise("Potion Check", "potion-check", 35, "easy"),
      exercise("Choose the Rank", "choose-the-rank", 40, "medium"),
      exercise("Battle Eligibility", "battle-eligibility", 50, "medium"),
      exercise("Branching Quest Ending", "branching-quest-ending", 55, "hard"),
    ],
  },
  {
    id: 5,
    name: "Loops",
    desc: "Repeat actions with for and while loops and build totals with accumulators.",
    exercises: [
      exercise("Quest Loop", "quest-loop", 35, "easy"),
      exercise("Countdown to Battle", "countdown-to-battle", 40, "medium"),
      exercise("Count Earned XP", "count-earned-xp", 45, "medium"),
      exercise("Find the First Boss", "find-the-first-boss", 50, "medium"),
      exercise("Skip Locked Quests", "skip-locked-quests", 55, "hard"),
    ],
  },
  {
    id: 6,
    name: "Lists & Tuples",
    desc: "Store ordered values, select and slice items, and process collections safely.",
    exercises: [
      exercise("Inventory List", "inventory-list", 30, "easy"),
      exercise("Update the Backpack", "update-the-backpack", 40, "medium"),
      exercise("Slice the Party", "slice-the-party", 40, "medium"),
      exercise("Highest Quest Reward", "highest-quest-reward", 50, "medium"),
      exercise(
        "Immutable Map Coordinates",
        "immutable-map-coordinates",
        50,
        "medium",
      ),
    ],
  },
  {
    id: 7,
    name: "Dictionaries & Sets",
    desc: "Model named data with dictionaries and keep collections unique with sets.",
    exercises: [
      exercise("Character Dictionary", "character-dictionary", 35, "easy"),
      exercise("Update Player Stats", "update-player-stats", 45, "medium"),
      exercise("Unique Loot", "unique-loot", 40, "medium"),
      exercise("Party Member Lookup", "party-member-lookup", 50, "medium"),
      exercise("Merge Quest Rewards", "merge-quest-rewards", 55, "hard"),
    ],
  },
  {
    id: 8,
    name: "Functions & Scope",
    desc: "Package logic into reusable functions with parameters, return values, scope, and clear responsibilities.",
    exercises: [
      exercise(
        "Create a Greeting Function",
        "create-a-greeting-function",
        35,
        "easy",
      ),
      exercise("Calculate Rank", "calculate-rank", 45, "medium"),
      exercise("Default Potion Amount", "default-potion-amount", 45, "medium"),
      exercise("Build a Battle Helper", "build-a-battle-helper", 60, "hard"),
      exercise(
        "Return Multiple Rewards",
        "return-multiple-rewards",
        55,
        "medium",
      ),
    ],
  },
  {
    id: 9,
    name: "Comprehensions & Data Processing",
    desc: "Transform and filter collections using concise comprehensions, sorting, and small data pipelines.",
    exercises: [
      exercise("Double the XP Rewards", "double-the-xp-rewards", 40, "easy"),
      exercise(
        "Filter Available Quests",
        "filter-available-quests",
        45,
        "medium",
      ),
      exercise(
        "Build a Rank Dictionary",
        "build-a-rank-dictionary",
        50,
        "medium",
      ),
      exercise("Sort the Leaderboard", "sort-the-leaderboard", 55, "medium"),
      exercise("Quest Summary Pipeline", "quest-summary-pipeline", 65, "hard"),
    ],
  },
  {
    id: 10,
    name: "Errors & Defensive Programs",
    desc: "Validate data, handle expected failures, raise useful exceptions, and keep programs reliable.",
    exercises: [
      exercise("Safe Number Input", "safe-number-input", 40, "medium"),
      exercise(
        "Raise an Invalid Level",
        "raise-an-invalid-level",
        50,
        "medium",
      ),
      exercise(
        "Catch a Missing Player",
        "catch-a-missing-player",
        50,
        "medium",
      ),
      exercise(
        "Always Close the Portal",
        "always-close-the-portal",
        55,
        "medium",
      ),
      exercise(
        "Validate a Quest Record",
        "validate-a-quest-record",
        65,
        "hard",
      ),
    ],
  },
  {
    id: 11,
    name: "Modules & Files",
    desc: "Organize code with imports and read or write small text and JSON files in Python's filesystem.",
    exercises: [
      exercise(
        "Import the Math Toolkit",
        "import-the-math-toolkit",
        35,
        "easy",
      ),
      exercise("Random Loot Drop", "random-loot-drop", 45, "medium"),
      exercise("Write the Quest Log", "write-the-quest-log", 50, "medium"),
      exercise("Read the Saved Party", "read-the-saved-party", 55, "medium"),
      exercise(
        "Store Player Data as JSON",
        "store-player-data-as-json",
        65,
        "hard",
      ),
    ],
  },
  {
    id: 12,
    name: "Classes & Objects",
    desc: "Model related state and behavior with simple classes, instances, methods, and inheritance.",
    exercises: [
      exercise("Create a Hero Class", "create-a-hero-class", 40, "easy"),
      exercise(
        "Initialize Player Stats",
        "initialize-player-stats",
        45,
        "medium",
      ),
      exercise("Add a Level Up Method", "add-a-level-up-method", 50, "medium"),
      exercise("Show the Hero Summary", "show-the-hero-summary", 55, "medium"),
      exercise("Specialized Mage Class", "specialized-mage-class", 70, "hard"),
    ],
  },
  {
    id: 13,
    name: "Python Final Project",
    desc: "Combine input, collections, functions, files, errors, and objects in a complete command-line application.",
    exercises: [
      exercise("Plan the Quest Manager", "plan-the-quest-manager", 40, "easy"),
      exercise(
        "Adventure Report Builder",
        "adventure-report-builder",
        55,
        "medium",
      ),
      exercise("Add Quest Commands", "add-quest-commands", 60, "medium"),
      exercise(
        "Save and Restore Progress",
        "save-and-restore-progress",
        70,
        "hard",
      ),
      exercise("Final Quest Manager", "final-quest-manager", 95, "hard"),
    ],
  },
];

interface CourseIdentity {
  title: string;
  tags?: string | null;
  level?: string | null;
}

export function getCourseChapterData({
  title,
  tags,
  level,
}: CourseIdentity): ChapterSeed[] | null {
  const identity = `${title} ${tags ?? ""} ${level ?? ""}`.toLowerCase();

  if (!/\bbeginner\b/.test(identity)) {
    return null;
  }

  if (/(?:^|[^a-z0-9])(?:c\+\+|cpp|cplusplus)(?=$|[^a-z0-9])/.test(identity)) {
    return CPP_DATA;
  }

  if (
    /(?:^|[^a-z0-9])(?:c#|c[\s-]?sharp|dotnet|\.net)(?=$|[^a-z0-9])/.test(
      identity,
    )
  ) {
    return CSHARP_DATA;
  }

  if (/\bpython\b/.test(identity)) {
    return PYTHON_DATA;
  }

  if (/\breact\b/.test(identity)) {
    return REACT_DATA;
  }

  if (/\bcss\b/.test(identity)) {
    return CSS_DATA;
  }

  if (/\bhtml\b/.test(identity)) {
    return HTML_DATA;
  }

  return null;
}
