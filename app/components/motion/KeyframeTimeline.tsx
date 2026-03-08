import React, { useRef, useState, useCallback, useMemo } from "react";
import type { Keyframe, EasingType, KeyframeProperty } from "~/types/motion";
import { cn } from "~/lib/utils";
import { generateKeyframeId } from "~/utils/motion-interpolation";

interface KeyframeTimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  keyframes: Keyframe[];
  selectedObjectId: string | null;
  onAddKeyframe: (property: KeyframeProperty, time: number, value: number | string, easing: EasingType) => void;
  onRemoveKeyframe: (keyframeId: string) => void;
  onSelectKeyframe: (keyframeId: string) => void;
  selectedKeyframeIds: string[];
  zoom?: number;
  fps?: number;
}

const PROPERTY_COLORS: Record<string, string> = {
  x: "#3b82f6", // blue
  y: "#22c55e", // green
  scaleX: "#f59e0b", // amber
  scaleY: "#f97316", // orange
  rotation: "#8b5cf6", // violet
  opacity: "#6b7280", // gray
  skewX: "#ec4899", // pink
  skewY: "#d946ef", // fuchsia
  fill: "#ef4444", // red
  stroke: "#14b8a6", // teal
  strokeWidth: "#0ea5e9", // sky
  fontSize: "#84cc16", // lime
  width: "#a855f7", // purple
  height: "#6366f1", // indigo
  radius: "#eab308", // yellow
};

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "easeIn", label: "Ease In" },
  { value: "easeOut", label: "Ease Out" },
  { value: "easeInOut", label: "Ease In Out" },
  { value: "spring", label: "Spring" },
  { value: "bounce", label: "Bounce" },
  { value: "elastic", label: "Elastic" },
];

export const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
  duration,
  currentTime,
  onTimeChange,
  keyframes,
  selectedObjectId,
  onAddKeyframe,
  onRemoveKeyframe,
  onSelectKeyframe,
  selectedKeyframeIds,
  zoom = 1,
  fps = 30,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showEasingMenu, setShowEasingMenu] = useState<string | null>(null);

  const pixelsPerSecond = 50 * zoom;
  const timelineWidth = Math.max(duration * pixelsPerSecond, 400);

  // Group keyframes by property
  const keyframesByProperty = useMemo(() => {
    const grouped = new Map<string, Keyframe[]>();
    for (const kf of keyframes) {
      const list = grouped.get(kf.property) || [];
      list.push(kf);
      grouped.set(kf.property, list);
    }
    return grouped;
  }, [keyframes]);

  // Get unique properties
  const properties = useMemo(() => {
    return Array.from(keyframesByProperty.keys()).sort();
  }, [keyframesByProperty]);

  // Handle timeline click
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const time = x / pixelsPerSecond;
      onTimeChange(Math.max(0, Math.min(time, duration)));
    },
    [pixelsPerSecond, duration, onTimeChange]
  );

  // Handle scrubber drag
  const handleScrubberMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const time = x / pixelsPerSecond;
      onTimeChange(Math.max(0, Math.min(time, duration)));
    },
    [isDragging, pixelsPerSecond, duration, onTimeChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Format time display
  const formatTime = (time: number) => {
    const seconds = Math.floor(time);
    const frames = Math.floor((time - seconds) * fps);
    return `${seconds}:${frames.toString().padStart(2, "0")}`;
  };

  // Generate time markers
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = Math.max(1, Math.floor(5 / zoom));
    for (let i = 0; i <= duration; i += step) {
      markers.push(i);
    }
    return markers;
  }, [duration, zoom]);

  return (
    <div className="flex flex-col bg-muted/30 border-t border-border h-48">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border bg-muted/50">
        <span className="text-xs font-medium">Keyframes</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Timeline area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-pointer"
        onClick={handleTimelineClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative h-full" style={{ width: timelineWidth }}>
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 h-6 border-b border-border bg-muted/20">
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="absolute top-0 text-[10px] text-muted-foreground transform -translate-x-1/2"
                style={{ left: time * pixelsPerSecond }}
              >
                <div className="h-2 w-px bg-border mx-auto mb-0.5" />
                {time}s
              </div>
            ))}
          </div>

          {/* Current time scrubber */}
          <div
            className="absolute top-0 bottom-0 w-px bg-primary z-20 cursor-ew-resize"
            style={{ left: currentTime * pixelsPerSecond }}
            onMouseDown={handleScrubberMouseDown}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary rounded-full" />
          </div>

          {/* Property tracks */}
          <div className="absolute top-8 left-0 right-0 bottom-0">
            {properties.length === 0 && (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No keyframes yet. Add animations to see them here.
              </div>
            )}

            {properties.map((property, index) => {
              const propertyKeyframes = keyframesByProperty.get(property) || [];
              const color = PROPERTY_COLORS[property] || "#6b7280";

              return (
                <div
                  key={property}
                  className="flex items-center h-8 border-b border-border/50 hover:bg-muted/20"
                  style={{ top: index * 32 }}
                >
                  {/* Property label */}
                  <div className="w-20 text-[10px] text-muted-foreground px-2 truncate">
                    {property}
                  </div>

                  {/* Keyframe track */}
                  <div className="flex-1 relative h-full">
                    {/* Connection lines between keyframes */}
                    {propertyKeyframes.length > 1 &&
                      propertyKeyframes
                        .sort((a, b) => a.time - b.time)
                        .slice(0, -1)
                        .map((kf, i) => {
                          const nextKf = propertyKeyframes[i + 1];
                          const startX = kf.time * pixelsPerSecond;
                          const endX = nextKf.time * pixelsPerSecond;
                          return (
                            <div
                              key={`line-${kf.id}`}
                              className="absolute top-1/2 h-0.5 -translate-y-1/2"
                              style={{
                                left: startX,
                                width: endX - startX,
                                backgroundColor: color,
                                opacity: 0.5,
                              }}
                            />
                          );
                        })}

                    {/* Keyframe dots */}
                    {propertyKeyframes.map((kf) => {
                      const isSelected = selectedKeyframeIds.includes(kf.id);
                      const x = kf.time * pixelsPerSecond;

                      return (
                        <div
                          key={kf.id}
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 transition-all",
                            "hover:scale-125 border-2",
                            isSelected
                              ? "border-white shadow-md scale-110"
                              : "border-transparent"
                          )}
                          style={{
                            left: x,
                            backgroundColor: color,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectKeyframe(kf.id);
                            setShowEasingMenu(kf.id);
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onRemoveKeyframe(kf.id);
                          }}
                          title={`${property}: ${kf.value} at ${kf.time.toFixed(2)}s (${kf.easing})`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add keyframe button for selected object */}
          {selectedObjectId && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <button
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add keyframe at current time for selected object
                  // This would need to know which property to keyframe
                  // For now, we'll keyframe position (x, y)
                  onAddKeyframe("x", currentTime, 100, "linear");
                }}
              >
                + Keyframe
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Easing menu popup */}
      {showEasingMenu && (
        <div
          className="absolute z-50 bg-popover border rounded-md shadow-md p-2"
          onMouseLeave={() => setShowEasingMenu(null)}
        >
          <div className="text-xs font-medium mb-2">Easing</div>
          {EASING_OPTIONS.map((option) => (
            <button
              key={option.value}
              className="block w-full text-left px-2 py-1 text-xs hover:bg-muted rounded"
              onClick={() => {
                // Update easing for selected keyframe
                setShowEasingMenu(null);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyframeTimeline;
