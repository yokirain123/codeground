import { NextResponse } from "next/server";

import { getServerI18n } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";

import {
  buildTelegramMessage,
  isHoneypotFilled,
  validateContactBody,
} from "./contact";

interface TelegramResponse {
  ok?: boolean;
  description?: string;
}

function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function localizeValidationError(message: string, t: Translate) {
  switch (message) {
    case "Invalid request body.":
      return t("Invalid request body.");
    case "Enter a name between 2 and 80 characters.":
      return t("Enter a name between 2 and 80 characters.");
    case "Enter a valid Telegram username or email.":
      return t("Enter a valid Telegram username or email.");
    case "Choose a valid request type.":
      return t("Choose a valid request type.");
    case "Message must contain between 10 and 2000 characters.":
      return t("Message must contain between 10 and 2000 characters.");
    default:
      return t("The message could not be sent.");
  }
}

export async function POST(request: Request) {
  const { t } = await getServerI18n();
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > 10_000) {
    return NextResponse.json(
      { error: t("Request body is too large.") },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError(t("Invalid request body."));
  }

  if (isHoneypotFilled(body)) {
    return NextResponse.json({
      message: t("Message delivered. The Quest Master will reply soon."),
    });
  }

  const validation = validateContactBody(body);

  if (!validation.ok) {
    return validationError(localizeValidationError(validation.error, t));
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return NextResponse.json(
      {
        error:
          t(
            "The Telegram contact bot is not configured yet. Please try again later.",
          ),
      },
      { status: 503 },
    );
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: buildTelegramMessage(validation.data),
          parse_mode: "HTML",
          link_preview_options: {
            is_disabled: true,
          },
        }),
      },
    );

    const telegramPayload = (await telegramResponse
      .json()
      .catch(() => null)) as TelegramResponse | null;

    if (!telegramResponse.ok || !telegramPayload?.ok) {
      console.error("Telegram contact delivery failed", {
        status: telegramResponse.status,
        description: telegramPayload?.description,
      });

      return NextResponse.json(
        { error: t("Telegram could not deliver the message. Please try again.") },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: t("Message delivered. The Quest Master will reply soon."),
    });
  } catch (error) {
    console.error("Telegram contact request failed", error);

    return NextResponse.json(
      { error: t("The message service is temporarily unavailable.") },
      { status: 502 },
    );
  }
}
