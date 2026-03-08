// Fabric.js Canvas Hook for Kimu Motion Editor
// Manages Fabric.js canvas instance and synchronization with React state

import { useState, useRef, useCallback, useEffect } from "react";
import type { Canvas, FabricObject as FabricObjectType } from "fabric";
import type { FabricObject, MotionGraphicsData } from "~/types/motion";

export interface UseFabricCanvasOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  onObjectAdded?: (obj: FabricObject) => void;
  onObjectModified?: (obj: FabricObject) => void;
  onObjectRemoved?: (objId: string) => void;
  onSelectionChanged?: (selectedIds: string[]) => void;
}

export interface UseFabricCanvasReturn {
  // Canvas ref to attach to DOM
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvas: Canvas | null;

  // Canvas state
  isReady: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;

  // Object operations
  addObject: (obj: Partial<FabricObject>) => string;
  updateObject: (id: string, updates: Partial<FabricObject>) => void;
  removeObject: (id: string) => void;
  getObject: (id: string) => FabricObject | null;
  getAllObjects: () => FabricObject[];

  // Selection
  selectedIds: string[];
  selectObjects: (ids: string[]) => void;
  deselectAll: () => void;

  // Canvas operations
  clear: () => void;
  toJSON: () => object;
  loadFromJSON: (json: object) => void;
  exportToImage: (format?: "png" | "jpeg") => string;

  // Grid and snapping
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveState: () => void;
}

