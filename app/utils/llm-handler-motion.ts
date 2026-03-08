// LLM Motion Handler for Kimu
// AI-callable functions for motion graphics operations

import type {
  TimelineState,
  ScrubberState,
  MediaBinItem,
} from "~/components/timeline/types";
import type {
  FabricObject,
  FabricObjectType,
  EasingType,
  FilterType,
  KeyframeProperty,
  MotionGraphicsData,
  LLMAddShapeArgs,
  LLMCreateKeyframeArgs,
  LLMApplyFilterArgs,
  LLMSetEasingArgs,
  LLMGroupObjectsArgs,
  LLMUngroupObjectsArgs,
  LLMImportLottieArgs,
  LLMDeleteObjectArgs,
  LLMUpdateObjectArgs,
  LLMAnimateObjectArgs,
  LLMCreateMotionScrubberArgs,
} from "~/types/motion";
import { generateUUID } from "./uuid";
import { ANIMATION_PRESETS, DEFAULT_MOTION_CANVAS_WIDTH, DEFAULT_MOTION_CANVAS_HEIGHT, DEFAULT_MOTION_DURATION } from "~/types/motion";
import { createKeyframe, offsetKeyframes } from "./motion-interpolation";

// ============================
// MOTION SCRUBBER OPERATIONS
// ============================

export function llmCreateMotionScrubber(
  trackNumber: number,
  positionSeconds: number,
  durationSeconds: number,
  pixelsPerSecond: number,
  timeline: TimelineState,
  handleDropOnTrack: (item: MediaBinItem, trackId: string, dropLeftPx: number) => void,
  canvasWidth: number = DEFAULT_MOTION_CANVAS_WIDTH,
  canvasHeight: number = DEFAULT_MOTION_CANVAS_HEIGHT,
  backgroundColor: string = "#000000"
): string {
  const trackIndex = trackNumber - 1;
  if (trackIndex < 0 || trackIndex >= timeline.tracks.length) {
    throw new Error(`Track ${trackNumber} does not exist`);
  }

  const trackId = timeline.tracks[trackIndex].id;
  const dropLeftPx = positionSeconds * pixelsPerSecond;
  const widthPx = durationSeconds * pixelsPerSecond;

  // Create motion graphics data
  const motionData: MotionGraphicsData = {
    canvasWidth,
    canvasHeight,
    backgroundColor,
    objects: [],
    keyframes: [],
    duration: durationSeconds,
    fps: 30,
    loop: false,
    version: "1.0",
  };

  // Create the motion scrubber as a MediaBinItem
  const motionItem: MediaBinItem = {
    id: generateUUID(),
    name: `Motion Graphic ${Date.now()}`,
    mediaType: "motion_graphics" as const,
    mediaUrlLocal: null,
    mediaUrlRemote: null,
    media_width: canvasWidth,
    media_height: canvasHeight,
    durationInSeconds: durationSeconds,
    uploadProgress: null,
    isUploading: false,
    text: null,
    groupped_scrubbers: null,
    left_transition_id: null,
    right_transition_id: null,
    // Store motion data in a special property
    motionData,
  };

  handleDropOnTrack(motionItem, trackId, dropLeftPx);

  return motionItem.id;
}

// ============================
// SHAPE OPERATIONS
// ============================

