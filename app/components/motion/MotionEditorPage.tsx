import React from "react";
import { useOutletContext, useNavigate, useParams } from "react-router";
import { MotionEditor } from "./MotionEditor";
import type { TimelineState, ScrubberState } from "~/components/timeline/types";
import type { MotionGraphicsData } from "~/types/motion";

interface OutletContext {
  timeline: TimelineState;
  handleUpdateScrubber: (scrubber: ScrubberState) => void;
}

export default function MotionEditorPage() {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.id;

  // Get timeline context from outlet
  const context = useOutletContext<OutletContext>();

  if (!context) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const { timeline, handleUpdateScrubber } = context;

  // Find a motion graphics scrubber to edit
  // For now, we'll find the first one or create a placeholder
  const motionScrubber = timeline.tracks
    .flatMap((t) => t.scrubbers)
    .find((s) => s.mediaType === "motion_graphics");

  const handleSave = (motionData: MotionGraphicsData) => {
    if (motionScrubber) {
      handleUpdateScrubber({
        ...motionScrubber,
        motionData,
      });
    }
  };

  const handleClose = () => {
    navigate(`/project/${projectId}/media-bin`);
  };

  // Default motion data if no scrubber selected
  const defaultMotionData: MotionGraphicsData = {
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundColor: "#000000",
    objects: [],
    keyframes: [],
    duration: 5,
    fps: 30,
    loop: false,
    version: "1.0",
  };

  return (
    <div className="h-full">
      {motionScrubber ? (
        <MotionEditor
          scrubberId={motionScrubber.id}
          initialMotionData={motionScrubber.motionData || defaultMotionData}
          onSave={handleSave}
          onClose={handleClose}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Motion Scrubber Selected</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Create a motion graphics scrubber first by using the AI assistant or timeline
            operations. You can ask the AI to &ldquo;create a motion graphic&rdquo; or
            &ldquo;add animated text&rdquo;.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Back to Media Bin
          </button>
        </div>
      )}
    </div>
  );
}
