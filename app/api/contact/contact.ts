const allowedCategories = new Set([
  "Question",
  "Bug report",
  "Course idea",
  "Other",
]);

export interface ContactPayload {
  name: string;
  contact: string;
  category: string;
  message: string;
}

type ValidationResult =
  | {
      ok: true;
      data: ContactPayload;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidReplyContact(value: string) {
  const telegramUsername = /^@[A-Za-z0-9_]{5,32}$/;
  const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return telegramUsername.test(value) || emailAddress.test(value);
}

export function isHoneypotFilled(body: unknown) {
  if (!body || typeof body !== "object") {
    return false;
  }

  return normalizeText((body as Record<string, unknown>).website).length > 0;
}

export function validateContactBody(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }

  const record = body as Record<string, unknown>;
  const name = normalizeText(record.name);
  const contact = normalizeText(record.contact);
  const category = normalizeText(record.category);
  const message = normalizeText(record.message);

  if (name.length < 2 || name.length > 80) {
    return {
      ok: false,
      error: "Enter a name between 2 and 80 characters.",
    };
  }

  if (
    contact.length < 3 ||
    contact.length > 120 ||
    !isValidReplyContact(contact)
  ) {
    return {
      ok: false,
      error: "Enter a valid Telegram username or email.",
    };
  }

  if (!allowedCategories.has(category)) {
    return { ok: false, error: "Choose a valid request type." };
  }

  if (message.length < 10 || message.length > 2000) {
    return {
      ok: false,
      error: "Message must contain between 10 and 2000 characters.",
    };
  }

  return {
    ok: true,
    data: {
      name,
      contact,
      category,
      message,
    },
  };
}

export function escapeTelegramHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildTelegramMessage(payload: ContactPayload) {
  return [
    "🟡 <b>New CodeQuest contact</b>",
    "",
    `<b>Type:</b> ${escapeTelegramHtml(payload.category)}`,
    `<b>Name:</b> ${escapeTelegramHtml(payload.name)}`,
    `<b>Reply contact:</b> <code>${escapeTelegramHtml(payload.contact)}</code>`,
    "",
    "<b>Message:</b>",
    escapeTelegramHtml(payload.message),
  ].join("\n");
}
