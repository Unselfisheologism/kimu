import React, { useState, useCallback, useRef } from "react";
import type { FabricObject, Keyframe, MotionGraphicsData, EasingType } from "~/types/motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Play, Pause, Trash2, Download, Save, Settings } from "lucide-react";
import { MotionCanvas } from "./MotionCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { ShapeTools } from "./ShapeTools";
import { KeyframeTimeline } from "./KeyframeTimeline";
import { useMotionKeyframes } from "~/hooks/useMotionKeyframes";
import { generateUUID } from "~/utils/uuid";
import { cn } from "~/lib/utils";

interface MotionEditorProps {
  motionData: MotionGraphicsData | null;
  onChange: (data: MotionGraphicsData) => void;
  className?: string;
}

export function MotionEditor({
  motionData,
  onChange,
  className,
}: MotionEditorProps) {
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const {
    keyframes,
    addKeyframe,
    updateKeyframe,
    deleteKeyframe,
    setAllKeyframes,
  } = useMotionKeyframes({
    initialKeyframes: motionData?.keyframes || [],
  });

  const objects = motionData?.objects || [];
  const duration = motionData?.duration || 5;
  const canvasWidth = motionData?.canvasWidth || 1920;
  const canvasHeight = motionData?.canvasHeight || 1080;
  const backgroundColor = motionData?.backgroundColor || "#1a1a1a";

  const selectedObjects = objects.filter(obj =>
    selectedObjectIds.includes(obj.id)
  );

  // Add a new shape to canvas
  const handleAddShape = useCallback(
    (type: FabricObject["type"]) => {
      if (!motionData) return;

      const newObject: FabricObject = {
        id: generateUUID(),
        type,
        left: canvasWidth / 2 - 50,
        top: canvasHeight / 2 - 50,
        width: type === "text" ? 200 : 100,
        height: type === "text" ? 60 : 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        fill: "#ffffff",
        stroke: type === "line" ? "#ffffff" : undefined,
        strokeWidth: type === "line" ? 2 : 0,
        text: type === "text" ? "Text" : undefined,
        fontSize: type === "text" ? 48 : undefined,
        fontFamily: "Arial",
        filters: [],
      };

      onChange({
        ...motionData,
        objects: [...objects, newObject],
      });

      setSelectedObjectIds([newObject.id]);
      setSelectedTool("select");
    },
    [motionData, objects, canvasWidth, canvasHeight, onChange]
  );

  // Update object properties
  const handleUpdateObject = useCallback(
    (objectId: string, updates: Partial<FabricObject>) => {
      if (!motionData) return;

      onChange({
        ...motionData,
        objects: objects.map(obj =>
          obj.id === objectId ? { ...obj, ...updates } : obj
        ),
      });
    },
    [motionData, objects, onChange]
  );

  // Delete objects
  const handleDeleteObjects = useCallback(
    (objectIds: string[]) => {
      if (!motionData) return;

      const newObjects = objects.filter(obj => !objectIds.includes(obj.id));
      const newKeyframes = keyframes.filter(
        kf => !objectIds.includes(kf.objectId)
      );

      onChange({
        ...motionData,
        objects: newObjects,
        keyframes: newKeyframes,
      });

      setAllKeyframes(newKeyframes);
      setSelectedObjectIds([]);
    },
    [motionData, objects, keyframes, onChange, setAllKeyframes]
  );

  // Add keyframe
  const handleAddKeyframe = useCallback(
    (objectId: string, property: string, time: number) => {
      const activeObject = objects.find(obj => obj.id === objectId);
      if (!activeObject) return;

      let value: number | string = 0;
      switch (property) {
        case "x":
          value = activeObject.left;
          break;
        case "y":
          value = activeObject.top;
          break;
        case "scaleX":
          value = activeObject.scaleX || 1;
          break;
        case "scaleY":
          value = activeObject.scaleY || 1;
          break;
        case "rotation":
          value = activeObject.rotation || 0;
          break;
        case "opacity":
          value = activeObject.opacity || 1;
          break;
        default:
          value = 0;
      }

      addKeyframe({
        objectId,
        property,
        time,
        value,
        easing: "easeInOut",
      });
    },
    [objects, addKeyframe]
  );

  // Handle canvas selection change
  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedObjectIds(ids);
  }, []);

  // Handle objects change from canvas
  const handleObjectsChange = useCallback((newObjects: FabricObject[]) => {
    if (!motionData) return;

    onChange({
      ...motionData,
      objects: newObjects,
    });
  }, [motionData, onChange]);

  // Animation loop
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const animate = useCallback(() => {
    const now = performance.now();
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
    }

    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setCurrentTime(prev => {
      const newTime = prev + delta * animationSpeed;
      if (newTime >= duration) {
        setIsPlaying(false);
        return 0;
      }
      return newTime;
    });

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, duration, animationSpeed]);

  React.useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Export motion data
  const handleExport = useCallback(() => {
    if (!motionData) return;

    const dataStr = JSON.stringify(motionData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motion-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [motionData]);

  return (
    <div
      className={cn(
        "flex flex-col bg-zinc-950 border border-zinc-800",
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-2 bg-zinc-900">
        <div className="flex items-center gap-2">
          <ShapeTools
            selectedTool={selectedTool}
            onAddShape={handleAddShape}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Playback controls */}
          <Button
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* Time slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-12 text-right">
              {Math.round(currentTime * 10) / 10}s
            </span>
            <Slider
              value={[currentTime]}
              onValueChange={([v]) => setCurrentTime(v)}
              max={duration}
              step={0.1}
              className="w-32"
            />
            <span className="text-xs text-muted-foreground w-8">
              {duration}s
            </span>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-1">
            <Label className="text-xs">Speed:</Label>
            <Input
              type="number"
              value={animationSpeed}
              onChange={e => setAnimationSpeed(parseFloat(e.target.value) || 1)}
              className="w-16 h-7"
              min={0.1}
              max={3}
              step={0.1}
            />
            <span className="text-xs text-muted-foreground">x</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Canvas settings */}
        <div className="w-56 border-r border-zinc-800 p-3 space-y-4 bg-zinc-900">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Canvas Size</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={e => {
                    if (motionData) {
                      onChange({ ...motionData, canvasWidth: parseInt(e.target.value) || canvasWidth });
                    }
                  }}
                  className="h-7"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={e => {
                    if (motionData) {
                      onChange({ ...motionData, canvasHeight: parseInt(e.target.value) || canvasHeight });
                    }
                  }}
                  className="h-7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Background</Label>
            <Input
              type="color"
              value={backgroundColor}
              onChange={e => {
                if (motionData) {
                  onChange({ ...motionData, backgroundColor: e.target.value });
                }
              }}
              className="h-7 w-full cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Duration</Label>
            <Input
              type="number"
              value={duration}
              onChange={e => {
                if (motionData) {
                  onChange({ ...motionData, duration: parseFloat(e.target.value) || duration });
                }
              }}
              className="h-7"
              step={0.1}
              min={0.1}
            />
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-auto bg-zinc-950 p-4">
          <div className="mx-auto" style={{ width: "fit-content" }}>
            <MotionCanvas
              width={canvasWidth}
              height={canvasHeight}
              backgroundColor={backgroundColor}
              objects={objects}
              onObjectsChange={handleObjectsChange}
              onSelectionChange={handleSelectionChange}
              className="border-zinc-800"
            />
          </div>
        </div>

        {/* Right sidebar - Properties & Keyframes */}
        <div className="w-72 border-l border-zinc-800 bg-zinc-900">
          <Tabs defaultValue="properties" className="h-full flex flex-col">
            <TabsList className="w-full h-auto">
              <TabsTrigger value="properties" className="flex-1 text-xs">
                Properties
              </TabsTrigger>
              <TabsTrigger value="keyframes" className="flex-1 text-xs">
                Keyframes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="flex-1 overflow-auto p-0 m-0">
              <PropertyPanel
                selectedObjects={selectedObjects}
                onUpdateObject={handleUpdateObject}
                onDeleteObjects={handleDeleteObjects}
                className="border-0"
              />
            </TabsContent>

            <TabsContent value="keyframes" className="flex-1 overflow-auto p-4 space-y-4">
              {selectedObjects.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>No object selected</p>
                  <p className="text-xs mt-2">
                    Select an object to add keyframes
                  </p>
                </div>
              )}

              {selectedObjects.length === 1 && (
                <div className="space-y-4">
                  {[
                    { prop: "x", label: "Position X" },
                    { prop: "y", label: "Position Y" },
                    { prop: "scaleX", label: "Scale X" },
                    { prop: "scaleY", label: "Scale Y" },
                    { prop: "rotation", label: "Rotation" },
                    { prop: "opacity", label: "Opacity" },
                  ].map(({ prop, label }) => (
                    <div key={prop} className="space-y-2">
                      <Label className="text-xs font-medium">{label}</Label>
                      <KeyframeTimeline
                        keyframes={keyframes}
                        objectId={selectedObjects[0].id}
                        property={prop}
                        duration={duration}
                        currentTime={currentTime}
                        onAddKeyframe={time =>
                          handleAddKeyframe(selectedObjects[0].id, prop, time)
                        }
                        onUpdateKeyframe={updateKeyframe}
                        onDeleteKeyframe={deleteKeyframe}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedObjects.length > 1 && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>{selectedObjects.length} objects selected</p>
                  <p className="text-xs mt-2">
                    Select a single object to edit keyframes
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
