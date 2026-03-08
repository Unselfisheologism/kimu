// Motion Interpolation Utilities for Kimu
// Handles keyframe interpolation and value calculation

import type { Keyframe, EasingType, FabricObject, MotionGraphicsData } from "~/types/motion";
import { EASING_FUNCTIONS } from "~/types/motion";

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Apply easing function to a normalized time value
 */
export function applyEasing(t: number, easing: EasingType): number {
  const easingFn = EASING_FUNCTIONS[easing] || EASING_FUNCTIONS.linear;
  return easingFn(clamp(t, 0, 1));
}

/**
 * Find the keyframes immediately before and after a given time
 */
export function findSurroundingKeyframes(
  keyframes: Keyframe[],
  property: string,
  time: number
): { before: Keyframe | null; after: Keyframe | null } {
  const propertyKeyframes = keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);

  if (propertyKeyframes.length === 0) {
    return { before: null, after: null };
  }

  // Check if time is before all keyframes
  if (time <= propertyKeyframes[0].time) {
    return { before: null, after: propertyKeyframes[0] };
  }

  // Check if time is after all keyframes
  if (time >= propertyKeyframes[propertyKeyframes.length - 1].time) {
    return { before: propertyKeyframes[propertyKeyframes.length - 1], after: null };
  }

  // Find surrounding keyframes
  for (let i = 0; i < propertyKeyframes.length - 1; i++) {
    if (time >= propertyKeyframes[i].time && time <= propertyKeyframes[i + 1].time) {
      return { before: propertyKeyframes[i], after: propertyKeyframes[i + 1] };
    }
  }

  return { before: null, after: null };
}

/**
 * Interpolate a value at a given time for a specific property
 */
export function interpolateValue(
  keyframes: Keyframe[],
  property: string,
  time: number
): number | string | null {
  const { before, after } = findSurroundingKeyframes(keyframes, property, time);

  // No keyframes for this property
  if (!before && !after) {
    return null;
  }

  // Only one keyframe or before first keyframe
  if (!before && after) {
    return after.value;
  }

  // After last keyframe
  if (before && !after) {
    return before.value;
  }

  // Between two keyframes - interpolate
  if (before && after) {
    const duration = after.time - before.time;
    if (duration === 0) return before.value;

    const rawT = (time - before.time) / duration;
    const t = applyEasing(rawT, after.easing);

    // Handle string values (like colors)
    if (typeof before.value === "string" || typeof after.value === "string") {
      return t < 0.5 ? before.value : after.value;
    }

    // Handle numeric values
    const startValue = typeof before.value === "number" ? before.value : 0;
    const endValue = typeof after.value === "number" ? after.value : 0;
    return lerp(startValue, endValue, t);
  }

  return null;
}

/**
 * Calculate all interpolated property values for an object at a given time
 */
export function calculateObjectPropertiesAtTime(
  obj: FabricObject,
  time: number
): Partial<FabricObject> {
  const properties: Partial<FabricObject> = {};
  const keyframes = obj.keyframes || [];

  // List of animatable properties
  const animatableProperties = [
    "left",
    "top",
    "width",
    "height",
    "scaleX",
    "scaleY",
    "rotation",
    "opacity",
    "skewX",
    "skewY",
    "fill",
    "stroke",
    "strokeWidth",
    "fontSize",
    "radius",
    "rx",
    "ry",
  ] as const;

  for (const prop of animatableProperties) {
    const value = interpolateValue(keyframes, prop, time);
    if (value !== null) {
      (properties as Record<string, unknown>)[prop] = value;
    }
  }

  return properties;
}

/**
 * Calculate the state of all objects at a given time
 */
export function calculateSceneAtTime(
  motionData: MotionGraphicsData,
  time: number
): FabricObject[] {
  return motionData.objects.map((obj) => ({
    ...obj,
    ...calculateObjectPropertiesAtTime(obj, time),
  }));
}

/**
 * Get the duration of the animation based on keyframes
 */
