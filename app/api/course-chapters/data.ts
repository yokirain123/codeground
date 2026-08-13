export interface ExerciseSeed {
  name: string;
  slug: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface ChapterSeed {
  id: number;
  name: string;
  desc: string;
  exercises: ExerciseSeed[];
}

const exercise = (
  name: string,
  slug: string,
  xp: number,
  difficulty: ExerciseSeed["difficulty"],
): ExerciseSeed => ({ name, slug, xp, difficulty });

export const DATA: ChapterSeed[] = [
  {
    id: 1,
    name: "Introduction to HTML",
    desc: "Discover how HTML elements shape the structure and meaning of every webpage.",
    exercises: [
      exercise("Explore the Web Skeleton", "explore-the-web-skeleton", 20, "easy"),
      exercise("Build Your Base Camp", "build-your-base-camp", 25, "easy"),
      exercise("Name Your World", "name-your-world", 20, "easy"),
    ],
  },
  {
    id: 2,
    name: "HTML Boilerplate",
    desc: "Build the complete document structure that every reliable HTML page begins with.",
    exercises: [
      exercise("Build the Core Structure", "build-the-core-structure", 30, "easy"),
      exercise("Fix the Broken Blueprint", "fix-the-broken-blueprint", 35, "medium"),
      exercise("Viewport Setup", "viewport-setup", 25, "easy"),
    ],
  },
  {
    id: 3,
    name: "Head & Body Tags",
    desc: "Separate page metadata and linked resources from visible document content.",
    exercises: [
      exercise("Mind vs Body", "mind-vs-body", 25, "easy"),
      exercise("Activate Styles", "activate-styles", 30, "medium"),
      exercise("Add an External Script", "add-external-script", 30, "medium"),
    ],
  },
  {
    id: 4,
    name: "Text Formatting",
    desc: "Create readable content with headings, paragraphs, emphasis, quotations, and code.",
    exercises: [
      exercise("Create the Text Realm", "create-the-text-realm", 25, "easy"),
      exercise("Power Words", "power-words", 25, "easy"),
      exercise("Story and Quote Block", "story-and-quote-block", 40, "medium"),
    ],
  },
  {
    id: 5,
    name: "Links & Navigation",
    desc: "Connect pages, jump to document sections, and build accessible navigation.",
    exercises: [
      exercise("Create a Warp Gate", "create-a-warp-gate", 25, "easy"),
      exercise("Anchor Teleport", "anchor-teleport", 30, "easy"),
      exercise("Navigation Builder", "navigation-builder", 45, "medium"),
    ],
  },
  {
    id: 6,
    name: "Images",
    desc: "Display meaningful images with useful alternatives, sizes, figures, and captions.",
    exercises: [
      exercise("Summon an Image", "summon-an-image", 25, "easy"),
      exercise("Vision for All", "vision-for-all", 30, "easy"),
      exercise("Figure and Caption", "figure-and-caption", 40, "medium"),
    ],
  },
  {
    id: 7,
    name: "Lists",
    desc: "Structure related content with ordered, unordered, description, and nested lists.",
    exercises: [
      exercise("Bullet Creator", "bullet-creator", 25, "easy"),
      exercise("Number Builder", "number-builder", 25, "easy"),
      exercise("Nested Inventory", "nested-inventory", 40, "medium"),
    ],
  },
  {
    id: 8,
    name: "Tables",
    desc: "Represent tabular information with captions, headers, rows, and grouped cells.",
    exercises: [
      exercise("Table Blueprint", "table-blueprint", 30, "easy"),
      exercise("Add Column Headers", "add-column-headers", 30, "easy"),
      exercise("Quest Results Table", "quest-results-table", 45, "medium"),
    ],
  },
  {
    id: 9,
    name: "Forms Basics",
    desc: "Collect user data with accessible labels, inputs, choices, and buttons.",
    exercises: [
      exercise("Label the Controls", "label-the-controls", 30, "easy"),
      exercise("Choose Your Class", "choose-your-class", 35, "medium"),
      exercise("Create a Login Portal", "create-a-login-portal", 50, "medium"),
    ],
  },
  {
    id: 10,
    name: "Semantic HTML",
    desc: "Use meaningful landmarks and content elements to improve structure and accessibility.",
    exercises: [
      exercise("Build the Layout", "build-the-layout", 35, "medium"),
      exercise("Blog Structure", "blog-structure", 40, "medium"),
      exercise("Semantic Rebuild", "semantic-rebuild", 50, "hard"),
    ],
  },
  {
    id: 11,
    name: "Audio & Video",
    desc: "Embed media with controls, fallback content, poster images, and captions.",
    exercises: [
      exercise("Play the Sound", "play-the-sound", 30, "easy"),
      exercise("Video Portal", "video-portal", 35, "medium"),
      exercise("Add Subtitles", "add-subtitles", 45, "medium"),
    ],
  },
  {
    id: 12,
    name: "Best Practices & Final Page",
    desc: "Apply clean structure, accessibility, and every core HTML skill in a final page.",
    exercises: [
      exercise("Code Cleanup", "code-cleanup", 30, "easy"),
      exercise("Accessibility Upgrade", "accessibility-upgrade", 45, "medium"),
      exercise("Final Adventurer Profile", "final-adventurer-profile", 80, "hard"),
    ],
  },
];
