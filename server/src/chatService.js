import OpenAI from "openai";
import { crmTools, executeCrmTool } from "./tools.js";

const SYSTEM_PROMPT =
  "You are Jay's Intelligence, an AI assistant for real estate professionals. You help with transaction management, follow-ups, client communication, and deal tracking. Be concise, actionable, and professional.";

const MAX_HISTORY_MESSAGES = 18;
const MAX_TOOL_ROUNDS = 4;

let openai;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openai;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim()
    }));
}

function parseToolArguments(rawArguments) {
  if (!rawArguments) {
    return {};
  }

  try {
    return JSON.parse(rawArguments);
  } catch {
    return {};
  }
}

function extractText(message) {
  if (!message?.content) {
    return "";
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  return message.content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      return part?.text ?? "";
    })
    .join("")
    .trim();
}

export async function runChatCompletion({ message, history = [], userId }) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.statusCode = 500;
    error.expose = true;
    throw error;
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const toolCallNames = [];
  const messages = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nCurrent embedded user/session ID: ${
        userId || "anonymous"
      }. Use CRM tools when the user asks about transactions, tasks, appointments, or task creation.`
    },
    ...normalizeHistory(history),
    {
      role: "user",
      content: message
    }
  ];

  const client = getOpenAIClient();

  let completion = await client.chat.completions.create({
    model,
    messages,
    tools: crmTools,
    tool_choice: "auto"
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const assistantMessage = completion.choices[0]?.message;
    const toolCalls = assistantMessage?.tool_calls ?? [];

    if (toolCalls.length === 0) {
      return {
        reply: extractText(assistantMessage),
        model,
        toolCalls: toolCallNames
      };
    }

    messages.push(assistantMessage);

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function?.name;
      const args = parseToolArguments(toolCall.function?.arguments);
      const result = executeCrmTool(toolName, args);

      toolCallNames.push(toolName);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify(result)
      });
    }

    completion = await client.chat.completions.create({
      model,
      messages,
      tools: crmTools,
      tool_choice: "auto"
    });
  }

  return {
    reply: "I used the CRM tools, but the request needs more follow-up than expected. Please narrow the request and try again.",
    model,
    toolCalls: toolCallNames
  };
}
