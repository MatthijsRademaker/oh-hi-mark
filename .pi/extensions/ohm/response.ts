export interface ResponseEntry {
  type: string;
  id: string;
  message?: {
    role?: string;
    content?: unknown;
  };
}

export interface LatestAssistantResponse {
  responseId: string;
  sessionId: string;
  entryId: string;
  text: string;
}

function extractTextParts(content: unknown): string[] {
  if (typeof content === "string") {
    return [content];
  }

  if (!Array.isArray(content)) {
    return [];
  }

  const textParts: string[] = [];
  for (const part of content) {
    if (!part || typeof part !== "object") {
      continue;
    }

    const block = part as { type?: unknown; text?: unknown };
    if (block.type === "text" && typeof block.text === "string") {
      textParts.push(block.text);
    }
  }

  return textParts;
}

export function findLatestAssistantResponse(
  entries: readonly ResponseEntry[],
  sessionId: string,
): LatestAssistantResponse | undefined {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry.type !== "message" || entry.message?.role !== "assistant") {
      continue;
    }

    const textParts = extractTextParts(entry.message.content);
    if (textParts.length === 0) {
      continue;
    }

    return {
      responseId: `${sessionId}:${entry.id}`,
      sessionId,
      entryId: entry.id,
      text: textParts.join("\n"),
    };
  }

  return undefined;
}
