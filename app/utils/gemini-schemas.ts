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

export const FunctionCallResponseSchema = z.object({
  function_call: z
    .union([
      LLMAddScrubberToTimelineArgsSchema,
      LLMMoveScrubberArgsSchema,
      LLMAddScrubberByNameArgsSchema,
      LLMDeleteScrubbersInTrackArgsSchema,
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
export type FunctionCallResponse = z.infer<typeof FunctionCallResponseSchema>;

// Export the ChatMessage type for use in ChatBox
export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};
