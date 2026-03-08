// Motion Graphics Types for Kimu - Based on Motionity Architecture

// Core keyframe system for animations
export interface Keyframe {
  id: string;
  property: KeyframeProperty;
  time: number; // in seconds
  value: number | string | Record<string, number>;
  easing: EasingType;
}

export type KeyframeProperty =
  | "x"
  | "y"
  | "scaleX"
  | "scaleY"
  | "rotation"
  | "opacity"
  | "skewX"
  | "skewY"
  | "fill"
  | "stroke"
  | "strokeWidth"
  | "fontSize"
  | "width"
  | "height"
  | "radius"
  | "rx"
  | "ry"
  | "left"
  | "top"
  | "angle";

export type EasingType =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "spring"
  | "bounce"
  | "elastic";

// Fabric.js object representation (serializable for storage)
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
  angle?: number;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  strokeLineCap?: "butt" | "round" | "square";
  strokeLineJoin?: "miter" | "round" | "bevel";
  // Type-specific props
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  fontStyle?: "normal" | "italic" | "oblique";
  textAlign?: "left" | "center" | "right";
  textDecoration?: "underline" | "overline" | "line-through";
  lineHeight?: number;
  charSpacing?: number;
  src?: string; // for images/videos
  crossOrigin?: "anonymous" | "use-credentials";
  path?: string; // for SVG paths
  pathData?: string; // SVG path data
  radius?: number; // for circles
  rx?: number; // for ellipses/rects
  ry?: number;
  points?: Array<{ x: number; y: number }>; // for polygons/polylines
  // Group properties
  objects?: FabricObject[]; // for groups
  // Video properties
  videoSrc?: string;
  videoStartTime?: number;
  videoDuration?: number;
  // Filters/effects
  filters: FilterConfig[];
  shadow?: ShadowConfig;
  // Animation
  keyframes?: Keyframe[];
  visible?: boolean;
  selectable?: boolean;
  lockMovementX?: boolean;
  lockMovementY?: boolean;
  lockRotation?: boolean;
  lockScalingX?: boolean;
  lockScalingY?: boolean;
  hasControls?: boolean;
  hasBorders?: boolean;
}

export type FabricObjectType =
  | "rect"
  | "circle"
  | "triangle"
  | "ellipse"
  | "line"
  | "polyline"
  | "polygon"
  | "path"
  | "text"
  | "textbox"
  | "image"
  | "video"
  | "group"
  | "activeSelection";

export interface FilterConfig {
  type: FilterType;
  value: number | { [key: string]: number | string };
}

export type FilterType =
  | "blur"
  | "brightness"
  | "contrast"
  | "saturation"
  | "hue"
  | "noise"
  | "pixelate"
  | "sepia"
  | "grayscale"
  | "invert"
  | "vintage"
  | "polaroid"
  | "kodachrome"
  | "technicolor"
  | "sharpen"
  | "emboss"
  | "gamma"
  | "chromakey";

export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  affectStroke?: boolean;
  nonScaling?: boolean;
}

// Extended ScrubberState for motion graphics
export interface MotionGraphicsData {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor?: string;
  backgroundImage?: string;
  objects: FabricObject[];
  keyframes: Keyframe[];
  duration: number; // in seconds
  fps: number;
  loop: boolean;
  version: string; // for migration compatibility
}

// Motion Editor State
export interface MotionEditorState {
  selectedObjectIds: string[];
  currentTime: number; // in seconds
  isPlaying: boolean;
  zoom: number;
  canvasZoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  selectedKeyframeIds: string[];
  isRecording: boolean; // for keyframe recording mode
}

// Animation Preset
export interface AnimationPreset {
  id: string;
  name: string;
  category: "entrance" | "exit" | "emphasis" | "motion" | "custom";
  description: string;
  keyframes: Keyframe[];
  duration: number;
  icon?: string;
}

// Lottie Animation Import
export interface LottieImportConfig {
  url?: string;
  json?: object;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
}

// Shape Tool Configuration
export interface ShapeTool {
  type: FabricObjectType;
  icon: string;
  label: string;
  defaultProps: Partial<FabricObject>;
}

// Asset Library Item
export interface MotionAsset {
  id: string;
  name: string;
  type: "shape" | "image" | "lottie" | "video" | "template";
  src?: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    fileSize?: number;
  };
}

