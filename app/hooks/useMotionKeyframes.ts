// Motion Keyframes Hook for Kimu
// Manages keyframe state for motion graphics scrubbers

import { useState, useCallback, useMemo } from "react";
import type {
  Keyframe,
  EasingType,
  FabricObject,
  MotionGraphicsData,
} from "~/types/motion";
import {
  createKeyframe,
  deleteKeyframe,
  updateKeyframe,
  moveKeyframe,
  getKeyframesForProperty,
  generateKeyframeId,
  getAnimationDuration,
  secondsToFrames,
  framesToSeconds,
} from "~/utils/motion-interpolation";

export interface UseMotionKeyframesReturn {
  // Keyframe operations
  keyframes: Keyframe[];
  addKeyframe: (
    objectId: string,
    property: string,
    time: number,
    value: number | string,
    easing?: EasingType
  ) => void;
  removeKeyframe: (keyframeId: string) => void;
  updateKeyframeValue: (keyframeId: string, value: number | string) => void;
  updateKeyframeTime: (keyframeId: string, time: number) => void;
  updateKeyframeEasing: (keyframeId: string, easing: EasingType) => void;
  moveKeyframeToTime: (keyframeId: string, newTime: number) => void;

  // Bulk operations
  duplicateKeyframes: (sourceObjectId: string, targetObjectId: string) => void;
  deleteAllKeyframesForObject: (objectId: string) => void;
  deleteKeyframesForProperty: (objectId: string, property: string) => void;

  // Query operations
  getKeyframesForObject: (objectId: string) => Keyframe[];
  getObjectKeyframesForProperty: (objectId: string, property: string) => Keyframe[];
  hasKeyframes: (objectId: string) => boolean;
  hasPropertyKeyframes: (objectId: string, property: string) => boolean;

  // Animation info
  totalDuration: number;
  animatedObjects: string[];
  animatedProperties: Map<string, string[]>;

  // Current time playback
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  // Recording mode
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  recordKeyframe: (objectId: string, property: string, value: number | string) => void;
}

export function useMotionKeyframes(
  initialKeyframes: Keyframe[] = [],
  initialDuration: number = 5
): UseMotionKeyframesReturn {
  const [keyframes, setKeyframes] = useState<Keyframe[]>(initialKeyframes);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Add a new keyframe
  const addKeyframe = useCallback(
    (
      objectId: string,
      property: string,
      time: number,
      value: number | string,
      easing: EasingType = "linear"
    ) => {
      const newKeyframe: Keyframe = {
        ...createKeyframe(property, time, value, easing),
        objectId, // Add objectId to track which object this keyframe belongs to
      };

      setKeyframes((prev) => {
        // Check if a keyframe already exists at this exact time and property
        const existingIndex = prev.findIndex(
          (k) => k.objectId === objectId && k.property === property && k.time === time
        );

        if (existingIndex >= 0) {
          // Update existing keyframe
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], value, easing };
          return updated;
        }

        return [...prev, newKeyframe];
      });
    },
    []
  );

  // Remove a keyframe by ID
  const removeKeyframe = useCallback((keyframeId: string) => {
    setKeyframes((prev) => deleteKeyframe(prev, keyframeId));
  }, []);

  // Update keyframe value
  const updateKeyframeValue = useCallback((keyframeId: string, value: number | string) => {
    setKeyframes((prev) => updateKeyframe(prev, keyframeId, { value }));
  }, []);

  // Update keyframe time
  const updateKeyframeTime = useCallback((keyframeId: string, time: number) => {
    setKeyframes((prev) => updateKeyframe(prev, keyframeId, { time }));
  }, []);

  // Update keyframe easing
  const updateKeyframeEasing = useCallback((keyframeId: string, easing: EasingType) => {
    setKeyframes((prev) => updateKeyframe(prev, keyframeId, { easing }));
  }, []);

  // Move keyframe to a new time
  const moveKeyframeToTime = useCallback((keyframeId: string, newTime: number) => {
    setKeyframes((prev) => moveKeyframe(prev, keyframeId, newTime));
  }, []);

  // Duplicate keyframes from one object to another
  const duplicateKeyframes = useCallback((sourceObjectId: string, targetObjectId: string) => {
    setKeyframes((prev) => {
      const sourceKeyframes = prev.filter((k) => k.objectId === sourceObjectId);
      const newKeyframes = sourceKeyframes.map((kf) => ({
        ...kf,
        id: generateKeyframeId(),
        objectId: targetObjectId,
      }));
      return [...prev, ...newKeyframes];
    });
  }, []);

  // Delete all keyframes for an object
  const deleteAllKeyframesForObject = useCallback((objectId: string) => {
    setKeyframes((prev) => prev.filter((k) => k.objectId !== objectId));
  }, []);

  // Delete keyframes for a specific property of an object
  const deleteKeyframesForProperty = useCallback((objectId: string, property: string) => {
    setKeyframes((prev) =>
      prev.filter((k) => !(k.objectId === objectId && k.property === property))
    );
  }, []);

  // Get all keyframes for a specific object
  const getKeyframesForObject = useCallback(
    (objectId: string) => {
      return keyframes.filter((k) => k.objectId === objectId);
    },
    [keyframes]
  );

  // Get keyframes for a specific property of an object
  const getObjectKeyframesForProperty = useCallback(
    (objectId: string, property: string) => {
      return getKeyframesForProperty(
        keyframes.filter((k) => k.objectId === objectId),
        property
      );
    },
    [keyframes]
  );

  // Check if an object has any keyframes
  const hasKeyframes = useCallback(
    (objectId: string) => {
      return keyframes.some((k) => k.objectId === objectId);
    },
    [keyframes]
  );

  // Check if an object has keyframes for a specific property
  const hasPropertyKeyframes = useCallback(
    (objectId: string, property: string) => {
      return keyframes.some((k) => k.objectId === objectId && k.property === property);
    },
    [keyframes]
  );

  // Record a keyframe at current time (for recording mode)
  const recordKeyframe = useCallback(
    (objectId: string, property: string, value: number | string) => {
      if (!isRecording) return;
      addKeyframe(objectId, property, currentTime, value);
    },
    [isRecording, currentTime, addKeyframe]
  );

  // Calculate total duration across all keyframes
  const totalDuration = useMemo(() => {
    return Math.max(initialDuration, getAnimationDuration(keyframes));
  }, [keyframes, initialDuration]);

  // Get list of object IDs that have keyframes
  const animatedObjects = useMemo(() => {
    return [...new Set(keyframes.map((k) => k.objectId).filter(Boolean))];
  }, [keyframes]);

  // Get map of object IDs to their animated properties
  const animatedProperties = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const kf of keyframes) {
      if (!kf.objectId) continue;
      const props = map.get(kf.objectId) || [];
      if (!props.includes(kf.property)) {
        props.push(kf.property);
      }
      map.set(kf.objectId, props);
    }
    return map;
  }, [keyframes]);

  return {
    keyframes,
    addKeyframe,
    removeKeyframe,
    updateKeyframeValue,
    updateKeyframeTime,
    updateKeyframeEasing,
    moveKeyframeToTime,
    duplicateKeyframes,
    deleteAllKeyframesForObject,
    deleteKeyframesForProperty,
    getKeyframesForObject,
    getObjectKeyframesForProperty,
    hasKeyframes,
    hasPropertyKeyframes,
    totalDuration,
    animatedObjects,
    animatedProperties,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    isRecording,
    setIsRecording,
    recordKeyframe,
  };
}

// Extend Keyframe type to include objectId
 declare module "~/types/motion" {
  interface Keyframe {
    objectId?: string;
  }
}