export function useFabricCanvas(options: UseFabricCanvasOptions): UseFabricCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasInstance = useRef<Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(10);

  // History for undo/redo
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUpdatingRef = useRef(false);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || canvasInstance.current) return;

    let fabricModule: typeof import("fabric");

    const initCanvas = async () => {
      try {
        fabricModule = await import("fabric");
        const { Canvas } = fabricModule;

        const canvas = new Canvas(canvasRef.current!, {
          width: options.width,
          height: options.height,
          backgroundColor: options.backgroundColor || "#1a1a1a",
          preserveObjectStacking: true,
          selection: true,
          uniScaleTransform: false,
        });

        canvasInstance.current = canvas;

        // Set up event handlers
        canvas.on("object:added", (e) => {
          if (isUpdatingRef.current) return;
          const obj = e.target;
          if (obj && options.onObjectAdded) {
            options.onObjectAdded(fabricToMotionObject(obj));
          }
          saveState();
        });

        canvas.on("object:modified", (e) => {
          if (isUpdatingRef.current) return;
          const obj = e.target;
          if (obj && options.onObjectModified) {
            options.onObjectModified(fabricToMotionObject(obj));
          }
          saveState();
        });

        canvas.on("object:removed", (e) => {
          if (isUpdatingRef.current) return;
          const obj = e.target;
          if (obj && obj.id && options.onObjectRemoved) {
            options.onObjectRemoved(obj.id as string);
          }
          saveState();
        });

        canvas.on("selection:created", (e) => {
          const ids = e.selected?.map((obj) => obj.id as string).filter(Boolean) || [];
          setSelectedIds(ids);
          if (options.onSelectionChanged) {
            options.onSelectionChanged(ids);
          }
        });

        canvas.on("selection:updated", (e) => {
          const ids = e.selected?.map((obj) => obj.id as string).filter(Boolean) || [];
          setSelectedIds(ids);
          if (options.onSelectionChanged) {
            options.onSelectionChanged(ids);
          }
        });

        canvas.on("selection:cleared", () => {
          setSelectedIds([]);
          if (options.onSelectionChanged) {
            options.onSelectionChanged([]);
          }
        });

        setIsReady(true);
        saveState();
      } catch (error) {
        console.error("Failed to initialize Fabric canvas:", error);
      }
    };

    initCanvas();

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.dispose();
        canvasInstance.current = null;
        setIsReady(false);
      }
    };
  }, [options.width, options.height, options.backgroundColor]);

  // Helper to convert Fabric object to motion object
  const fabricToMotionObject = (obj: FabricObjectType): FabricObject => {
    return {
      id: (obj.id as string) || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: obj.type as FabricObject["type"],
      left: obj.left || 0,
      top: obj.top || 0,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      rotation: obj.angle,
      angle: obj.angle,
      opacity: obj.opacity,
      fill: obj.fill as string,
      stroke: obj.stroke as string,
      strokeWidth: obj.strokeWidth,
      filters: [],
      ...obj.toObject(),
    };
  };

  // Save canvas state to history
  const saveState = useCallback(() => {
    if (!canvasInstance.current) return;

    const json = JSON.stringify(canvasInstance.current.toJSON());

    // Remove redo states if we're in the middle of the history
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    historyRef.current.push(json);
    historyIndexRef.current++;

    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, []);

  // Undo
  const undo = useCallback(async () => {
    if (historyIndexRef.current > 0 && canvasInstance.current) {
      historyIndexRef.current--;
      const state = historyRef.current[historyIndexRef.current];
      isUpdatingRef.current = true;
      try {
        await canvasInstance.current.loadFromJSON(state, () => {
          canvasInstance.current?.renderAll();
        });
      } finally {
        isUpdatingRef.current = false;
      }
    }
  }, []);

  // Redo
  const redo = useCallback(async () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && canvasInstance.current) {
      historyIndexRef.current++;
      const state = historyRef.current[historyIndexRef.current];
      isUpdatingRef.current = true;
      try {
        await canvasInstance.current.loadFromJSON(state, () => {
          canvasInstance.current?.renderAll();
        });
      } finally {
        isUpdatingRef.current = false;
      }
    }
  }, []);

  // Add object to canvas
  const addObject = useCallback(
    (objData: Partial<FabricObject>): string => {
      if (!canvasInstance.current) return "";

      const id = objData.id || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      isUpdatingRef.current = true;
      try {
        // Create Fabric object based on type
        // This is a simplified version - full implementation would handle all types
        canvasInstance.current.add({
          ...objData,
          id,
        } as FabricObjectType);
        canvasInstance.current.renderAll();
      } finally {
        isUpdatingRef.current = false;
      }

      saveState();
      return id;
    },
    [saveState]
  );

  // Update object
  const updateObject = useCallback(
    (id: string, updates: Partial<FabricObject>) => {
      if (!canvasInstance.current) return;

      const obj = canvasInstance.current.getObjects().find((o) => o.id === id);
      if (!obj) return;

      isUpdatingRef.current = true;
      try {
        obj.set(updates);
        obj.setCoords();
        canvasInstance.current.renderAll();
      } finally {
        isUpdatingRef.current = false;
      }

      saveState();
    },
    [saveState]
  );

  // Remove object
  const removeObject = useCallback(
    (id: string) => {
      if (!canvasInstance.current) return;

      const obj = canvasInstance.current.getObjects().find((o) => o.id === id);
      if (!obj) return;

      isUpdatingRef.current = true;
      try {
        canvasInstance.current.remove(obj);
        canvasInstance.current.renderAll();
      } finally {
        isUpdatingRef.current = false;
      }

      saveState();
    },
    [saveState]
  );

  // Get object by ID
  const getObject = useCallback((id: string): FabricObject | null => {
    if (!canvasInstance.current) return null;

    const obj = canvasInstance.current.getObjects().find((o) => o.id === id);
    return obj ? fabricToMotionObject(obj) : null;
  }, []);

  // Get all objects
  const getAllObjects = useCallback((): FabricObject[] => {
    if (!canvasInstance.current) return [];

    return canvasInstance.current.getObjects().map(fabricToMotionObject);
  }, []);

  // Select objects by ID
  const selectObjects = useCallback((ids: string[]) => {
    if (!canvasInstance.current) return;

    const objects = canvasInstance.current
      .getObjects()
      .filter((obj) => obj.id && ids.includes(obj.id as string));

    if (objects.length > 0) {
      if (objects.length === 1) {
        canvasInstance.current.setActiveObject(objects[0]);
      } else {
        const selection = new (require("fabric")).ActiveSelection(objects, {
          canvas: canvasInstance.current,
        });
        canvasInstance.current.setActiveObject(selection);
      }
      canvasInstance.current.renderAll();
    }
  }, []);

  // Deselect all
  const deselectAll = useCallback(() => {
    if (!canvasInstance.current) return;

    canvasInstance.current.discardActiveObject();
    canvasInstance.current.renderAll();
    setSelectedIds([]);
  }, []);

  // Clear canvas
  const clear = useCallback(() => {
    if (!canvasInstance.current) return;

    isUpdatingRef.current = true;
    try {
      canvasInstance.current.clear();
      canvasInstance.current.backgroundColor = options.backgroundColor || "#1a1a1a";
      canvasInstance.current.renderAll();
    } finally {
      isUpdatingRef.current = false;
    }

    saveState();
  }, [options.backgroundColor, saveState]);

  // Export to JSON
  const toJSON = useCallback(() => {
    if (!canvasInstance.current) return {};
    return canvasInstance.current.toJSON();
  }, []);

  // Load from JSON
  const loadFromJSON = useCallback(
    async (json: object) => {
      if (!canvasInstance.current) return;

      isUpdatingRef.current = true;
      try {
        await canvasInstance.current.loadFromJSON(json, () => {
          canvasInstance.current?.renderAll();
        });
      } finally {
        isUpdatingRef.current = false;
      }

      saveState();
    },
    [saveState]
  );

  // Export to image
  const exportToImage = useCallback(
    (format: "png" | "jpeg" = "png"): string => {
      if (!canvasInstance.current) return "";
      return canvasInstance.current.toDataURL({
        format,
        quality: 1,
        multiplier: 2,
      });
    },
    []
  );

  // Set zoom
  const setZoom = useCallback((newZoom: number) => {
    if (!canvasInstance.current) return;

    canvasInstance.current.setZoom(newZoom);
    canvasInstance.current.renderAll();
    setZoomState(newZoom);
  }, []);

  return {
    canvasRef,
    canvas: canvasInstance.current,
    isReady,
    zoom,
    setZoom,
    addObject,
    updateObject,
    removeObject,
    getObject,
    getAllObjects,
    selectedIds,
    selectObjects,
    deselectAll,
    clear,
    toJSON,
    loadFromJSON,
    exportToImage,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    undo,
    redo,
    canUndo: historyIndexRef.current > 0,
    canRedo: historyIndexRef.current < historyRef.current.length - 1,
    saveState,
  };
}
