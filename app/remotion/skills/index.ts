// Remotion Skills Index
// This file contains skill categories and keywords for the AI to detect and use when generating Remotion code

export interface RemotionSkill {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  codeTemplate: string;
}

export const REMOTION_SKILLS: RemotionSkill[] = [
  {
    id: "animations",
    name: "Animations",
    keywords: ["animate", "animation", "move", "slide", "fade", "scale", "rotate", "bounce", "pulse", "shake", "wobble", "spring"],
    description: "Basic animations using interpolate and spring",
    codeTemplate: `import { useCurrentFrame, interpolate, spring } from 'remotion';

const frame = useCurrentFrame();
const { opacity, scale, translateX } = {
  opacity: interpolate(frame, [0, 30], [0, 1]),
  scale: interpolate(frame, [0, 30], [0.5, 1]),
  translateX: interpolate(frame, [0, 30], [-100, 0], { extrapolateRight: "clamp" })
};`
  },
  {
    id: "text_animations",
    name: "Text Animations",
    keywords: ["text", "word", "letter", "typography", "title", "subtitle", "heading", "font", "type"],
    description: "Text reveal and animation effects",
    codeTemplate: `import { useCurrentFrame, interpolate, delayRender, continueRender } from 'remotion';

const frame = useCurrentFrame();
// Text character-by-character reveal
const text = "Hello World";
const chars = text.split("");
const revealFrame = 30;`
  },
  {
    id: "transitions",
    name: "Transitions",
    keywords: ["transition", "fade", "wipe", "slide", "flip", "iris", "cross", "dissolve", "effect"],
    description: "Transitions between scenes using @remotion/transitions",
    codeTemplate: `import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade, wipe, slide, flip, iris } from '@remotion/transitions';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={30}>
    {/* First scene */}
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={30}>
    {/* Second scene */}
  </TransitionSeries.Sequence>
</TransitionSeries>`
  },
  {
    id: "shapes",
    name: "Shapes",
    keywords: ["shape", "circle", "rectangle", "square", "triangle", "line", "polygon", "box"],
    description: "Drawing shapes with CSS/HTML in Remotion",
    codeTemplate: `import { AbsoluteFill } from 'remotion';

const Shape = ({ type, color, width, height }) => {
  const style: React.CSSProperties = {
    width,
    height,
    backgroundColor: color,
    borderRadius: type === 'circle' ? '50%' : '0'
  };
  return <div style={style} />;
};`
  },
  {
    id: "audio",
    name: "Audio",
    keywords: ["audio", "sound", "music", "voice", "speak", "song", "background music", "bgm"],
    description: "Audio playback and synchronization",
    codeTemplate: `import { Audio } from 'remotion';

<Audio src="/path/to/audio.mp3" />`
  },
  {
    id: "video",
    name: "Video",
    keywords: ["video", "clip", "movie", "footage", "media"],
    description: "Video handling in Remotion",
    codeTemplate: `import { Video } from 'remotion';

<Video src="/path/to/video.mp3" />`
  },
  {
    id: "images",
    name: "Images",
    keywords: ["image", "picture", "photo", "img", "graphic"],
    description: "Image handling in Remotion",
    codeTemplate: `import { Img } from 'remotion';

<Img src="/path/to/image.png" />`
  },
  {
    id: "loops",
    name: "Looping",
    keywords: ["loop", "repeat", "cycle", "infinite", "continuous"],
    description: "Creating looping animations",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();
const loopFrame = frame % 60; // Loop every 60 frames`
  },
  {
    id: "sequences",
    name: "Sequences",
    keywords: ["sequence", "series", "order", "chain", "timeline", "stagger"],
    description: "Sequencing multiple elements",
    codeTemplate: `import { Sequence, AbsoluteFill } from 'remotion';

<AbsoluteFill>
  <Sequence from={0} durationInFrames={30}>
    {/* First element */}
  </Sequence>
  <Sequence from={30} durationInFrames={30}>
    {/* Second element */}
  </Sequence>
</AbsoluteFill>`
  },
  {
    id: "spring_animations",
    name: "Spring Animations",
    keywords: ["spring", "bounce", "elastic", "wobbly", "physics"],
    description: "Physics-based spring animations",
    codeTemplate: `import { spring, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const scale = spring({
  frame,
  fps: 30,
  config: { damping: 10, stiffness: 100 }
});`
  },
  {
    id: "color_animations",
    name: "Color Animations",
    keywords: ["color", "gradient", "hue", "saturation", "lightness", "rgb", "hex"],
    description: "Animated colors and gradients",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();
const color = interpolate(frame, [0, 60], [0, 360], {
  extrapolateRight: "clamp"
});
const gradient = \`linear-gradient(\${color}deg, #ff0000, #0000ff)\`;`
  },
  {
    id: "staggered_animations",
    name: "Staggered Animations",
    keywords: ["stagger", "delay", "offset", "cascade", "wave"],
    description: "Staggered animations for multiple elements",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const items = ['A', 'B', 'C', 'D'];
const staggerDelay = 10;

items.map((item, i) => {
  const frame = useCurrentFrame();
  const delay = i * staggerDelay;
  const opacity = interpolate(frame, [delay, delay + 30], [0, 1]);
  return { ...item, opacity };
});`
  },
  {
    id: "counting",
    name: "Counting/Numbers",
    keywords: ["count", "number", "digit", "counter", "timer", "clock", "seconds", "minutes"],
    description: "Animated counting and number displays",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();
const value = interpolate(frame, [0, 60], [0, 100], {
  extrapolateRight: "clamp"
});
const displayValue = Math.floor(value);`
  },
  {
    id: "particles",
    name: "Particles",
    keywords: ["particle", "dot", "confetti", "snow", "rain", "sparkle", "stars"],
    description: "Particle effects and systems",
    codeTemplate: `import { useCurrentFrame } from 'remotion';

const particles = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 1920,
  y: (useCurrentFrame() + i * 10) % 1080,
  size: Math.random() * 10 + 2
}));`
  },
  {
    id: "masks",
    name: "Masks & Clips",
    keywords: ["mask", "clip", "crop", "reveal", "shape mask", "circle reveal"],
    description: "CSS masks and clip-paths",
    codeTemplate: `const maskStyle: React.CSSProperties = {
  clipPath: "circle(50% at 50% 50%)",
  // or
  clipPath: "inset(0% 50% 0% 0%)"
};`
  },
  {
    id: "3d_transforms",
    name: "3D Transforms",
    keywords: ["3d", "perspective", "rotateX", "rotateY", "rotateZ", "transform", "depth", "cube"],
    description: "3D CSS transforms in Remotion",
    codeTemplate: `const style: React.CSSProperties = {
  transform: "perspective(1000px) rotateY(45deg)",
  transformStyle: "preserve-3d"
};`
  },
  {
    id: "responsive",
    name: "Responsive/Layout",
    keywords: ["responsive", "layout", "position", "center", "align", "grid", "flex"],
    description: "Responsive layouts and positioning",
    codeTemplate: `const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '20px'
};`
  }
];

// Function to detect skills from a description
export function detectSkills(description: string): string[] {
  const descriptionLower = description.toLowerCase();
  const detectedSkills: string[] = [];
  
  for (const skill of REMOTION_SKILLS) {
    for (const keyword of skill.keywords) {
      if (descriptionLower.includes(keyword)) {
        if (!detectedSkills.includes(skill.id)) {
          detectedSkills.push(skill.id);
        }
        break;
      }
    }
  }
  
  return detectedSkills;
}

// Function to get skill code templates
export function getSkillTemplates(skillIds: string[]): string[] {
  return skillIds
    .map(id => REMOTION_SKILLS.find(s => s.id === id)?.codeTemplate)
    .filter((template): template is string => template !== undefined);
}

// Function to get all skill names
export function getAllSkillNames(): string[] {
  return REMOTION_SKILLS.map(s => s.name);
}
