import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > 10_000) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return validationError("Invalid request body.");
  }

  if (isHoneypotFilled(body)) {
    return NextResponse.json({
      message: "Message delivered. The Quest Master will reply soon.",
    });
  }

  const validation = validateContactBody(body);

  if (!validation.ok) {
    return validationError(validation.error);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return NextResponse.json(
      {
        error:
          "The Telegram contact bot is not configured yet. Please try again later.",
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
        { error: "Telegram could not deliver the message. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      message: "Message delivered. The Quest Master will reply soon.",
    });
  } catch (error) {
    console.error("Telegram contact request failed", error);

    return NextResponse.json(
      { error: "The message service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
