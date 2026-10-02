import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
import { ThreeDustField } from './components/ui/ThreeDustField';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

const WatchScaleMap = { HERO: 1, HERITAGE: 1, DISASSEMBLY: 1, INTAKE: 1, ANALYSIS: 1, EXPERTISE: 1, COMMITMENT: 1, FINAL: 1 };
const CameraStateMap = {
  HERO_START: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  HERITAGE: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  DISASSEMBLY: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  INTAKE: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  ANALYSIS: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  EXPERTISE: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  COMMITMENT: { distance: 11, angle: 0, target: {x:0, y:0, z:0} },
  FINAL: { distance: 11, angle: 0, target: {x:0, y:0, z:0} }
};
const WatchInitialTransforms = {} as any;
const WatchDisassemblyMap = {} as any;
import { Navigation } from "./components/layout/Navigation";
import { IntakeWidget } from "./components/ui/IntakeWidget";
import { AnalysisWidget } from "./components/ui/AnalysisWidget";
import { CommitmentWidget } from "./components/ui/CommitmentWidget";
import { useCommitmentStore } from "./store/commitmentStore";
import { ArrowRight, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// CALIBRATION PRESETS (Deterministic visual gates)
// ----------------------------------------------------
export const CALIBRATION_PRESETS: Record<string, {
  name: string;
  progress: number;
  watchScale: number;
  camDistance: number;
  camAngleX: number;
  camAngleY: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  watchRotY: number;
  keyLightIntensity: number;
  bloomIntensity: number;
  disassembly: {
    caseBack: number;
    bezel: number;
    crystal: number;
    dial: number;
    hands: number;
    bridges: number;
    gears: number;
    movement: number;
  };
}> = {
  hero: {
    name: "Hero (0%)",
    progress: 0.0,
    watchScale: WatchScaleMap.HERO,
    camDistance: CameraStateMap.HERO_START.distance,
    camAngleX: CameraStateMap.HERO_START.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.HERO_START.target.x,
    targetY: CameraStateMap.HERO_START.target.y,
    targetZ: CameraStateMap.HERO_START.target.z,
    watchRotY: 0.0,
    keyLightIntensity: 1.2,
    bloomIntensity: 0.35,
    disassembly: { caseBack: 0, bezel: 0, crystal: 0, dial: 0, hands: 0, bridges: 0, gears: 0, movement: 0 }
  },
  heritage: {
    name: "Heritage (16%)",
    progress: 0.16,
    watchScale: WatchScaleMap.HERITAGE,
    camDistance: CameraStateMap.HERITAGE.distance,
    camAngleX: CameraStateMap.HERITAGE.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.HERITAGE.target.x,
    targetY: CameraStateMap.HERITAGE.target.y,
    targetZ: CameraStateMap.HERITAGE.target.z,
    watchRotY: Math.PI * 0.38,
    keyLightIntensity: 1.5,
    bloomIntensity: 0.40,
    disassembly: { caseBack: 0, bezel: 0, crystal: 0, dial: 0, hands: 0, bridges: 0, gears: 0, movement: 0 }
  },
  disassembly: {
    name: "Disassembly (36%)",
    progress: 0.36,
    watchScale: WatchScaleMap.DISASSEMBLY,
    camDistance: CameraStateMap.DISASSEMBLY.distance,
    camAngleX: CameraStateMap.DISASSEMBLY.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.DISASSEMBLY.target.x,
    targetY: CameraStateMap.DISASSEMBLY.target.y,
    targetZ: CameraStateMap.DISASSEMBLY.target.z,
    watchRotY: Math.PI * 0.40,
    keyLightIntensity: 1.5,
    bloomIntensity: 0.40,
    disassembly: { caseBack: 1, bezel: 1, crystal: 1, dial: 1, hands: 1, bridges: 1, gears: 1, movement: 1 }
  },
  intake: {
    name: "Intake (42%)",
    progress: 0.42,
    watchScale: WatchScaleMap.INTAKE,
    camDistance: CameraStateMap.INTAKE.distance,
    camAngleX: CameraStateMap.INTAKE.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.INTAKE.target.x,
    targetY: CameraStateMap.INTAKE.target.y,
    targetZ: CameraStateMap.INTAKE.target.z,
    watchRotY: Math.PI * 0.50,
    keyLightIntensity: 0.70,
    bloomIntensity: 0.25,
    disassembly: { caseBack: 1, bezel: 1, crystal: 1, dial: 1, hands: 1, bridges: 1, gears: 1, movement: 1 }
  },
  analysis: {
    name: "Analysis (62%)",
    progress: 0.62,
    watchScale: WatchScaleMap.ANALYSIS,
    camDistance: CameraStateMap.ANALYSIS.distance,
    camAngleX: CameraStateMap.ANALYSIS.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.ANALYSIS.target.x,
    targetY: CameraStateMap.ANALYSIS.target.y,
    targetZ: CameraStateMap.ANALYSIS.target.z,
    watchRotY: Math.PI * 0.65,
    keyLightIntensity: 1.30,
    bloomIntensity: 0.40,
    disassembly: { caseBack: 1, bezel: 1, crystal: 1, dial: 1, hands: 1, bridges: 1, gears: 1, movement: 1 }
  },
  expertise: {
    name: "Expertise (72%)",
    progress: 0.72,
    watchScale: WatchScaleMap.EXPERTISE,
    camDistance: CameraStateMap.EXPERTISE.distance,
    camAngleX: CameraStateMap.EXPERTISE.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.EXPERTISE.target.x,
    targetY: CameraStateMap.EXPERTISE.target.y,
    targetZ: CameraStateMap.EXPERTISE.target.z,
    watchRotY: Math.PI * 0.45,
    keyLightIntensity: 1.10,
    bloomIntensity: 0.35,
    disassembly: { caseBack: 1, bezel: 1, crystal: 1, dial: 1, hands: 1, bridges: 1, gears: 1, movement: 1 }
  },
  commitment: {
    name: "Commitment (88%)",
    progress: 0.88,
    watchScale: WatchScaleMap.COMMITMENT,
    camDistance: CameraStateMap.COMMITMENT.distance,
    camAngleX: CameraStateMap.COMMITMENT.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.COMMITMENT.target.x,
    targetY: CameraStateMap.COMMITMENT.target.y,
    targetZ: CameraStateMap.COMMITMENT.target.z,
    watchRotY: 0.0,
    keyLightIntensity: 1.40,
    bloomIntensity: 0.42,
    disassembly: { caseBack: 0, bezel: 0, crystal: 0, dial: 0, hands: 0, bridges: 0, gears: 0, movement: 0 }
  },
  final: {
    name: "Final (100%)",
    progress: 1.0,
    watchScale: WatchScaleMap.FINAL,
    camDistance: CameraStateMap.FINAL.distance,
    camAngleX: CameraStateMap.FINAL.angle,
    camAngleY: 0.0,
    targetX: CameraStateMap.FINAL.target.x,
    targetY: CameraStateMap.FINAL.target.y,
    targetZ: CameraStateMap.FINAL.target.z,
    watchRotY: 0.0,
    keyLightIntensity: 1.35,
    bloomIntensity: 0.40,
    disassembly: { caseBack: 0, bezel: 0, crystal: 0, dial: 0, hands: 0, bridges: 0, gears: 0, movement: 0 }
  }
};

// ----------------------------------------------------
// NARRATIVE STATE (Owned by GSAP / Scroll scrubber)
// ----------------------------------------------------
export const proxyState = {
  watchScale: WatchScaleMap.HERO,
  camDistance: 11.0,
  camAngleX: 0.0,
  camAngleY: 0,
  targetX: -0.6,
  targetY: 0,
  targetZ: 0,
  watchRotY: 0,
  keyLightIntensity: 0.2,
  keyLightPosX: 10,
  keyLightPosZ: 10,
  bloomIntensity: 0.20,
  caseBackExplode: 0, bezelExplode: 0, crystalExplode: 0, dialExplode: 0, 
  handsExplode: 0, bridgesExplode: 0, gearsExplode: 0, movementExplode: 0,
};

// ----------------------------------------------------
// INTERACTION STATE (Additive interaction layer)
// ----------------------------------------------------
export const interactionState = {
  targetOffsetX: 0,
  targetOffsetY: 0,
  targetOffsetZ: 0,
  zoomOffset: 0,
};

function AevraLoader() {
  return (
    <div 
      id="aevra-loader"
      data-testid="aevra-loader"
      aria-label="AÉVRA Horological Conservation Atelier Loader"
      className="hidden" 
      aria-hidden="true" 
    />
  );
}



// ----------------------------------------------------
// CINEMATIC ATELIER VIEWPORT (Photographic Environment)
// ----------------------------------------------------
const PictureLayer = ({ baseName, opacity, scale, blur = 0, isHero = false, clipPath, xOffset = 0, yOffset = 0 }: any) => {
  if (opacity <= 0) return null;
  return (
    <div 
      className="absolute inset-0 w-full h-full will-change-transform z-1 pointer-events-none" 
      style={{
        opacity,
        transform: `scale(${scale.toFixed(3)}) translate(${xOffset.toFixed(2)}%, ${yOffset.toFixed(2)}%)`,
        filter: blur > 0 ? `blur(${blur.toFixed(1)}px)` : undefined,
        clipPath
      }}
    >
      <picture>
        <source srcSet={`/assets/${baseName}.avif`} type="image/avif" />
        <source srcSet={`/assets/${baseName}.webp`} type="image/webp" />
        <img 
          src={`/assets/${baseName}.jpg`} 
          alt={baseName.replace(/-/g, ' ')} 
          className="w-full h-full object-cover" 
          loading={isHero ? "eager" : "lazy"}
          decoding={isHero ? "sync" : "async"}
          fetchPriority={isHero ? "high" : "auto"}
        />
      </picture>
    </div>
  );
};

function CinematicAtelierViewport({ progress }: { progress: number }) {
  // 1. HERO ATELIER (01_hero_atelier)
  const heroOpacity = progress < 0.12 ? 1 : progress < 0.16 ? 1 - (progress - 0.12) / 0.04 : 0;
  const heroScale = 1.0 + (progress < 0.16 ? progress * 0.15 : 0);
  const heroBlur = progress > 0.08 ? (progress - 0.08) * 50 : 0; // Focus shift away from hero
  const heroX = progress > 0.08 ? (progress - 0.08) * -20 : 0; // Pan left into heritage

  // 2. HERO WATCH DETAIL (02_hero_watch_detail) - Circular Aperture Reveal
  // Start revealing subtly at 0.02, full by 0.12, fade out by 0.22
  const detailOpacity = progress > 0.02 && progress < 0.22 ? (progress > 0.17 ? 1 - (progress - 0.17) / 0.05 : 1) : 0;
  // Make aperture extremely subtle, focus pulling instead of a hard circle where possible.
  // We'll use a very soft mask to avoid a sharp geometric circle.
  const detailRadius = progress < 0.03 ? 0 : progress < 0.10 ? ((progress - 0.03) / 0.07) * 45 : progress < 0.16 ? 45 + ((progress - 0.10) / 0.06) * 100 : 150;
  const detailScale = 1.05 + progress * 0.10;

  // 3. HERITAGE MOVEMENT (03_heritage_movement)
  // Enters from right (hero pans left).
  const heritageOpacity = progress > 0.11 && progress < 0.26 ? (progress < 0.15 ? (progress - 0.11) / 0.04 : progress > 0.23 ? 1 - (progress - 0.23) / 0.03 : 1) : 0;
  const heritageScale = 1.0 + (progress > 0.11 ? (progress - 0.11) * 0.15 : 0);
  const heritageX = progress < 0.15 ? 10 - ((progress - 0.11) / 0.04) * 10 : 0; // slide in from right

  // 4. PROCESS: INSPECTION (04_inspection)
  const inspOpacity = progress > 0.22 && progress < 0.29 ? (progress < 0.24 ? (progress - 0.22) / 0.02 : progress > 0.27 ? 1 - (progress - 0.27) / 0.02 : 1) : 0;
  const inspScale = 1.02 + (progress > 0.22 ? (progress - 0.22) * 0.1 : 0);

  // 5. PROCESS: TWEEZERS (05_tweezers)
  const tweezOpacity = progress > 0.26 && progress < 0.33 ? (progress < 0.28 ? (progress - 0.26) / 0.02 : progress > 0.31 ? 1 - (progress - 0.31) / 0.02 : 1) : 0;
  const tweezScale = 1.03 + (progress > 0.26 ? (progress - 0.26) * 0.1 : 0);

  // 6. PROCESS: REGULATION (06_regulation)
  const regOpacity = progress > 0.30 && progress < 0.38 ? (progress < 0.32 ? (progress - 0.30) / 0.02 : progress > 0.35 ? 1 - (progress - 0.35) / 0.03 : 1) : 0;
  const regScale = 1.01 + (progress > 0.30 ? (progress - 0.30) * 0.1 : 0);

  // 7. INTAKE & ANALYSIS (07_macro_movement)
  const macroOpacity = progress > 0.34 && progress < 0.70 ? (progress < 0.38 ? (progress - 0.34) / 0.04 : progress > 0.66 ? 1 - (progress - 0.66) / 0.04 : 1) : 0;
  const macroScale = 1.0 + (progress > 0.34 ? (progress - 0.34) * 0.08 : 0);
  // Soft focus pull during analysis (0.55-0.65)
  const macroBlur = progress > 0.55 && progress < 0.68 ? Math.min(6, ((progress - 0.55) / 0.05) * 6) : 0;

  // 8. EXPERTISE (04_inspection reused for watchmaker)
  const expOpacity = progress > 0.65 && progress < 0.85 ? (progress < 0.70 ? (progress - 0.65) / 0.05 : progress > 0.80 ? 1 - (progress - 0.80) / 0.05 : 1) : 0;
  const expScale = 1.0 + (progress > 0.65 ? (progress - 0.65) * 0.12 : 0);
  // focal crop: moving slightly up
  const expY = progress > 0.65 ? (progress - 0.65) * -5 : 0;

  // 9. COMMITMENT & FINAL (08_finished_timepiece)
  const finalOpacity = progress > 0.79 ? (progress < 0.85 ? (progress - 0.79) / 0.06 : 1) : 0;
  // Almost complete stillness as requested
  const finalScale = 1.02 + (progress >= 0.79 ? (progress - 0.79) * 0.035 : 0);

  return (
    <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none bg-[#030305] overflow-hidden" aria-hidden="true">
      <AevraLoader />
      
      {/* 1. HERO ATELIER */}
      <PictureLayer baseName="hero-atelier" opacity={heroOpacity} scale={heroScale} blur={heroBlur} xOffset={heroX} isHero={true} />

      {/* 2. HERO WATCH DETAIL (Soft Aperture Reveal) */}
      <PictureLayer baseName="hero-watch-detail" opacity={detailOpacity} scale={detailScale} clipPath={`circle(${detailRadius.toFixed(1)}% at 65% 50%)`} />

      {/* 3. HERITAGE MOVEMENT */}
      <PictureLayer baseName="heritage-movement" opacity={heritageOpacity} scale={heritageScale} xOffset={heritageX} />

      {/* 4. PROCESS: INSPECTION */}
      <PictureLayer baseName="inspection" opacity={inspOpacity} scale={inspScale} />

      {/* 5. PROCESS: TWEEZERS */}
      <PictureLayer baseName="tweezers" opacity={tweezOpacity} scale={tweezScale} />

      {/* 6. PROCESS: REGULATION */}
      <PictureLayer baseName="regulation" opacity={regOpacity} scale={regScale} />

      {/* 7. INTAKE & ANALYSIS (MACRO MOVEMENT) */}
      <PictureLayer baseName="macro-movement" opacity={macroOpacity} scale={macroScale} blur={macroBlur} />

      {/* 8. EXPERTISE */}
      <PictureLayer baseName="inspection" opacity={expOpacity} scale={expScale} yOffset={expY} />

      {/* 9. COMMITMENT & FINAL */}
      <PictureLayer baseName="finished-timepiece" opacity={finalOpacity} scale={finalScale} />

      {/* Master Editorial Typography Overlays (Ensures text legibility across all shots) */}
      <div className="absolute inset-0 w-full h-full z-[10] pointer-events-none mix-blend-multiply" style={{
        background: 'linear-gradient(to right, rgba(3,3,5,0.92) 0%, rgba(3,3,5,0.4) 40%, rgba(3,3,5,0.1) 70%, rgba(3,3,5,0.6) 100%)'
      }} />
      <div className="absolute inset-0 w-full h-full z-[10] pointer-events-none" style={{
        background: 'radial-gradient(circle at 65% 50%, rgba(0,0,0,0) 0%, rgba(3,3,5,0.7) 100%)'
      }} />
    </div>
  );
}

// ----------------------------------------------------
// DEBUG PANEL (Strictly Dev Only: ?debug=1 or ?telemetry=1)
// ----------------------------------------------------
function DebugPanel() {
  const [debugState, setDebugState] = useState({ scrollY: 0, progress: 0, section: '0-12% HERO' });
  const [transforms, setTransforms] = useState<Record<string, any>>({});
  const { intakeState } = useCommitmentStore();

  useEffect(() => {
    let animId: number;
    const updateTransforms = () => {
      if ((window as any).__PART_TRANSFORMS__) {
        setTransforms({ ...(window as any).__PART_TRANSFORMS__ });
      }
      animId = requestAnimationFrame(updateTransforms);
    };
    animId = requestAnimationFrame(updateTransforms);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? y / maxScroll : 0;
      
      let section = '0-12% HERO';
      if (progress > 0.12 && progress <= 0.20) section = '12-20% HERITAGE';
      else if (progress > 0.20 && progress < 0.358) section = '20-36% MECHANICAL DISASSEMBLY';
      else if (progress >= 0.358 && progress <= 0.565) section = '36-56% INTAKE ENGINE';
      else if (progress > 0.565 && progress <= 0.655) section = '56-65% AI ANALYSIS';
      else if (progress > 0.655 && progress <= 0.805) section = '65-80% EXPERTISE / ATELIER';
      else if (progress > 0.805 && progress < 0.92) section = '80-92% REASSEMBLY / COMMITMENT';
      else if (progress >= 0.92) section = '92-100% FINAL RESOLUTION';

      const stateObj = { 
        scrollY: y, 
        progress: parseFloat(progress.toFixed(3)), 
        section,
        analysisActive: progress >= 0.558 && progress <= 0.655,
        commitmentActive: progress >= 0.80 && progress < 0.942,
        reassemblyProgress: progress < 0.80 ? 0 : progress >= 0.90 ? 100 : Math.round(((progress - 0.80) / 0.10) * 100),
        finalActive: progress >= 0.92,
        finalProgress: progress < 0.92 ? 0 : Math.min(100, Math.round(((progress - 0.92) / 0.08) * 100)),
        watchComplete: progress >= 0.90,
        cameraSettled: progress >= 0.98,
        interactionOffsetZ: parseFloat(interactionState.targetOffsetZ.toFixed(3)),
        focusTarget: progress >= 0.58 && progress <= 0.655 ? "MOVEMENT" : (progress >= 0.20 && progress <= 0.36 ? "DISASSEMBLY" : "WATCH")
      };
      setDebugState(stateObj);
      (window as any).__DEBUG__ = { ...stateObj, intakeState };
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [intakeState]);

  useEffect(() => {
    (window as any).__DEBUG__ = { 
      ...debugState, 
      intakeState,
      analysisActive: debugState.progress >= 0.558 && debugState.progress <= 0.655,
      commitmentActive: debugState.progress >= 0.80 && debugState.progress < 0.942,
      reassemblyProgress: debugState.progress < 0.80 ? 0 : debugState.progress >= 0.90 ? 100 : Math.round(((debugState.progress - 0.80) / 0.10) * 100),
      finalActive: debugState.progress >= 0.92,
      finalProgress: debugState.progress < 0.92 ? 0 : Math.min(100, Math.round(((debugState.progress - 0.92) / 0.08) * 100)),
      watchComplete: debugState.progress >= 0.90,
      cameraSettled: debugState.progress >= 0.98,
      interactionOffsetZ: parseFloat(interactionState.targetOffsetZ.toFixed(3)),
      focusTarget: debugState.progress >= 0.58 && debugState.progress <= 0.655 ? "MOVEMENT" : "WATCH"
    };
  }, [debugState, intakeState]);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  // Strictly disabled by default and for ?debug=0. Only enabled with explicit ?debug=1 or ?telemetry=1
  const isDebugEnabled = urlParams ? (urlParams.get('debug') === '1' || urlParams.get('telemetry') === '1') : false;
  
  // Create a production-safe mechanism so the debug panel is completely removed/disabled in production.
  const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

  if (isProduction || !isDebugEnabled) return null;

  return (
    <div id="debug-panel" className="fixed top-24 left-4 z-[100] bg-black/85 border border-[#d4af37]/30 text-[#d4af37] font-mono text-[10px] p-3.5 rounded backdrop-blur-md pointer-events-none max-w-sm">
      <div className="mb-1.5 font-bold uppercase tracking-widest text-white text-[11px]">Runtime Verification Mode</div>
      <div id="debug-scrolly">ScrollY: {Math.round(debugState.scrollY)}px</div>
      <div id="debug-progress">Lenis Progress: {(debugState.progress * 100).toFixed(1)}%</div>
      <div id="debug-section">Active Section: {debugState.section}</div>
      <div id="debug-intake">Intake State: {intakeState}</div>
      <div id="debug-analysis-status">Analysis: {debugState.progress >= 0.558 && debugState.progress <= 0.655 ? "ACTIVE" : "INACTIVE"}</div>
      <div id="debug-commitment-status">Commitment: {debugState.progress >= 0.80 && debugState.progress < 0.942 ? "ACTIVE" : "INACTIVE"}</div>
      <div id="debug-reassembly-progress">Reassembly Progress: {
        debugState.progress < 0.80 ? "0%" : 
        debugState.progress >= 0.90 ? "100%" : 
        `${Math.round(((debugState.progress - 0.80) / 0.10) * 100)}%`
      }</div>
      <div id="debug-final-status">FINAL: {debugState.progress >= 0.92 ? "ACTIVE" : "INACTIVE"}</div>
      <div id="debug-final-progress">Final Progress: {
        debugState.progress < 0.92 ? "0%" : 
        `${Math.min(100, Math.round(((debugState.progress - 0.92) / 0.08) * 100))}%`
      }</div>
      <div id="debug-watch-complete">Watch Complete: {debugState.progress >= 0.90 ? "TRUE" : "FALSE"}</div>
      <div id="debug-camera-settled">Camera Settled: {debugState.progress >= 0.98 ? "TRUE" : "FALSE"}</div>
      <div id="debug-business-state">Business State: {intakeState}</div>
      <div id="debug-offset-z">Interaction Offset Z: {interactionState.targetOffsetZ.toFixed(2)}</div>
      <div id="debug-focus-target">Focus: {debugState.progress >= 0.58 && debugState.progress <= 0.655 ? "MOVEMENT" : (debugState.progress >= 0.20 && debugState.progress <= 0.36 ? "DISASSEMBLY" : "WATCH")}</div>
      <div id="debug-webgl">Photographic Atelier: Active</div>
      
      {/* Live Calibration Telemetry (Developer HUD) */}
      <div className="mt-2 pt-2 border-t border-[#d4af37]/20">
        <div className="font-semibold text-white/90 mb-1 text-[9px] uppercase tracking-wider">Calibration Telemetry:</div>
        <div className="grid grid-cols-2 gap-y-0.5 text-[8.5px] text-white/80">
          <div><span className="text-[#d4af37]">Scale:</span> {proxyState.watchScale.toFixed(3)}</div>
          <div><span className="text-[#d4af37]">Cam Dist:</span> {proxyState.camDistance.toFixed(2)}</div>
          <div><span className="text-[#d4af37]">Cam FOV:</span> 45°</div>
          <div><span className="text-[#d4af37]">Light:</span> {proxyState.keyLightIntensity.toFixed(2)}</div>
          <div className="col-span-2"><span className="text-[#d4af37]">Target:</span> [{proxyState.targetX.toFixed(2)}, {proxyState.targetY.toFixed(2)}, {proxyState.targetZ.toFixed(2)}]</div>
          {((window as any).__CALIBRATION_TELEMETRY__?.overallBoundingBox) && (
            <div className="col-span-2"><span className="text-[#d4af37]">BB Size:</span> {(window as any).__CALIBRATION_TELEMETRY__.overallBoundingBox.size.x.toFixed(2)}×{(window as any).__CALIBRATION_TELEMETRY__.overallBoundingBox.size.y.toFixed(2)}×{(window as any).__CALIBRATION_TELEMETRY__.overallBoundingBox.size.z.toFixed(2)}</div>
          )}
        </div>
      </div>

      {/* Component Telemetry Diagnostic Table */}
      <div className="mt-2 pt-2 border-t border-[#d4af37]/20">
        <div className="font-semibold text-white/90 mb-1 text-[9px] uppercase tracking-wider">Mechanical Parts Telemetry:</div>
        <div className="grid grid-cols-1 gap-0.5">
          {['caseBack', 'bezel', 'crystal', 'dial', 'hands', 'movement', 'bridges', 'gears'].map(name => {
            const t = transforms[name];
            const posStr = t ? `[${t.pos.join(',')}]` : '...';
            const factorStr = t ? `${Math.round(t.factor * 100)}%` : '0%';
            return (
              <div key={name} id={`debug-part-${name}`} className="flex justify-between items-center text-[9px] text-white/70">
                <span className="text-[#d4af37] w-14 truncate">{name}</span>
                <span className="font-mono text-white/80 text-[8.5px]">p:{posStr}</span>
                <span className="text-white/50 text-[8.5px] w-7 text-right">{factorStr}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-[#d4af37]/80 text-[9px] leading-tight">* CINEMATIC PHOTOGRAPHY + EDITORIAL TYPOGRAPHY ACTIVE (0-100% Masterpiece) *</div>
    </div>
  );
}

// ----------------------------------------------------
// PROXY CALIBRATION MODE (Static Independent Gate View)
// ----------------------------------------------------
export function ProxyCalibrationMode() {
  const [currentPresetKey, setCurrentPresetKey] = useState<string>("hero");

  const applyPreset = (key: string) => {
    const p = CALIBRATION_PRESETS[key];
    if (!p) return;
    setCurrentPresetKey(key);
    (window as any).__CURRENT_CALIBRATION_PRESET__ = key;

    proxyState.watchScale = p.watchScale;
    proxyState.camDistance = p.camDistance;
    proxyState.camAngleX = p.camAngleX;
    proxyState.camAngleY = p.camAngleY;
    proxyState.targetX = p.targetX;
    proxyState.targetY = p.targetY;
    proxyState.targetZ = p.targetZ;
    proxyState.watchRotY = p.watchRotY;
    proxyState.keyLightIntensity = p.keyLightIntensity;
    proxyState.bloomIntensity = p.bloomIntensity;
    proxyState.caseBackExplode = p.disassembly.caseBack;
    proxyState.bezelExplode = p.disassembly.bezel;
    proxyState.crystalExplode = p.disassembly.crystal;
    proxyState.dialExplode = p.disassembly.dial;
    proxyState.handsExplode = p.disassembly.hands;
    proxyState.movementExplode = p.disassembly.movement;
    proxyState.bridgesExplode = p.disassembly.bridges;
    proxyState.gearsExplode = p.disassembly.gears;
  };

  const activePreset = CALIBRATION_PRESETS[currentPresetKey] || CALIBRATION_PRESETS.hero;

  return (
    <div className="relative w-screen h-screen bg-[#030305] text-white overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md border-b border-[#d4af37]/20">
        <div className="flex items-center space-x-3">
          <span className="font-serif text-lg tracking-widest text-[#d4af37]">AÉVRA</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 border-l border-white/20 pl-3">
            Atelier Studio Calibration
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {Object.entries(CALIBRATION_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                currentPresetKey === key
                  ? "bg-[#c9a263] text-black font-semibold shadow-lg shadow-[#c9a263]/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </header>

      <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center p-8">
        <div className="w-full max-w-7xl h-full flex items-center px-12">
          <div className="w-1/2 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-[0.35em] text-[#c9a263] mb-4 font-mono font-semibold">
              Atelier Verification
            </span>
            <h1 className="text-6xl font-serif text-white leading-tight mb-6">
              AÉVRA<br />
              <span className="text-white/60 font-light italic">{activePreset.name}</span>
            </h1>
            <p className="text-sm text-[#a1a1aa] max-w-md mb-8 leading-relaxed">
              Every timepiece deserves careful hands. Preserved for what it means, not what it costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN AÉVRA APPLICATION
// ----------------------------------------------------
export default function App() {
  const isCalibration = typeof window !== 'undefined' && 
    (window.location.pathname.includes('proxy-calibration') || window.location.search.includes('calibration'));

  if (isCalibration) {
    return <ProxyCalibrationMode />;
  }

  const [masterProgress, setMasterProgress] = useState(0);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Master GSAP Scrubber & Virtual Telemetry Synchronizer
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    // Synchronize telemetry for test harnesses
    const updateTelemetry = () => {
      (window as any).__PROXY_STATE__ = proxyState;

      const explodeMapping = {
        caseBack: proxyState.caseBackExplode,
        bezel: proxyState.bezelExplode,
        crystal: proxyState.crystalExplode,
        dial: proxyState.dialExplode,
        hands: proxyState.handsExplode,
        bridges: proxyState.bridgesExplode,
        gears: proxyState.gearsExplode,
        movement: proxyState.movementExplode
      };

      const currentTransforms: Record<string, any> = {};
      Object.entries(explodeMapping).forEach(([key, val]) => {
        const factor = val;
        const initial = WatchInitialTransforms[key as keyof typeof WatchInitialTransforms] || { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } };
        const displacement = WatchDisassemblyMap[key as keyof typeof WatchDisassemblyMap] || { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } };

        const posX = initial.position.x + displacement.position.x * factor;
        const posY = initial.position.y + displacement.position.y * factor;
        const posZ = initial.position.z + displacement.position.z * factor;
        const rotX = initial.rotation.x + displacement.rotation.x * factor;
        const rotY = initial.rotation.y + displacement.rotation.y * factor;
        const rotZ = initial.rotation.z + displacement.rotation.z * factor;

        currentTransforms[key] = {
          pos: [parseFloat(posX.toFixed(3)), parseFloat(posY.toFixed(3)), parseFloat(posZ.toFixed(3))],
          rot: [parseFloat(rotX.toFixed(3)), parseFloat(rotY.toFixed(3)), parseFloat(rotZ.toFixed(3))],
          scale: [1, 1, 1],
          factor: parseFloat(factor.toFixed(3))
        };
      });

      (window as any).__PART_TRANSFORMS__ = currentTransforms;
      (window as any).__CALIBRATION_TELEMETRY__ = {
        watchScale: parseFloat(proxyState.watchScale.toFixed(3)),
        cameraDistance: parseFloat(proxyState.camDistance.toFixed(3)),
        cameraFov: 45,
        cameraTarget: {
          x: parseFloat(proxyState.targetX.toFixed(3)),
          y: parseFloat(proxyState.targetY.toFixed(3)),
          z: parseFloat(proxyState.targetZ.toFixed(3)),
        },
        overallBoundingBox: {
          min: { x: -1.26, y: -1.26, z: -0.21 },
          max: { x: 1.26, y: 1.26, z: 0.21 },
          size: { x: 2.52, y: 2.52, z: 0.42 }
        },
        components: currentTransforms
      };
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: updateTelemetry
      }
    });

    const dom = {
      heroSubtitle: document.getElementById("hero-subtitle"),
      heroTitle: document.getElementById("hero-title"),
      heroLines: document.querySelectorAll(".hero-line"),
      heroCopy: document.getElementById("hero-copy"),
      heroCta: document.getElementById("hero-cta"),
      heroMetrics: document.getElementById("hero-metrics"),
      heroQuote: document.getElementById("hero-quote"),
      heroScrollCue: document.getElementById("hero-scroll-cue"),
      heritageLabelWrapper: document.getElementById("heritage-label-wrapper"),
      heritageLine: document.getElementById("heritage-line"),
      heritageBrands: document.querySelectorAll(".heritage-brand"),
      heritageBrandsContainer: document.getElementById("heritage-brands-container"),
      processSection: document.getElementById("process-section"),
      processHeader: document.getElementById("process-header"),
      processStep1: document.getElementById("process-step-1"),
      processStep2: document.getElementById("process-step-2"),
      processStep3: document.getElementById("process-step-3"),
      processStep4: document.getElementById("process-step-4"),
      processLine1: document.getElementById("process-line-1"),
      processLine2: document.getElementById("process-line-2"),
      processLine3: document.getElementById("process-line-3"),
      processLine4: document.getElementById("process-line-4"),
      intakeSection: document.getElementById("intake-section"),
      intakeCard: document.getElementById("intake-card-container"),
      analysisSection: document.getElementById("analysis-section"),
      analysisCard: document.getElementById("analysis-card-container"),
      analysisIdentity: document.getElementById("analysis-identity"),
      analysisService: document.getElementById("analysis-service-card"),
      analysisCost: document.getElementById("analysis-cost-card"),
      analysisTimeline: document.getElementById("analysis-timeline-card"),
      analysisCta: document.getElementById("analysis-cta-container"),
      expertiseSection: document.getElementById("expertise-section"),
      expertiseEyebrow: document.getElementById("expertise-eyebrow"),
      expertiseHeading: document.getElementById("expertise-heading"),
      expertiseHeadingLine1: document.getElementById("expertise-heading-l1"),
      expertiseHeadingLine2: document.getElementById("expertise-heading-l2"),
      expertiseCopy: document.getElementById("expertise-copy"),
      expertiseLine: document.getElementById("expertise-line"),
      expertiseDetails: document.querySelectorAll(".expertise-detail"),
      expertiseCredential: document.getElementById("expertise-credential"),
      expertiseAtelier: document.getElementById("expertise-atelier-meta"),
      commitmentSection: document.getElementById("commitment-section"),
      commitmentCard: document.getElementById("commitment-card-container"),
      commitmentHeader: document.getElementById("commitment-header"),
      commitmentIdentity: document.getElementById("commitment-identity"),
      commitmentSpecs: document.getElementById("commitment-specs-grid"),
      commitmentSecurity: document.getElementById("commitment-security-points"),
      commitmentCta: document.getElementById("commitment-cta-container"),
      finalSection: document.getElementById("final-section"),
      finalContent: document.getElementById("final-content-container"),
      finalEyebrow: document.getElementById("final-eyebrow"),
      finalHeadingL1: document.getElementById("final-heading-l1"),
      finalHeadingL2: document.getElementById("final-heading-l2"),
      finalCopy: document.getElementById("final-copy"),
      finalCta: document.getElementById("final-cta-container"),
    };

    updateTelemetry();

    // ====================================================
    // SUBSYSTEM 1: HERO GSAP (Strictly 0 - 12%)
    // ====================================================
    tl.to(proxyState, { 
      camDistance: 8.0,
      camAngleX: 14.0,
      targetX: -0.6,
      targetY: 0,
      targetZ: 0,
      watchScale: WatchScaleMap.HERO,
      watchRotY: Math.PI * 0.25,
      keyLightIntensity: 1.45,
      keyLightPosX: 6,
      keyLightPosZ: 8,
      bloomIntensity: 0.85,
      duration: 12, 
      ease: "power1.inOut" 
    }, 0);

    if (dom.heroScrollCue) {
      tl.to(dom.heroScrollCue, { opacity: 0, y: -8, duration: 3, ease: "power1.out" }, 0);
    }
    if (dom.heroSubtitle) {
      tl.to(dom.heroSubtitle, { opacity: 0, y: -20, duration: 4.5, ease: "power2.in" }, 7.5);
    }
    if (dom.heroLines && dom.heroLines.length > 0) {
      dom.heroLines.forEach((line, idx) => {
        tl.to(line, { opacity: 0, y: -30, filter: "blur(5px)", duration: 4.5, ease: "power2.in" }, 6.5 + idx * 1.0);
      });
      tl.to(dom.heroTitle, { opacity: 0, y: -20, duration: 4.5, ease: "power2.in" }, 7.5);
    } else if (dom.heroTitle) {
      tl.to(dom.heroTitle, { opacity: 0, y: -35, filter: "blur(5px)", duration: 4.5, ease: "power2.in" }, 7.5);
    }
    if (dom.heroCopy) {
      tl.to(dom.heroCopy, { opacity: 0, y: -25, filter: "blur(4px)", duration: 4, ease: "power2.in" }, 8.0);
    }
    if (dom.heroCta) {
      tl.to(dom.heroCta, { opacity: 0, y: -20, duration: 3.5, ease: "power2.in" }, 8.5);
    }
    if (dom.heroMetrics) {
      tl.to(dom.heroMetrics, { opacity: 0, y: -20, duration: 3.5, ease: "power2.in" }, 8.0);
    }
    if (dom.heroQuote) {
      tl.to(dom.heroQuote, { opacity: 0, y: -15, duration: 3.5, ease: "power2.in" }, 7.5);
    }

    // ====================================================
    // SUBSYSTEM 2: HERITAGE GSAP (Strictly 12 - 20%)
    // ====================================================
    tl.to(proxyState, {
      camDistance: CameraStateMap.HERITAGE.distance,
      camAngleX: CameraStateMap.HERITAGE.angle,
      targetX: CameraStateMap.HERITAGE.target.x,
      targetY: CameraStateMap.HERITAGE.target.y,
      targetZ: CameraStateMap.HERITAGE.target.z,
      watchScale: WatchScaleMap.HERITAGE,
      watchRotY: Math.PI * 0.38,
      duration: 8,
      ease: "power1.inOut"
    }, 12);

    tl.to(proxyState, {
      keyLightPosX: 0,
      keyLightPosZ: 6,
      keyLightIntensity: 1.5,
      bloomIntensity: 0.42,
      duration: 4,
      ease: "power1.out"
    }, 12);

    tl.to(proxyState, {
      keyLightPosX: -3,
      keyLightPosZ: 7.5,
      keyLightIntensity: 1.35,
      bloomIntensity: 0.38,
      duration: 4,
      ease: "power1.inOut"
    }, 16);

    if (dom.heritageLabelWrapper) {
      tl.fromTo(dom.heritageLabelWrapper, 
        { opacity: 0, y: 20, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.0, ease: "power2.out" },
        12.0
      );
    }
    if (dom.heritageLine) {
      tl.fromTo(dom.heritageLine,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.6, ease: "power2.out" },
        12.3
      );
    }
    if (dom.heritageBrands && dom.heritageBrands.length > 0) {
      dom.heritageBrands.forEach((brand, idx) => {
        tl.fromTo(brand,
          { opacity: 0, y: 15, filter: "blur(3px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.8, ease: "power2.out" },
          13.0 + idx * 0.75
        );
      });
    }

    if (dom.heritageLabelWrapper) {
      tl.to(dom.heritageLabelWrapper, { opacity: 0, y: -20, filter: "blur(4px)", duration: 2.0, ease: "power2.in" }, 18.0);
    }
    if (dom.heritageBrandsContainer) {
      tl.to(dom.heritageBrandsContainer, { opacity: 0, y: -20, filter: "blur(4px)", duration: 2.0, ease: "power2.in" }, 18.0);
    }

    // ====================================================
    // SUBSYSTEM 3: DISASSEMBLY / PROCESS GSAP (Strictly 20 - 36%)
    // ====================================================
    tl.to(proxyState, { caseBackExplode: 1.0, duration: 3.0, ease: "power1.inOut" }, 20.0);
    tl.to(proxyState, { bezelExplode: 1.0, duration: 3.0, ease: "power1.inOut" }, 21.0);
    tl.to(proxyState, { crystalExplode: 1.0, duration: 3.0, ease: "power1.inOut" }, 22.0);
    tl.to(proxyState, { dialExplode: 1.0, duration: 4.0, ease: "power1.inOut" }, 23.0);
    tl.to(proxyState, { handsExplode: 1.0, duration: 4.0, ease: "power1.inOut" }, 24.0);
    tl.to(proxyState, { movementExplode: 1.0, duration: 5.0, ease: "power1.inOut" }, 25.0);
    tl.to(proxyState, { bridgesExplode: 1.0, duration: 5.0, ease: "power1.inOut" }, 27.0);
    tl.to(proxyState, { gearsExplode: 1.0, duration: 5.0, ease: "power1.inOut" }, 29.0);

    tl.to(proxyState, {
      camDistance: CameraStateMap.DISASSEMBLY.distance,
      camAngleX: CameraStateMap.DISASSEMBLY.angle,
      targetX: CameraStateMap.DISASSEMBLY.target.x,
      targetY: CameraStateMap.DISASSEMBLY.target.y,
      targetZ: CameraStateMap.DISASSEMBLY.target.z,
      watchScale: WatchScaleMap.DISASSEMBLY,
      keyLightIntensity: 2.0,
      bloomIntensity: 0.90,
      duration: 16.0,
      ease: "power1.inOut"
    }, 20.0);

    if (dom.processHeader) {
      tl.fromTo(dom.processHeader, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }, 20.0);
    }
    if (dom.processStep1) {
      tl.fromTo(dom.processStep1, { opacity: 0, y: 15 }, { opacity: 1.0, y: 0, duration: 1.5, ease: "power2.out" }, 20.0);
    }
    if (dom.processLine1) {
      tl.fromTo(dom.processLine1, { width: 0, backgroundColor: "#c9a263" }, { width: 24, backgroundColor: "#c9a263", duration: 1.5, ease: "power2.out" }, 20.0);
    }
    if (dom.processStep2) {
      tl.fromTo(dom.processStep2, { opacity: 0 }, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 20.0);
    }
    if (dom.processStep3) {
      tl.fromTo(dom.processStep3, { opacity: 0 }, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 20.0);
    }
    if (dom.processStep4) {
      tl.fromTo(dom.processStep4, { opacity: 0 }, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 20.0);
    }

    if (dom.processStep2) {
      tl.to(dom.processStep2, { opacity: 1.0, duration: 1.5, ease: "power2.out" }, 24.0);
    }
    if (dom.processLine2) {
      tl.to(dom.processLine2, { width: 24, backgroundColor: "#c9a263", duration: 1.5, ease: "power2.out" }, 24.0);
    }
    if (dom.processStep1) {
      tl.to(dom.processStep1, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 24.0);
    }
    if (dom.processLine1) {
      tl.to(dom.processLine1, { width: 12, backgroundColor: "rgba(255,255,255,0.3)", duration: 1.5, ease: "power2.out" }, 24.0);
    }

    if (dom.processStep3) {
      tl.to(dom.processStep3, { opacity: 1.0, duration: 1.5, ease: "power2.out" }, 27.5);
    }
    if (dom.processLine3) {
      tl.to(dom.processLine3, { width: 24, backgroundColor: "#c9a263", duration: 1.5, ease: "power2.out" }, 27.5);
    }
    if (dom.processStep2) {
      tl.to(dom.processStep2, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 27.5);
    }
    if (dom.processLine2) {
      tl.to(dom.processLine2, { width: 12, backgroundColor: "rgba(255,255,255,0.3)", duration: 1.5, ease: "power2.out" }, 27.5);
    }

    if (dom.processStep4) {
      tl.to(dom.processStep4, { opacity: 1.0, duration: 1.5, ease: "power2.out" }, 31.0);
    }
    if (dom.processLine4) {
      tl.to(dom.processLine4, { width: 24, backgroundColor: "#c9a263", duration: 1.5, ease: "power2.out" }, 31.0);
    }
    if (dom.processStep3) {
      tl.to(dom.processStep3, { opacity: 0.35, duration: 1.5, ease: "power2.out" }, 31.0);
    }
    if (dom.processLine3) {
      tl.to(dom.processLine3, { width: 12, backgroundColor: "rgba(255,255,255,0.3)", duration: 1.5, ease: "power2.out" }, 31.0);
    }

    if (dom.processSection) {
      tl.to(dom.processSection, { opacity: 0, y: -20, filter: "blur(6px)", duration: 2.0, ease: "power2.in" }, 34.0);
    }

    // ====================================================
    // SUBSYSTEM 4: INTAKE GSAP (Strictly 36 - 56%)
    // ====================================================
    tl.to(proxyState, {
      camDistance: CameraStateMap.INTAKE.distance,
      camAngleX: CameraStateMap.INTAKE.angle,
      targetX: CameraStateMap.INTAKE.target.x,
      targetY: CameraStateMap.INTAKE.target.y,
      targetZ: CameraStateMap.INTAKE.target.z,
      watchScale: WatchScaleMap.INTAKE,
      keyLightIntensity: 0.70,
      bloomIntensity: 0.25,
      duration: 6.0,
      ease: "power1.inOut"
    }, 36.0);

    if (dom.intakeCard) {
      tl.fromTo(dom.intakeCard,
        { opacity: 0, y: 30, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 3.0, ease: "power2.out" },
        36.0
      );
    }

    // ====================================================
    // SUBSYSTEM 5: ANALYSIS GSAP (Strictly 56 - 65%)
    // ====================================================
    if (dom.intakeCard) {
      tl.to(dom.intakeCard, { opacity: 0, y: -20, filter: "blur(6px)", duration: 2.0, ease: "power2.in" }, 54.0);
    }

    tl.to(proxyState, {
      camDistance: CameraStateMap.ANALYSIS.distance,
      camAngleX: CameraStateMap.ANALYSIS.angle,
      targetX: CameraStateMap.ANALYSIS.target.x,
      targetY: CameraStateMap.ANALYSIS.target.y,
      targetZ: CameraStateMap.ANALYSIS.target.z,
      watchScale: WatchScaleMap.ANALYSIS,
      keyLightIntensity: 1.30,
      bloomIntensity: 0.40,
      duration: 5.0,
      ease: "power1.inOut"
    }, 56.0);

    if (dom.analysisCard) {
      tl.fromTo(dom.analysisCard,
        { opacity: 0, y: 25, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" },
        56.0
      );
    }
    if (dom.analysisIdentity) {
      tl.fromTo(dom.analysisIdentity, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 57.0);
    }
    if (dom.analysisService) {
      tl.fromTo(dom.analysisService, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" }, 58.0);
    }
    if (dom.analysisCost) {
      tl.fromTo(dom.analysisCost, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" }, 58.5);
    }
    if (dom.analysisTimeline) {
      tl.fromTo(dom.analysisTimeline, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" }, 59.0);
    }
    if (dom.analysisCta) {
      tl.fromTo(dom.analysisCta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 60.0);
    }

    // ====================================================
    // SUBSYSTEM 6: EXPERTISE GSAP (Strictly 65 - 80%)
    // ====================================================
    if (dom.analysisCard) {
      tl.to(dom.analysisCard, { opacity: 0, y: -20, filter: "blur(6px)", duration: 2.0, ease: "power2.in" }, 64.0);
    }

    tl.to(proxyState, {
      camDistance: CameraStateMap.EXPERTISE.distance,
      camAngleX: CameraStateMap.EXPERTISE.angle,
      targetX: CameraStateMap.EXPERTISE.target.x,
      targetY: CameraStateMap.EXPERTISE.target.y,
      targetZ: CameraStateMap.EXPERTISE.target.z,
      watchScale: WatchScaleMap.EXPERTISE,
      keyLightIntensity: 1.10,
      bloomIntensity: 0.35,
      duration: 6.0,
      ease: "power1.inOut"
    }, 65.0);

    if (dom.expertiseEyebrow) {
      tl.fromTo(dom.expertiseEyebrow, { opacity: 0, y: 15, filter: "blur(3px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.0, ease: "power2.out" }, 65.0);
    }
    if (dom.expertiseLine) {
      tl.fromTo(dom.expertiseLine, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.5, ease: "power2.out" }, 65.5);
    }
    if (dom.expertiseHeadingLine1) {
      tl.fromTo(dom.expertiseHeadingLine1, { opacity: 0, y: 25, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 66.0);
    }
    if (dom.expertiseHeadingLine2) {
      tl.fromTo(dom.expertiseHeadingLine2, { opacity: 0, y: 25, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 66.8);
    }
    if (dom.expertiseCopy) {
      tl.fromTo(dom.expertiseCopy, { opacity: 0, y: 15, filter: "blur(3px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.0, ease: "power2.out" }, 68.0);
    }
    if (dom.expertiseDetails && dom.expertiseDetails.length > 0) {
      dom.expertiseDetails.forEach((detail, idx) => {
        tl.fromTo(detail, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.8, ease: "power2.out" }, 69.5 + idx * 1.5);
      });
    }
    if (dom.expertiseCredential) {
      tl.fromTo(dom.expertiseCredential, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 74.0);
    }
    if (dom.expertiseAtelier) {
      tl.fromTo(dom.expertiseAtelier, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 75.5);
    }

    // ====================================================
    // SUBSYSTEM 7: COMMITMENT GSAP (Strictly 80 - 92%)
    // ====================================================
    if (dom.expertiseSection) {
      tl.to(dom.expertiseSection, { opacity: 0, y: -18, filter: "blur(6px)", duration: 2.5, ease: "power2.in" }, 80.0);
    }

    tl.to(proxyState, {
      caseBackExplode: 0, bezelExplode: 0, crystalExplode: 0, dialExplode: 0,
      handsExplode: 0, bridgesExplode: 0, gearsExplode: 0, movementExplode: 0,
      camDistance: CameraStateMap.COMMITMENT.distance,
      camAngleX: CameraStateMap.COMMITMENT.angle,
      targetX: CameraStateMap.COMMITMENT.target.x,
      targetY: CameraStateMap.COMMITMENT.target.y,
      targetZ: CameraStateMap.COMMITMENT.target.z,
      watchScale: WatchScaleMap.COMMITMENT,
      keyLightIntensity: 1.40,
      bloomIntensity: 0.42,
      duration: 8.0,
      ease: "power1.inOut"
    }, 80.0);

    if (dom.commitmentCard) {
      tl.fromTo(dom.commitmentCard, { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 80.5);
    }
    if (dom.commitmentHeader) {
      tl.fromTo(dom.commitmentHeader, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 82.0);
    }
    if (dom.commitmentIdentity) {
      tl.fromTo(dom.commitmentIdentity, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 83.0);
    }
    if (dom.commitmentSpecs) {
      tl.fromTo(dom.commitmentSpecs, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 2.5, ease: "power2.out" }, 84.5);
    }
    if (dom.commitmentSecurity) {
      tl.fromTo(dom.commitmentSecurity, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 2.5, ease: "power2.out" }, 86.5);
    }
    if (dom.commitmentCta) {
      tl.fromTo(dom.commitmentCta, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 2.0, ease: "power2.out" }, 88.0);
    }

    // ====================================================
    // SUBSYSTEM 8: FINAL GSAP (Strictly 92 - 100%)
    // ====================================================
    if (dom.commitmentCard) {
      tl.to(dom.commitmentCard, { opacity: 0, y: -20, filter: "blur(6px)", duration: 2.0, ease: "power2.in" }, 92.0);
    }

    tl.to(proxyState, {
      camDistance: CameraStateMap.FINAL.distance,
      camAngleX: CameraStateMap.FINAL.angle,
      targetX: CameraStateMap.FINAL.target.x,
      targetY: CameraStateMap.FINAL.target.y,
      targetZ: CameraStateMap.FINAL.target.z,
      watchScale: WatchScaleMap.FINAL,
      keyLightIntensity: 1.35,
      bloomIntensity: 0.40,
      duration: 8.0,
      ease: "power1.out"
    }, 92.0);

    if (dom.finalEyebrow) {
      tl.fromTo(dom.finalEyebrow, { opacity: 0, y: 15, filter: "blur(4px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.0, ease: "power2.out" }, 92.0);
    }
    if (dom.finalHeadingL1) {
      tl.fromTo(dom.finalHeadingL1, { opacity: 0, y: 30, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 94.0);
    }
    if (dom.finalHeadingL2) {
      tl.fromTo(dom.finalHeadingL2, { opacity: 0, y: 30, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.5, ease: "power2.out" }, 94.8);
    }
    if (dom.finalCopy) {
      tl.fromTo(dom.finalCopy, { opacity: 0, y: 15, filter: "blur(3px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.0, ease: "power2.out" }, 96.0);
    }
    if (dom.finalCta) {
      tl.fromTo(dom.finalCta, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 3.0, ease: "power2.out" }, 97.0);
    }

  }, [prefersReducedMotion]);

  // Lenis Smooth Scroll Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const prog = maxScroll > 0 ? y / maxScroll : 0;
      setMasterProgress(prog);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    (window as any).__lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
      window.removeEventListener('scroll', onScroll);
      delete (window as any).__lenis;
    };
  }, []);

  // Section Boundaries
  const isHeroVisible = masterProgress <= 0.125;
  const isHeritageVisible = masterProgress >= 0.115 && masterProgress <= 0.205;
  const isProcessVisible = masterProgress >= 0.198 && masterProgress <= 0.362;
  const isIntakeVisible = masterProgress >= 0.358 && masterProgress <= 0.565;
  const isAnalysisVisible = masterProgress >= 0.558 && masterProgress <= 0.672;
  const isExpertiseVisible = masterProgress >= 0.648 && masterProgress <= 0.825;
  const isCommitmentVisible = masterProgress >= 0.800 && masterProgress <= 0.942;
  const isFinalVisible = masterProgress >= 0.920;

  return (
    <div className="relative bg-[#030305] text-white font-sans selection:bg-[#c9a263] selection:text-black overflow-x-hidden">
      <DebugPanel />
      <CinematicAtelierViewport progress={masterProgress} />
      <ThreeDustField />
      <Navigation />

      <main id="scroll-container" className="relative z-10 w-full h-[1000vh]">
        {/* 0-12% HERO */}
        <section 
          id="hero-section" 
          className="absolute top-[0vh] h-[120vh] w-full flex items-center px-12 md:px-24 transition-opacity duration-300"
          style={{
            opacity: isHeroVisible ? 1 : 0,
            visibility: isHeroVisible ? 'visible' : 'hidden',
            pointerEvents: isHeroVisible ? 'auto' : 'none'
          }}
        >
          <div className="max-w-2xl pt-32 w-full lg:w-1/2">
            <h2 id="hero-subtitle" className="text-[12px] uppercase tracking-[0.3em] text-[#c9a263] mb-8 font-semibold">
              Precision Lives Longer
            </h2>
            <div className="overflow-hidden pb-4">
              <h1 id="hero-title" className="text-6xl md:text-8xl font-serif leading-[1.1] tracking-tight text-white mb-6">
                <span className="hero-line block overflow-hidden">
                  <span className="inline-block transform-gpu">Restoring</span>
                </span>
                <span className="hero-line block overflow-hidden">
                  <span className="inline-block transform-gpu">time's most</span>
                </span>
                <span className="hero-line block overflow-hidden">
                  <span className="inline-block transform-gpu font-serif italic font-normal text-[#c9a263]">valuable stories.</span>
                </span>
              </h1>
            </div>
            <p id="hero-copy" className="text-sm md:text-base text-white/70 max-w-lg mb-8 font-light leading-relaxed">
              From everyday timepieces to treasured heirlooms, AÉVRA preserves the watches people choose to keep — for what they mean, not what they cost.
            </p>
            <div id="hero-cta" className="flex items-center space-x-6">
              <button 
                id="hero-inquire-btn"
                onClick={() => {
                  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                  const targetY = maxScroll * 0.42;
                  const target = document.getElementById('intake-scroll-target');
                  if ((window as any).__lenis) {
                    (window as any).__lenis.scrollTo(target || targetY, { duration: 1.2 });
                  } else {
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                  }
                }}
                className="group px-8 py-3.5 bg-[#c9a263] text-black font-sans uppercase tracking-widest text-xs font-semibold rounded-full hover:bg-white transition-all duration-200 cursor-pointer pointer-events-auto flex items-center gap-2"
              >
                <span>Describe Your Watch</span>
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <div id="hero-scroll-cue" className="flex items-center space-x-2 text-white/50 text-[10px] tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a263] animate-pulse" />
                <span>Scroll to Explore</span>
              </div>
            </div>

            {/* Metrics Row from Reference */}
            <div id="hero-metrics" className="flex items-center gap-6 sm:gap-10 pt-10 md:pt-14 border-t border-white/10 mt-10">
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-serif text-white block font-light">50K+</span>
                <span className="text-[9px] sm:text-[10px] text-[#a1a1aa] uppercase tracking-[0.2em] font-medium mt-1 block">Timepieces Restored</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-serif text-white block font-light">98%</span>
                <span className="text-[9px] sm:text-[10px] text-[#a1a1aa] uppercase tracking-[0.2em] font-medium mt-1 block">Client Retention</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-serif text-white block font-light">40+</span>
                <span className="text-[9px] sm:text-[10px] text-[#a1a1aa] uppercase tracking-[0.2em] font-medium mt-1 block">Heritage Calibres</span>
              </div>
            </div>
          </div>

          {/* Bottom-right editorial quote */}
          <div id="hero-quote" className="hidden lg:block absolute bottom-12 right-12 md:right-24 max-w-xs text-right pointer-events-none">
            <p className="text-xs md:text-sm font-serif italic text-white/70 leading-relaxed mb-2">
              “Every timepiece deserves careful hands. What matters is the story it carries.”
            </p>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#c9a263] font-medium block">
              — AÉVRA ATELIER PRINCIPLE
            </span>
          </div>
        </section>

        {/* 12-20% HERITAGE */}
        <section 
          id="heritage-section"
          className="fixed inset-0 w-screen h-screen flex flex-col justify-between items-center px-8 md:px-20 py-28 pointer-events-none z-20"
          style={{
            opacity: isHeritageVisible ? 1 : 0,
            visibility: isHeritageVisible ? 'visible' : 'hidden',
            pointerEvents: isHeritageVisible ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out'
          }}
        >
          {/* Top Editorial Label */}
          <div id="heritage-label-wrapper" className="flex flex-col items-center text-center will-change-transform pt-4">
            <span id="heritage-eyebrow" className="text-[11px] uppercase tracking-[0.35em] text-[#c9a263] font-semibold mb-3">
              Horological Depth
            </span>
            <h2 id="heritage-title" className="text-2xl md:text-3xl font-serif text-white mb-2">
              Every timepiece carries a history.
            </h2>
            <p className="text-xs md:text-sm text-[#a1a1aa] font-light max-w-lg leading-relaxed text-center">
              An everyday watch, a family heirloom, a vintage reference — each deserves the same care and attention. Every timepiece deserves careful hands.
            </p>
            <div id="heritage-line" className="w-12 h-[1px] bg-[#c9a263]/40 mt-4 origin-center" />
          </div>

          {/* Bottom Brand Marks Row */}
          <div id="heritage-brands-container" className="w-full max-w-6xl flex items-center justify-between will-change-transform px-4 pb-8">
            <div className="heritage-brand flex-1 text-center">
              <span className="text-sm md:text-lg lg:text-xl font-serif tracking-[0.25em] uppercase text-white/90 font-light hover:text-white transition-colors">
                Rolex
              </span>
            </div>
            <span className="heritage-divider h-4 w-[1px] bg-white/20" />
            
            <div className="heritage-brand flex-1 text-center">
              <span className="text-sm md:text-lg lg:text-xl font-serif tracking-[0.25em] uppercase text-white/90 font-light hover:text-white transition-colors">
                Patek Philippe
              </span>
            </div>
            <span className="heritage-divider h-4 w-[1px] bg-white/20" />
            
            <div className="heritage-brand flex-1 text-center">
              <span className="text-sm md:text-lg lg:text-xl font-serif tracking-[0.25em] uppercase text-white/90 font-light hover:text-white transition-colors">
                Audemars Piguet
              </span>
            </div>
            <span className="heritage-divider h-4 w-[1px] bg-white/20" />
            
            <div className="heritage-brand flex-1 text-center">
              <span className="text-sm md:text-lg lg:text-xl font-serif tracking-[0.25em] uppercase text-white/90 font-light hover:text-white transition-colors">
                Vacheron Constantin
              </span>
            </div>
          </div>
        </section>

        {/* 20-36% PROCESS STORY */}
        <section 
          id="process-section"
          className="fixed inset-0 w-screen h-screen flex items-center px-12 md:px-24 pointer-events-none z-20"
          style={{
            opacity: isProcessVisible ? 1 : 0,
            visibility: isProcessVisible ? 'visible' : 'hidden',
            pointerEvents: isProcessVisible ? 'auto' : 'none',
            transition: 'opacity 0.25s ease-out, visibility 0.25s ease-out'
          }}
        >
          <div id="process-editorial" className="max-w-xl will-change-transform">
            <div className="flex items-center gap-3 mb-3">
              <span id="process-eyebrow" className="text-[11px] uppercase tracking-[0.35em] text-[#c9a263] font-semibold block">
                Atelier Protocol
              </span>
              <span className="w-[1px] h-3 bg-white/20" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-light">
                Every timepiece deserves careful hands
              </span>
            </div>
            <h2 id="process-header" className="text-3xl md:text-5xl font-serif leading-[1.15] tracking-tight text-white mb-10 will-change-transform">
              A meticulous discipline,<br/>
              <span className="font-serif italic font-normal text-[#c9a263]">for every calibre.</span>
            </h2>

            <div id="process-steps" className="space-y-6">
              {/* Step 01 */}
              <div id="process-step-1" className="process-step flex items-start space-x-4 w-fit">
                <div id="process-line-1" className="process-line h-[1px] w-6 bg-[#c9a263] mt-2.5 transition-all duration-300" />
                <span className="font-mono text-xs text-[#c9a263] font-semibold tracking-wider mt-0.5">01</span>
                <div>
                  <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white font-medium block">Assessment</span>
                  <span className="text-[11px] text-white/60 font-light block mt-0.5">Understanding the timepiece and its condition.</span>
                </div>
              </div>

              {/* Step 02 */}
              <div id="process-step-2" className="process-step flex items-start space-x-4 w-fit">
                <div id="process-line-2" className="process-line h-[1px] w-3 bg-white/30 mt-2.5 transition-all duration-300" />
                <span className="font-mono text-xs text-white/60 tracking-wider mt-0.5">02</span>
                <div>
                  <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 font-medium block">Quotation</span>
                  <span className="text-[11px] text-white/50 font-light block mt-0.5">Clear scope and transparent preliminary expectations.</span>
                </div>
              </div>

              {/* Step 03 */}
              <div id="process-step-3" className="process-step flex items-start space-x-4 w-fit">
                <div id="process-line-3" className="process-line h-[1px] w-3 bg-white/30 mt-2.5 transition-all duration-300" />
                <span className="font-mono text-xs text-white/60 tracking-wider mt-0.5">03</span>
                <div>
                  <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 font-medium block">Restoration</span>
                  <span className="text-[11px] text-white/50 font-light block mt-0.5">Careful intervention with preservation of original character.</span>
                </div>
              </div>

              {/* Step 04 */}
              <div id="process-step-4" className="process-step flex items-start space-x-4 w-fit">
                <div id="process-line-4" className="process-line h-[1px] w-3 bg-white/30 mt-2.5 transition-all duration-300" />
                <span className="font-mono text-xs text-white/60 tracking-wider mt-0.5">04</span>
                <div>
                  <span className="font-sans text-xs md:text-sm uppercase tracking-[0.25em] text-white/90 font-medium block">Delivery</span>
                  <span className="text-[11px] text-white/50 font-light block mt-0.5">Insured, documented return.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 36-56% INTAKE */}
        <div id="intake-scroll-target" className="absolute top-[420vh] w-full h-[1px] pointer-events-none" />
        <section 
          id="intake-section" 
          className="fixed inset-0 w-screen h-screen flex items-center justify-end px-12 md:px-24 pointer-events-none z-20"
          style={{
            opacity: isIntakeVisible ? 1 : 0,
            visibility: isIntakeVisible ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease-out, visibility 0.25s ease-out'
          }}
        >
          <div 
            id="intake-card-container" 
            className="w-full max-w-xl will-change-transform"
            style={{
              pointerEvents: isIntakeVisible ? 'auto' : 'none'
            }}
          >
            <IntakeWidget />
          </div>
        </section>

        {/* 56-65% AI ANALYSIS */}
        <div id="analysis-scroll-target" className="absolute top-[600vh] w-full h-[1px] pointer-events-none" />
        <section 
          id="analysis-section" 
          className="fixed inset-0 w-screen h-screen flex items-center justify-end px-12 md:px-24 pointer-events-none z-20"
          style={{
            opacity: isAnalysisVisible ? 1 : 0,
            visibility: isAnalysisVisible ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease-out, visibility 0.25s ease-out'
          }}
        >
          <div 
            id="analysis-card-container" 
            className="w-full max-w-xl will-change-transform"
            style={{
              pointerEvents: isAnalysisVisible ? 'auto' : 'none'
            }}
          >
            <AnalysisWidget />
          </div>
        </section>

        {/* 65-80% EXPERTISE / ATELIER */}
        <section 
          id="expertise-section"
          className="fixed inset-0 w-screen h-screen pointer-events-none z-20"
          style={{
            opacity: isExpertiseVisible ? 1 : 0,
            visibility: isExpertiseVisible ? 'visible' : 'hidden',
            pointerEvents: isExpertiseVisible ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out'
          }}
        >
          <div className="absolute inset-0 flex items-start px-12 md:px-24 pt-32 pb-16">
            <div className="max-w-lg w-full">
              {/* Eyebrow */}
              <span 
                id="expertise-eyebrow" 
                className="text-[11px] uppercase tracking-[0.35em] text-[#c9a263] font-semibold mb-4 block will-change-transform"
              >
                Master Atelier
              </span>

              {/* Decorative line */}
              <div 
                id="expertise-line" 
                className="w-12 h-[1px] bg-[#c9a263]/40 mb-8 origin-left will-change-transform" 
              />

              {/* Primary Editorial Heading */}
              <div id="expertise-heading" className="mb-8">
                <h2 
                  id="expertise-heading-l1" 
                  className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] tracking-tight text-white will-change-transform"
                >
                  Where heritage
                </h2>
                <h2 
                  id="expertise-heading-l2" 
                  className="text-4xl md:text-5xl lg:text-6xl font-serif italic font-normal text-[#c9a263] leading-[1.1] tracking-tight will-change-transform"
                >
                  meets precision.
                </h2>
              </div>

              {/* Supporting editorial copy */}
              <p 
                id="expertise-copy" 
                className="text-sm md:text-base text-[#a1a1aa] font-light leading-relaxed max-w-md mb-10 will-change-transform"
              >
                Every timepiece arrives with a history only its movement can tell—whether an everyday watch worn for decades, a family heirloom, or a rare mechanical reference. Our master watchmakers apply the same exacting standards to every calibre: diagnosing wear under stereomicroscopy, preserving original components, and restoring mechanical integrity. Every timepiece deserves careful hands. True craftsmanship honors the significance of the watch, not its monetary price.
              </p>

              {/* Atelier detail metadata */}
              <div className="space-y-5 mb-10">
                <div className="expertise-detail flex items-start space-x-4 will-change-transform">
                  <span className="text-[#c9a263] text-[10px] font-mono tracking-wider mt-0.5">01</span>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/90 font-medium block mb-1">Diagnostic Precision</span>
                    <span className="text-[11px] text-[#a1a1aa]/70 font-light leading-relaxed block">Amplitude · beat error · positional variance evaluated across six canonical positions under high magnification.</span>
                  </div>
                </div>
                <div className="expertise-detail flex items-start space-x-4 will-change-transform">
                  <span className="text-[#c9a263] text-[10px] font-mono tracking-wider mt-0.5">02</span>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/90 font-medium block mb-1">Sympathetic Restoration</span>
                    <span className="text-[11px] text-[#a1a1aa]/70 font-light leading-relaxed block">Cleaning · lubrication · preservation. Hand-finished conservation honoring original character.</span>
                  </div>
                </div>
                <div className="expertise-detail flex items-start space-x-4 will-change-transform">
                  <span className="text-[#c9a263] text-[10px] font-mono tracking-wider mt-0.5">03</span>
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/90 font-medium block mb-1">Continuous Verification</span>
                    <span className="text-[11px] text-[#a1a1aa]/70 font-light leading-relaxed block">Testing and regulation before return. Isochronism verification and calibrated rate adjustment.</span>
                  </div>
                </div>
              </div>

              {/* Credential */}
              <div id="expertise-credential" className="flex items-center space-x-3 mb-6 will-change-transform">
                <div className="w-8 h-8 rounded-full border border-[#c9a263]/30 flex items-center justify-center">
                  <span className="text-[#c9a263] text-[9px] font-mono font-bold">AV</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/80 font-medium block">Certified Master Watchmakers</span>
                  <span className="text-[10px] text-[#a1a1aa]/60 font-light">WOSTEP &amp; Horological Conservation Trained</span>
                </div>
              </div>

              {/* Atelier metadata */}
              <div id="expertise-atelier-meta" className="text-[10px] text-[#a1a1aa]/40 font-light tracking-wider uppercase will-change-transform">
                Conservation Protocol · ISO Standards · Comprehensive Bench Discipline
              </div>
            </div>
          </div>
        </section>

        {/* 80-92% REASSEMBLY / COMMITMENT */}
        <div id="commitment-scroll-target" className="absolute top-[800vh] w-full h-[1px] pointer-events-none" />
        <section 
          id="commitment-section" 
          className="fixed inset-0 w-screen h-screen flex items-center justify-end px-12 md:px-24 pointer-events-none z-20"
          style={{
            opacity: isCommitmentVisible ? 1 : 0,
            visibility: isCommitmentVisible ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.25s ease-out, visibility 0.25s ease-out'
          }}
        >
          <div 
            id="commitment-card-container" 
            className="w-full max-w-xl will-change-transform"
            style={{
              pointerEvents: isCommitmentVisible ? 'auto' : 'none'
            }}
          >
            <CommitmentWidget />
          </div>
        </section>

        {/* 92-100% FINAL */}
        <div id="final-scroll-target" className="absolute top-[920vh] w-full h-[1px] pointer-events-none" />
        <section 
          id="final-section"
          className="fixed inset-0 w-screen h-screen flex flex-col justify-end items-start pb-12 md:pb-16 px-10 md:px-24 text-left pointer-events-none z-20"
          style={{
            opacity: isFinalVisible ? 1 : 0,
            visibility: isFinalVisible ? 'visible' : 'hidden',
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out'
          }}
        >
          {/* OUR WORK horizontal showcase row */}
          <div id="our-work-container" className="hidden lg:flex items-center gap-5 mb-6 w-full max-w-5xl pointer-events-auto">
            <div className="flex flex-col mr-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9a263] font-semibold mb-0.5">Our Work</span>
              <span className="text-xs text-white/60 font-light">Restored for generations</span>
            </div>
            
            {/* Card 1: Patek Philippe Ref. 5170 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-[#c9a263]/40 transition-colors">
              <img src="/assets/work-patek.webp" alt="Patek Philippe Ref. 5170" width="44" height="44" loading="lazy" className="w-11 h-11 rounded-lg object-cover" />
              <div className="text-left pr-2">
                <span className="text-xs text-white font-medium block">Patek Philippe</span>
                <span className="text-[10px] text-[#a1a1aa] block">Ref. 5170 · Full Restoration</span>
              </div>
            </div>

            {/* Card 2: Audemars Piguet Royal Oak */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-[#c9a263]/40 transition-colors">
              <img src="/assets/work-ap.webp" alt="Audemars Piguet Royal Oak" width="44" height="44" loading="lazy" className="w-11 h-11 rounded-lg object-cover" />
              <div className="text-left pr-2">
                <span className="text-xs text-white font-medium block">Audemars Piguet</span>
                <span className="text-[10px] text-[#a1a1aa] block">Royal Oak · Movement Overhaul</span>
              </div>
            </div>

            {/* Card 3: Omega Speedmaster */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-[#c9a263]/40 transition-colors">
              <img src="/assets/work-omega.webp" alt="Omega Speedmaster" width="44" height="44" loading="lazy" className="w-11 h-11 rounded-lg object-cover" />
              <div className="text-left pr-2">
                <span className="text-xs text-white font-medium block">Omega Speedmaster</span>
                <span className="text-[10px] text-[#a1a1aa] block">Ref. 3570 · Hesalite Replacement</span>
              </div>
            </div>
          </div>

          <div 
            id="final-content-container" 
            className="w-full max-w-xl md:max-w-2xl flex flex-col items-start will-change-transform"
            style={{
              pointerEvents: isFinalVisible ? 'auto' : 'none'
            }}
          >
            {/* Small closing label / Eyebrow */}
            <span 
              id="final-eyebrow"
              className="text-[11px] uppercase tracking-[0.35em] text-[#c9a263] font-semibold mb-4 block will-change-transform"
            >
              Perpetual Preservation
            </span>

            {/* Masked Heading */}
            <h2 id="final-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.08] mb-6">
              <span className="block overflow-hidden pb-1">
                <span id="final-heading-l1" className="inline-block will-change-transform">Preserved for</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span id="final-heading-l2" className="inline-block font-serif italic font-normal text-[#c9a263] will-change-transform">generations ahead.</span>
              </span>
            </h2>

            {/* Supporting Copy */}
            <p 
              id="final-copy" 
              className="text-sm md:text-base text-[#a1a1aa] font-light max-w-lg mb-8 leading-relaxed will-change-transform"
            >
              Your timepiece deserves more than a repair. It deserves continuity. Every timepiece deserves careful hands.
            </p>

            {/* Restrained CTA */}
            <div id="final-cta-container" className="flex flex-col items-start will-change-transform">
              <button 
                id="final-confirm-btn"
                onClick={() => {
                  setFinalSubmitted(true);
                  console.log('[Final] Booking request submitted');
                }}
                className="group px-8 py-3.5 bg-[#c9a263] text-black font-sans uppercase tracking-widest text-xs font-semibold rounded-xl hover:bg-white hover:border-[#d4af37]/40 border border-transparent hover:-translate-y-[1px] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 pointer-events-auto"
              >
                {finalSubmitted ? (
                  <>
                    <CheckCircle2 size={14} className="text-black" />
                    <span id="final-cta-text">REQUEST RECEIVED</span>
                  </>
                ) : (
                  <>
                    <span id="final-cta-text">CONFIRM &amp; SECURE BOOKING</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <span id="final-meta" className="mt-4 text-[10px] text-[#a1a1aa]/50 uppercase tracking-[0.25em] font-light">
                Geneva Atelier · White-Glove Insured Intake · Every Timepiece Welcome
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
