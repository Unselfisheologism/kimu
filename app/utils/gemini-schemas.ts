// Type definitions ported from backend/schema.py

export interface LLMAddScrubberToTimelineArgs {
  function_name: "LLMAddScrubberToTimeline";
  scrubber_id: string;
  track_id: string;
  drop_left_px: number;
}

export interface LLMMoveScrubberArgs {
  function_name: "LLMMoveScrubber";
  scrubber_id: string;
  new_position_seconds: number;
  new_track_number: number;
  pixels_per_second: number;
}

export interface LLMAddScrubberByNameArgs {
  function_name: "LLMAddScrubberByName";
  scrubber_name: string;
  track_number: number;
  position_seconds: number;
  pixels_per_second: number;
}

export interface LLMDeleteScrubbersInTrackArgs {
  function_name: "LLMDeleteScrubbersInTrack";
  track_number: number;
}

export type FunctionCallArgs =
  | LLMAddScrubberToTimelineArgs
  | LLMMoveScrubberArgs
  | LLMAddScrubberByNameArgs
  | LLMDeleteScrubbersInTrackArgs;

export interface FunctionCallResponse {
  function_call: FunctionCallArgs | null;
  assistant_message: string | null;
}
