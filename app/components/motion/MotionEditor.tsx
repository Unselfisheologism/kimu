import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import type { FabricObject, FabricObjectType, MotionGraphicsData } from "~/types/motion";
import { DEFAULT_MOTION_CANVAS_WIDTH, DEFAULT_MOTION_CANVAS_HEIGHT, DEFAULT_MOTION_DURATION } from "~/types/motion";
import { generateUUID } from "~/utils/uuid";
import { cn } from "~/lib/utils";

// Components
import { MotionCanvas } from "./MotionCanvas";
import { KeyframeTimeline } from "./KeyframeTimeline";
import { ShapeTools } from "./ShapeTools";
import { PropertyPanel } from "./PropertyPanel";

// Hooks
import { useMotionKeyframes } from "~/hooks/useMotionKeyframes";

// UI Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Layers,
  Settings,
  ChevronLeft,
} from "lucide-react";

interface MotionEditorProps {
  scrubberId: string;
  initialMotionData: MotionGraphicsData;
  onSave: (motionData: MotionGraphicsData) => void;
  onClose: () => void;
}

export const MotionEditor: React.FC<MotionEditorProps> = ({
  scrubberId,
  initialMotionData,
  onSave,
  onClose,
}) => {
  const [motionData, setMotionData] = useState<MotionGraphicsData>(initialMotionData);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<FabricObjectType | "select" | "hand">("select");
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keyframe management
  const {
    currentTime,
    setCurrentTime,
    keyframes,
    addKeyframe,
    removeKeyframe,
    totalDuration,
  } = useMotionKeyframes(
    initialMotionData.objects.flatMap((o) =>
      (o.keyframes || []).map((kf) => ({ ...kf, objectId: o.id }))
    ),
    initialMotionData.duration
  );

  // Get selected object
  const selectedObject = useMemo(() => {
    return motionData.objects.find((o) => o.id === selectedObjectId) || null;
  }, [motionData.objects, selectedObjectId]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((time) => {
        if (time >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return time + 0.033; // ~30fps
      });
    }, 33);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, setCurrentTime]);

  // Handle object selection
  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
    setActiveTool("select");
  }, []);

  // Handle object modification
  const handleObjectModified = useCallback(
    (id: string, updates: Partial<FabricObject>) => {
      setMotionData((prev) => ({
        ...prev,
        objects: prev.objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
      }));
    },
    []
  );

  // Add new object
  const handleAddObject = useCallback(
    (type: FabricObjectType) => {
      const centerX = motionData.canvasWidth / 2 - 50;
      const centerY = motionData.canvasHeight / 2 - 50;

      const newObject: FabricObject = {
        id: generateUUID(),
        type,
        left: centerX,
        top: centerY,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fill: type === "text" ? "#ffffff" : "#3b82f6",
        stroke: undefined,
        strokeWidth: 0,
        filters: [],
        visible: true,
        selectable: true,
        ...(type === "text" || type === "textbox"
          ? {
              text: "Text",
              fontSize: 48,
              fontFamily: "Arial",
              textAlign: "center",
            }
          : {}),
        ...(type === "circle"
          ? {
              radius: 50,
            }
          : {}),
        ...(type === "ellipse"
          ? {
              rx: 75,
              ry: 50,
            }
          : {}),
      };

      setMotionData((prev) => ({
        ...prev,
        objects: [...prev.objects, newObject],
      }));

      setSelectedObjectId(newObject.id);
    },
    [motionData.canvasWidth, motionData.canvasHeight]
  );

  // Delete selected object
  const handleDeleteObject = useCallback(() => {
    if (!selectedObjectId) return;

    setMotionData((prev) => ({
      ...prev,
      objects: prev.objects.filter((o) => o.id !== selectedObjectId),
    }));

    setSelectedObjectId(null);
  }, [selectedObjectId]);

  // Duplicate selected object
  const handleDuplicateObject = useCallback(() => {
    if (!selectedObject) return;

    const newObject: FabricObject = {
      ...selectedObject,
      id: generateUUID(),
      left: selectedObject.left + 20,
      top: selectedObject.top + 20,
      keyframes: selectedObject.keyframes?.map((kf) => ({
        ...kf,
        id: generateUUID(),
      })),
    };

    setMotionData((prev) => ({
      ...prev,
      objects: [...prev.objects, newObject],
    }));

    setSelectedObjectId(newObject.id);
  }, [selectedObject]);

  // Add keyframe
  const handleAddKeyframe = useCallback(
    (property: string, time: number, value: number | string, easing: string) => {
      if (!selectedObjectId) return;

      // Update the object's keyframes
      setMotionData((prev) => ({
        ...prev,
        objects: prev.objects.map((obj) => {
          if (obj.id !== selectedObjectId) return obj;

          const newKeyframe = {
            id: generateUUID(),
            property,
            time,
            value,
            easing,
          };

          return {
            ...obj,
            keyframes: [...(obj.keyframes || []), newKeyframe],
          };
        }),
      }));
    },
    [selectedObjectId]
  );

  // Remove keyframe
  const handleRemoveKeyframe = useCallback((keyframeId: string) => {
    setMotionData((prev) => ({
      ...prev,
      objects: prev.objects.map((obj) => ({
        ...obj,
        keyframes: (obj.keyframes || []).filter((kf) => kf.id !== keyframeId),
      })),
    }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onSave({
      ...motionData,
      duration: totalDuration,
    });
  }, [motionData, totalDuration, onSave]);

  // Flatten keyframes for timeline
  const allKeyframes = useMemo(() => {
    return motionData.objects.flatMap((obj) =>
      (obj.keyframes || []).map((kf) => ({ ...kf, objectId: obj.id }))
    );
  }, [motionData.objects]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-medium">Motion Editor</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom control */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <Slider
              value={[zoom * 100]}
              min={25}
              max={200}
              step={25}
              onValueChange={([v]) => setZoom(v / 100)}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-10">{Math.round(zoom * 100)}%</span>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            <Settings className="w-3 h-3 mr-1" />
            Grid
          </Button>

          <Button variant="default" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tools */}
        <div className="w-14 border-r border-border bg-muted/20">
          <ShapeTools activeTool={activeTool} onToolChange={setActiveTool} disabled={false} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Canvas container */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/10">
            <MotionCanvas
              width={motionData.canvasWidth}
              height={motionData.canvasHeight}
              motionData={motionData}
              currentTime={currentTime}
              backgroundColor={motionData.backgroundColor}
              selectedIds={selectedObjectId ? [selectedObjectId] : []}
              onSelectObject={handleSelectObject}
              onObjectModified={handleObjectModified}
              isEditing={activeTool === "select"}
              zoom={zoom}
              showGrid={showGrid}
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-2 p-2 border-t border-border bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(0)}
              disabled={currentTime <= 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentTime(totalDuration)}
              disabled={currentTime >= totalDuration}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <span className="text-xs font-mono text-muted-foreground min-w-[80px]">
              {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
            </span>
          </div>

          {/* Timeline */}
          <KeyframeTimeline
            duration={totalDuration}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            keyframes={allKeyframes}
            selectedObjectId={selectedObjectId}
            onAddKeyframe={handleAddKeyframe}
            onRemoveKeyframe={handleRemoveKeyframe}
            onSelectKeyframe={(id) => setSelectedKeyframeIds([id])}
            selectedKeyframeIds={selectedKeyframeIds}
            zoom={zoom}
          />
        </div>

        {/* Right sidebar - Properties */}
        <div className="w-64 border-l border-border bg-muted/20 overflow-y-auto">
          {/* Object actions */}
          {selectedObject && (
            <div className="flex items-center gap-1 p-2 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicateObject}
                className="flex-1"
              >
                <Copy className="w-3 h-3 mr-1" />
                Duplicate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteObject}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Properties panel */}
          <PropertyPanel
            object={selectedObject}
            onUpdate={handleObjectModified}
            disabled={!selectedObject}
          />

          {/* Layers */}
          <div className="border-t border-border">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
              <Layers className="w-3 h-3" />
              Layers
            </div>
            <div className="max-h-40 overflow-y-auto">
              {motionData.objects
                .slice()
                .reverse()
                .map((obj) => (
                  <button
                    key={obj.id}
                    className={cn(
                      "w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2",
                      selectedObjectId === obj.id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => setSelectedObjectId(obj.id)}
                  >
                    <span className="capitalize">{obj.type}</span>
                    {obj.text && <span className="text-muted-foreground truncate">- {obj.text}</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionEditor;
