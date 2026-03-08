import React, { useEffect, useRef, useCallback, useState } from "react";
import type { Canvas, FabricObject as FabricObjectType } from "fabric";
import type { FabricObject, MotionGraphicsData } from "~/types/motion";
import { calculateSceneAtTime } from "~/utils/motion-interpolation";

interface MotionCanvasProps {
  width: number;
  height: number;
  motionData: MotionGraphicsData;
  currentTime: number;
  backgroundColor?: string;
  selectedIds: string[];
  onSelectObject: (id: string | null) => void;
  onObjectModified: (id: string, updates: Partial<FabricObject>) => void;
  isEditing: boolean;
  zoom?: number;
  showGrid?: boolean;
  gridSize?: number;
}

export const MotionCanvas: React.FC<MotionCanvasProps> = ({
  width,
  height,
  motionData,
  currentTime,
  backgroundColor = "#000000",
  selectedIds,
  onSelectObject,
  onObjectModified,
  isEditing,
  zoom = 1,
  showGrid = false,
  gridSize = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const isUpdatingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const initCanvas = async () => {
      try {
        const fabric = await import("fabric");
        const canvas = new fabric.Canvas(canvasRef.current!, {
          width,
          height,
          backgroundColor,
          preserveObjectStacking: true,
          selection: isEditing,
          uniScaleTransform: false,
          defaultCursor: isEditing ? "default" : "not-allowed",
        });

        fabricCanvasRef.current = canvas;

        // Set up event handlers
        canvas.on("selection:created", (e) => {
          const selected = e.selected?.[0];
          if (selected && selected.id) {
            onSelectObject(selected.id as string);
          }
        });

        canvas.on("selection:updated", (e) => {
          const selected = e.selected?.[0];
          if (selected && selected.id) {
            onSelectObject(selected.id as string);
          }
        });

        canvas.on("selection:cleared", () => {
          onSelectObject(null);
        });

        canvas.on("object:modified", (e) => {
          const obj = e.target;
          if (obj && obj.id) {
            onObjectModified(obj.id as string, {
              left: obj.left,
              top: obj.top,
              width: obj.width,
              height: obj.height,
              scaleX: obj.scaleX,
              scaleY: obj.scaleY,
              angle: obj.angle,
              opacity: obj.opacity,
            });
          }
        });

        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Fabric canvas:", error);
      }
    };

    initCanvas();

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [width, height, backgroundColor, isEditing, onSelectObject, onObjectModified]);

  // Update canvas size when props change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setWidth(width);
      fabricCanvasRef.current.setHeight(height);
      fabricCanvasRef.current.renderAll();
    }
  }, [width, height]);

  // Update zoom
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoom);
      fabricCanvasRef.current.renderAll();
    }
  }, [zoom]);

  // Render objects based on current time
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady || isUpdatingRef.current) return;

    const renderFrame = async () => {
      isUpdatingRef.current = true;
      const fabric = await import("fabric");

      try {
        // Clear canvas but keep background
        fabricCanvasRef.current!.clear();
        fabricCanvasRef.current!.backgroundColor = backgroundColor;

        // Calculate interpolated object states
        const objectsAtTime = calculateSceneAtTime(motionData, currentTime);

        // Render each object
        for (const obj of objectsAtTime) {
          if (!obj.visible) continue;

          const fabricObj = createFabricObject(fabric, obj);
          if (fabricObj) {
            // Apply selection state
            if (selectedIds.includes(obj.id)) {
              fabricObj.set({
                borderColor: "#3b82f6",
                cornerColor: "#3b82f6",
                cornerStrokeColor: "#ffffff",
                cornerSize: 8,
                transparentCorners: false,
              });
            }

            // Make interactive only in edit mode
            fabricObj.set({
              selectable: isEditing,
              evented: isEditing,
            });

            fabricCanvasRef.current!.add(fabricObj);
          }
        }

        fabricCanvasRef.current!.renderAll();
      } catch (error) {
        console.error("Error rendering frame:", error);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    renderFrame();
  }, [motionData, currentTime, isReady, backgroundColor, selectedIds, isEditing]);

  // Draw grid if enabled
  useEffect(() => {
    if (!fabricCanvasRef.current || !showGrid) return;

    const canvas = fabricCanvasRef.current;

    // Grid drawing would be implemented here
    // For now, we'll just render the canvas
    canvas.renderAll();
  }, [showGrid, gridSize]);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <canvas ref={canvasRef} className="block" />

      {/* Overlay info */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {motionData.objects.length} objects | {currentTime.toFixed(2)}s
      </div>

      {/* Playback indicator */}
      {isReady && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {isEditing ? "Edit Mode" : "Preview Mode"}
        </div>
      )}
    </div>
  );
};

// Helper function to create Fabric objects from motion objects
function createFabricObject(
  fabric: typeof import("fabric"),
  obj: FabricObject
): FabricObjectType | null {
  const { fabric: fabricModule } = fabric;

  const commonProps = {
    id: obj.id,
    left: obj.left,
    top: obj.top,
    width: obj.width,
    height: obj.height,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    angle: obj.rotation ?? obj.angle ?? 0,
    opacity: obj.opacity ?? 1,
    fill: obj.fill ?? "#3b82f6",
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth ?? 0,
    selectable: true,
    evented: true,
  };

  switch (obj.type) {
    case "rect":
      return new fabricModule.Rect(commonProps);

    case "circle":
      return new fabricModule.Circle({
        ...commonProps,
        radius: obj.radius ?? Math.min(obj.width ?? 50, obj.height ?? 50) / 2,
      });

    case "ellipse":
      return new fabricModule.Ellipse({
        ...commonProps,
        rx: obj.rx ?? (obj.width ?? 100) / 2,
        ry: obj.ry ?? (obj.height ?? 100) / 2,
      });

    case "triangle":
      return new fabricModule.Triangle(commonProps);

    case "text":
    case "textbox":
      return new fabricModule.Textbox(obj.text || "", {
        ...commonProps,
        fontSize: obj.fontSize ?? 48,
        fontFamily: obj.fontFamily ?? "Arial",
        fontWeight: obj.fontWeight ?? "normal",
        fontStyle: obj.fontStyle ?? "normal",
        textAlign: obj.textAlign ?? "center",
        fill: obj.fill ?? "#ffffff",
      });

    case "image":
      if (obj.src) {
        // Note: Image loading is async, so we'd need to handle this differently
        // For now, return a placeholder rect
        return new fabricModule.Rect({
          ...commonProps,
          fill: "#666666",
        });
      }
      return null;

    case "line":
      return new fabricModule.Line(
        [obj.left, obj.top, (obj.left || 0) + (obj.width || 100), obj.top || 0],
        {
          ...commonProps,
          stroke: obj.stroke ?? obj.fill ?? "#3b82f6",
          strokeWidth: obj.strokeWidth ?? 2,
        }
      );

    case "group":
      // Groups are complex - for now, return a placeholder
      return new fabricModule.Rect({
        ...commonProps,
        fill: "transparent",
        stroke: "#3b82f6",
        strokeDashArray: [5, 5],
      });

    default:
      console.warn(`Unknown object type: ${obj.type}`);
      return new fabricModule.Rect(commonProps);
  }
}

export default MotionCanvas;
