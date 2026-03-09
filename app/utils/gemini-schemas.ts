import { z } from "zod";

export const TextPropertiesSchema = z.object({
  textContent: z.string().describe("The text content to display"),
  fontSize: z.number().describe("Font size in pixels"),
  fontFamily: z.string().describe("Font family name"),
  color: z.string().describe("Text color in hex format"),
  textAlign: z.enum(["left", "center", "right"]).describe("Text alignment"),
  fontWeight: z.enum(["normal", "bold"]).describe("Font weight"),
});

export const BaseScrubberSchema = z.object({
  id: z.string().describe("Unique identifier for the scrubber"),
  mediaType: z.enum(["video", "image", "audio", "text"]).describe("Type of media"),
  mediaUrlLocal: z.string().nullable().describe("Local URL for the media file"),
  mediaUrlRemote: z.string().nullable().describe("Remote URL for the media file"),
  media_width: z.number().describe("Width of the media in pixels"),
  media_height: z.number().describe("Height of the media in pixels"),
  text: TextPropertiesSchema.nullable().describe("Text properties if mediaType is text"),
});

export const MediaBinItemSchema = BaseScrubberSchema.extend({
  name: z.string().describe("Display name for the media item"),
  durationInSeconds: z.number().describe("Duration of the media in seconds"),
});

export const LLMAddScrubberToTimelineArgsSchema = z.object({
  function_name: z.literal("LLMAddScrubberToTimeline").describe("The name of the function to call"),
  scrubber_id: z.string().describe("The id of the scrubber to add to the timeline"),
  track_id: z.string().describe("The id of the track to add the scrubber to"),
  drop_left_px: z.number().describe("The left position of the scrubber in pixels"),
});

export const LLMMoveScrubberArgsSchema = z.object({
  function_name: z.literal("LLMMoveScrubber").describe("The name of the function to call"),
  scrubber_id: z.string().describe("The id of the scrubber to move"),
  new_position_seconds: z.number().describe("The new position of the scrubber in seconds"),
  new_track_number: z.number().describe("The new track number of the scrubber"),
  pixels_per_second: z.number().describe("The number of pixels per second"),
});

export const LLMAddScrubberByNameArgsSchema = z.object({
  function_name: z.literal("LLMAddScrubberByName").describe("The name of the function to call"),
  scrubber_name: z.string().describe("The partial or full name of the media to add"),
  track_number: z.number().describe("1-based track number to add to"),
  position_seconds: z.number().describe("Timeline time in seconds to place the media at"),
  pixels_per_second: z.number().describe("Pixels per second to convert time to pixels"),
});

export const LLMDeleteScrubbersInTrackArgsSchema = z.object({
  function_name: z.literal("LLMDeleteScrubbersInTrack").describe("The name of the function to call"),
  track_number: z.number().describe("1-based track number whose scrubbers will be removed"),
});

// Motion Graphics Schemas
export const LLMCreateMotionScrubberArgsSchema = z.object({
  function_name: z.literal("LLMCreateMotionScrubber").describe("Create a new motion graphics scrubber on the timeline"),
  track_number: z.number().describe("1-based track number to place the motion scrubber"),
  position_seconds: z.number().describe("Timeline time in seconds to place the motion scrubber"),
  duration_seconds: z.number().describe("Duration of the motion graphics in seconds"),
  canvas_width: z.number().optional().describe("Width of the motion canvas in pixels (default: 1920)"),
  canvas_height: z.number().optional().describe("Height of the motion canvas in pixels (default: 1080)"),
  background_color: z.string().optional().describe("Background color of the motion canvas (default: #000000)"),
  pixels_per_second: z.number().optional().describe("Pixels per second for timeline calculations"),
});

