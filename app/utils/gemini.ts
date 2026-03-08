// Direct Gemini API calls for AI assistant
import type { FunctionCallResponse } from "./gemini-schemas";
import type { TimelineState, MediaBinItem } from "~/components/timeline/types";

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set. AI assistant will not work.");
}

// Schema definition for structured output
const functionCallResponseSchema = {
  type: "object" as const,
  properties: {
    function_call: {
      anyOf: [
        {
          type: "object" as const,
          properties: {
            function_name: { type: "string", const: "LLMAddScrubberToTimeline" },
            scrubber_id: { type: "string" },
            track_id: { type: "string" },
            drop_left_px: { type: "number" },
          },
          required: ["function_name", "scrubber_id", "track_id", "drop_left_px"],
        },
        {
          type: "object" as const,
          properties: {
            function_name: { type: "string", const: "LLMMoveScrubber" },
            scrubber_id: { type: "string" },
            new_position_seconds: { type: "number" },
            new_track_number: { type: "number" },
            pixels_per_second: { type: "number" },
          },
          required: [
            "function_name",
            "scrubber_id",
            "new_position_seconds",
            "new_track_number",
            "pixels_per_second",
          ],
        },
        {
          type: "object" as const,
          properties: {
            function_name: { type: "string", const: "LLMAddScrubberByName" },
            scrubber_name: { type: "string" },
            track_number: { type: "number" },
            position_seconds: { type: "number" },
            pixels_per_second: { type: "number" },
          },
          required: [
            "function_name",
            "scrubber_name",
            "track_number",
            "position_seconds",
            "pixels_per_second",
          ],
        },
        {
          type: "object" as const,
          properties: {
            function_name: { type: "string", const: "LLMDeleteScrubbersInTrack" },
            track_number: { type: "number" },
          },
          required: ["function_name", "track_number"],
        },
        { type: "null" as const },
      ],
    },
    assistant_message: { type: ["string", "null"] },
  },
  required: [],
} as const;

export interface MessageInput {
  message: string;
  mentioned_scrubber_ids?: string[];
  timeline_state: TimelineState;
  mediabin_items: MediaBinItem[];
  chat_history?: Array<{ role: "user" | "assistant"; content: string; timestamp?: Date }>;
}

export async function callGeminiAI(request: MessageInput): Promise<FunctionCallResponse> {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.");
  }

  const chatHistoryText = request.chat_history
    ? request.chat_history
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n")
    : "(no previous conversation)";

  const prompt = `
You are Kimu, an AI assistant inside a video editor. You can decide to either:
- call ONE tool from provided schema when user explicitly asks for an editing action, or
- return a short friendly assistant_message when no concrete action is needed (e.g., greetings, small talk, clarifying questions).

Strictly follow:
- If user's message does not clearly request an editing action, set function_call to null and include an assistant_message.
- Only produce a function_call when it is safe and unambiguous to execute.

Inference rules:
- Assume a single active timeline; do NOT require a timeline_id.
- Tracks are named like "track-1", but when user says "track 1" they mean number 1.
- Use pixels_per_second=100 by default if not provided.
- When user names media like "twitter" or "twitter header", map that to closest media in the media bin by name substring match.
- Prefer LLMAddScrubberByName when user specifies a name, track number, and time in seconds.
- If the user asks to remove scrubbers in a specific track, call LLMDeleteScrubbersInTrack with that track number.

Conversation so far (oldest first): ${chatHistoryText}

User message: ${request.message}
Mentioned scrubber ids: ${request.mentioned_scrubber_ids?.join(", ") || "none"}
Timeline state: ${JSON.stringify(request.timeline_state)}
Media bin items: ${JSON.stringify(request.mediabin_items)}
`.trim();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: functionCallResponseSchema,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("No text in Gemini response");
    }

    // Parse JSON response
    const parsedResponse: FunctionCallResponse = JSON.parse(responseText);

    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      `Failed to call Gemini API: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
