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
- Motion graphics: Users can create motion graphics scrubbers with shapes, animations, and keyframes. Use LLMCreateMotionScrubber to create a new motion scrubber.
- For motion editing: Use LLMAddShape to add shapes, LLMCreateKeyframe for animations, LLMAnimateObject for preset animations like fadeIn, bounce, etc.
- Common motion requests: "add a red circle", "animate this to fade in", "make it bounce", "add keyframe at 2 seconds".

REMOTION CODE GENERATION:
- If the user asks to create programmatic video content using code (e.g., "create an animated intro with code", "generate a video using Remotion", "write code for a video"), use WriteRemotionCode to generate TypeScript/React code using Remotion components.
- The WriteRemotionCode function generates a code field that contains the complete TypeScript code.
- The generated code should use Remotion components like: AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, delayRender, continueRender, etc.
- Use @remotion/player for preview, @remotion/transitions for transitions like fade, wipe, slide, flip, iris.
- The code should be a complete React component that can be rendered by Remotion.
- Detect relevant skills from the description: animations, transitions, text_animations, shapes, audio, subtitles, lottie, three_d, etc.
- Set duration_in_frames based on desired duration (e.g., 90 frames = 3 seconds at 30fps).
- Default dimensions: 1920x1080, fps: 30.

Conversation so far (oldest first): ${JSON.stringify(request.chat_history)}

User message: ${request.message}
Mentioned scrubber ids: ${JSON.stringify(request.mentioned_scrubber_ids)}
Timeline state: ${JSON.stringify(request.timeline_state)}
Media bin items: ${JSON.stringify(request.mediabin_items)}`;
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
                  "LLMCreateMotionScrubber",
                  "LLMAddShape",
                  "LLMCreateKeyframe",
                  "LLMApplyFilter",
                  "LLMDeleteObject",
                  "LLMUpdateObject",
                  "LLMAnimateObject",
                  "WriteRemotionCode",
                ],
              },
              // Timeline operations
              scrubber_id: { type: "string" },
              track_id: { type: "string" },
              drop_left_px: { type: "number" },
              new_position_seconds: { type: "number" },
              new_track_number: { type: "number" },
              pixels_per_second: { type: "number" },
              scrubber_name: { type: "string" },
              track_number: { type: "number" },
              position_seconds: { type: "number" },
              // Motion operations
              duration_seconds: { type: "number" },
              canvas_width: { type: "number" },
              canvas_height: { type: "number" },
              background_color: { type: "string" },
              // Shape operations
              shape_type: { type: "string", enum: ["rect", "circle", "triangle", "ellipse", "line", "text"] },
              left: { type: "number" },
              top: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
              fill: { type: "string" },
              stroke: { type: "string" },
              stroke_width: { type: "number" },
              text: { type: "string" },
              font_size: { type: "number" },
              font_family: { type: "string" },
              // Keyframe operations
              object_id: { type: "string" },
              property: { type: "string", enum: ["x", "y", "scaleX", "scaleY", "rotation", "opacity", "fill", "stroke", "width", "height", "fontSize"] },
              time: { type: "number" },
              value: { type: ["number", "string"] },
              easing: { type: "string", enum: ["linear", "easeIn", "easeOut", "easeInOut", "spring", "bounce", "elastic"] },
              // Filter operations
              filter_type: { type: "string", enum: ["blur", "brightness", "contrast", "sepia", "grayscale", "invert"] },
              // Animation operations
              animation_type: { type: "string", enum: ["fadeIn", "fadeOut", "slideIn", "slideOut", "scaleIn", "scaleOut", "rotate", "bounce", "pulse", "shake"] },
              duration: { type: "number" },
              // Update operations
              properties: { type: "object" },
              // Remotion code generation
              description: { type: "string" },
              composition_name: { type: "string" },
              duration_in_frames: { type: "number" },
              fps: { type: "number" },
              detected_skills: { type: "array", items: { type: "string" } },
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
