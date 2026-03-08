import { useState, useCallback } from "react";
import type { Keyframe, EasingType } from "~/types/motion";
import { generateUUID } from "~/utils/uuid";

export interface UseMotionKeyframesOptions {
  initialKeyframes?: Keyframe[];
}

export function useMotionKeyframes(options: UseMotionKeyframesOptions = {}) {
  const [keyframes, setKeyframes] = useState<Keyframe[]>(
    options.initialKeyframes || []
  );

  // Add a new keyframe
  const addKeyframe = useCallback(
    (keyframe: Omit<Keyframe, "id">) => {
      const newKeyframe: Keyframe = {
        ...keyframe,
        id: generateUUID(),
      };
      setKeyframes(prev => [...prev, newKeyframe]);
      return newKeyframe;
    },
    []
  );

  // Update an existing keyframe
  const updateKeyframe = useCallback((id: string, updates: Partial<Keyframe>) => {
    setKeyframes(prev =>
      prev.map(kf => (kf.id === id ? { ...kf, ...updates } : kf))
    );
  }, []);

  // Delete a keyframe
  const deleteKeyframe = useCallback((id: string) => {
    setKeyframes(prev => prev.filter(kf => kf.id !== id));
  }, []);

  // Get keyframes for an object
  const getObjectKeyframes = useCallback(
    (objectId: string) => {
      return keyframes.filter(kf => kf.objectId === objectId);
    },
    [keyframes]
  );

  // Get keyframes for a specific object property
  const getPropertyKeyframes = useCallback(
    (objectId: string, property: string) => {
      return keyframes
        .filter(kf => kf.objectId === objectId && kf.property === property)
        .sort((a, b) => a.time - b.time);
    },
    [keyframes]
  );

  // Delete all keyframes for an object
  const deleteObjectKeyframes = useCallback((objectId: string) => {
    setKeyframes(prev => prev.filter(kf => kf.objectId !== objectId));
  }, []);

  // Delete all keyframes for a specific property
  const deletePropertyKeyframes = useCallback(
    (objectId: string, property: string) => {
      setKeyframes(prev =>
        prev.filter(
          kf => !(kf.objectId === objectId && kf.property === property)
        )
      );
    },
    []
  );

  // Set all keyframes (replace current state)
  const setAllKeyframes = useCallback((newKeyframes: Keyframe[]) => {
    setKeyframes(newKeyframes);
  }, []);

  // Clear all keyframes
  const clearAllKeyframes = useCallback(() => {
    setKeyframes([]);
  }, []);

  return {
    keyframes,
    addKeyframe,
    updateKeyframe,
    deleteKeyframe,
    getObjectKeyframes,
    getPropertyKeyframes,
    deleteObjectKeyframes,
    deletePropertyKeyframes,
    setAllKeyframes,
    clearAllKeyframes,
  };
}
