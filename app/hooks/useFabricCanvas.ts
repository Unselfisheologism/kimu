import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import type { Canvas } from "fabric/fabric-impl";
import type { FabricObject } from "~/types/motion";
import { generateUUID } from "~/utils/uuid";

export interface UseFabricCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  selection?: boolean;
  preserveObjectStacking?: boolean;
}

export function useFabricCanvas(options: UseFabricCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [fabricObjects, setFabricObjects] = useState<FabricObject[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor || "transparent",
      selection: options.selection !== false,
      preserveObjectStacking: options.preserveObjectStacking !== false,
    });

    fabricCanvasRef.current = canvas;

    // Handle selection changes
    canvas.on("selection:created", (e) => {
      const selected = e.selected?.map(obj => obj.data?.id || obj.id).filter(Boolean) as string[];
      setSelectedObjectIds(selected);
    });

    canvas.on("selection:updated", (e) => {
      const selected = e.selected?.map(obj => obj.data?.id || obj.id).filter(Boolean) as string[];
      setSelectedObjectIds(selected);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObjectIds([]);
    });

    // Handle object modifications
    canvas.on("object:modified", updateObjectsFromCanvas);
    canvas.on("object:added", updateObjectsFromCanvas);
    canvas.on("object:removed", updateObjectsFromCanvas);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update canvas dimensions when options change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({
        width: options.width,
        height: options.height,
      });
    }
  }, [options.width, options.height]);

  // Update background color
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = options.backgroundColor || "transparent";
    }
  }, [options.backgroundColor]);

  // Sync fabric objects to React state
  const updateObjectsFromCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const fabricObjects: FabricObject[] = [];

    objects.forEach(obj => {
      fabricObjects.push(fabricObjectToData(obj));
    });

    setFabricObjects(fabricObjects);
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    if (options.backgroundColor) {
      fabricCanvasRef.current.backgroundColor = options.backgroundColor;
    }
    setFabricObjects([]);
  }, [options.backgroundColor]);

  // Add object to canvas
  const addObject = useCallback((fabricObj: FabricObject) => {
    if (!fabricCanvasRef.current) return;

    const obj = dataToFabricObject(fabricObj);
    if (obj) {
      fabricCanvasRef.current.add(obj);
      fabricCanvasRef.current.setActiveObject(obj);
      fabricCanvasRef.current.renderAll();
      updateObjectsFromCanvas();
    }
  }, [updateObjectsFromCanvas]);

  // Remove object from canvas
  const removeObject = useCallback((objectId: string) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const objToRemove = objects.find(obj => obj.data?.id === objectId);

    if (objToRemove) {
      fabricCanvasRef.current.remove(objToRemove);
      fabricCanvasRef.current.renderAll();
      updateObjectsFromCanvas();
    }
  }, [updateObjectsFromCanvas]);

  // Update object in canvas
  const updateObject = useCallback((fabricObj: FabricObject) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const objToUpdate = objects.find(obj => obj.data?.id === fabricObj.id);

    if (objToUpdate) {
      const updated = dataToFabricObject(fabricObj);
      if (updated) {
        objToUpdate.set(updated);
        fabricCanvasRef.current.renderAll();
        updateObjectsFromCanvas();
      }
    }
  }, [updateObjectsFromCanvas]);

  // Get selected objects
  const getSelectedObjects = useCallback(() => {
    if (!fabricCanvasRef.current) return [];
    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    return activeObjects.map(obj => obj.data?.id || obj.id).filter(Boolean) as string[];
  }, []);

  // Select objects by IDs
  const selectObjects = useCallback((objectIds: string[]) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const toSelect = objects.filter(obj => 
      objectIds.includes(obj.data?.id || obj.id)
    );

    if (toSelect.length > 0) {
      fabricCanvasRef.current.deselectAll();
      fabricCanvasRef.current.setActiveObject(toSelect[0]);
      if (toSelect.length > 1) {
        fabricCanvasRef.current.setActiveObject(
          new fabric.ActiveSelection(toSelect, {
            canvas: fabricCanvasRef.current,
          })
        );
      }
      fabricCanvasRef.current.renderAll();
    }
  }, []);

  // Convert Fabric object to data structure
  function fabricObjectToData(obj: any): FabricObject {
    return {
      id: obj.data?.id || obj.id || generateUUID(),
      type: obj.type,
      left: obj.left,
      top: obj.top,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      rotation: obj.angle,
      opacity: obj.opacity,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      // Type-specific properties
      text: obj.text,
      fontSize: obj.fontSize,
      fontFamily: obj.fontFamily,
      fontWeight: obj.fontWeight,
      src: obj.getSrc?.(),
      path: obj.path,
      points: obj.points,
      // Effects
      filters: (obj.filters || []).map((f: any) => ({
        type: f.type,
        value: { blur: f.blur, matrix: f.matrix },
      })),
      shadow: obj.shadow ? {
        color: obj.shadow.color,
        blur: obj.shadow.blur,
        offsetX: obj.shadow.offsetX,
        offsetY: obj.shadow.offsetY,
      } : undefined,
      // Grouping
      isGroup: obj.type === "group",
      objectIds: obj.type === "group" ? obj.getObjects().map((o: any) => o.data?.id) : undefined,
      parentId: obj.group?.data?.id,
    };
  }

  // Convert data structure to Fabric object
  function dataToFabricObject(data: FabricObject): any {
    const commonProps = {
      left: data.left,
      top: data.top,
      angle: data.rotation || 0,
      opacity: data.opacity || 1,
      selectable: true,
    };

    let fabricObj: any;

    switch (data.type) {
      case "rect":
        fabricObj = new fabric.Rect({
          ...commonProps,
          width: data.width || 100,
          height: data.height || 100,
          fill: data.fill || "#ffffff",
          stroke: data.stroke,
          strokeWidth: data.strokeWidth || 0,
        });
        break;

      case "circle":
        fabricObj = new fabric.Circle({
          ...commonProps,
          radius: (data.width || 100) / 2,
          fill: data.fill || "#ffffff",
          stroke: data.stroke,
          strokeWidth: data.strokeWidth || 0,
        });
        break;

      case "triangle":
        fabricObj = new fabric.Triangle({
          ...commonProps,
          width: data.width || 100,
          height: data.height || 100,
          fill: data.fill || "#ffffff",
          stroke: data.stroke,
          strokeWidth: data.strokeWidth || 0,
        });
        break;

      case "text":
        fabricObj = new fabric.Text(data.text || "Text", {
          ...commonProps,
          fontSize: data.fontSize || 48,
          fontFamily: data.fontFamily || "Arial",
          fontWeight: data.fontWeight || "normal",
          fill: data.fill || "#ffffff",
        });
        break;

      case "image":
        if (!data.src) return null;
        fabric.Image.fromURL(data.src, (img: any) => {
          img.set({
            ...commonProps,
            scaleX: data.scaleX || 1,
            scaleY: data.scaleY || 1,
          });
          fabricCanvasRef.current?.add(img);
          fabricCanvasRef.current?.renderAll();
        }, { crossOrigin: "anonymous" });
        return null;

      case "line":
        fabricObj = new fabric.Line(data.points || [0, 0, 100, 0], {
          ...commonProps,
          stroke: data.stroke || "#ffffff",
          strokeWidth: data.strokeWidth || 2,
        });
        break;

      case "path":
        if (!data.path) return null;
        fabricObj = new fabric.Path(data.path, {
          ...commonProps,
          fill: data.fill || "#ffffff",
          stroke: data.stroke,
          strokeWidth: data.strokeWidth || 0,
        });
        break;

      default:
        console.warn(`Unknown object type: ${data.type}`);
        return null;
    }

    if (fabricObj) {
      // Store ID in data property
      fabricObj.data = { id: data.id };
      fabricObj.id = data.id;

      // Apply shadow
      if (data.shadow) {
        fabricObj.set("shadow", new fabric.Shadow(data.shadow));
      }

      // Apply filters
      if (data.filters && data.filters.length > 0) {
        const fabricFilters = data.filters.map(f => {
          if (f.type === "blur" && typeof f.value === "object") {
            return new fabric.Image.filters.Blur({
              blur: f.value.blur || 0,
            });
          }
          return null;
        }).filter(Boolean) as any[];
        
        fabricObj.filters = fabricFilters;
      }
    }

    return fabricObj;
  }

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    fabricObjects,
    selectedObjectIds,
    clearCanvas,
    addObject,
    removeObject,
    updateObject,
    getSelectedObjects,
    selectObjects,
  };
}
