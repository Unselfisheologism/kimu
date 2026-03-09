// Remotion Skills Index - High-end Motion Graphics Generation
// This file contains comprehensive skill categories for generating professional motion graphics
// Based on Remotion Agent Skills from github.com/remotion-dev/remotion

import type { RemotionCodeData } from "~/components/timeline/types";

export interface RemotionSkill {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  codeTemplate: string;
  guidanceRules?: string; // Detailed guidance rules for the AI
}

// Comprehensive skill definitions for high-end motion graphics
export const REMOTION_SKILLS: RemotionSkill[] = [
  // ==================== TYPOGRAPHY SKILLS ====================
  {
    id: "typography",
    name: "Typography & Kinetic Text",
    keywords: ["text", "typography", "kinetic", "type", "word", "letter", "title", "heading", "subtitle", "font", "word", "animate text", "text animation", "typewriter", "text reveal", "highlight", "glitch", "title sequence"],
    description: "Kinetic typography and text animations - essential for SaaS startup videos",
    codeTemplate: `import { useCurrentFrame, interpolate, spring } from 'remotion';

const frame = useCurrentFrame();

// Character-by-character reveal
const text = "Your Title Here";
const chars = text.split("");
const delayPerChar = 3;

// Typewriter effect
const typeProgress = interpolate(frame, [0, text.length * delayPerChar], [0, 1]);
const displayedText = text.slice(0, Math.floor(typeProgress * text.length));`,
    guidanceRules: `## Typography Guidelines
- Use interpolate() for smooth text reveals
- Character-by-character or word-by-word reveals work best
- Spring physics create organic feel
- Combine with opacity and scale for polish
- Use useVideoConfig().fps for timing

## Text Animation Patterns:
1. Typewriter: Reveal one character at a time with fixed delay
2. Slide-up: Text slides from below while fading in  
3. Scale-in: Text scales from 0.5 to 1 while fading
4. Word stagger: Each word animates with delay offset
5. Highlight reveal: Background highlight sweeps across text

## Font Recommendations:
- Sans-serif: Inter, Roboto, SF Pro for modern look
- Display: Poppins, Montserrat for headlines
- Monospace: JetBrains Mono for tech content`
  },
  
  // ==================== SPRING PHYSICS ====================
  {
    id: "spring-physics",
    name: "Spring Physics & Organic Motion",
    keywords: ["spring", "bounce", "elastic", "physics", "organic", "bouncy", "wobbly", "natural", "smooth", "ease-out-back"],
    description: "Physics-based spring animations for natural, organic motion",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Spring animation for natural bounce
const bounce = spring({
  frame,
  fps,
  config: { damping: 10, stiffness: 100, mass: 1 }
});

// Elastic scale with overshoot
const elastic = spring({
  frame,
  fps,
  config: { damping: 8, stiffness: 200, mass: 0.5 },
  overshootClamping: false
});

// Smooth entrance with spring
const entrance = spring({
  frame,
  fps,
  config: { damping: 15, stiffness: 100 }
});`,
    guidanceRules: `## Spring Physics Guidelines
- damping: Lower = more oscillation (10-20 default)
- stiffness: Higher = faster animation (100-200)
- mass: Higher = slower/heavier feel
- overshootClamping: false allows overshoot for bounce effects

## Common Spring Configs:
- Subtle: { damping: 20, stiffness: 100 }
- Bouncy: { damping: 8, stiffness: 200, mass: 0.5 }
- Snappy: { damping: 15, stiffness: 300 }
- Organic: { damping: 10, stiffness: 100, mass: 1 }

## Use Cases:
- Button interactions
- Element entrances
- Micro-animations
- Loading states
- Success feedback`
  },

  // ==================== TRANSITIONS ====================
  {
    id: "transitions",
    name: "Scene Transitions",
    keywords: ["transition", "fade", "wipe", "slide", "flip", "iris", "cross-dissolve", "scene change", "effect", "transition between"],
    description: "Professional scene transitions using @remotion/transitions",
    codeTemplate: `import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade, wipe, slide, flip, iris } from '@remotion/transitions';

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    {/* Scene 1 */}
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={60}>
    {/* Scene 2 */}
  </TransitionSeries.Sequence>
</TransitionSeries>`,
    guidanceRules: `## Transition Types:
- fade(): Cross-dissolve between scenes
- wipe(direction): Directional wipe (left, right, up, down)
- slide(): Slides in from direction
- flip(): 3D flip transition
- iris(): Circular reveal/hide

## Timing Functions:
- linearTiming: Constant speed
- springTiming: Spring-based natural motion

## Best Practices:
- 20-30 frames for quick transitions
- 45-60 frames for dramatic reveals
- Match transition to video mood
- Use consistent timing across video`
  },

  // ==================== CHARTS & DATA VISUALIZATION ====================
  {
    id: "charts",
    name: "Charts & Data Visualization",
    keywords: ["chart", "bar", "graph", "pie", "data", "statistic", "percentage", "growth", "increase", "decrease", "analytics", "metric", "kpi", "number", "counter", "animated chart"],
    description: "Animated charts and data visualizations",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const frame = useCurrentFrame();

// Animated bar chart
const bars = [
  { label: "Q1", value: 40 },
  { label: "Q2", value: 65 },
  { label: "Q3", value: 80 },
  { label: "Q4", value: 95 }
];

const barHeights = bars.map((bar, i) => {
  const delay = i * 15;
  return interpolate(frame, [delay, delay + 30], [0, bar.value], {
    extrapolateRight: "clamp"
  });
});

// Animated percentage counter
const percentage = interpolate(frame, [0, 60], [0, 85], {
  extrapolateRight: "clamp"
});
const displayValue = Math.round(percentage);`,
    guidanceRules: `## Chart Animation Patterns:
1. Bar charts: Bars grow from bottom with stagger
2. Line charts: Path draws progressively
3. Pie charts: Segments animate in sequence
4. Counters: Numbers count up with easing

## Data Viz Guidelines:
- Use interpolate() for smooth value transitions
- Stagger animations for multiple elements
- Add easing for natural feel
- Include labels and units
- Keep animations under 2 seconds total`
  },

  // ==================== MESSAGING & UI ====================
  {
    id: "messaging",
    name: "Messaging & UI Elements",
    keywords: ["chat", "message", "bubble", "ui", "button", "notification", "toast", "dialog", "popup", "card", "interface", "app", "mobile", "screen"],
    description: "Chat UIs, app interfaces, and mobile screen animations",
    codeTemplate: `import { useCurrentFrame, interpolate, spring } from 'remotion';
import { AbsoluteFill, Sequence } from 'remotion';

const ChatBubble = ({ message, isUser, index }) => {
  const frame = useCurrentFrame();
  const delay = index * 20;
  
  const slideIn = spring({ frame: frame - delay, fps: 30, config: { damping: 15 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1]);
  
  return (
    <div style={{
      transform: \`translateX(\${(1 - slideIn) * 50 * (isUser ? 1 : -1)}px)\`,
      opacity,
      alignSelf: isUser ? 'flex-end' : 'flex-start'
    }}>
      {message}
    </div>
  );
};`,
    guidanceRules: `## UI Animation Patterns:
1. Chat bubbles: Slide in from left/right with stagger
2. Cards: Scale up with fade from center
3. Buttons: Scale down on click, spring back
4. Lists: Items slide in sequentially
5. Notifications: Slide from top/corner

## Mobile/SaaS Patterns:
- App screen mockups with device frames
- Chat interfaces with typing indicators
- Dashboard cards with staggered entrance
- Feature highlights with spotlight effect
- Testimonial carousels`
  },

  // ==================== SOCIAL MEDIA ====================
  {
    id: "social-media",
    name: "Social Media Content",
    keywords: ["social", "instagram", "twitter", "linkedin", "tiktok", "youtube", "short", "reel", "story", "post", "feed", "thumbnail", "avatar"],
    description: "Social media video formats and content patterns",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

// 9:16 vertical video (TikTok, Reels, Shorts)
const VERTICAL_WIDTH = 1080;
const VERTICAL_HEIGHT = 1920;

// 16:9 horizontal video (YouTube)
const HORIZONTAL_WIDTH = 1920;
const HORIZONTAL_HEIGHT = 1080;

// Safe zone markers for platforms
const tiktokSafeZone = { top: 250, bottom: 450, padding: 40 };
const youtubeEndCard = { width: 480, height: 270, position: 'bottom-right' };`,
    guidanceRules: `## Video Formats:
- TikTok/Reels/Shorts: 9:16, 1080x1920
- YouTube: 16:9, 1920x1080  
- Instagram Feed: 1:1, 1080x1080
- LinkedIn: 4:5, 1080x1350

## Platform Safe Zones:
- TikTok: Bottom 450px for UI, top 250px
- YouTube: Right 400px for timestamps
- Instagram: Center 1080px safe

## Content Patterns:
- Hook in first 2 seconds
- Visual storytelling without audio
- End screens with CTA
- Captions/bad`
  },

  // ==================== 3D &ges overlay THREE.JS ====================
  {
    id: "3d",
    name: "3D & Three.js Integration",
    keywords: ["3d", "three", "threejs", "cube", "sphere", "3d scene", "three.js", "3d object", "3d animation", "webgl", "perspective", "rotate", "3d text"],
    description: "Three.js integration for 3D scenes and animations",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';
import { ThreeCanvas, useThreeFrame, } from '@remotion/three';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const RotatingCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frame = useCurrentFrame();
  
  // Rotation animation
  const rotation = interpolate(frame, [0, 300], [0, Math.PI * 2]);
  
  return (
    <mesh ref={meshRef} rotation={[rotation, rotation, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};`,
    guidanceRules: `## Three.js in Remotion:
- Use @remotion/three package
- Components: <ThreeCanvas>, <OrbitControls>
- animate via useCurrentFrame()
- Use useThreeFrame() for 3D-specific frame updates

## 3D Animation Patterns:
- Rotating objects (cubes, spheres, models)
- Camera movements (pan, zoom, orbit)
- Lighting changes over time
- Material property animations
- Text in 3D space

## Performance:
- Keep polygon count reasonable
- Use instanced meshes for multiple objects
- Preload 3D models`
  },

  // ==================== SEQUENCING & TIMING ====================
  {
    id: "sequencing",
    name: "Sequencing & Timing Control",
    keywords: ["sequence", "timing", "sync", " synchronize", "audio sync", "stagger", "delay", "parallel", "series", "chain", "timeline"],
    description: "Mastering timing and sequencing for complex compositions",
    codeTemplate: `import { Sequence, useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';

// Sequential animations using Sequence
const MyComposition = () => (
  <AbsoluteFill style={{ backgroundColor: '#111' }}>
    <Sequence from={0} durationInFrames={60}>
      <TitleAnimation />
    </Sequence>
    <Sequence from={45} durationInFrames={90}>
      <BodyContent />
    </Sequence>
    <Sequence from={120} durationInFrames={30}>
      <CTAButton />
    </Sequence>
  </AbsoluteFill>
);

// Staggered animations
const staggerDelay = 10;
const items = data.map((item, i) => ({
  ...item,
  delay: i * staggerDelay
}));`,
    guidanceRules: `## Sequencing Fundamentals:
- Sequence: Controls start time of child elements
- from: When to start (in frames)
- durationInFrames: How long to display
- overlap: Allow overlap between sequences

## Timing Best Practices:
- Leave 15-30 frames between major beats
- Use consistent stagger delays
- Consider audio sync points
- Plan entry/exit timing

## Common Patterns:
- Intro → Content → CTA flow
- List items with stagger
- Multi-track compositions
- Beat-synced animations`
  },

  // ==================== LOTTIE ANIMATIONS ====================
  {
    id: "lottie",
    name: "Lottie & External Animations",
    keywords: ["lottie", "dotlottie", "animation file", "after effects", "json animation", "animated illustration", "icon animation"],
    description: "Using Lottie animations in Remotion",
    codeTemplate: `import { Lottie } from '@remotion/lottie';
import lottie from 'lottie-react'; // or fetch JSON

const LottieAnimation = () => {
  // Option 1: Load from JSON file
  const animationData = require('./animation.json');
  
  // Option 2: Control playback with frame
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 60], [0, 1]);
  
  return (
    <Lottie
      animationData={animationData}
      play={true}
      loop={true}
    />
  );
};`,
    guidanceRules: `## Lottie Integration:
- Use @remotion/lottie package
- Load JSON from file or URL
- Control with useCurrentFrame() for sync
- Loop or play once as needed

## Use Cases:
- Loading spinners
- Success/checkmark animations
- Decorative illustrations
- Icon animations
- Character animations`
  },

  // ==================== LOOPS & REPEATING ====================
  {
    id: "loops",
    name: "Looping Animations",
    keywords: ["loop", "repeat", "infinite", "continuous", "cycle", "endless", "looping background", "ambient"],
    description: "Creating seamless looping animations",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const LoopingBackground = () => {
  const frame = useCurrentFrame();
  
  // Seamless loop using modulo
  const loopFrame = frame % 120; // Loop every 4 seconds at 30fps
  
  // Or use interpolate with [0, totalFrames]
  const progress = interpolate(loopFrame, [0, 120], [0, 1]);
  
  // Continuous rotation
  const rotation = (frame * 2) % 360;
  
  // Ping-pong loop (back and forth)
  const pingPong = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0, 1]
  );`,
    guidanceRules: `## Looping Techniques:
