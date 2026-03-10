// Remotion Skills - High-End Motion Graphics Generation
// Based on Remotion Agent Skills from github.com/remotion-dev/skills
// This file contains comprehensive skill categories for generating professional motion graphics

import type { RemotionCodeData } from "~/components/timeline/types";

export interface RemotionSkill {
  id: string;
  name: string;
  keywords: string[];
  description: string;
  codeTemplate: string;
  guidanceRules: string;
}

// Comprehensive skill definitions based on official Remotion Agent Skills
export const REMOTION_SKILLS: RemotionSkill[] = [
  // ==================== CORE ANIMATION ====================
  {
    id: "frame-driven",
    name: "Frame-Driven Animation (Core)",
    keywords: ["animation", "animate", "frame", "timing", "sequence", "smooth", "motion"],
    description: "Core frame-driven animation using useCurrentFrame - the foundation of all Remotion animations",
    codeTemplate: `import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const MyComponent = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Basic animation with interpolate
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  // Physics-based spring animation  
  const scale = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 }
  });
  
  return <div style={{ opacity, transform: \`scale(\${scale})\` }} />;
};`,
    guidanceRules: `## Core Animation Principles (from Remotion Skills)

### Frame-Driven Animation
All animations in Remotion are frame-driven - the state is determined by the current frame number, ensuring deterministic rendering without flickering.

### useCurrentFrame()
Returns the current frame number - the primary input for all animations:
\`\`\`tsx
const frame = useCurrentFrame();
\`\`\`

### useVideoConfig()
Provides composition settings:
\`\`\`tsx
const { fps, width, height } = useVideoConfig();
\`\`\``
  },

  // ==================== INTERPOLATE ====================
  {
    id: "interpolate",
    name: "Interpolate Function",
    keywords: ["interpolate", "easing", "map", "range", "clamp", "extrapolate"],
    description: "Map values from input range to output range with optional easing",
    codeTemplate: `import { interpolate, Easing } from 'remotion';

const frame = useCurrentFrame();

// Basic interpolation
const opacity = interpolate(frame, [0, 30], [0, 1]);

// With clamp (most common)
const scale = interpolate(frame, [0, 60], [0.5, 1], {
  extrapolateRight: 'clamp',
  extrapolateLeft: 'clamp'
});

// With easing function
const eased = interpolate(frame, [0, 60], [0, 1], {
  easing: Easing.inOut(Easing.quad)
});

// Blinking cursor effect (from typewriter)
const cursorOpacity = interpolate(
  frame % blinkFrames,
  [0, blinkFrames / 2, blinkFrames],
  [1, 0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);`,
    guidanceRules: `## interpolate() Function
Maps a value from an input range to an output range.

### Parameters:
- \`input\`: The value to interpolate (usually \`frame\`)
- \`inputRange\`: Array of numbers [start, end]
- \`outputRange\`: Array of numbers [start, end]
- \`options\`: { easing, extrapolateLeft, extrapolateRight }

### Options:
- \`easing\`: Easing function (e.g., Easing.inOut(Easing.quad))
- \`extrapolateLeft\`: How to handle values below inputRange ('clamp' or 'extend')
- \`extrapolateRight\`: How to handle values above inputRange ('clamp' or 'extend')

### Common Patterns:
- \`extrapolateRight: 'clamp'\`: Hold final value after animation ends
- Use for opacity, scale, position, color transitions`
  },

  // ==================== SPRING PHYSICS ====================
  {
    id: "spring",
    name: "Spring Physics",
    keywords: ["spring", "bounce", "physics", "bouncy", "elastic", "damping", "stiffness", "natural"],
    description: "Physics-based spring animations for natural motion",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const MyAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Basic spring (default config)
  const basic = spring({ frame, fps });

  // Spring with damping (smooth, no bounce)
  const smooth = spring({
    frame,
    fps,
    config: { damping: 200 }
  });

  // Bouncy spring
  const bouncy = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80 }
  });

  // With delay
  const delayed = spring({
    frame,
    fps,
    delay: 20,
    durationInFrames: 40
  });

  // Staggered spring (for lists/bars)
  const progress = spring({
    frame: frame - i * 5 - 10,  // i = index, 5 = stagger, 10 = offset
    fps,
    config: { damping: 18, stiffness: 80 }
  });

  return <div style={{ transform: \`scale(\${basic})\` }} />;
};`,
    guidanceRules: `## spring() Function
Creates physics-based animations that transition from 0 to 1.

### Parameters:
- \`frame\`: Current frame (from useCurrentFrame())
- \`fps\`: Frames per second (from useVideoConfig())
- \`config\`: { mass, damping, stiffness }
- \`delay\`: Frames to wait before starting
- \`durationInFrames\`: Force specific duration
- \`overshootClamping\`: Prevent overshoot

### Config Options (from Remotion Skills):
- \`damping\`: Lower = more oscillation. Default: 10
- \`stiffness\`: Higher = faster. Default: 100
- \`mass\`: Higher = slower/heavier. Default: 1

### Recommended Configs (from Remotion Skills):
- No bounce: \`{ damping: 200 }\`
- Subtle: \`{ damping: 18, stiffness: 80 }\`
- Bouncy: \`{ damping: 10, stiffness: 200 }\`
- Snappy: \`{ damping: 15, stiffness: 300 }\`

### Stagger Pattern:
\`\`\`tsx
// For each item i in a list:
const progress = spring({
  frame: frame - i * staggerFrames - offsetFrames,
  fps,
  config: { damping: 18, stiffness: 80 }
});
\`\`\``
  },

  // ==================== SEQUENCE ====================
  {
    id: "sequence",
    name: "Sequence Component",
    keywords: ["sequence", "delay", "timeline", "sync", "series", "stagger", "order"],
    description: "Control timing with Sequence and Series components",
    codeTemplate: `import { Sequence, Series, useCurrentFrame } from 'remotion';

const { fps } = useVideoConfig();

// Basic Sequence - delay an element
<Sequence from={0} durationInFrames={60}>
  <Title />
</Sequence>

<Sequence from={60} durationInFrames={60}>
  <BodyContent />
</Sequence>

// Sequence with premountFor (recommended!)
<Sequence from={1 * fps} premountFor={1 * fps}>
  <HeavyComponent />
</Sequence>

// Series - auto-plays sequences one after another
<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>

// Overlapping sequences with offset
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    {/* Starts 15 frames before SceneA ends */}
    <SceneB />
  </Series.Sequence>
</Series>

// Nested sequences
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} layout="none">
    <Title />
  </Sequence>
  <Sequence from={45} layout="none">
    <Subtitle />
  </Sequence>
</Sequence>`,
    guidanceRules: `## Sequence Component
Delays the appearance of an element.

### Props:
- \`from\`: Starting frame number
- \`durationInFrames\`: How long to display (optional)
- \`premountFor\`: Preload frames before visible (recommended: fps)
- \`layout\`: "none" to prevent absolute positioning wrapper

### Local Frame:
Inside a Sequence, useCurrentFrame() returns local frame (0-based), not global.

## Series Component
Automatically plays sequences one after another.

### Usage:
No manual frame calculations needed - just define durations.

### Overlap:
Use \`offset={-n}\` to overlap with previous sequence.

## Key Tips:
- Always use \`premountFor\` for smooth playback
- Use \`layout="none"\` for cleaner DOM
- Prefer Series for sequential content`
  },

  // ==================== TRANSITIONS ====================
  {
    id: "transitions",
    name: "Scene Transitions",
    keywords: ["transition", "fade", "wipe", "slide", "flip", "scene change", "effect"],
    description: "Professional scene transitions using @remotion/transitions",
    codeTemplate: `import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade, wipe, slide, flip, clockWipe } from '@remotion/transitions/fade';

const MyVideo = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={60}>
      <Scene1 />
    </TransitionSeries.Sequence>
    
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: 15 })}
    />
    
    <TransitionSeries.Sequence durationInFrames={60}>
      <Scene2 />
    </TransitionSeries.Sequence>
    
    <TransitionSeries.Transition
      presentation={slide({ direction: 'from-left' })}
      timing={springTiming({ config: { damping: 200 } })}
    />
    
    <TransitionSeries.Sequence durationInFrames={60}>
      <Scene3 />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

// Available transitions: fade, wipe, slide, flip, clockWipe
// Timing: linearTiming or springTiming`,
    guidanceRules: `## TransitionSeries Component
Fullscreen scene transitions from @remotion/transitions.

### Installation:
\`\`\`bash
npx remotion add @remotion/transitions
\`\`\`

### Available Transitions:
- \`fade()\`: Cross-dissolve
- \`wipe({ direction })\`: Directional wipe
- \`slide({ direction })\`: Slide in from direction
- \`flip()\`: 3D flip
- \`clockWipe()\`: Clock-style reveal

### Timing Functions:
- \`linearTiming\`: Constant speed
  \`\`\`tsx
  linearTiming({ durationInFrames: 20 })
  \`\`\`
- \`springTiming\`: Organic motion
  \`\`\`tsx
  springTiming({ config: { damping: 200 }, durationInFrames: 25 })
  \`\`\`

### Duration Note:
Transitions overlap scenes, so total duration is less than sum of sequences.`
  },

  // ==================== BAR CHART ====================
  {
    id: "bar-chart",
    name: "Bar Chart Animation",
    keywords: ["chart", "bar", "graph", "data", "visualization", "statistics", "growth", "animated chart"],
    description: "Animated bar chart with staggered spring animations (from Remotion Skills)",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

const BarChartAnimation = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();

  const data = [
    { month: 'Jan', price: 2039 },
    { month: 'Mar', price: 2160 },
    { month: 'May', price: 2327 },
    { month: 'Jul', price: 2426 },
    { month: 'Sep', price: 2634 },
    { month: 'Nov', price: 2672 },
  ];

  const minPrice = 2000;
  const maxPrice = 2800;
  const priceRange = maxPrice - minPrice;
  const chartHeight = height - 280;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e', padding: 60 }}>
      <h1 style={{ color: 'white', fontSize: 48 }}>Gold Price 2024</h1>
      
      <div style={{ display: 'flex', flex: 1, gap: 20 }}>
        {/* Y-Axis */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {[2800, 2400, 2000].map(val => (
            <span key={val} style={{ color: '#888' }}>\${val}</span>
          ))}
        </div>
        
        {/* Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, gap: 30 }}>
          {data.map((item, i) => {
            // Staggered spring animation (key pattern from Remotion Skills!)
            const progress = spring({
              frame: frame - i * 5 - 10,  // i*5 = stagger, -10 = offset
              fps,
              config: { damping: 18, stiffness: 80 }
            });

            const barHeight = ((item.price - minPrice) / priceRange) * chartHeight * progress;

            return (
              <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 60,
                    height: barHeight,
                    backgroundColor: '#4ade80',
                    borderRadius: '4px 4px 0 0',
                    opacity: progress
                  }}
                />
                <span style={{ color: '#888', marginTop: 10 }}>{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};`,
    guidanceRules: `## Bar Chart Animation (from Remotion Skills)

### Key Pattern - Staggered Spring:
\`\`\`tsx
const progress = spring({
  frame: frame - i * staggerFrames - offsetFrames,
  fps,
  config: { damping: 18, stiffness: 80 }
});
\`\`\`

### Explanation:
- \`i * 5\`: Each bar starts 5 frames after the previous
- \`-10\`: Global offset delays start
- Spring returns 0 for negative frames (handles delay)
- \`progress\` goes from 0 to 1

### Components:
- YAxis: Vertical axis with value labels
- XAxis: Horizontal axis with category labels
- Bar: Individual animated bar using progress

### Best Practices:
- Use consistent stagger intervals (5-10 frames)
- Configure spring for subtle motion (damping: 18, stiffness: 80)
- Animate both height and opacity`
  },

  // ==================== TYPEWRITER ====================
  {
    id: "typewriter",
    name: "Typewriter Animation",
    keywords: ["typewriter", "typing", "text reveal", "cursor", "character", "blink"],
    description: "Character-by-character text reveal with blinking cursor (from Remotion Skills)",
    codeTemplate: `import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

const FULL_TEXT = "Welcome to the future of video creation";
const CHAR_FRAMES = 4;  // Frames per character
const PAUSE_AFTER = "future";  // Pause after this word
const PAUSE_SECONDS = 1;
const CURSOR_BLINK_FRAMES = 30;

const getTypedText = (frame) => {
  const pauseIndex = FULL_TEXT.indexOf(PAUSE_AFTER);
  const preLen = pauseIndex + PAUSE_AFTER.length;
  const pauseFrames = PAUSE_SECONDS * 30;  // Assuming 30fps

  let typedChars;
  if (frame < preLen * CHAR_FRAMES) {
    typedChars = Math.floor(frame / CHAR_FRAMES);
  } else if (frame < preLen * CHAR_FRAMES + pauseFrames) {
    typedChars = preLen;
  } else {
    const postPhase = frame - preLen * CHAR_FRAMES - pauseFrames;
    typedChars = preLen + Math.floor(postPhase / CHAR_FRAMES);
  }

  return FULL_TEXT.slice(0, typedChars);
};

const Cursor = ({ frame, blinkFrames = CURSOR_BLINK_FRAMES }) => {
  const opacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <span
      style={{
        display: 'inline-block',
        width: 2,
        height: '1.2em',
        backgroundColor: 'white',
        marginLeft: 2,
        verticalAlign: 'text-bottom',
        opacity
      }}
    />
  );
};

const TypewriterAnimation = () => {
  const frame = useCurrentFrame();
  const typedText = getTypedText(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <span style={{ color: 'white', fontSize: 64, fontFamily: 'monospace' }}>
        {typedText}
        <Cursor frame={frame} />
      </span>
    </AbsoluteFill>
  );
};`,
    guidanceRules: `## Typewriter Animation (from Remotion Skills)

### getTypedText Function:
Calculates displayed text based on frame number.

### Phases:
1. Typing before pause: \`Math.floor(frame / charFrames)\`
2. Pausing: Fixed at pause position
3. Typing after pause: Add pre-pause length

### Cursor Blinking (key pattern!):
\`\`\`tsx
const opacity = interpolate(
  frame % blinkFrames,
  [0, blinkFrames / 2, blinkFrames],
  [1, 0, 1],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
\`\`\`
This creates: fade in -> fade out -> repeat

### Parameters:
- \`CHAR_FRAMES\`: Frames per character (typically 3-5)
- \`PAUSE_SECONDS\`: How long to pause (typically 0.5-2)
- \`CURSOR_BLINK_FRAMES\`: Cursor blink cycle (typically 20-40)`
  },

  // ==================== WORD HIGHLIGHT ====================
  {
    id: "word-highlight",
    name: "Word Highlight Animation",
    keywords: ["highlight", "word", "wipe", "emphasis", "text effect", "kinetic"],
    description: "Highlight a word with spring-animated wipe effect (from Remotion Skills)",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

const WordHighlight = ({ text, highlightWord }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');
  const highlightIndex = words.indexOf(highlightWord);
  const delayPerWord = 8;

  return (
    <div style={{ fontSize: 48, color: 'white' }}>
      {words.map((word, i) => {
        const isHighlight = i === highlightIndex;
        
        if (isHighlight) {
          // Spring animation for highlight
          const progress = spring({
            frame: frame - i * delayPerWord,
            fps,
            config: { damping: 18, stiffness: 80 }
          });

          return (
            <span key={i} style={{ position: 'relative', margin: '0 8px' }}>
              <span style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                height: '100%', 
                width: \`\${progress * 100}%\`,
                backgroundColor: '#fbbf24',
                borderRadius: 4,
                zIndex: -1
              }} />
              {word}
            </span>
          );
        }

        // Other words fade in
        const opacity = interpolate(
          frame - i * delayPerWord,
          [0, 15],
          [0, 1],
          { extrapolateRight: 'clamp' }
        );

        return (
          <span key={i} style={{ margin: '0 8px', opacity }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

const WordHighlightAnimation = () => (
  <AbsoluteFill style={{ backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
    <WordHighlight 
      text="This is an amazing product that will change everything"
      highlightWord="amazing"
    />
  </AbsoluteFill>
);`,
    guidanceRules: `## Word Highlight Animation (from Remotion Skills)

### Key Pattern:
Use spring() to animate a highlight bar that wipes across the word.

### Technique:
1. Calculate progress using spring() with stagger
2. Position an absolutely-sized highlight behind the word
3. Animate the width from 0% to 100%

### Stagger Formula:
\`\`\`tsx
const progress = spring({
  frame: frame - wordIndex * delayPerWord,
  fps,
  config: { damping: 18, stiffness: 80 }
});
\`\`\``
  },

  // ==================== TYPOGRAPHY ====================
  {
    id: "typography",
    name: "Typography & Kinetic Text",
    keywords: ["text", "typography", "title", "subtitle", "font", "word", "letter", "kinetic"],
    description: "Kinetic typography and text animations",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

// Slide-up text reveal
const SlideUpText = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  const opacity = interpolate(progress, [0, 0.5], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [50, 0]);

  return (
    <span style={{ 
      opacity, 
      transform: \`translateY(\${translateY}px)\`,
      display: 'inline-block'
    }}>
      {text}
    </span>
  );
};

// Scale-in title
const ScaleInTitle = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12 }
  });

  return (
    <h1 style={{ 
      fontSize: 80, 
      fontWeight: 'bold',
      transform: \`scale(\${scale})\`,
      opacity: scale
    }}>
      {text}
    </h1>
  );
};

// Letter-by-letter stagger
const LetterStagger = ({ text }) => {
  const frame = useCurrentFrame();
  const letters = text.split('');
  const staggerDelay = 3;

  return (
    <span>
      {letters.map((letter, i) => {
        const progress = spring({
          frame: frame - i * staggerDelay,
          fps: 30,
          config: { damping: 20 }
        });
        
        return (
          <span 
            key={i}
            style={{ 
              opacity: progress,
              transform: \`translateY(\${(1 - progress) * 20}px)\`,
              display: 'inline-block'
            }}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
};`,
    guidanceRules: `## Typography Animation Patterns

### Slide-Up Reveal:
- opacity: 0 → 1
- translateY: 50 → 0
- Use spring for natural motion

### Scale-In:
- scale: 0.5 → 1
- Often combined with opacity
- Good for titles

### Letter/Word Stagger:
- Each letter has delay: \`i * staggerDelay\`
- Use spring for bouncy reveal
- Common: 2-5 frames per letter

### Text Animation Tips:
- Use appropriate font sizes (title: 64-80px, body: 24-32px)
- Consider line height for multi-line text
- Add text-shadow for depth`
  },

  // ==================== LOOPS ====================
  {
    id: "loops",
    name: "Looping Animations",
    keywords: ["loop", "repeat", "infinite", "continuous", "cycle", "ambient", "background"],
    description: "Seamless looping animations",
    codeTemplate: `import { useCurrentFrame, interpolate } from 'remotion';

// Seamless loop using modulo
const LoopingRotation = ({ speed = 2 }) => {
  const frame = useCurrentFrame();
  const rotation = (frame * speed) % 360;
  return <div style={{ transform: \`rotate(\${rotation}deg)\` }} />;
};

// Ping-pong loop (back and forth)
const PingPongScale = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.8, 1.2]
  );
  return <div style={{ transform: \`scale(\${scale})\` }} />;
};

// Gradient color cycle
const CyclingGradient = () => {
  const frame = useCurrentFrame();
  const hue = (frame * 0.5) % 360;
  return (
    <div style={{ 
      background: \`linear-gradient(\${hue}deg, hsl(\${hue}, 70%, 50%), hsl(\${hue + 60}, 70%, 50%))\`
    }} />
  );
};

// Continuous float
const FloatingElement = ({ amplitude = 10, speed = 1 }) => {
  const frame = useCurrentFrame();
  const offset = Math.sin(frame * 0.05 * speed) * amplitude;
  return <div style={{ transform: \`translateY(\${offset}px)\` }} />;
};`,
    guidanceRules: `## Looping Patterns

### Modulo Loop:
\`\`\`tsx
const loopFrame = frame % duration;
\`\`\`
Simple repetition of fixed duration.

### Ping-Pong (Back and Forth):
\`\`\`tsx
const value = interpolate(
  Math.sin(frame * speed),
  [-1, 1],
  [min, max]
);
\`\`\`
Smooth oscillation between two values.

### Tips:
- Start and end at same position for seamless loops
- Use even duration divisions
- Test at least 2 cycles
- Consider audio sync`
  },

  // ==================== SOCIAL MEDIA ====================
  {
    id: "social-media",
    name: "Social Media Formats",
    keywords: ["social", "tiktok", "reels", "youtube", "instagram", "vertical", "short", "story"],
    description: "Video formats for social media platforms",
    codeTemplate: `// Platform dimensions (from Remotion Skills)
const PLATFORMS = {
  // TikTok, Reels, Shorts (9:16)
  vertical: { width: 1080, height: 1920 },
  
  // YouTube (16:9)
  horizontal: { width: 1920, height: 1080 },
  
  // Instagram Feed (1:1)
  square: { width: 1080, height: 1080 },
  
  // LinkedIn (4:5)
  portrait: { width: 1080, height: 1350 },
};

// Safe zones (from Remotion Skills)
const SAFE_ZONES = {
  tiktok: { top: 250, bottom: 450, sides: 20 },
  youtube: { right: 400, bottom: 60 },
  instagram: { padding: 40 }
};

// Device frame for product demo
const DeviceFrame = ({ type = 'phone', children }) => {
  const dims = type === 'phone' 
    ? { w: 375, h: 812, r: 40 }
    : { w: 1440, h: 900, r: 20 };
    
  return (
    <div style={{
      width: dims.w,
      height: dims.h,
      borderRadius: dims.r,
      border: '12px solid #333',
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      {children}
    </div>
  );
};`,
    guidanceRules: `## Social Media Formats (from Remotion Skills)

### Dimensions:
- TikTok/Reels/Shorts: 1080x1920 (9:16)
- YouTube: 1920x1080 (16:9)
- Instagram Feed: 1080x1080 (1:1)
- LinkedIn: 1080x1350 (4:5)

### Safe Zones:
- TikTok: Bottom 450px for UI, top 250px
- YouTube: Right 400px for timestamps
- Keep important content centered

### Best Practices:
- Hook in first 2 seconds
- Design for sound-off viewing
- Include captions
- End screens for CTAs`
  },

  // ==================== CTA ====================
  {
    id: "cta",
    name: "Call to Action",
    keywords: ["cta", "button", "call to action", "subscribe", "click", "link", "get started", "sign up"],
    description: "Call-to-action buttons and end screens",
    codeTemplate: `import { spring, useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

// Animated CTA Button
const CTAButton = ({ text = "Get Started", onClick }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulse animation
  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 }
  });

  // Shadow grows with scale
  const shadowOpacity = interpolate(scale, [1, 1.05], [0.2, 0.4]);
  const shadowBlur = interpolate(scale, [1, 1.05], [10, 25]);

  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 48px',
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        transform: \`scale(\${scale})\`,
        boxShadow: \`0 \${shadowBlur}px 20px rgba(59, 130, 246, \${shadowOpacity})\`,
        transition: 'transform 0.1s'
      }}
    >
      {text}
    </button>
  );
};

// End screen with multiple CTAs
const EndScreen = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: 'white', fontSize: 64, marginBottom: 40 }}>Thanks for watching!</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <CTAButton text="Get Started" />
        <CTAButton text="Learn More" style={{ backgroundColor: 'transparent', border: '2px solid white' }} />
      </div>
      <div style={{ marginTop: 40, color: '#888' }}>
        follow@username
      </div>
    </AbsoluteFill>
  );
};`,
    guidanceRules: `## Call-to-Action Design

### Button Animation:
- Subtle scale pulse to draw attention
- Shadow/glow effects
- Hover states

### End Screen Elements:
- Main CTA (most prominent)
- Secondary option
- Social handles/links
- QR code for mobile

### Best Practices:
- High contrast with background
- Clear action verb
- Multiple options for different users`
  }
];

// ==================== HELPER FUNCTIONS ====================

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
  
  // Default to core animation if nothing detected
  if (detectedSkills.length === 0) {
    detectedSkills.push("frame-driven", "spring");
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
// Generated by Kimu AI

import { 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate, 
  spring,
  Sequence,
  Series,
  AbsoluteFill,
  Img,
  Video,
  Audio,
  TransitionSeries
} from 'remotion';

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

// ==================== GUIDANCE FROM REMOTION SKILLS ====================

${guidance}
`;
}

// Export skill IDs for type checking
export type SkillId = typeof REMOTION_SKILLS[number]['id'];
