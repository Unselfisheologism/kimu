import React, { useRef, useEffect } from "react";
import { useFabricCanvas } from "~/hooks/useFabricCanvas";
import type { FabricObject } from "~/types/motion";
import { cn } from "~/lib/utils";

interface MotionCanvasProps {
  width: number;
  height: number;
  backgroundColor?: string;
  objects?: FabricObject[];
  onObjectsChange?: (objects: FabricObject[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  selection?: boolean;
  className?: string;
}

export function MotionCanvas({
  width,
  height,
  backgroundColor = "#1a1a1a",
  objects: initialObjects = [],
  onObjectsChange,
  onSelectionChange,
  selection = true,
  className,
}: MotionCanvasProps) {
  const {
    canvasRef,
    fabricObjects,
    selectedObjectIds,
    clearCanvas,
    addObject,
    removeObject,
    updateObject,
  } = useFabricCanvas({
    width,
    height,
    backgroundColor,
    selection,
    preserveObjectStacking: true,
  });

  // Initialize objects from props
  useEffect(() => {
    clearCanvas();
    initialObjects.forEach(obj => addObject(obj));
  }, [initialObjects]);

  // Notify parent of object changes
  useEffect(() => {
    onObjectsChange?.(fabricObjects);
  }, [fabricObjects]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedObjectIds);
  }, [selectedObjectIds]);

  // Update objects when props change (external updates)
  useEffect(() => {
    if (JSON.stringify(fabricObjects) !== JSON.stringify(initialObjects)) {
      // Diff and update changed objects
      fabricObjects.forEach(existing => {
        const updated = initialObjects.find(o => o.id === existing.id);
        if (updated && JSON.stringify(existing) !== JSON.stringify(updated)) {
          updateObject(updated);
        }
      });

      // Add new objects
      initialObjects.forEach(obj => {
        if (!fabricObjects.find(o => o.id === obj.id)) {
          addObject(obj);
        }
      });

      // Remove deleted objects
      fabricObjects.forEach(obj => {
        if (!initialObjects.find(o => o.id === obj.id)) {
          removeObject(obj.id);
        }
      });
    }
  }, [initialObjects]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-900 border border-zinc-800",
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
