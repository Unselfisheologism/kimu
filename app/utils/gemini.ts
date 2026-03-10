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

REMOTION CODE GENERATION (High-End Motion Graphics):
- Use WriteRemotionCode when users want to create professional motion graphics programmatically.
- This enables high-end SaaS/startup video production with code-based animations.
- Detect skills from user description and include them in detected_skills array.

Available skill categories:
- typography: Kinetic text, title sequences, word animations, typewriter effects
- spring-physics: Natural spring animations with damping/stiffness controls
- transitions: Scene transitions using @remotion/transitions (fade, wipe, slide, flip, iris)
- charts: Animated bar charts, line charts, pie charts, counters, data visualization
- messaging: Chat UIs, mobile app screens, notification bubbles, cards
- social-media: 9:16 vertical videos (TikTok/Reels), YouTube 16:9, platform-specific formats
- 3d: Three.js integration, 3D objects, rotations, perspective transforms
- sequencing: Complex timing, staggered animations, Sequence components
- lottie: Lottie animation integration from JSON files
- loops: Seamless looping backgrounds, continuous animations
- product: Device mockups (phone/laptop), app demos, feature showcases
- logo: Logo reveals, brand animations, letter-by-letter effects
- backgrounds: Gradient animations, mesh gradients, particle effects
- cta: Call-to-action buttons, end screens, subscribe prompts

Code patterns to use:
- useCurrentFrame() for frame-based animations
- interpolate(inputRange, outputRange) for smooth value mapping
- spring({ frame, fps, config: { damping, stiffness }}) for physics
- Sequence from={frame} durationInFrames={n} for timing control
- TransitionSeries for professional scene transitions

Examples of requests that should trigger WriteRemotionCode:
- "Create an animated intro with bouncing text"
- "Make a promotional video for my startup"
- "Generate a product demo animation"
- "Create a kinetic typography title sequence"
- "Add animated bar charts showing growth"
- "Make a logo reveal animation"
- "Create a smooth transition between scenes"

When calling WriteRemotionCode:
- Set duration_in_frames based on desired length (e.g., 180 frames = 6 seconds at 30fps)
- Default composition settings: width=1920, height=1080, fps=30
- Include all detected skills in the detected_skills array
- The description should capture what the user wants to create

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
