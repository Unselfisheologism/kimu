// Motion Graphics Type Definitions

// Filter types supported in motion graphics
export type FilterType = "blur" | "brightness" | "contrast" | "sepia" | "grayscale" | "chromakey";

export interface FilterConfig {
  type: FilterType;
  value: number | { [key: string]: number };
}

// Easing functions for keyframe interpolation
export type EasingType = "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring" | "bounce" | "elastic";

// Keyframe for property animation
export interface Keyframe {
  id: string;
  objectId: string; // ID of the Fabric.js object
  property: string; // Property name: "x", "y", "scaleX", "scaleY", "rotation", "opacity", etc.
  time: number; // Time in seconds
  value: number | string; // Target value at this keyframe
  easing: EasingType;
}

// Fabric.js object representation (serializable)
export type FabricObjectType = "rect" | "circle" | "triangle" | "path" | "text" | "image" | "video" | "group" | "line" | "arrow";

export interface FabricObject {
  id: string;
  type: FabricObjectType;
  left: number;
  top: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  
  // Type-specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  src?: string; // For images/videos
  path?: string; // For SVG paths
  points?: number[]; // For paths/lines
  
  // Effects
  filters: FilterConfig[];
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  
  // Grouping
  isGroup?: boolean;
  objectIds?: string[]; // IDs of objects in this group
  parentId?: string; // ID of parent group if nested
}

// Motion graphics data structure for motion scrubber
export interface MotionGraphicsData {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string;
  objects: FabricObject[];
  keyframes: Keyframe[];
  duration: number; // Duration in seconds
}

// Interpolation result for a property at a given time
export interface InterpolatedValue {
  value: number | string;
  inProgress: boolean; // Whether this frame is between keyframes
}