export function getAnimationDuration(keyframes: Keyframe[]): number {
  if (keyframes.length === 0) return 0;
  return Math.max(...keyframes.map((k) => k.time));
}

/**
 * Get all unique properties that have keyframes for an object
 */
export function getAnimatedProperties(obj: FabricObject): string[] {
  if (!obj.keyframes) return [];
  return [...new Set(obj.keyframes.map((k) => k.property))];
}

/**
 * Check if an object has any animations
 */
export function hasAnimations(obj: FabricObject): boolean {
  return !!obj.keyframes && obj.keyframes.length > 0;
}

/**
 * Generate a unique ID for keyframes
 */
export function generateKeyframeId(): string {
  return `kf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a keyframe with a generated ID
 */
export function createKeyframe(
  property: string,
  time: number,
  value: number | string,
  easing: EasingType = "linear"
): Keyframe {
  return {
    id: generateKeyframeId(),
    property,
    time,
    value,
    easing,
  };
}

/**
 * Get keyframes for a specific property sorted by time
 */
export function getKeyframesForProperty(
  keyframes: Keyframe[],
  property: string
): Keyframe[] {
  return keyframes
    .filter((k) => k.property === property)
    .sort((a, b) => a.time - b.time);
}

/**
 * Delete a keyframe by ID
 */
export function deleteKeyframe(keyframes: Keyframe[], keyframeId: string): Keyframe[] {
  return keyframes.filter((k) => k.id !== keyframeId);
}

/**
 * Update a keyframe value
 */
export function updateKeyframe(
  keyframes: Keyframe[],
  keyframeId: string,
  updates: Partial<Keyframe>
): Keyframe[] {
  return keyframes.map((k) => (k.id === keyframeId ? { ...k, ...updates } : k));
}

/**
 * Move a keyframe to a new time
 */
export function moveKeyframe(
  keyframes: Keyframe[],
  keyframeId: string,
  newTime: number
): Keyframe[] {
  return keyframes.map((k) => (k.id === keyframeId ? { ...k, time: newTime } : k));
}

/**
 * Copy keyframes from one object to another
 */
export function copyKeyframes(
  sourceKeyframes: Keyframe[],
  targetObject: FabricObject
): FabricObject {
  return {
    ...targetObject,
    keyframes: sourceKeyframes.map((kf) => ({
      ...kf,
      id: generateKeyframeId(),
    })),
  };
}

/**
 * Reverse keyframes (useful for creating exit animations from entrance animations)
 */
export function reverseKeyframes(keyframes: Keyframe[], duration: number): Keyframe[] {
  return keyframes.map((kf) => ({
    ...kf,
    id: generateKeyframeId(),
    time: duration - kf.time,
  }));
}

/**
 * Scale keyframe times (useful for speeding up or slowing down animations)
 */
export function scaleKeyframes(keyframes: Keyframe[], scale: number): Keyframe[] {
  return keyframes.map((kf) => ({
    ...kf,
    id: generateKeyframeId(),
    time: kf.time * scale,
  }));
}

/**
 * Offset keyframe times
 */
export function offsetKeyframes(keyframes: Keyframe[], offset: number): Keyframe[] {
  return keyframes.map((kf) => ({
    ...kf,
    id: generateKeyframeId(),
    time: Math.max(0, kf.time + offset),
  }));
}

/**
 * Convert seconds to frames
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Convert fabric object to a simplified representation for Remotion rendering
 */
export function fabricObjectToRemotionProps(
  obj: FabricObject,
  motionData: MotionGraphicsData,
  currentTime: number
) {
  const interpolatedProps = calculateObjectPropertiesAtTime(obj, currentTime);

  const baseProps = {
    id: obj.id,
    type: obj.type,
    style: {
      position: "absolute" as const,
      left: interpolatedProps.left ?? obj.left,
      top: interpolatedProps.top ?? obj.top,
      width: interpolatedProps.width ?? obj.width,
      height: interpolatedProps.height ?? obj.height,
      transform: [
        `scaleX(${interpolatedProps.scaleX ?? obj.scaleX ?? 1})`,
        `scaleY(${interpolatedProps.scaleY ?? obj.scaleY ?? 1})`,
        `rotate(${interpolatedProps.rotation ?? obj.rotation ?? 0}deg)`,
        `skewX(${interpolatedProps.skewX ?? obj.skewX ?? 0}deg)`,
        `skewY(${interpolatedProps.skewY ?? obj.skewY ?? 0}deg)`,
      ].join(" "),
      opacity: interpolatedProps.opacity ?? obj.opacity ?? 1,
      backgroundColor: interpolatedProps.fill ?? obj.fill,
      borderColor: interpolatedProps.stroke ?? obj.stroke,
      borderWidth: interpolatedProps.strokeWidth ?? obj.strokeWidth,
    },
  };

  // Add type-specific properties
  switch (obj.type) {
    case "text":
    case "textbox":
      return {
        ...baseProps,
        text: obj.text,
        fontSize: interpolatedProps.fontSize ?? obj.fontSize,
        fontFamily: obj.fontFamily,
        fontWeight: obj.fontWeight,
        fontStyle: obj.fontStyle,
        textAlign: obj.textAlign,
        color: interpolatedProps.fill ?? obj.fill ?? "#ffffff",
      };
    case "circle":
      return {
        ...baseProps,
        borderRadius: "50%",
        width: (interpolatedProps.radius ?? obj.radius ?? 50) * 2,
        height: (interpolatedProps.radius ?? obj.radius ?? 50) * 2,
      };
    case "ellipse":
      return {
        ...baseProps,
        borderRadius: "50%",
        width: (interpolatedProps.rx ?? obj.rx ?? 50) * 2,
        height: (interpolatedProps.ry ?? obj.ry ?? 50) * 2,
      };
    case "image":
      return {
        ...baseProps,
        src: obj.src,
      };
    default:
      return baseProps;
  }
}

/**
 * Get the bounding box of all objects at a specific time
 */
export function getSceneBoundingBox(
  motionData: MotionGraphicsData,
  time: number
): { left: number; top: number; right: number; bottom: number } | null {
  const objects = calculateSceneAtTime(motionData, time);
  if (objects.length === 0) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const obj of objects) {
    const objLeft = obj.left;
    const objTop = obj.top;
    const objRight = objLeft + (obj.width || 0) * (obj.scaleX || 1);
    const objBottom = objTop + (obj.height || 0) * (obj.scaleY || 1);

    left = Math.min(left, objLeft);
    top = Math.min(top, objTop);
    right = Math.max(right, objRight);
    bottom = Math.max(bottom, objBottom);
  }

  return { left, top, right, bottom };
}

/**
 * Calculate total animation duration across all objects
 */
export function getTotalAnimationDuration(motionData: MotionGraphicsData): number {
  let maxDuration = motionData.duration;

  for (const obj of motionData.objects) {
    if (obj.keyframes) {
      const objDuration = getAnimationDuration(obj.keyframes);
      maxDuration = Math.max(maxDuration, objDuration);
    }
  }

  return maxDuration;
}

/**
 * Validate keyframe data
 */
export function validateKeyframe(keyframe: Partial<Keyframe>): string[] {
  const errors: string[] = [];

  if (!keyframe.property) {
    errors.push("Keyframe must have a property");
  }

  if (typeof keyframe.time !== "number" || keyframe.time < 0) {
    errors.push("Keyframe must have a non-negative time value");
  }

  if (keyframe.value === undefined || keyframe.value === null) {
    errors.push("Keyframe must have a value");
  }

  return errors;
}

/**
 * Create a snapshot of the scene at a specific time for export
 */
export function createSceneSnapshot(
  motionData: MotionGraphicsData,
  time: number
): {
  objects: FabricObject[];
  width: number;
  height: number;
  backgroundColor?: string;
} {
  return {
    objects: calculateSceneAtTime(motionData, time),
    width: motionData.canvasWidth,
    height: motionData.canvasHeight,
    backgroundColor: motionData.backgroundColor,
  };
}
