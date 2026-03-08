import { GoogleGenAI } from "@google/genai";
import { FunctionCallResponseSchema, type FunctionCallResponse, type ChatMessage } from "./gemini-schemas";
import type { MediaBinItem, TimelineState } from "~/components/timeline/types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface CallGeminiAIParams {
  message: string;
  mentioned_scrubber_ids?: string[];
  timeline_state: TimelineState;
  mediabin_items: MediaBinItem[];
  chat_history: ChatMessage[];
}

function buildSystemPrompt(request: CallGeminiAIParams): string {
  return `You are Kimu, an AI assistant inside a video editor. You can decide to either:
- call ONE tool from the provided schema when the user explicitly asks for an editing action, or
- return a short friendly assistant_message when no concrete action is needed (e.g., greetings, small talk, clarifying questions).

Strictly follow:
- If the user's message does not clearly request an editing action, set function_call to null and include an assistant_message.
- Only produce a function_call when it is safe and unambiguous to execute.

Inference rules:
- Assume a single active timeline; do NOT require a timeline_id.
- Tracks are named like "track-1", but when the user says "track 1" they mean number 1.
- Use pixels_per_second=100 by default if not provided.
- When the user names media like "twitter" or "twitter header", map that to the closest media in the media bin by name substring match.
- Prefer LLMAddScrubberByName when the user specifies a name, track number, and time in seconds.
- If the user asks to remove scrubbers in a specific track, call LLMDeleteScrubbersInTrack with that track number.

Conversation so far (oldest first): ${JSON.stringify(request.chat_history)}

User message: ${request.message}
Mentioned scrubber ids: ${JSON.stringify(request.mentioned_scrubber_ids)}
Timeline state: ${JSON.stringify(request.timeline_state)}
Media bin items: ${JSON.stringify(request.mediacin_items)}`;
}

export async function callGeminiAI(request: CallGeminiAIParams): Promise<FunctionCallResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const systemPrompt = buildSystemPrompt(request);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          function_call: {
            type: "object",
            properties: {
              function_name: {
                type: "string",
                enum: [
                  "LLMAddScrubberToTimeline",
                  "LLMMoveScrubber",
                  "LLMAddScrubberByName",
                  "LLMDeleteScrubbersInTrack",
                ],
              },
              scrubber_id: { type: "string" },
              track_id: { type: "string" },
              drop_left_px: { type: "number" },
              new_position_seconds: { type: "number" },
              new_track_number: { type: "number" },
              pixels_per_second: { type: "number" },
              scrubber_name: { type: "string" },
              track_number: { type: "number" },
              position_seconds: { type: "number" },
            },
            required: ["function_name"],
          },
          assistant_message: { type: "string" },
        },
        required: [],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  try {
    const parsed = JSON.parse(text);
    // Return parsed response - type casting needed due to schema validation differences
    return parsed as unknown as FunctionCallResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", text, error);
    throw new Error("Invalid response format from Gemini API");
  }
}
