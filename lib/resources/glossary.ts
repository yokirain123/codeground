export const GLOSSARY_CATEGORIES = [
  "Fundamentals",
  "Web",
  "Object-oriented",
  "Data",
  "Tools",
  "Architecture",
] as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export interface GlossaryEntry {
  term: string;
  slug: string;
  category: GlossaryCategory;
  definition: string;
  example?: string;
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: "Algorithm",
    slug: "algorithm",
    category: "Fundamentals",
    definition:
      "A finite sequence of steps used to solve a problem or produce a result.",
    example: "Sorting quests from the smallest XP reward to the largest.",
  },
  {
    term: "API",
    slug: "api",
    category: "Web",
    definition:
      "A defined way for programs to request data or actions from another program.",
    example: "GET /api/courses returns course data to the frontend.",
  },
  {
    term: "Argument",
    slug: "argument",
    category: "Fundamentals",
    definition: "A value supplied to a function when that function is called.",
    example: 'In greet("Nova"), "Nova" is the argument.',
  },
  {
    term: "Array",
    slug: "array",
    category: "Data",
    definition:
      "An ordered collection whose items are normally accessed by numeric index.",
    example: "const rewards = [20, 40, 60]",
  },
  {
    term: "Async",
    slug: "async",
    category: "Fundamentals",
    definition:
      "Work that can finish later without blocking the rest of the program while it waits.",
    example: "Loading profile data from a server is asynchronous work.",
  },
  {
    term: "Authentication",
    slug: "authentication",
    category: "Web",
    definition: "The process of proving who a user or service is.",
    example: "Signing in with Clerk authenticates the current player.",
  },
  {
    term: "Authorization",
    slug: "authorization",
    category: "Web",
    definition:
      "The rules that decide what an authenticated user is allowed to access or change.",
    example: "Only an admin is authorized to generate course exercises.",
  },
  {
    term: "Boolean",
    slug: "boolean",
    category: "Fundamentals",
    definition: "A data type with only two possible values: true or false.",
    example: "const isCompleted = true",
  },
  {
    term: "Branch",
    slug: "branch",
    category: "Tools",
    definition:
      "An independent line of Git development that can later be merged with another line.",
    example: "Build the friends feature on a feature/friends branch.",
  },
  {
    term: "Bug",
    slug: "bug",
    category: "Fundamentals",
    definition:
      "A defect that makes a program behave differently from what was intended.",
    example: "A Run button that never sends the code is a bug.",
  },
  {
    term: "Cache",
    slug: "cache",
    category: "Architecture",
    definition:
      "Temporarily stored data that makes later reads faster or avoids repeated work.",
    example: "Cache a course catalog instead of loading it on every render.",
  },
  {
    term: "Class",
    slug: "class",
    category: "Object-oriented",
    definition:
      "A blueprint that describes the data and behavior of objects created from it.",
    example: "A Hero class can define Name, Level, and LevelUp().",
  },
  {
    term: "CLI",
    slug: "cli",
    category: "Tools",
    definition:
      "A command-line interface: a program controlled by text commands in a terminal.",
    example: "git status and npm run dev are CLI commands.",
  },
  {
    term: "Closure",
    slug: "closure",
    category: "Fundamentals",
    definition:
      "A function together with access to variables from the scope where it was created.",
    example: "An event handler can remember component values from its render.",
  },
  {
    term: "Compiler",
    slug: "compiler",
    category: "Tools",
    definition:
      "A program that translates source code into another form, often executable machine code.",
    example: "GCC compiles a C++ main.cpp file before it runs.",
  },
  {
    term: "Component",
    slug: "component",
    category: "Web",
    definition:
      "A reusable and isolated part of a user interface with its own structure and behavior.",
    example: "QuestCard is a React component.",
  },
  {
    term: "Condition",
    slug: "condition",
    category: "Fundamentals",
    definition:
      "An expression evaluated as true or false to choose which code should run.",
    example: "if (xp >= 100) unlockBadge();",
  },
  {
    term: "Constant",
    slug: "constant",
    category: "Fundamentals",
    definition:
      "A named value that cannot be reassigned after it has been initialized.",
    example: "const MAX_LEVEL = 100",
  },
  {
    term: "Database",
    slug: "database",
    category: "Data",
    definition:
      "An organized system for storing, finding, and updating persistent data.",
    example: "CodeQuest stores users, courses, and progress in PostgreSQL.",
  },
  {
    term: "Debugging",
    slug: "debugging",
    category: "Tools",
    definition:
      "The process of reproducing, locating, understanding, and fixing a defect.",
    example: "Inspect the network response to find why progress was not saved.",
  },
  {
    term: "Dependency",
    slug: "dependency",
    category: "Architecture",
    definition:
      "Code or a service that another part of the application relies on.",
    example: "React is a dependency listed in package.json.",
  },
  {
    term: "DOM",
    slug: "dom",
    category: "Web",
    definition:
      "The browser's object representation of an HTML document and its elements.",
    example: "document.querySelector reads an element from the DOM.",
  },
  {
    term: "Endpoint",
    slug: "endpoint",
    category: "Web",
    definition:
      "A specific API address that accepts a defined request and returns a response.",
    example: "POST /api/code/run/cpp is a C++ execution endpoint.",
  },
  {
    term: "Environment variable",
    slug: "environment-variable",
    category: "Architecture",
    definition:
      "A configuration value supplied outside the source code for a particular environment.",
    example: "DATABASE_URL should be an environment variable, not hardcoded.",
  },
  {
    term: "Exception",
    slug: "exception",
    category: "Fundamentals",
    definition:
      "A signal that an unusual or failed operation interrupted normal execution.",
    example: "Parsing invalid input can throw an exception.",
  },
  {
    term: "Framework",
    slug: "framework",
    category: "Architecture",
    definition:
      "A structured foundation that controls part of an application's flow and provides conventions.",
    example: "Next.js is the web framework used by CodeQuest.",
  },
  {
    term: "Function",
    slug: "function",
    category: "Fundamentals",
    definition:
      "A named or anonymous block of reusable code that can receive values and return a result.",
    example: "calculateXp(base, bonus) returns the final XP amount.",
  },
  {
    term: "Git",
    slug: "git",
    category: "Tools",
    definition:
      "A distributed version-control system used to track and combine changes to files.",
    example: "Git records the project history as commits.",
  },
  {
    term: "Hook",
    slug: "hook",
    category: "Web",
    definition:
      "A function that connects custom logic to a framework lifecycle or extension point.",
    example: "useState and useEffect are React Hooks.",
  },
  {
    term: "HTTP",
    slug: "http",
    category: "Web",
    definition:
      "The request-response protocol browsers and web servers use to communicate.",
    example: "A successful GET request commonly returns HTTP status 200.",
  },
  {
    term: "Inheritance",
    slug: "inheritance",
    category: "Object-oriented",
    definition:
      "A relationship where one class receives and specializes behavior defined by another class.",
    example: "Mage can inherit common behavior from Hero.",
  },
  {
    term: "Interface",
    slug: "interface",
    category: "Object-oriented",
    definition:
      "A contract describing what operations or shape a value must provide without defining all implementation details.",
    example: "A User interface can require id, name, and email fields.",
  },
  {
    term: "Iteration",
    slug: "iteration",
    category: "Fundamentals",
    definition:
      "One repetition of a loop, or the general process of repeating over values.",
    example: "Each item visited by a for loop is one iteration.",
  },
  {
    term: "JSON",
    slug: "json",
    category: "Data",
    definition:
      "A text format for structured data using objects, arrays, strings, numbers, booleans, and null.",
    example: "API responses often send course data as JSON.",
  },
  {
    term: "Key-value pair",
    slug: "key-value-pair",
    category: "Data",
    definition:
      "A piece of data where a unique key identifies its associated value.",
    example: "In { level: 4 }, level is the key and 4 is the value.",
  },
  {
    term: "Library",
    slug: "library",
    category: "Architecture",
    definition:
      "Reusable code that your application calls while your application keeps control of the overall flow.",
    example: "Lucide is an icon library.",
  },
  {
    term: "Loop",
    slug: "loop",
    category: "Fundamentals",
    definition:
      "A control structure that repeats code while a condition holds or for each item in a collection.",
    example: "Use a foreach loop to print every quest.",
  },
  {
    term: "Method",
    slug: "method",
    category: "Object-oriented",
    definition: "A function associated with an object or class.",
    example: "hero.levelUp() calls the Hero object's method.",
  },
  {
    term: "Middleware",
    slug: "middleware",
    category: "Architecture",
    definition:
      "Code that runs between an incoming request and its final handler or response.",
    example: "Authentication middleware can protect private routes.",
  },
  {
    term: "Module",
    slug: "module",
    category: "Architecture",
    definition:
      "A file or package with its own scope that exports selected values for other code to import.",
    example:
      "Export a utility function from validation.ts and import it elsewhere.",
  },
  {
    term: "Null",
    slug: "null",
    category: "Data",
    definition:
      "An explicit value representing the intentional absence of an object or result.",
    example: "selectedQuest can be null when nothing is selected.",
  },
  {
    term: "Object",
    slug: "object",
    category: "Object-oriented",
    definition:
      "A value that groups related data and behavior, often created from a class or object literal.",
    example: 'const hero = { name: "Nova", level: 4 }',
  },
  {
    term: "Operator",
    slug: "operator",
    category: "Fundamentals",
    definition:
      "A symbol or keyword that performs an operation on one or more values.",
    example: "+ adds numbers, while === compares values in JavaScript.",
  },
  {
    term: "Package",
    slug: "package",
    category: "Tools",
    definition:
      "A distributable collection of code and metadata that can be installed as a dependency.",
    example: "npm installs packages from package.json.",
  },
  {
    term: "Parameter",
    slug: "parameter",
    category: "Fundamentals",
    definition:
      "A named input declared by a function; it receives an argument when the function is called.",
    example: "In function greet(name), name is the parameter.",
  },
  {
    term: "Pointer",
    slug: "pointer",
    category: "Fundamentals",
    definition:
      "A value that stores the memory address of another value or object.",
    example: "C++ uses nullptr to represent a pointer that points nowhere.",
  },
  {
    term: "Promise",
    slug: "promise",
    category: "Fundamentals",
    definition:
      "A JavaScript object representing an asynchronous result that may succeed or fail later.",
    example: "fetch() returns a Promise for an HTTP response.",
  },
  {
    term: "Property",
    slug: "property",
    category: "Object-oriented",
    definition:
      "A named value stored on an object; some languages can control how it is read or changed.",
    example: "hero.name reads the name property.",
  },
  {
    term: "Queue",
    slug: "queue",
    category: "Data",
    definition:
      "A first-in, first-out collection where the earliest added item is removed first.",
    example: "Process submitted code jobs in the order they arrived.",
  },
  {
    term: "Recursion",
    slug: "recursion",
    category: "Fundamentals",
    definition:
      "A technique where a function solves a problem by calling itself with a smaller case.",
    example: "Walking every nested folder can be implemented recursively.",
  },
  {
    term: "Repository",
    slug: "repository",
    category: "Tools",
    definition:
      "A project directory tracked by version control together with its change history.",
    example: "Clone the CodeQuest Git repository before creating a branch.",
  },
  {
    term: "REST",
    slug: "rest",
    category: "Web",
    definition:
      "A style of HTTP API organized around resources and standard request methods.",
    example: "GET reads a course and DELETE removes a course resource.",
  },
  {
    term: "Runtime",
    slug: "runtime",
    category: "Architecture",
    definition:
      "The environment and period in which a compiled or interpreted program is executing.",
    example: "Node.js is a JavaScript runtime outside the browser.",
  },
  {
    term: "Scope",
    slug: "scope",
    category: "Fundamentals",
    definition: "The region of code where a declared name can be accessed.",
    example: "A variable declared inside a function has local scope.",
  },
  {
    term: "State",
    slug: "state",
    category: "Architecture",
    definition:
      "Data that describes the current condition of a program or interface and may change over time.",
    example: "The current search query is component state.",
  },
  {
    term: "String",
    slug: "string",
    category: "Data",
    definition: "A sequence of characters used to represent text.",
    example: '"Hello, CodeQuest!" is a string literal.',
  },
  {
    term: "Syntax",
    slug: "syntax",
    category: "Fundamentals",
    definition:
      "The grammar and structural rules that define valid code in a language.",
    example: "A missing semicolon can be a C++ syntax error.",
  },
  {
    term: "Type",
    slug: "type",
    category: "Fundamentals",
    definition:
      "A classification that determines what a value represents and which operations are valid for it.",
    example: "int, string, and boolean are common types.",
  },
  {
    term: "URL",
    slug: "url",
    category: "Web",
    definition:
      "A text address that identifies the location of a resource and how to access it.",
    example: "https://example.com/courses/1 is a URL.",
  },
  {
    term: "Variable",
    slug: "variable",
    category: "Fundamentals",
    definition:
      "A named storage location that refers to a value and may allow that value to change.",
    example: "let xp = 0 creates a variable named xp.",
  },
  {
    term: "Vector",
    slug: "vector",
    category: "Data",
    definition:
      "In C++, a standard-library container that stores a resizable ordered sequence of values.",
    example: "std::vector<int> rewards {20, 40, 60};",
  },
  {
    term: "Version control",
    slug: "version-control",
    category: "Tools",
    definition:
      "A system that records file changes so people can review, combine, and restore project history.",
    example:
      "Git is the version-control system; GitHub can host its repositories.",
  },
  {
    term: "WebSocket",
    slug: "websocket",
    category: "Web",
    definition:
      "A persistent two-way connection that lets a browser and server send messages at any time.",
    example:
      "A live multiplayer editor can synchronize changes through WebSockets.",
  },
  {
    term: "XML",
    slug: "xml",
    category: "Data",
    definition:
      "A text format that represents nested structured data with custom tags and attributes.",
    example: "SVG images are written using XML syntax.",
  },
  {
    term: "YAML",
    slug: "yaml",
    category: "Data",
    definition:
      "A human-readable configuration format based mostly on indentation and key-value pairs.",
    example: "GitHub Actions workflows are commonly stored as YAML.",
  },
  {
    term: "Zero-based index",
    slug: "zero-based-index",
    category: "Fundamentals",
    definition:
      "An indexing convention where the first item has position 0 instead of position 1.",
    example: "rewards[0] returns the first array item.",
  },
];