export const LLMAddShapeArgsSchema = z.object({
  function_name: z.literal("LLMAddShape").describe("Add a shape to a motion graphics scrubber"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  shape_type: z.enum(["rect", "circle", "triangle", "ellipse", "line", "text"]).describe("Type of shape to add"),
  left: z.number().describe("X position of the shape"),
  top: z.number().describe("Y position of the shape"),
  width: z.number().describe("Width of the shape"),
  height: z.number().describe("Height of the shape"),
  fill: z.string().optional().describe("Fill color of the shape"),
  stroke: z.string().optional().describe("Stroke color of the shape"),
  stroke_width: z.number().optional().describe("Stroke width"),
  text: z.string().optional().describe("Text content (for text shapes)"),
  font_size: z.number().optional().describe("Font size (for text shapes)"),
  font_family: z.string().optional().describe("Font family (for text shapes)"),
});

export const LLMCreateKeyframeArgsSchema = z.object({
  function_name: z.literal("LLMCreateKeyframe").describe("Create a keyframe for an object in motion graphics"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  object_id: z.string().describe("ID of the object to animate"),
  property: z.enum(["x", "y", "scaleX", "scaleY", "rotation", "opacity", "fill", "stroke", "width", "height", "fontSize"]).describe("Property to animate"),
  time: z.number().describe("Time in seconds for the keyframe"),
  value: z.union([z.number(), z.string()]).describe("Value of the property at this keyframe"),
  easing: z.enum(["linear", "easeIn", "easeOut", "easeInOut", "spring", "bounce", "elastic"]).optional().describe("Easing function"),
});

export const LLMApplyFilterArgsSchema = z.object({
  function_name: z.literal("LLMApplyFilter").describe("Apply a filter to an object in motion graphics"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  object_id: z.string().describe("ID of the object to filter"),
  filter_type: z.enum(["blur", "brightness", "contrast", "sepia", "grayscale", "invert"]).describe("Type of filter"),
  value: z.number().describe("Filter intensity (0-1 or higher depending on filter)"),
});

export const LLMDeleteObjectArgsSchema = z.object({
  function_name: z.literal("LLMDeleteObject").describe("Delete an object from motion graphics"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  object_id: z.string().describe("ID of the object to delete"),
});

export const LLMUpdateObjectArgsSchema = z.object({
  function_name: z.literal("LLMUpdateObject").describe("Update properties of an object in motion graphics"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  object_id: z.string().describe("ID of the object to update"),
  properties: z.record(z.string(), z.any()).describe("Object properties to update"),
});

export const LLMAnimateObjectArgsSchema = z.object({
  function_name: z.literal("LLMAnimateObject").describe("Apply a preset animation to an object"),
  scrubber_id: z.string().describe("ID of the motion graphics scrubber"),
  object_id: z.string().describe("ID of the object to animate"),
  animation_type: z.enum(["fadeIn", "fadeOut", "slideIn", "slideOut", "scaleIn", "scaleOut", "rotate", "bounce", "pulse", "shake"]).describe("Type of animation preset"),
  duration: z.number().describe("Duration of the animation in seconds"),
  easing: z.enum(["linear", "easeIn", "easeOut", "easeInOut", "spring", "bounce", "elastic"]).optional().describe("Easing function"),
});

// Remotion Code Generation Schema
export const WriteRemotionCodeArgsSchema = z.object({
  function_name: z.literal("WriteRemotionCode").describe("Generate TypeScript/React code using Remotion components for programmatic video creation"),
  description: z.string().describe("Description of the video to generate (e.g., 'animated intro with bouncing text', 'fade transition between scenes')"),
  composition_name: z.string().describe("Name for the composition (e.g., 'Intro', 'Outro', 'Transition')"),
  duration_in_frames: z.number().describe("Duration of the video in frames (at 30fps)"),
  width: z.number().optional().describe("Video width in pixels (default: 1920)"),
  height: z.number().optional().describe("Video height in pixels (default: 1080)"),
  fps: z.number().optional().describe("Frames per second (default: 30)"),
  detected_skills: z.array(z.string()).optional().describe("Skills detected from the description that should be used in the code"),
});

export const FunctionCallResponseSchema = z.object({
  function_call: z
    .union([
      LLMAddScrubberToTimelineArgsSchema,
      LLMMoveScrubberArgsSchema,
      LLMAddScrubberByNameArgsSchema,
      LLMDeleteScrubbersInTrackArgsSchema,
      LLMCreateMotionScrubberArgsSchema,
      LLMAddShapeArgsSchema,
      LLMCreateKeyframeArgsSchema,
      LLMApplyFilterArgsSchema,
      LLMDeleteObjectArgsSchema,
      LLMUpdateObjectArgsSchema,
      LLMAnimateObjectArgsSchema,
      WriteRemotionCodeArgsSchema,
    ])
    .nullable()
    .optional(),
  assistant_message: z.string().nullable().optional(),
});

export type TextProperties = z.infer<typeof TextPropertiesSchema>;
export type MediaBinItem = z.infer<typeof MediaBinItemSchema>;
export type LLMAddScrubberToTimelineArgs = z.infer<typeof LLMAddScrubberToTimelineArgsSchema>;
export type LLMMoveScrubberArgs = z.infer<typeof LLMMoveScrubberArgsSchema>;
export type LLMAddScrubberByNameArgs = z.infer<typeof LLMAddScrubberByNameArgsSchema>;
export type LLMDeleteScrubbersInTrackArgs = z.infer<typeof LLMDeleteScrubbersInTrackArgsSchema>;
export type LLMCreateMotionScrubberArgs = z.infer<typeof LLMCreateMotionScrubberArgsSchema>;
export type LLMAddShapeArgs = z.infer<typeof LLMAddShapeArgsSchema>;
export type LLMCreateKeyframeArgs = z.infer<typeof LLMCreateKeyframeArgsSchema>;
export type LLMApplyFilterArgs = z.infer<typeof LLMApplyFilterArgsSchema>;
export type LLMDeleteObjectArgs = z.infer<typeof LLMDeleteObjectArgsSchema>;
export type LLMUpdateObjectArgs = z.infer<typeof LLMUpdateObjectArgsSchema>;
export type LLMAnimateObjectArgs = z.infer<typeof LLMAnimateObjectArgsSchema>;
export type WriteRemotionCodeArgs = z.infer<typeof WriteRemotionCodeArgsSchema>;
export type FunctionCallResponse = z.infer<typeof FunctionCallResponseSchema>;

// Export the ChatMessage type for use in ChatBox
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};
