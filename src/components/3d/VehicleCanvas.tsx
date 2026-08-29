import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VehicleConfiguration, VehicleModel } from '../../types/vehicle';
import { buildCarModel, CarMeshes } from './CarModelBuilder';
import { vehicleAudio } from '../../utils/audioSynth';
import {
  Rotate3d,
  Sun,
  Moon,
  Zap,
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Sparkles,
  Compass,
  Info,
} from 'lucide-react';

interface VehicleCanvasProps {
  model: VehicleModel;
  config: VehicleConfiguration;
  onUpdateConfig: (partial: Partial<VehicleConfiguration>) => void;
}

interface HotspotInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export const VehicleCanvas: React.FC<VehicleCanvasProps> = ({
  model,
  config,
  onUpdateConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    carMeshes: CarMeshes | null;
    environmentGroup: THREE.Group;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    isDragging: boolean;
    prevMouseX: number;
    prevMouseY: number;
    spherical: { radius: number; theta: number; phi: number };
    targetSpherical: { radius: number; theta: number; phi: number };
    animationFrameId: number;
  } | null>(null);

  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<HotspotInfo[]>([]);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Camera presets definition
  const getCameraTarget = useCallback(
    (preset: VehicleConfiguration['cameraAngle']) => {
      switch (preset) {
        case 'front':
          return { radius: 6.2, theta: 0, phi: Math.PI / 2.3, lookAt: new THREE.Vector3(0, 0.4, 0) };
        case 'side':
          return { radius: 6.8, theta: -Math.PI / 2, phi: Math.PI / 2.3, lookAt: new THREE.Vector3(0, 0.4, 0) };
        case 'rear':
          return { radius: 6.4, theta: Math.PI, phi: Math.PI / 2.4, lookAt: new THREE.Vector3(0, 0.4, 0) };
        case 'top':
          return { radius: 7.5, theta: 0.1, phi: 0.25, lookAt: new THREE.Vector3(0, 0.2, 0) };
        case 'wheel':
          return { radius: 3.4, theta: -Math.PI / 1.7, phi: Math.PI / 2.1, lookAt: new THREE.Vector3(-1.1, 0.35, 1.4) };
        case 'cockpit':
          return { radius: 2.2, theta: -Math.PI / 2.6, phi: Math.PI / 3.0, lookAt: new THREE.Vector3(0, 0.7, 0) };
        case 'hero':
        default:
          return { radius: 6.5, theta: -Math.PI / 4, phi: Math.PI / 2.4, lookAt: new THREE.Vector3(0, 0.4, 0) };
      }
    },
    []
  );

  // 1. Initialize Three.js Scene, Camera, Renderer & Studio Lights
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d11);
    scene.fog = new THREE.FogExp2(0x0c0d11, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initialSpherical = { radius: 6.5, theta: -Math.PI / 4, phi: Math.PI / 2.4 };
    
    // Position camera based on initial spherical coordinates
    camera.position.set(
      initialSpherical.radius * Math.sin(initialSpherical.phi) * Math.sin(initialSpherical.theta),
      initialSpherical.radius * Math.cos(initialSpherical.phi),
      initialSpherical.radius * Math.sin(initialSpherical.phi) * Math.cos(initialSpherical.theta)
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const environmentGroup = new THREE.Group();
    environmentGroup.name = 'StudioEnvironment';
    scene.add(environmentGroup);

    threeRef.current = {
      scene,
      camera,
      renderer,
      carMeshes: null,
      environmentGroup,
      targetCamPos: new THREE.Vector3(0, 0, 0),
      targetLookAt: new THREE.Vector3(0, 0.4, 0),
      currentLookAt: new THREE.Vector3(0, 0.4, 0),
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      spherical: { ...initialSpherical },
      targetSpherical: { ...initialSpherical },
      animationFrameId: 0,
    };

    // Resize Observer for smooth responsive canvas
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && threeRef.current) {
          threeRef.current.camera.aspect = newW / newH;
          threeRef.current.camera.updateProjectionMatrix();
          threeRef.current.renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animationFrameId);
        threeRef.current.renderer.dispose();
      }
    };
  }, []);

  // 2. Setup Studio Environment & Lighting Preset
  const updateStudioLighting = useCallback((preset: VehicleConfiguration['studioPreset']) => {
    if (!threeRef.current) return;
    const { scene, environmentGroup } = threeRef.current;

    // Clear previous lights & floor
    while (environmentGroup.children.length > 0) {
      const child = environmentGroup.children[0];
      environmentGroup.remove(child);
    }

    let bgColor = 0x0a0b0e;
    let floorColor = 0x111318;
    let gridColor = 0x222834;

    if (preset === 'pristine') {
      bgColor = 0x0f1117;
      floorColor = 0x181b22;
      gridColor = 0x2e3544;
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.028);

      // Key Soft Overhead Studio Box Light
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(4, 8, 4);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.bias = -0.0001;
      environmentGroup.add(keyLight);

      // Rim Light 1 (Rear Accent)
      const rimLight1 = new THREE.DirectionalLight(0xdbeafe, 2.2);
      rimLight1.position.set(-6, 4, -6);
      environmentGroup.add(rimLight1);

      // Warm Front Fill Light
      const fillLight = new THREE.DirectionalLight(0xfef3c7, 1.4);
      fillLight.position.set(-4, 3, 5);
      environmentGroup.add(fillLight);

      // Ambient Studio Fill
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
      environmentGroup.add(hemiLight);
    } else if (preset === 'cyberpunk') {
      bgColor = 0x050508;
      floorColor = 0x090a0f;
      gridColor = 0x0ea5e9;
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.035);

      // Cyan Neon Light Bar
      const cyanLight = new THREE.DirectionalLight(0x06b6d4, 3.5);
      cyanLight.position.set(6, 4, 3);
      environmentGroup.add(cyanLight);

      // Magenta Neon Light Bar
      const magentaLight = new THREE.DirectionalLight(0xec4899, 3.2);
      magentaLight.position.set(-6, 3, -3);
      environmentGroup.add(magentaLight);

      // Overhead cool key
      const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
      topLight.position.set(0, 8, 0);
      topLight.castShadow = true;
      environmentGroup.add(topLight);

      const hemi = new THREE.HemisphereLight(0x06b6d4, 0xec4899, 1.0);
      environmentGroup.add(hemi);
    } else if (preset === 'sunset') {
      bgColor = 0x120d0f;
      floorColor = 0x1a1215;
      gridColor = 0xf59e0b;
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.03);

      // Golden Hour Sun
      const sunLight = new THREE.DirectionalLight(0xf59e0b, 3.8);
      sunLight.position.set(7, 3.5, 6);
      sunLight.castShadow = true;
      environmentGroup.add(sunLight);

      // Deep Violet Fill
      const violetLight = new THREE.DirectionalLight(0x8b5cf6, 2.0);
      violetLight.position.set(-6, 4, -5);
      environmentGroup.add(violetLight);

      const hemi = new THREE.HemisphereLight(0xfde68a, 0x4c1d95, 1.2);
      environmentGroup.add(hemi);
    } else {
      // Stealth Mode
      bgColor = 0x050506;
      floorColor = 0x0a0a0c;
      gridColor = 0x1f2937;
      scene.background = new THREE.Color(bgColor);
      scene.fog = new THREE.FogExp2(bgColor, 0.045);

      // Single High-Contrast Overhead Spotlight
      const spotLight = new THREE.SpotLight(0xffffff, 4.5, 25, Math.PI / 4, 0.3, 1.2);
      spotLight.position.set(0, 9, 0);
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 2048;
      spotLight.shadow.mapSize.height = 2048;
      environmentGroup.add(spotLight);

      const subtleRim = new THREE.DirectionalLight(0x94a3b8, 0.8);
      subtleRim.position.set(0, 2, -7);
      environmentGroup.add(subtleRim);
    }

    // High-Gloss Floor Mesh with Subtle Grid
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(floorColor),
      roughness: 0.15,
      metalness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    environmentGroup.add(floorMesh);

    // Subtle Radial Floor Grid
    const gridHelper = new THREE.PolarGridHelper(16, 16, 8, 32, gridColor, gridColor);
    gridHelper.position.y = 0.005;
    environmentGroup.add(gridHelper);

    // Decorative Studio Ring Pedestal
    const ringGeo = new THREE.RingGeometry(2.8, 3.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(gridColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    environmentGroup.add(ringMesh);
  }, []);

  // Update studio lighting when preset changes
  useEffect(() => {
    updateStudioLighting(config.studioPreset);
  }, [config.studioPreset, updateStudioLighting]);

  // 3. Build & Rebuild Car Model on Configuration change
  useEffect(() => {
    if (!threeRef.current) return;
    const { scene } = threeRef.current;

    // Remove existing car
    if (threeRef.current.carMeshes) {
      scene.remove(threeRef.current.carMeshes.rootGroup);
    }

    // Build new car meshes
    const carMeshes = buildCarModel(model, config, scene);
    scene.add(carMeshes.rootGroup);
    threeRef.current.carMeshes = carMeshes;
  }, [
    model,
    config.colorId,
    config.finishType,
    config.wheelId,
    config.wheelFinishId,
    config.caliperColorId,
    config.aeroPackageId,
    config.roofId,
    config.interiorId,
    config.ambientLightColor,
    config.doorsOpen,
    config.headlightsOn,
    config.activeSpoilerDeployed,
    config.xRayMode,
  ]);

  // 4. Update Camera Target on preset angle change
  useEffect(() => {
    if (!threeRef.current) return;
    const target = getCameraTarget(config.cameraAngle);
    threeRef.current.targetSpherical = {
      radius: target.radius,
      theta: target.theta,
      phi: target.phi,
    };
    threeRef.current.targetLookAt.copy(target.lookAt);
  }, [config.cameraAngle, getCameraTarget]);

  // 5. Main Render Loop & Animation Frame
  useEffect(() => {
    if (!threeRef.current) return;

    let wheelRotation = 0;

    const renderLoop = () => {
      if (!threeRef.current) return;
      const {
        camera,
        renderer,
        scene,
        spherical,
        targetSpherical,
        currentLookAt,
        targetLookAt,
        carMeshes,
      } = threeRef.current;

      // Auto-rotation handling
      if (config.autoRotate && !threeRef.current.isDragging) {
        targetSpherical.theta += 0.005;
      }

      // Smooth camera interpolation
      spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;
      spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
      spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;

      // Clamp phi to prevent passing under the floor
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.05, spherical.phi));

      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

      currentLookAt.lerp(targetLookAt, 0.08);
      camera.lookAt(currentLookAt);

      // Animate active wheels rotation if auto rotating
      if (config.autoRotate && carMeshes) {
        wheelRotation -= 0.03;
        carMeshes.wheelGroups.forEach(wg => {
          wg.rotation.x = wheelRotation;
        });
      }

      // Render Scene
      renderer.render(scene, camera);

      // Project 3D Hotspot world coordinates to 2D screen positions
      if (carMeshes && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const project = (pos: THREE.Vector3) => {
          const v = pos.clone().project(camera);
          const x = (v.x * 0.5 + 0.5) * width;
          const y = (-(v.y * 0.5) + 0.5) * height;
          return { x, y, visible: v.z < 1 };
        };

        const aeroP = project(carMeshes.hotspotPositions.aeroWing);
        const brakeP = project(carMeshes.hotspotPositions.brakes);
        const powerP = project(carMeshes.hotspotPositions.powertrain);
        const cockpitP = project(carMeshes.hotspotPositions.cockpit);
        const chargeP = project(carMeshes.hotspotPositions.chargePort);

        setHotspots([
          {
            id: 'aero',
            title: 'Active Dynamics',
            subtitle: `${model.name} Aero Pack`,
            description: 'Electronically modulated dual-position carbon fiber aerodynamic wing generating high-speed downforce.',
            screenX: aeroP.x,
            screenY: aeroP.y,
            visible: aeroP.visible,
          },
          {
            id: 'brakes',
            title: 'Carbon-Ceramic Braking',
            subtitle: '10-Piston Monoblock',
            description: '420mm drilled ceramic rotors with lightweight aluminum multi-piston calipers for track endurance.',
            screenX: brakeP.x,
            screenY: brakeP.y,
            visible: brakeP.visible,
          },
          {
            id: 'powertrain',
            title: `${model.specs.horsepower} HP Powertrain`,
            subtitle: model.specs.drivetrain,
            description: `0-60 mph in ${model.specs.acceleration060}s with intelligent torque vectoring across all four wheels.`,
            screenX: powerP.x,
            screenY: powerP.y,
            visible: powerP.visible,
          },
          {
            id: 'cockpit',
            title: 'Next-Gen Cockpit',
            subtitle: 'OLED Spatial Display',
            description: 'Driver-focused digital panoramic display with high-resolution telemetry and ambient sensory lighting.',
            screenX: cockpitP.x,
            screenY: cockpitP.y,
            visible: cockpitP.visible,
          },
          {
            id: 'charging',
            title: '900V Ultra-Fast Architecture',
            subtitle: '350kW DC Rapid Charging',
            description: 'Replenishes up to 250 miles of range in just 12 minutes with pre-conditioned thermal cooling.',
            screenX: chargeP.x,
            screenY: chargeP.y,
            visible: chargeP.visible,
          },
        ]);
      }

      threeRef.current.animationFrameId = requestAnimationFrame(renderLoop);
    };

    threeRef.current.animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animationFrameId);
      }
    };
  }, [config.autoRotate, model]);

  // 6. Interactive Mouse / Touch Drag Orbit Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!threeRef.current) return;
    threeRef.current.isDragging = true;
    threeRef.current.prevMouseX = e.clientX;
    threeRef.current.prevMouseY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!threeRef.current || !threeRef.current.isDragging) return;
    const deltaX = e.clientX - threeRef.current.prevMouseX;
    const deltaY = e.clientY - threeRef.current.prevMouseY;

    threeRef.current.targetSpherical.theta -= deltaX * 0.006;
    threeRef.current.targetSpherical.phi -= deltaY * 0.006;

    threeRef.current.prevMouseX = e.clientX;
    threeRef.current.prevMouseY = e.clientY;
  };

  const handlePointerUp = () => {
    if (threeRef.current) {
      threeRef.current.isDragging = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!threeRef.current) return;
    threeRef.current.targetSpherical.radius += e.deltaY * 0.005;
    threeRef.current.targetSpherical.radius = Math.max(
      2.0,
      Math.min(12.0, threeRef.current.targetSpherical.radius)
    );
  };

  // High-Res Snapshot Export
  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    vehicleAudio.playSelectBeep();
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${model.name.replace(/\s+/g, '-').toLowerCase()}-build.png`;
    link.href = dataUrl;
    link.click();
  };

  // Audio Engine Rev Playback
  const handleEngineRev = () => {
    vehicleAudio.playElectricRev();
  };

  // Audio Mute Toggle
  const handleToggleMute = () => {
    const muted = vehicleAudio.toggleMute();
    setIsMuted(muted);
  };

  // Fullscreen Container Toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div
      ref={containerRef}
      id="vehicle-canvas-container"
      className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-[#0A0A0A] overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl border border-white/10 shadow-2xl"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Header Badges on Canvas */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-lg pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Interactive 3D Configurator
            </div>
            <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>{model.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-normal border border-blue-500/30">
                {model.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Engine Rev Audio Button */}
          <button
            id="btn-engine-rev"
            onClick={handleEngineRev}
            title="Accelerate / Rev Engine Sound"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Engine Spool</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="btn-sound-mute"
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
            className="p-2.5 rounded-xl bg-[#0A0A0A]/90 hover:bg-[#1C1C1C] text-neutral-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-200" />}
          </button>

          {/* Screenshot Snapshot */}
          <button
            id="btn-capture-snapshot"
            onClick={handleCaptureSnapshot}
            title="Export High-Res PNG Render"
            className="p-2.5 rounded-xl bg-[#0A0A0A]/90 hover:bg-[#1C1C1C] text-neutral-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            id="btn-toggle-fullscreen"
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen Canvas"
            className="p-2.5 rounded-xl bg-[#0A0A0A]/90 hover:bg-[#1C1C1C] text-neutral-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3D Interactive Hotspot Markers */}
      {showHotspots &&
        hotspots.map(spot => {
          if (!spot.visible || spot.screenX <= 20 || spot.screenY <= 20) return null;
          const isSelected = activeHotspot === spot.id;

          return (
            <div
              key={spot.id}
              style={{
                left: `${spot.screenX}px`,
                top: `${spot.screenY}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-auto z-20"
            >
              <button
                id={`hotspot-${spot.id}`}
                onClick={e => {
                  e.stopPropagation();
                  vehicleAudio.playSelectBeep();
                  setActiveHotspot(isSelected ? null : spot.id);
                }}
                className={`relative group flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'bg-blue-500 text-white scale-125 ring-4 ring-blue-500/40 shadow-lg shadow-blue-500/50'
                    : 'bg-[#0A0A0A]/90 text-blue-400 border border-blue-400/60 hover:scale-110 shadow-md'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span className="absolute -inset-1 rounded-full border border-blue-400/40 animate-ping opacity-40" />
              </button>

              {/* Hotspot Info Popup Popover */}
              {isSelected && (
                <div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 bg-[#0F0F0F]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 shadow-2xl text-left z-30 animate-in fade-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                      {spot.subtitle}
                    </div>
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="text-neutral-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{spot.title}</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{spot.description}</p>
                </div>
              )}
            </div>
          );
        })}

      {/* Floating Bottom Left Controls: Camera Angles & Views */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex items-center gap-1 shadow-xl">
          {(
            [
              { id: 'hero', label: '3/4 Hero' },
              { id: 'front', label: 'Front' },
              { id: 'side', label: 'Profile' },
              { id: 'rear', label: 'Rear' },
              { id: 'top', label: 'Aerial' },
              { id: 'wheel', label: 'Wheels' },
              { id: 'cockpit', label: 'Cockpit' },
            ] as const
          ).map(view => (
            <button
              key={view.id}
              id={`cam-view-${view.id}`}
              onClick={() => {
                vehicleAudio.playSelectBeep();
                onUpdateConfig({ cameraAngle: view.id });
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                config.cameraAngle === view.id
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bottom Right Controls: Studio Preset, Auto-Rotate, Hotspots & X-Ray */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
        {/* Toggle Hotspots */}
        <button
          id="btn-toggle-hotspots"
          onClick={() => {
            vehicleAudio.playSelectBeep();
            setShowHotspots(!showHotspots);
          }}
          title="Toggle 3D Engineering Hotspots"
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
            showHotspots
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              : 'bg-[#0A0A0A]/90 border-white/10 text-neutral-400 hover:text-white hover:bg-[#1C1C1C]'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* X-Ray Chassis Mode Toggle */}
        <button
          id="btn-toggle-xray"
          onClick={() => {
            vehicleAudio.playLightToggle();
            onUpdateConfig({ xRayMode: !config.xRayMode });
          }}
          title="Toggle X-Ray Chassis / Powertrain View"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
            config.xRayMode
              ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-blue-600/30'
              : 'bg-[#0A0A0A]/90 border-white/10 text-neutral-300 hover:text-white hover:bg-[#1C1C1C]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">X-Ray</span>
        </button>

        {/* Auto Rotate Toggle */}
        <button
          id="btn-toggle-autorotate"
          onClick={() => {
            vehicleAudio.playSelectBeep();
            onUpdateConfig({ autoRotate: !config.autoRotate });
          }}
          title="Toggle 360 Showcase Auto-Rotation"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md transition-all shadow-lg ${
            config.autoRotate
              ? 'bg-blue-600 text-white font-bold border-blue-500 shadow-blue-600/30'
              : 'bg-[#0A0A0A]/90 border-white/10 text-neutral-300 hover:text-white hover:bg-[#1C1C1C]'
          }`}
        >
          <Rotate3d className={`w-4 h-4 ${config.autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">360°</span>
        </button>

        {/* Studio Lighting Preset Dropdown */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 shadow-xl">
          {(
            [
              { id: 'pristine', label: 'Studio', icon: Sun },
              { id: 'cyberpunk', label: 'Neon', icon: Sparkles },
              { id: 'sunset', label: 'Sunset', icon: Compass },
              { id: 'stealth', label: 'Dark', icon: Moon },
            ] as const
          ).map(studio => {
            const Icon = studio.icon;
            const isCurrent = config.studioPreset === studio.id;
            return (
              <button
                key={studio.id}
                id={`studio-${studio.id}`}
                onClick={() => {
                  vehicleAudio.playSelectBeep();
                  onUpdateConfig({ studioPreset: studio.id });
                }}
                title={`${studio.label} Lighting Preset`}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{studio.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
