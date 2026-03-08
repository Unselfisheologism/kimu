import React, { useMemo } from "react";
import type { Keyframe, EasingType } from "~/types/motion";
import { Button } from "~/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface KeyframeTimelineProps {
  keyframes: Keyframe[];
  objectId: string;
  property: string;
  duration: number;
  currentTime: number;
  onAddKeyframe: (time: number) => void;
  onUpdateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  onDeleteKeyframe: (id: string) => void;
  className?: string;
}

export function KeyframeTimeline({
  keyframes,
  objectId,
  property,
  duration,
  currentTime,
  onAddKeyframe,
  onUpdateKeyframe,
  onDeleteKeyframe,
  className,
}: KeyframeTimelineProps) {
  // Filter and sort keyframes for this object/property
  const propertyKeyframes = useMemo(() => {
    return keyframes
      .filter(kf => kf.objectId === objectId && kf.property === property)
      .sort((a, b) => a.time - b.time);
  }, [keyframes, objectId, property]);

  // Get easing type label
  const getEasingLabel = (easing: EasingType): string => {
    const labels: Record<EasingType, string> = {
      linear: "Linear",
      easeIn: "Ease In",
      easeOut: "Ease Out",
      easeInOut: "Ease In Out",
      spring: "Spring",
      bounce: "Bounce",
      elastic: "Elastic",
    };
    return labels[easing];
  };

  // Time to pixels conversion (100px per second)
  const timeToPx = (time: number) => time * 100;
  const pxToTime = (px: number) => px / 100;

  return (
    <div
      className={cn(
        "relative h-10 bg-background border border-border overflow-hidden",
        className
      )}
      style={{ width: `${duration * 100}px` }}
    >
      {/* Current time indicator */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
        style={{ left: `${timeToPx(currentTime)}px` }}
      />

      {/* Keyframe markers */}
      {propertyKeyframes.map((keyframe, index) => (
        <div
          key={keyframe.id}
          className="absolute top-1/2 -translate-y-1/2 group"
          style={{ left: `${timeToPx(keyframe.time)}px` }}
        >
          {/* Keyframe diamond */}
          <div
            className={cn(
              "w-3 h-3 rotate-45 cursor-pointer transition-colors",
              "bg-amber-500 hover:bg-amber-400 border border-amber-600"
            )}
            onClick={() => onDeleteKeyframe(keyframe.id)}
            title="Click to delete keyframe"
          />

          {/* Easing label on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap">
            <div className="text-xs bg-popover border border-border rounded px-2 py-1 shadow-sm">
              <div className="font-medium">
                {Math.round(keyframe.time * 100) / 100}s
              </div>
              <div className="text-muted-foreground">
                {getEasingLabel(keyframe.easing)}
              </div>
              <div className="text-muted-foreground">
                Value: {typeof keyframe.value === "number" ? Math.round(keyframe.value) : keyframe.value}
              </div>
            </div>
          </div>

          {/* Connection line to next keyframe */}
          {index < propertyKeyframes.length - 1 && (
            <div
              className="absolute top-1.5 left-1.5 h-0.5 bg-amber-600/50"
              style={{
                width: `${timeToPx(propertyKeyframes[index + 1].time) - timeToPx(keyframe.time) - 6}px`,
              }}
            />
          )}
        </div>
      ))}

      {/* Add keyframe button */}
      <div className="absolute top-1 right-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddKeyframe(currentTime)}
          className="h-6 w-6 p-0"
          title="Add keyframe at current time"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Timeline ruler */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex items-end border-t border-border/50">
        {Array.from({ length: Math.ceil(duration) }, (_, i) => (
          <div
            key={i}
            className="absolute text-[10px] text-muted-foreground/70"
            style={{ left: `${i * 100}px` }}
          >
            <div className="h-2 border-l border-border/50" />
            <span>{i}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