// Layer Management
export interface LayerInfo {
  id: string;
  objectId: string;
  name: string;
  type: FabricObjectType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  index: number; // z-index order
}

// Export Settings
export interface MotionExportSettings {
  format: "mp4" | "webm" | "gif" | "lottie" | "json";
  quality: "low" | "medium" | "high" | "ultra";
  width: number;
  height: number;
  fps: number;
  transparentBackground: boolean;
}

// AI Tool Types for Motion Operations
export interface LLMAddShapeArgs {
  function_name: "LLMAddShape";
  scrubber_id: string;
  shape_type: "rect" | "circle" | "triangle" | "text" | "ellipse" | "line";
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface LLMCreateKeyframeArgs {
  function_name: "LLMCreateKeyframe";
  scrubber_id: string;
  object_id: string;
  property: KeyframeProperty;
  time: number;
  value: number | string;
  easing: EasingType;
}

export interface LLMApplyFilterArgs {
  function_name: "LLMApplyFilter";
  scrubber_id: string;
  object_id: string;
  filter_type: FilterType;
  value: number;
}

export interface LLMSetEasingArgs {
  function_name: "LLMSetEasing";
  scrubber_id: string;
  keyframe_id: string;
  easing: EasingType;
}

export interface LLMGroupObjectsArgs {
  function_name: "LLMGroupObjects";
  scrubber_id: string;
  object_ids: string[];
}

export interface LLMUngroupObjectsArgs {
  function_name: "LLMUngroupObjects";
  scrubber_id: string;
  object_id: string;
}

export interface LLMImportLottieArgs {
  function_name: "LLMImportLottie";
  scrubber_id: string;
  lottie_url?: string;
  lottie_json?: object;
}

export interface LLMDeleteObjectArgs {
  function_name: "LLMDeleteObject";
  scrubber_id: string;
  object_id: string;
}

export interface LLMUpdateObjectArgs {
  function_name: "LLMUpdateObject";
  scrubber_id: string;
  object_id: string;
  properties: Partial<FabricObject>;
}

export interface LLMAnimateObjectArgs {
  function_name: "LLMAnimateObject";
  scrubber_id: string;
  object_id: string;
  animation_type: "fadeIn" | "fadeOut" | "slideIn" | "slideOut" | "scaleIn" | "scaleOut" | "rotate" | "bounce" | "pulse" | "shake";
  duration: number;
  easing?: EasingType;
}

export interface LLMCreateMotionScrubberArgs {
  function_name: "LLMCreateMotionScrubber";
  track_number: number;
  position_seconds: number;
  duration_seconds: number;
  canvas_width?: number;
  canvas_height?: number;
  background_color?: string;
}

export type MotionFunctionCall =
  | LLMAddShapeArgs
  | LLMCreateKeyframeArgs
  | LLMApplyFilterArgs
  | LLMSetEasingArgs
  | LLMGroupObjectsArgs
  | LLMUngroupObjectsArgs
  | LLMImportLottieArgs
  | LLMDeleteObjectArgs
  | LLMUpdateObjectArgs
  | LLMAnimateObjectArgs
  | LLMCreateMotionScrubberArgs;

// Constants
export const DEFAULT_MOTION_CANVAS_WIDTH = 1920;
export const DEFAULT_MOTION_CANVAS_HEIGHT = 1080;
export const DEFAULT_MOTION_DURATION = 5; // seconds
export const DEFAULT_MOTION_FPS = 30;
export const MIN_KEYFRAME_TIME = 0;
export const MAX_KEYFRAME_TIME = 300; // 5 minutes max

// Shape Tools Configuration
export const SHAPE_TOOLS: ShapeTool[] = [
  {
    type: "rect",
    icon: "Square",
    label: "Rectangle",
    defaultProps: { width: 100, height: 100, fill: "#3b82f6" },
  },
  {
    type: "circle",
    icon: "Circle",
    label: "Circle",
    defaultProps: { radius: 50, fill: "#3b82f6" },
  },
  {
    type: "triangle",
    icon: "Triangle",
    label: "Triangle",
    defaultProps: { width: 100, height: 100, fill: "#3b82f6" },
  },
  {
    type: "ellipse",
    icon: "Circle",
    label: "Ellipse",
    defaultProps: { rx: 75, ry: 50, fill: "#3b82f6" },
  },
  {
    type: "line",
    icon: "Minus",
    label: "Line",
    defaultProps: { width: 100, stroke: "#3b82f6", strokeWidth: 2 },
  },
  {
    type: "text",
    icon: "Type",
    label: "Text",
    defaultProps: { text: "Text", fontSize: 48, fill: "#ffffff", fontFamily: "Arial" },
  },
];

// Animation Presets
export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "fade-in",
    name: "Fade In",
    category: "entrance",
    description: "Fade in from transparent to opaque",
    duration: 0.5,
    keyframes: [
      { id: "", property: "opacity", time: 0, value: 0, easing: "easeInOut" },
      { id: "", property: "opacity", time: 0.5, value: 1, easing: "easeInOut" },
    ],
  },
  {
    id: "fade-out",
    name: "Fade Out",
    category: "exit",
    description: "Fade out from opaque to transparent",
    duration: 0.5,
    keyframes: [
      { id: "", property: "opacity", time: 0, value: 1, easing: "easeInOut" },
      { id: "", property: "opacity", time: 0.5, value: 0, easing: "easeInOut" },
    ],
  },
  {
    id: "slide-in-right",
    name: "Slide In (Right)",
    category: "entrance",
    description: "Slide in from right side",
    duration: 0.5,
    keyframes: [
      { id: "", property: "x", time: 0, value: 500, easing: "easeOut" },
      { id: "", property: "x", time: 0.5, value: 0, easing: "easeOut" },
    ],
  },
  {
    id: "slide-in-left",
    name: "Slide In (Left)",
    category: "entrance",
    description: "Slide in from left side",
    duration: 0.5,
    keyframes: [
      { id: "", property: "x", time: 0, value: -500, easing: "easeOut" },
      { id: "", property: "x", time: 0.5, value: 0, easing: "easeOut" },
    ],
  },
  {
    id: "scale-in",
    name: "Scale In",
    category: "entrance",
    description: "Scale up from 0 to 1",
    duration: 0.4,
    keyframes: [
      { id: "", property: "scaleX", time: 0, value: 0, easing: "spring" },
      { id: "", property: "scaleY", time: 0, value: 0, easing: "spring" },
      { id: "", property: "scaleX", time: 0.4, value: 1, easing: "spring" },
      { id: "", property: "scaleY", time: 0.4, value: 1, easing: "spring" },
    ],
  },
  {
    id: "bounce",
    name: "Bounce",
    category: "emphasis",
    description: "Bounce animation effect",
    duration: 0.8,
    keyframes: [
      { id: "", property: "y", time: 0, value: 0, easing: "easeOut" },
      { id: "", property: "y", time: 0.2, value: -50, easing: "easeOut" },
      { id: "", property: "y", time: 0.4, value: 0, easing: "easeIn" },
      { id: "", property: "y", time: 0.55, value: -25, easing: "easeOut" },
      { id: "", property: "y", time: 0.7, value: 0, easing: "easeIn" },
      { id: "", property: "y", time: 0.8, value: -10, easing: "easeOut" },
    ],
  },
  {
    id: "rotate",
    name: "Rotate",
    category: "emphasis",
    description: "Full 360 degree rotation",
    duration: 1,
    keyframes: [
      { id: "", property: "rotation", time: 0, value: 0, easing: "linear" },
      { id: "", property: "rotation", time: 1, value: 360, easing: "linear" },
    ],
  },
  {
    id: "pulse",
    name: "Pulse",
    category: "emphasis",
    description: "Pulsing scale effect",
    duration: 0.6,
    keyframes: [
      { id: "", property: "scaleX", time: 0, value: 1, easing: "easeInOut" },
      { id: "", property: "scaleY", time: 0, value: 1, easing: "easeInOut" },
      { id: "", property: "scaleX", time: 0.3, value: 1.2, easing: "easeInOut" },
      { id: "", property: "scaleY", time: 0.3, value: 1.2, easing: "easeInOut" },
      { id: "", property: "scaleX", time: 0.6, value: 1, easing: "easeInOut" },
      { id: "", property: "scaleY", time: 0.6, value: 1, easing: "easeInOut" },
    ],
  },
];

// Easing function definitions for interpolation
export const EASING_FUNCTIONS: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  spring: (t) => {
    // Simple spring approximation
    const overshoot = 1.70158;
    return t * t * ((overshoot + 1) * t - overshoot);
  },
  bounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};