export function llmAddShape(
  scrubberId: string,
  shapeType: FabricObjectType,
  left: number,
  top: number,
  width: number,
  height: number,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void,
  options: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    label?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
  } = {}
): string {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber) {
    throw new Error(`Scrubber with id ${scrubberId} not found`);
  }

  if (scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Scrubber ${scrubberId} is not a motion graphics scrubber`);
  }

  const motionData = scrubber.motionData || {
    canvasWidth: DEFAULT_MOTION_CANVAS_WIDTH,
    canvasHeight: DEFAULT_MOTION_CANVAS_HEIGHT,
    objects: [],
    keyframes: [],
    duration: DEFAULT_MOTION_DURATION,
    fps: 30,
    loop: false,
    version: "1.0",
  };

  const newObject: FabricObject = {
    id: generateUUID(),
    type: shapeType,
    left,
    top,
    width: shapeType === "circle" ? width / 2 : width,
    height: shapeType === "circle" ? height / 2 : height,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    fill: options.fill || (shapeType === "text" ? "#ffffff" : "#3b82f6"),
    stroke: options.stroke,
    strokeWidth: options.strokeWidth || 0,
    filters: [],
    // Type-specific properties
    ...(shapeType === "text" || shapeType === "textbox"
      ? {
          text: options.text || options.label || "Text",
          fontSize: options.fontSize || 48,
          fontFamily: options.fontFamily || "Arial",
          fontWeight: "normal",
          textAlign: "center",
        }
      : {}),
    ...(shapeType === "circle"
      ? {
          radius: width / 2,
        }
      : {}),
    visible: true,
    selectable: true,
  };

  const updatedMotionData: MotionGraphicsData = {
    ...motionData,
    objects: [...motionData.objects, newObject],
  };

  const updatedScrubber: ScrubberState = {
    ...scrubber,
    motionData: updatedMotionData,
  };

  handleUpdateScrubber(updatedScrubber);

  return newObject.id;
}

// ============================
// KEYFRAME OPERATIONS
// ============================

export function llmCreateKeyframe(
  scrubberId: string,
  objectId: string,
  property: KeyframeProperty,
  time: number,
  value: number | string,
  easing: EasingType,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): string {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  const object = motionData.objects.find((o) => o.id === objectId);

  if (!object) {
    throw new Error(`Object ${objectId} not found in scrubber ${scrubberId}`);
  }

  const newKeyframe = createKeyframe(property, time, value, easing);

  // Initialize keyframes array if needed
  const objectKeyframes = object.keyframes || [];

  // Check for existing keyframe at this time/property and update instead
  const existingIndex = objectKeyframes.findIndex(
    (k) => k.property === property && Math.abs(k.time - time) < 0.001
  );

  let updatedKeyframes: typeof objectKeyframes;
  if (existingIndex >= 0) {
    updatedKeyframes = [...objectKeyframes];
    updatedKeyframes[existingIndex] = { ...newKeyframe, id: objectKeyframes[existingIndex].id };
  } else {
    updatedKeyframes = [...objectKeyframes, newKeyframe];
  }

  const updatedObject: FabricObject = {
    ...object,
    keyframes: updatedKeyframes,
  };

  const updatedMotionData: MotionGraphicsData = {
    ...motionData,
    objects: motionData.objects.map((o) => (o.id === objectId ? updatedObject : o)),
  };

  handleUpdateScrubber({
    ...scrubber,
    motionData: updatedMotionData,
  });

  return newKeyframe.id;
}

export function llmSetEasing(
  scrubberId: string,
  keyframeId: string,
  easing: EasingType,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): void {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  let keyframeFound = false;

  const updatedObjects = motionData.objects.map((obj) => {
    if (!obj.keyframes) return obj;

    const updatedKeyframes = obj.keyframes.map((kf) => {
      if (kf.id === keyframeId) {
        keyframeFound = true;
        return { ...kf, easing };
      }
      return kf;
    });

    return { ...obj, keyframes: updatedKeyframes };
  });

  if (!keyframeFound) {
    throw new Error(`Keyframe ${keyframeId} not found`);
  }

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: updatedObjects,
    },
  });
}

// ============================
// FILTER OPERATIONS
// ============================

export function llmApplyFilter(
  scrubberId: string,
  objectId: string,
  filterType: FilterType,
  value: number,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): void {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  const object = motionData.objects.find((o) => o.id === objectId);

  if (!object) {
    throw new Error(`Object ${objectId} not found`);
  }

  // Check if filter already exists
  const existingFilterIndex = object.filters.findIndex((f) => f.type === filterType);
  let updatedFilters;

  if (existingFilterIndex >= 0) {
    updatedFilters = [...object.filters];
    updatedFilters[existingFilterIndex] = { type: filterType, value };
  } else {
    updatedFilters = [...object.filters, { type: filterType, value }];
  }

  const updatedObject: FabricObject = {
    ...object,
    filters: updatedFilters,
  };

  const updatedMotionData: MotionGraphicsData = {
    ...motionData,
    objects: motionData.objects.map((o) => (o.id === objectId ? updatedObject : o)),
  };

  handleUpdateScrubber({
    ...scrubber,
    motionData: updatedMotionData,
  });
}

// ============================
// GROUP OPERATIONS
// ============================

export function llmGroupObjects(
  scrubberId: string,
  objectIds: string[],
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): string {
  if (objectIds.length < 2) {
    throw new Error("At least 2 objects are required to form a group");
  }

  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  const objectsToGroup = motionData.objects.filter((o) => objectIds.includes(o.id));

  if (objectsToGroup.length !== objectIds.length) {
    throw new Error("One or more objects not found");
  }

  // Calculate group bounds
  const leftmost = Math.min(...objectsToGroup.map((o) => o.left));
  const topmost = Math.min(...objectsToGroup.map((o) => o.top));
  const rightmost = Math.max(...objectsToGroup.map((o) => o.left + (o.width || 0)));
  const bottommost = Math.max(...objectsToGroup.map((o) => o.top + (o.height || 0)));

  const groupObject: FabricObject = {
    id: generateUUID(),
    type: "group",
    left: leftmost,
    top: topmost,
    width: rightmost - leftmost,
    height: bottommost - topmost,
    objects: objectsToGroup.map((o) => ({
      ...o,
      // Adjust positions relative to group
      left: o.left - leftmost,
      top: o.top - topmost,
    })),
    fill: "transparent",
    filters: [],
  };

  // Remove individual objects and add group
  const remainingObjects = motionData.objects.filter((o) => !objectIds.includes(o.id));

  const updatedMotionData: MotionGraphicsData = {
    ...motionData,
    objects: [...remainingObjects, groupObject],
  };

  handleUpdateScrubber({
    ...scrubber,
    motionData: updatedMotionData,
  });

  return groupObject.id;
}

export function llmUngroupObjects(
  scrubberId: string,
  objectId: string,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): string[] {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  const group = motionData.objects.find((o) => o.id === objectId);

  if (!group || group.type !== "group" || !group.objects) {
    throw new Error(`Group ${objectId} not found`);
  }

  // Restore child objects with adjusted positions
  const restoredObjects = group.objects.map((child) => ({
    ...child,
    left: child.left + group.left,
    top: child.top + group.top,
    id: generateUUID(), // Generate new IDs
  }));

  const updatedObjects = motionData.objects
    .filter((o) => o.id !== objectId)
    .concat(restoredObjects);

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: updatedObjects,
    },
  });

  return restoredObjects.map((o) => o.id);
}

// ============================
// OBJECT OPERATIONS
// ============================

export function llmDeleteObject(
  scrubberId: string,
  objectId: string,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): void {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;

  if (!motionData.objects.find((o) => o.id === objectId)) {
    throw new Error(`Object ${objectId} not found`);
  }

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: motionData.objects.filter((o) => o.id !== objectId),
    },
  });
}

export function llmUpdateObject(
  scrubberId: string,
  objectId: string,
  properties: Partial<FabricObject>,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): void {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;
  const object = motionData.objects.find((o) => o.id === objectId);

  if (!object) {
    throw new Error(`Object ${objectId} not found`);
  }

  const updatedObject: FabricObject = {
    ...object,
    ...properties,
  };

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: motionData.objects.map((o) => (o.id === objectId ? updatedObject : o)),
    },
  });
}

// ============================
// ANIMATION PRESET OPERATIONS
// ============================

export function llmAnimateObject(
  scrubberId: string,
  objectId: string,
  animationType: string,
  duration: number,
  easing: EasingType = "easeInOut",
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void
): string[] {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const preset = ANIMATION_PRESETS.find((p) => p.id === animationType);
  if (!preset) {
    throw new Error(`Animation preset ${animationType} not found`);
  }

  const motionData = scrubber.motionData!;
  const object = motionData.objects.find((o) => o.id === objectId);

  if (!object) {
    throw new Error(`Object ${objectId} not found`);
  }

  // Scale preset keyframes to requested duration and offset to start at time 0
  const timeScale = duration / preset.duration;
  const newKeyframes = preset.keyframes.map((kf) => ({
    ...kf,
    id: generateUUID(),
    time: kf.time * timeScale,
    easing: easing || kf.easing,
  }));

  const updatedObject: FabricObject = {
    ...object,
    keyframes: [...(object.keyframes || []), ...newKeyframes],
  };

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: motionData.objects.map((o) => (o.id === objectId ? updatedObject : o)),
    },
  });

  return newKeyframes.map((kf) => kf.id);
}

// ============================
// LOTTIE IMPORT
// ============================

export function llmImportLottie(
  scrubberId: string,
  timeline: TimelineState,
  handleUpdateScrubber: (scrubber: ScrubberState) => void,
  lottieUrl?: string,
  lottieJson?: object
): string {
  if (!lottieUrl && !lottieJson) {
    throw new Error("Either lottieUrl or lottieJson must be provided");
  }

  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    throw new Error(`Motion graphics scrubber ${scrubberId} not found`);
  }

  const motionData = scrubber.motionData!;

  // Create a placeholder object for Lottie
  // In a full implementation, this would parse the Lottie JSON and convert to fabric objects
  const lottieObject: FabricObject = {
    id: generateUUID(),
    type: "group",
    left: motionData.canvasWidth / 2 - 100,
    top: motionData.canvasHeight / 2 - 100,
    width: 200,
    height: 200,
    fill: "transparent",
    filters: [],
    // Store Lottie data
    lottieUrl,
    lottieData: lottieJson,
  } as FabricObject;

  handleUpdateScrubber({
    ...scrubber,
    motionData: {
      ...motionData,
      objects: [...motionData.objects, lottieObject],
    },
  });

  return lottieObject.id;
}

// ============================
// UTILITY FUNCTIONS
// ============================

export function llmGetMotionScrubberObjects(
  scrubberId: string,
  timeline: TimelineState
): FabricObject[] {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    return [];
  }

  return scrubber.motionData?.objects || [];
}

export function llmGetMotionScrubberInfo(
  scrubberId: string,
  timeline: TimelineState
): {
  objectCount: number;
  animatedObjectCount: number;
  totalKeyframes: number;
  duration: number;
  canvasSize: { width: number; height: number };
} | null {
  const allScrubbers = timeline.tracks.flatMap((track) => track.scrubbers);
  const scrubber = allScrubbers.find((s) => s.id === scrubberId);

  if (!scrubber || scrubber.mediaType !== "motion_graphics") {
    return null;
  }

  const motionData = scrubber.motionData!;
  const objects = motionData.objects || [];
  const animatedObjects = objects.filter((o) => o.keyframes && o.keyframes.length > 0);
  const totalKeyframes = objects.reduce((sum, o) => sum + (o.keyframes?.length || 0), 0);

  return {
    objectCount: objects.length,
    animatedObjectCount: animatedObjects.length,
    totalKeyframes,
    duration: motionData.duration,
    canvasSize: {
      width: motionData.canvasWidth,
      height: motionData.canvasHeight,
    },
  };
}
