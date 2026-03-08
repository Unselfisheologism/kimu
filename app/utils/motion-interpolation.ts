import type { Keyframe, InterpolatedValue, EasingType } from "~/types/motion";

// Easing functions
const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  spring: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// Interpolate between two values
function interpolate(
  value1: number,
  value2: number,
  progress: number,
  easing: EasingType
): number {
  const easedProgress = easingFunctions[easing](progress);
  return value1 + (value2 - value1) * easedProgress;
}

// Get keyframes for a specific object and property
function getKeyframesForObjectProperty(
  keyframes: Keyframe[],
  objectId: string,
  property: string
): Keyframe[] {
  return keyframes
    .filter(kf => kf.objectId === objectId && kf.property === property)
    .sort((a, b) => a.time - b.time);
}

// Calculate interpolated value at a given time
export function getInterpolatedValue(
  keyframes: Keyframe[],
  objectId: string,
  property: string,
  time: number
): InterpolatedValue {
  const objectKeyframes = getKeyframesForObjectProperty(keyframes, objectId, property);

  // No keyframes - return default
  if (objectKeyframes.length === 0) {
    return {
      value: 0,
      inProgress: false,
    };
  }

  // Only one keyframe - use its value
  if (objectKeyframes.length === 1) {
    const kf = objectKeyframes[0];
    return {
      value: typeof kf.value === "number" ? kf.value : 0,
      inProgress: false,
    };
  }

  // Before first keyframe - use first keyframe's value
  if (time < objectKeyframes[0].time) {
    const kf = objectKeyframes[0];
    return {
      value: typeof kf.value === "number" ? kf.value : 0,
      inProgress: false,
    };
  }

  // After last keyframe - use last keyframe's value
  if (time >= objectKeyframes[objectKeyframes.length - 1].time) {
    const kf = objectKeyframes[objectKeyframes.length - 1];
    return {
      value: typeof kf.value === "number" ? kf.value : 0,
      inProgress: false,
    };
  }

  // Find the two keyframes that surround the current time
  let startKf: Keyframe | null = null;
  let endKf: Keyframe | null = null;

  for (let i = 0; i < objectKeyframes.length - 1; i++) {
    const current = objectKeyframes[i];
    const next = objectKeyframes[i + 1];

    if (time >= current.time && time <= next.time) {
      startKf = current;
      endKf = next;
      break;
    }
  }

  if (!startKf || !endKf) {
    // Shouldn't happen, but fallback
    const kf = objectKeyframes[0];
    return {
      value: typeof kf.value === "number" ? kf.value : 0,
      inProgress: false,
    };
  }

  // Calculate progress between keyframes
  const duration = endKf.time - startKf.time;
  const elapsed = time - startKf.time;
  const progress = duration > 0 ? elapsed / duration : 0;

  // Interpolate values
  if (typeof startKf.value === "string" || typeof endKf.value === "string") {
    // String values (like color) - just return the end value when past halfway
    return {
      value: progress >= 0.5 ? endKf.value : startKf.value,
      inProgress: progress > 0 && progress < 1,
    };
  }

  const interpolatedValue = interpolate(
    startKf.value as number,
    endKf.value as number,
    progress,
    endKf.easing
  );

  return {
    value: interpolatedValue,
    inProgress: progress > 0 && progress < 1,
  };
}

// Get all keyframes for an object
export function getObjectKeyframes(keyframes: Keyframe[], objectId: string): Keyframe[] {
  return keyframes.filter(kf => kf.objectId === objectId);
}

// Check if a keyframe exists at a specific time for an object/property
export function keyframeExistsAtTime(
  keyframes: Keyframe[],
  objectId: string,
  property: string,
  time: number,
  epsilon: number = 0.001
): boolean {
  return keyframes.some(
    kf =>
      kf.objectId === objectId &&
      kf.property === property &&
      Math.abs(kf.time - time) < epsilon
  );
}

// Find keyframe closest to a time
export function findClosestKeyframe(
  keyframes: Keyframe[],
  objectId: string,
  property: string,
  time: number
): Keyframe | null {
  const objectPropertyKeyframes = getKeyframesForObjectProperty(
    keyframes,
    objectId,
    property
  );

  if (objectPropertyKeyframes.length === 0) return null;

  return objectPropertyKeyframes.reduce((closest, kf) => {
    const closestDistance = Math.abs(closest.time - time);
    const currentDistance = Math.abs(kf.time - time);
    return currentDistance < closestDistance ? kf : closest;
  }, objectPropertyKeyframes[0]);
}