- Modulo (frame % duration): Simple repeating
- Sin/cos: Smooth back-and-forth
- interpolate with clamp: One-way then hold

## Seamless Loop Tips:
- Start and end at same position
- Use even duration divisions
- Test at least 2 loop cycles
- Consider audio sync for loops`
  },

  // ==================== PRODUCT & DEVICE ====================
  {
    id: "product",
    name: "Product & Device Showcase",
    keywords: ["product", "device", "phone", "laptop", "mockup", "showcase", "demo", "feature", "screen recording", "app demo", "ui demo"],
    description: "Product animations and device mockups",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const DeviceFrame = ({ children, type = 'phone' }) => {
  const frame = useCurrentFrame();
  
  const deviceStyle = type === 'phone' 
    ? { width: 375, height: 812, borderRadius: 40, borderWidth: 12 }
    : { width: 1440, height: 900, borderRadius: 20, borderWidth: 16 };
  
  // Floating animation
  const float = interpolate(frame % 120, [0, 60, 120], [0, -10, 0]);
  
  return (
    <div style={{ transform: \`translateY(\${float}px)\` }}>
      <div style={{
        ...deviceStyle,
        backgroundColor: '#000',
        overflow: 'hidden',
        border: \`\${deviceStyle.borderWidth}px solid #333\`
      }}>
        {children}
      </div>
    </div>
  );
};`,
    guidanceRules: `## Device Mockup Patterns:
- Phone: 375x812 (iPhone), 412x915 (Android)
- Laptop: 1440x900, 1920x1080
- Tablet: 768x1024, 1024x768

## Animation Ideas:
- Device floating/rotating
- Screen content playing
- Highlight specific features
- Exploded view animations
- Before/after comparisons`
  },

  // ==================== LOGO ANIMATIONS ====================
  {
    id: "logo",
    name: "Logo & Brand Animations",
    keywords: ["logo", "brand", "logotype", "icon", "badge", "identity", "brand reveal", "company", "startup", "intro logo"],
    description: "Logo animations and brand reveals",
    codeTemplate: `import { useCurrentFrame, interpolate, spring } from 'remotion';

const LogoReveal = ({ logoText }) => {
  const frame = useCurrentFrame();
  
  // Scale from center
  const scale = spring({ frame, fps: 30, config: { damping: 12 } });
  
  // Letter-by-letter reveal
  const letters = logoText.split('');
  const letterDelay = 5;
  
  return (
    <div style={{ transform: \`scale(\${scale})\` }}>
      {letters.map((letter, i) => {
        const delay = i * letterDelay;
        const opacity = interpolate(frame, [delay, delay + 10], [0, 1]);
        const y = interpolate(frame, [delay, delay + 15], [20, 0]);
        
        return (
          <span key={i} style={{ opacity, transform: \`translateY(\${y}px)\` }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
};`,
    guidanceRules: `## Logo Animation Patterns:
- Letter-by-letter reveal
- Scale from center
- Draw-on effect (stroke animation)
- Color fill transitions
- Floating/flying elements
- Glow effects

## Brand Guidelines:
- Keep under 3 seconds for intro
- Match company personality
- Use brand colors consistently
- Leave space around logo`
  },

  // ==================== BACKGROUND EFFECTS ====================
  {
    id: "backgrounds",
    name: "Backgrounds & Atmospheres",
    keywords: ["background", "atmosphere", "gradient", "mesh", "particle", "ambient", "mood", "texture", "noise", "vignette", "blur", "backdrop"],
    description: "Animated backgrounds and atmospheric effects",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

const AnimatedGradient = () => {
  const frame = useCurrentFrame();
  
  // Animated gradient shift
  const gradient = interpolate(frame % 300, [0, 300], [0, 1]);
  
  // Color interpolation
  const color1 = interpolate(gradient, [0, 0.5, 1], ['#667eea', '#764ba2', '#f093fb']);
  const color2 = interpolate(gradient, [0, 0.5, 1], ['#764ba2', '#f093fb', '#667eea']);
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: \`linear-gradient(\${gradient * 45}deg, \${color1}, \${color2})\`
    }} />
  );
};

// Mesh gradient (simplified)
const MeshGradient = () => {
  const frame = useCurrentFrame();
  const blobs = [
    { x: interpolate(frame, [0, 200], [0, 1920]), y: 0, color: '#ff6b6b' },
    { x: 1920, y: interpolate(frame, [0, 300], [1080, 0]), color: '#4ecdc4' },
  ];
  // Render blurred circles for mesh effect
};`,
    guidanceRules: `## Background Types:
- Animated gradients: Smooth color transitions
- Mesh gradients: Blurred overlapping colors
- Particle fields: Floating dots/particles
- Noise textures: Film grain, static
- Geometric patterns: Moving shapes

## Performance Tips:
- Use CSS transforms over layout changes
- Limit particle count to 50-100
- Consider reduced motion preference
- Test on lower-end devices`
  },

  // ==================== CALL TO ACTION ====================
  {
    id: "cta",
    name: "Call to Action & End Screens",
    keywords: ["cta", "call to action", "button", "click here", "sign up", "get started", "subscribe", "end screen", "outro", "link", "url", "visit"],
    description: "CTA buttons, end screens, and conversion elements",
    codeTemplate: `import { useCurrentFrame, interpolate, spring } from 'remotion';

const CTAButton = ({ text = "Get Started", url = "https://example.com" }) => {
  const frame = useCurrentFrame();
  
  // Pulse animation
  const scale = spring({ frame, fps: 30, config: { damping: 10, stiffness: 100 } });
  const shadow = interpolate(scale, [0.95, 1], [0, 20]);
  
  return (
    <div style={{
      padding: '16px 32px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111',
      transform: \`scale(\${scale})\`,
      boxShadow: \`0 \${shadow}px 20px rgba(0,0,0,0.2)\`,
      cursor: 'pointer'
    }}>
      {text}
    </div>
  );
};

// End screen with multiple CTAs
const EndScreen = () => (
  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
    <CTAButton text="Get Started" />
    <CTAButton text="Learn More" />
  </div>
);`,
    guidanceRules: `## CTA Design Patterns:
- Contrast with background
- Clear action verb
- Subtle animation to draw attention
- Multiple options for different users

## End Screen Elements:
- Main CTA button (most prominent)
- Secondary link
- Social handles
- QR code for mobile
- Video recommendations`
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
  
  // Default to typography if nothing detected
  if (detectedSkills.length === 0) {
    detectedSkills.push("typography");
  }
  
  return detectedSkills;
}

// Function to get skill code templates
export function getSkillTemplates(skillIds: string[]): string[] {
  return skillIds
    .map(id => REMOTION_SKILLS.find(s => s.id === id)?.codeTemplate)
    .filter((template): template is string => template !== undefined);
}

// Function to get skill guidance rules
export function getSkillGuidance(skillIds: string[]): string {
  return skillIds
    .map(id => REMOTION_SKILLS.find(s => s.id === id)?.guidanceRules)
    .filter((rule): rule is string => rule !== undefined)
    .join('\n\n');
}

// Function to get all skill names
export function getAllSkillNames(): string[] {
  return REMOTION_SKILLS.map(s => s.name);
}

// Function to generate full Remotion code based on description and skills
export function generateRemotionCode(
  description: string,
  compositionName: string,
  durationInFrames: number,
  width: number = 1920,
  height: number = 1080,
  fps: number = 30
): string {
  const detectedSkills = detectSkills(description);
  const templates = getSkillTemplates(detectedSkills);
  const guidance = getSkillGuidance(detectedSkills);
  
  // Build the composition code
  const compositionCode = templates.join('\n\n');
  
  return `// Remotion Code: ${compositionName}
// Generated for: ${description}
// Skills detected: ${detectedSkills.join(', ')}
// Duration: ${durationInFrames} frames at ${fps}fps
// Dimensions: ${width}x${height}

import { 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate, 
  spring,
  Sequence,
  AbsoluteFill,
  Img,
  Video,
  Audio
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';

// ==================== BASE COMPOSITION ====================

export const ${compositionName.replace(/[^a-zA-Z0-9]/g, '')}: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
      {/* Your content here */}
      ${compositionCode}
    </AbsoluteFill>
  );
};

// ==================== GUIDANCE RULES ====================
${guidance}
`;
}

// Export skill IDs for type checking
export type SkillId = typeof REMOTION_SKILLS[number]['id'];
