import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { WORLD_CUP_DATA, TEAMS_LIST } from '../data/world_cup_data';
import { TeamData, AppPhase } from '../types';

// Define the static ribbon curve outside the component for instant access & performance
const curvePoints = [
  new THREE.Vector3(0, 0.2, 3),        // Start (Intro)
  new THREE.Vector3(2.3, 0.4, -12),     // ARG
  new THREE.Vector3(-2.3, -0.4, -24),   // FRA
  new THREE.Vector3(2.3, 0.4, -36),     // BRA
  new THREE.Vector3(-2.3, -0.4, -48),   // ENG
  new THREE.Vector3(2.3, 0.4, -60),     // ESP
  new THREE.Vector3(-2.3, -0.4, -72),   // GER
  new THREE.Vector3(2.3, 0.4, -84),     // POR
  new THREE.Vector3(-2.3, -0.4, -96),   // USA
];

const ribbonCurve = new THREE.CatmullRomCurve3(curvePoints);

interface ThreeCanvasProps {
  phase: AppPhase;
  scrollProgress: number; // 0 to 8 float
  selectedTeamId: string;
  onSelectTeam: (teamId: string) => void;
  onGoalAnimationComplete: () => void;
  onGoalTriggered: () => void;
}

export default function ThreeCanvas({
  phase,
  scrollProgress,
  selectedTeamId,
  onSelectTeam,
  onGoalAnimationComplete,
  onGoalTriggered,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);

  // Store the latest scrollProgress in a ref to avoid recreation of Three.js setup
  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  // References to keep Three.js objects accessible across loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const footballRef = useRef<THREE.Group | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const dustRef = useRef<THREE.Points | null>(null);
  const nebulaRef = useRef<THREE.Group | null>(null);
  const goalPostGroupRef = useRef<THREE.Group | null>(null);
  const goalNetRef = useRef<THREE.LineSegments | null>(null);

  // Keep track of node meshes for raycasting
  const nodesRef = useRef<{ teamId: string; mesh: THREE.Mesh; pos: THREE.Vector3 }[]>([]);

  // Coordinates of HTML tooltips to render on overlay
  const [projectedNodes, setProjectedNodes] = useState<{
    teamId: string;
    country: string;
    flag: string;
    x: number;
    y: number;
    visible: boolean;
    color: string;
    isTransitioning?: boolean;
  }[]>([]);

  // State to track shooting animation
  const shootAnimRef = useRef<{
    active: boolean;
    t: number;
    startX: number;
    startY: number;
    startZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
  }>({
    active: false,
    t: 0,
    startX: 0,
    startY: 0,
    startZ: 0,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
  });

  // Snaps progress towards integers to create precise stops at the country checkpoints
  const getSnappedProgress = (progress: number) => {
    if (progress <= 0.1) return progress;
    const intVal = Math.round(progress);
    if (Math.abs(progress - intVal) < 0.3) {
      return intVal;
    }
    const lowerInt = Math.floor(progress);
    const t = (progress - lowerInt - 0.3) / 0.4; // Map [0.3, 0.7] to [0, 1]
    const ease = t * t * (3 - 2 * t);
    return lowerInt + ease;
  };

  // Calculate football positions along the ribbon curve based on scrollProgress (0 to 8)
  const getFootballPosition = (progress: number) => {
    // Map progress (0 to 8) directly to CatmullRomCurve3 parametric value t (0 to 1) for continuous physical movement
    const t = Math.max(0, Math.min(1, progress / 8));
    const pt = ribbonCurve.getPointAt(t);
    return { x: pt.x, y: pt.y, z: pt.z };
  };

  // Node position helper along the ribbon curve
  const getNodePosition = (idx: number) => {
    return ribbonCurve.getPointAt((idx + 1) / 8);
  };

  // Trigger goal kick animation
  useEffect(() => {
    if (phase === 'GOAL_ANIMATION' && footballRef.current) {
      const fb = footballRef.current;
      
      // Determine where the ball shoots to (top corner of net)
      // Goalpost center is placed at z = fb.position.z - 18, y = 0, x = 0
      const targetZ = fb.position.z - 18;
      // Shoot towards the upper right or upper left corner of the net
      const shootRight = Math.random() > 0.5;

      shootAnimRef.current = {
        active: true,
        t: 0,
        startX: fb.position.x,
        startY: fb.position.y,
        startZ: fb.position.z,
        targetX: shootRight ? 2.2 : -2.2,
        targetY: 1.1,
        targetZ: targetZ,
      };

      // Set up goalpost visual
      if (goalPostGroupRef.current) {
        goalPostGroupRef.current.position.set(0, 0, targetZ);
        goalPostGroupRef.current.visible = true;
      }
    } else if (phase === 'SCROLL_JOURNEY' && goalPostGroupRef.current) {
      // Hide goalpost when back to scroll matrix
      goalPostGroupRef.current.visible = false;
      shootAnimRef.current.active = false;
    }
  }, [phase]);

  // Main Three.js setup and animation loop
  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions
    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Stars Particle Background (Immersive deep space starfield)
    const starsCount = 1500;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Uniform distribution in a sphere/cylinder for deep-space immersion
      const radius = 15 + Math.random() * 85;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi) - 35; // depth centered slightly in front & behind

      // Cosmic stellar hues (Ice blue, warm gold, pinkish magenta, and pure white)
      const colorRand = Math.random();
      if (colorRand < 0.25) {
        starColors[i] = 0.5;     // R
        starColors[i + 1] = 0.85; // G
        starColors[i + 2] = 1.0;  // B (Ice Blue)
      } else if (colorRand < 0.4) {
        starColors[i] = 1.0;
        starColors[i + 1] = 0.85;
        starColors[i + 2] = 0.45; // Golden Amber
      } else if (colorRand < 0.55) {
        starColors[i] = 0.95;
        starColors[i + 1] = 0.5;
        starColors[i + 2] = 1.0;  // Celestial Pink / Violet
      } else {
        starColors[i] = 0.95;
        starColors[i + 1] = 0.95;
        starColors[i + 2] = 1.0;  // Soft Space White
      }
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // Custom glowing circle star texture via Canvas
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 16;
    starCanvas.height = 16;
    const ctx = starCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(0,255,204,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starsMat = new THREE.PointsMaterial({
      size: 0.18, // Crispy, tiny starry dots for space realism
      map: starTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    starsRef.current = stars;

    // 2.5. Celestial Ribbon Dust Particles (glowing geometric guides following the ribbon curve)
    const dustCount = 450;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const t = Math.random();
      const pt = ribbonCurve.getPointAt(t);
      
      // Random spread around the ribbon path
      const spread = 5 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      const rX = Math.cos(angle) * spread;
      const rY = Math.sin(angle) * spread;
      const rZ = (Math.random() - 0.5) * spread;

      dustPositions[i * 3] = pt.x + rX;
      dustPositions[i * 3 + 1] = pt.y + rY;
      dustPositions[i * 3 + 2] = pt.z + rZ;

      // Color theme matching the cosmic neon palette (cyan, soft purple, energetic orange/gold)
      const hueSelect = Math.random();
      if (hueSelect < 0.4) {
        // Cyan / Neon Emerald
        dustColors[i * 3] = 0.0;
        dustColors[i * 3 + 1] = 1.0;
        dustColors[i * 3 + 2] = 0.85;
      } else if (hueSelect < 0.7) {
        // Celestial Purple / Violet
        dustColors[i * 3] = 0.65;
        dustColors[i * 3 + 1] = 0.35;
        dustColors[i * 3 + 2] = 1.0;
      } else {
        // Bright Amber / Gold
        dustColors[i * 3] = 1.0;
        dustColors[i * 3 + 1] = 0.75;
        dustColors[i * 3 + 2] = 0.25;
      }
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

    // Glow circle texture (larger and softer than standard stars)
    const dustCanvas = document.createElement('canvas');
    dustCanvas.width = 32;
    dustCanvas.height = 32;
    const dCtx = dustCanvas.getContext('2d');
    if (dCtx) {
      const grad = dCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.3, 'rgba(0, 180, 255, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dCtx.fillStyle = grad;
      dCtx.fillRect(0, 0, 32, 32);
    }
    const dustTexture = new THREE.CanvasTexture(dustCanvas);

    const dustMat = new THREE.PointsMaterial({
      size: 0.38, // Large glowing cosmic dust specs
      map: dustTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);
    dustRef.current = dustParticles;

    // 3. Ambient Starfield & Nebula Background setup
    // Create a beautiful, soft circular glow texture for our cosmic nebula clouds
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 128;
    nebulaCanvas.height = 128;
    const nCtx = nebulaCanvas.getContext('2d');
    if (nCtx) {
      const grad = nCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      nCtx.fillStyle = grad;
      nCtx.fillRect(0, 0, 128, 128);
    }
    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);

    const nebulaGroup = new THREE.Group();
    const nebulaGeo = new THREE.PlaneGeometry(65, 65);

    // Nebula Cloud 1: Cosmic Ice Blue/Teal
    const nebulaMat1 = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebula1 = new THREE.Mesh(nebulaGeo, nebulaMat1);
    nebula1.position.set(-22, 10, -55);
    nebulaGroup.add(nebula1);

    // Nebula Cloud 2: Deep Amethyst Purple
    const nebulaMat2 = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      color: 0x8a2be2,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebula2 = new THREE.Mesh(nebulaGeo, nebulaMat2);
    nebula2.position.set(22, -12, -60);
    nebulaGroup.add(nebula2);

    // Nebula Cloud 3: Cyber Electric Emerald Cyan
    const nebulaMat3 = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebula3 = new THREE.Mesh(nebulaGeo, nebulaMat3);
    nebula3.position.set(-6, -8, -45);
    nebulaGroup.add(nebula3);

    // Nebula Cloud 4: Soft Solar Magenta/Pink
    const nebulaMat4 = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      color: 0xff007f,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebula4 = new THREE.Mesh(nebulaGeo, nebulaMat4);
    nebula4.position.set(24, 15, -50);
    nebulaGroup.add(nebula4);

    scene.add(nebulaGroup);
    nebulaRef.current = nebulaGroup;

    // 4. Highly Realistic Procedural Soccer Ball & Laser Wireframe
    // Helper to generate classic black-and-white soccer ball texture programmatically
    const createSoccerBallTextures = () => {
      const texWidth = 512;
      const texHeight = 256;

      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = texWidth;
      mapCanvas.height = texHeight;
      const mapCtx = mapCanvas.getContext('2d')!;
      const mapData = mapCtx.createImageData(texWidth, texHeight);

      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = texWidth;
      bumpCanvas.height = texHeight;
      const bumpCtx = bumpCanvas.getContext('2d')!;
      const bumpData = bumpCtx.createImageData(texWidth, texHeight);

      // Precompute 12 normalized vertices of a regular icosahedron (centers of the 12 pentagons)
      const phiValue = (1 + Math.sqrt(5)) / 2;
      const pentagonCenters = [
        new THREE.Vector3(0, 1, phiValue).normalize(),
        new THREE.Vector3(0, 1, -phiValue).normalize(),
        new THREE.Vector3(0, -1, phiValue).normalize(),
        new THREE.Vector3(0, -1, -phiValue).normalize(),
        new THREE.Vector3(1, phiValue, 0).normalize(),
        new THREE.Vector3(1, -phiValue, 0).normalize(),
        new THREE.Vector3(-1, phiValue, 0).normalize(),
        new THREE.Vector3(-1, -phiValue, 0).normalize(),
        new THREE.Vector3(phiValue, 0, 1).normalize(),
        new THREE.Vector3(phiValue, 0, -1).normalize(),
        new THREE.Vector3(-phiValue, 0, 1).normalize(),
        new THREE.Vector3(-phiValue, 0, -1).normalize(),
      ];

      for (let y = 0; y < texHeight; y++) {
        const theta = (1 - y / texHeight) * Math.PI - Math.PI / 2;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        for (let x = 0; x < texWidth; x++) {
          const phiLon = (x / texWidth) * Math.PI * 2 - Math.PI;
          const px = cosTheta * Math.cos(phiLon);
          const py = sinTheta;
          const pz = cosTheta * Math.sin(phiLon);

          // Find the two largest dot products with pentagon centers
          let d1 = -1;
          let d2 = -1;

          for (let i = 0; i < 12; i++) {
            const v = pentagonCenters[i];
            const dot = px * v.x + py * v.y + pz * v.z;
            if (dot > d1) {
              d2 = d1;
              d1 = dot;
            } else if (dot > d2) {
              d2 = dot;
            }
          }

          // Base color (Both Pentagons and Hexagons are pristine glossy white leather as requested)
          let r = 255;
          let g = 255;
          let b = 255;
          let bumpVal = 240; // Neutral high leather base bump

          const isPentagon = d1 > 0.885;
          const isPentagonBorder = Math.abs(d1 - 0.885) < 0.015;
          const isHexagonBorder = d1 <= 0.885 && (d1 - d2) < 0.022;

          // Compute distance to nearest edge to simulate luxurious panel pillowing / soft shadow gradients
          const distToPentBorder = Math.abs(d1 - 0.885);
          const distToHexBorder = d1 - d2;
          const edgeDist = Math.min(distToPentBorder, distToHexBorder);

          // Recessed Seam Line painting
          if (isPentagonBorder || isHexagonBorder) {
            // Soft shadow grey for seams as shown in standard white soccer balls
            r = 195;
            g = 195;
            b = 198;
            bumpVal = 25; // Deep recessed seam for real 3D shadows and high-fidelity lighting
          } else {
            // Pillow shading: smoothly darken near edges for dramatic depth & puffy leather look!
            if (edgeDist < 0.08) {
              const shadowFactor = 0.76 + 0.24 * (edgeDist / 0.08); // Darken up to 24% towards the seam
              r = Math.floor(255 * shadowFactor);
              g = Math.floor(255 * shadowFactor);
              b = Math.floor(255 * shadowFactor);
              bumpVal = Math.floor(240 * (0.35 + 0.65 * (edgeDist / 0.08)));
            } else {
              // Micro synthetic leather texture noise
              const noise = (Math.sin(px * 480) * Math.cos(py * 480) * Math.sin(pz * 480)) * 5;
              bumpVal = Math.min(Math.max(240 + noise, 0), 255);
            }
          }

          // Write to pixel array
          const idx = (y * texWidth + x) * 4;
          mapData.data[idx] = r;
          mapData.data[idx + 1] = g;
          mapData.data[idx + 2] = b;
          mapData.data[idx + 3] = 255;

          bumpData.data[idx] = bumpVal;
          bumpData.data[idx + 1] = bumpVal;
          bumpData.data[idx + 2] = bumpVal;
          bumpData.data[idx + 3] = 255;
        }
      }

      mapCtx.putImageData(mapData, 0, 0);
      bumpCtx.putImageData(bumpData, 0, 0);

      return { mapCanvas, bumpCanvas };
    };

    const { mapCanvas, bumpCanvas } = createSoccerBallTextures();
    const mapTexture = new THREE.CanvasTexture(mapCanvas);
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

    // Premium MeshStandardMaterial with realistic dielectric leather settings (low metalness, balanced roughness for beautiful soft specular highlights in deep space)
    const footballMat = new THREE.MeshStandardMaterial({
      map: mapTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.035, // Premium realistic tactile seam depth
      roughness: 0.38,  // Soft, rich glossy leather finish
      metalness: 0.05,  // Realistic non-metallic leather coating
    });

    const footballGeo = new THREE.SphereGeometry(2.6, 64, 64); // Increased size to make it a prominent, premium centerpiece
    const footballMesh = new THREE.Mesh(footballGeo, footballMat);
    const footballGroup = new THREE.Group();
    footballGroup.add(footballMesh);

    // Initialize position instantly to prevent lag or popping on load
    const initScroll = scrollProgressRef.current;
    const initPos = getFootballPosition(initScroll);
    footballGroup.position.copy(initPos);
    camera.position.set(initPos.x * 0.45, initPos.y * 0.45, initPos.z + 8.5);
    camera.lookAt(initPos.x * 0.5, initPos.y * 0.5, initPos.z - 2);

    scene.add(footballGroup);
    footballRef.current = footballGroup;

    // Visual ribbon track and energy overlays are removed as they act as visual obstructions and clip through the ball.

    // 5. Build Interactive Tactical Beacons for nations
    const nodesList: { teamId: string; mesh: THREE.Mesh; pos: THREE.Vector3 }[] = [];

    TEAMS_LIST.forEach((team, idx) => {
      const pos = getNodePosition(idx);

      // Node Group
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(pos);
      scene.add(nodeGroup);

      // Core Glowing Sphere
      const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(team.color),
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);
      // Store mesh for raycasting
      nodesList.push({ teamId: team.id, mesh: coreMesh, pos });

      // Outer Torus Ring
      const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(team.secondaryColor),
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + (Math.random() * 0.5);
      ringMesh.name = "ring";
      nodeGroup.add(ringMesh);

      // Tactical Beacon Vertical Pillar removed to prevent visual clipping through the football.
    });

    nodesRef.current = nodesList;

    // 6. 3D Wireframe Goalpost (Phase 2 Asset)
    const goalPostGroup = new THREE.Group();
    scene.add(goalPostGroup);
    goalPostGroupRef.current = goalPostGroup;
    goalPostGroup.visible = false; // Hidden initially

    // Material for Goal frame
    const postMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Left post (cylinder)
    const leftPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8);
    const leftPost = new THREE.Mesh(leftPostGeo, postMat);
    leftPost.position.set(-3.6, 1.6 - 1.6, 0); // floor is at y = -1.6 inside net coordinates
    goalPostGroup.add(leftPost);

    // Right post
    const rightPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8);
    const rightPost = new THREE.Mesh(rightPostGeo, postMat);
    rightPost.position.set(3.6, 1.6 - 1.6, 0);
    goalPostGroup.add(rightPost);

    // Crossbar
    const crossbarGeo = new THREE.CylinderGeometry(0.1, 0.1, 7.2, 8);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 3.2 - 1.6, 0);
    goalPostGroup.add(crossbar);

    // Goal Netting Wireframe (Back Box structure)
    const netGeo = new THREE.BoxGeometry(7.2, 3.2, 2.4);
    const edges = new THREE.EdgesGeometry(netGeo);
    const netWire = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x00ffcc, linewidth: 1 })
    );
    // Offset the net box so it sits behind the goal line
    netWire.position.set(0, 1.6 - 1.6, -1.2);
    goalPostGroup.add(netWire);
    goalNetRef.current = netWire;

    // Subtle net backing visual pattern
    const netBackGeo = new THREE.PlaneGeometry(7.2, 3.2, 10, 5);
    const netBackMat = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const netBack = new THREE.Mesh(netBackGeo, netBackMat);
    netBack.position.set(0, 1.6 - 1.6, -2.4);
    goalPostGroup.add(netBack);

    // 7. Lighting with professional multi-directional setups for dramatic, high-definition 3D volume
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    // High-intensity Point Light attached directly to the camera to act as a ring-light headlight
    const camPointLight = new THREE.PointLight(0xffffff, 4.5, 50);
    camPointLight.position.set(0, 0, 1.5); // slightly in front of camera lens
    camera.add(camPointLight);
    scene.add(camera);

    // Main neon key light
    const dirLight = new THREE.DirectionalLight(0x00ffcc, 1.4);
    dirLight.position.set(6, 6, 6);
    scene.add(dirLight);

    // Warm high-intensity studio light targeting the front-facing leather panels for maximum realism
    const studioLight = new THREE.DirectionalLight(0xffffff, 1.8);
    studioLight.position.set(3, 5, 8);
    scene.add(studioLight);

    // Colorful rim light from behind for a cinematic halo glow on the ball's silhouette
    const backRimLight = new THREE.DirectionalLight(0xf5a623, 1.2);
    backRimLight.position.set(-6, 3, -6);
    scene.add(backRimLight);

    // Extra fill light to keep shadows clean and detailed
    const shadowFillLight = new THREE.DirectionalLight(0x00ffff, 0.6);
    shadowFillLight.position.set(-5, -5, 2);
    scene.add(shadowFillLight);

    // Track mouse coordinates for interactive cursor drifting follow
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 8. Event Listener for Click / Node Selection via Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      if (phase !== 'SCROLL_JOURNEY') return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersection with our node cores
      const meshesToTest = nodesList.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(meshesToTest);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitNode = nodesList.find((n) => n.mesh === hitMesh);
        if (hitNode) {
          // Select team and trigger goal!
          onSelectTeam(hitNode.teamId);
          setTimeout(() => {
            onGoalTriggered();
          }, 50);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Track smooth interpolated scroll progress for momentum-based ball movement
    let currentScroll = scrollProgressRef.current;

    // 10. Frame Loop
    const tick = () => {
      // Smoothly interpolate current scroll progress towards target scroll position
      currentScroll = THREE.MathUtils.lerp(currentScroll, scrollProgressRef.current, 0.07);

      // Smoothly update mouse coordinates
      currentMouse.x = THREE.MathUtils.lerp(currentMouse.x, targetMouse.x, 0.06);
      currentMouse.y = THREE.MathUtils.lerp(currentMouse.y, targetMouse.y, 0.06);

      // Rotation animations
      if (footballGroup) {
        if (!shootAnimRef.current.active) {
          // Rotate along with mouse drift to feel interactive
          footballGroup.rotation.y += 0.006 + (currentMouse.x * 0.005);
          footballGroup.rotation.x += 0.003 - (currentMouse.y * 0.003);
        } else {
          // High speed spinning for shot animation
          footballGroup.rotation.y += 0.06;
          footballGroup.rotation.x += 0.04;
          footballGroup.rotation.z += 0.05;
        }
      }

      // Drift starry background and subtly react to scroll progress to increase depth
      if (stars) {
        stars.rotation.z += 0.0001; // Subtle continuous drift
        stars.rotation.y = currentScroll * 0.015; // Responsive scroll rotation
        stars.position.z = -35 - (currentScroll * 0.6); // Dynamic depth shift
      }

      // Drift and oscillate the ribbon dust particles
      if (dustParticles) {
        dustParticles.rotation.z -= 0.0002; // Continuous organic drift
        dustParticles.rotation.y = -currentScroll * 0.045; // Parallax rotation relative to scroll progress
        
        // Add a gentle floating wave movement over time
        const timeVal = Date.now() * 0.0004;
        dustParticles.position.y = Math.sin(timeVal) * 0.3;
        dustParticles.position.x = Math.cos(timeVal * 0.7) * 0.2;
      }

      // Slowly rotate and oscillate nebula clouds for a living deep-space atmosphere
      if (nebulaRef.current) {
        nebulaRef.current.rotation.z -= 0.00015;
        // Slowly oscillate positions of individual clouds for gas expansion look
        const time = Date.now() * 0.0003;
        nebulaRef.current.children.forEach((cloud, index) => {
          const factor = (index + 1) * 0.5;
          cloud.position.x += Math.sin(time + factor) * 0.002;
          cloud.position.y += Math.cos(time - factor) * 0.002;
        });
      }

      // Rotate nation node outer rings
      scene.traverse((obj) => {
        if (obj instanceof THREE.Group && obj.position.z !== 0) {
          const ring = obj.children.find((child) => child.name === 'ring');
          if (ring) {
            ring.rotation.z += 0.015;
          }
        }
      });

      // Handle standard Phase 1 scrolling position
      if (phase === 'SCROLL_JOURNEY') {
        const targetPos = getFootballPosition(currentScroll);
        if (footballGroup) {
          // Generous and interactive drift based on cursor pointer
          const driftX = currentMouse.x * 2.5;
          const driftY = currentMouse.y * 1.8;

          // Smoothly interpolate (lerp) current position towards scroll target + drift position
          footballGroup.position.x = THREE.MathUtils.lerp(
            footballGroup.position.x,
            targetPos.x + driftX,
            0.1
          );
          footballGroup.position.y = THREE.MathUtils.lerp(
            footballGroup.position.y,
            targetPos.y + driftY,
            0.1
          );
          footballGroup.position.z = THREE.MathUtils.lerp(
            footballGroup.position.z,
            targetPos.z,
            0.1
          );

          // Smooth proportional scaling near the start of the ribbon (keep it nice and big!)
          let baseScale = 1.45;
          if (currentScroll < 1.2) {
            baseScale = THREE.MathUtils.lerp(1.1, 1.45, currentScroll / 1.2);
          }
          footballGroup.scale.set(baseScale, baseScale, baseScale);
        }

        // Camera smoothly follows football
        if (camera && footballGroup) {
          const targetCamX = footballGroup.position.x * 0.45;
          const targetCamY = footballGroup.position.y * 0.45;
          const targetCamZ = footballGroup.position.z + 8.5; // Backed up to frame the larger premium football beautifully!

          camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.08);
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);

          // Direct view slightly in front of football
          camera.lookAt(
            footballGroup.position.x * 0.5,
            footballGroup.position.y * 0.5,
            footballGroup.position.z - 2
          );
        }
      }

      // Handle Phase 2 shooting animation kinematics
      if (phase === 'GOAL_ANIMATION' && shootAnimRef.current.active) {
        const anim = shootAnimRef.current;
        anim.t += 0.024; // Speed of the shot, completes in ~40 frames (~0.7s)

        if (anim.t >= 1) {
          anim.t = 1;
          anim.active = false;
          onGoalAnimationComplete(); // Trigger screen flash & transition!
        }

        // Easing curve (ease-in-out or fast ease-in for realistic rocket shot)
        // Let's use a power3.5 ease-in for massive acceleration!
        const easeT = Math.pow(anim.t, 3.5);

        if (footballGroup) {
          footballGroup.position.x = THREE.MathUtils.lerp(anim.startX, anim.targetX, easeT);
          footballGroup.position.y = THREE.MathUtils.lerp(anim.startY, anim.targetY, easeT);
          footballGroup.position.z = THREE.MathUtils.lerp(anim.startZ, anim.targetZ, easeT);

          // Spin the ball super fast during the shot!
          footballGroup.rotation.y += 0.15;
          footballGroup.rotation.x += 0.12;

          // Make ball shrink rapidly into the distance (creates depth scale compression)
          const scaleVal = THREE.MathUtils.lerp(1.45, 0.35, easeT);
          footballGroup.scale.set(scaleVal, scaleVal, scaleVal);
        }

        if (camera && footballGroup) {
          // Camera shakes slightly during rocket shot, then stays static behind the spot
          const shake = (1 - anim.t) * 0.03 * Math.sin(anim.t * 60);
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0 + shake, 0.1);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.5 + shake, 0.1);
          camera.position.z = THREE.MathUtils.lerp(
            camera.position.z,
            anim.startZ + 4.5, // keep camera near the launch point
            0.1
          );
          camera.lookAt(0, 0.5, anim.targetZ);
        }

        // Bend net wireframe slightly as ball arrives!
        if (goalNetRef.current && anim.t > 0.8) {
          const impact = (anim.t - 0.8) * 5; // scales up to 1
          goalNetRef.current.scale.set(1, 1, 1 + impact * 0.15);
        }
      }

      // Render scene
      if (renderer && camera) {
        renderer.render(scene, camera);
      }

      // Recalculate and update HTML overlay coordinates for tooltips (Phase 1 & 2)
      if (camera && phase === 'SCROLL_JOURNEY') {
        const tempV = new THREE.Vector3();
        const projected = nodesList.map((node, i) => {
          const team = TEAMS_LIST[i];
          tempV.copy(node.pos);
          tempV.project(camera);

          // Check if it's behind camera
          const isBehind = tempV.z > 1;

          // Convert to normalized screen pixels
          const screenX = (tempV.x * 0.5 + 0.5) * width;
          const screenY = (-(tempV.y) * 0.5 + 0.5) * height;

          // Only show tooltips that are close to the camera depth-wise (e.g., within a scroll bubble)
          const zDistance = Math.abs(camera.position.z - node.pos.z);
          // Tooltips are visible when camera is near them
          const visible = !isBehind && zDistance < 35 && zDistance > 0.5;

          return {
            teamId: node.teamId,
            country: team.country,
            flag: team.flag,
            x: screenX,
            y: screenY,
            visible: visible,
            color: team.color,
          };
        });

        setProjectedNodes(projected);
      } else if (camera && phase === 'GOAL_ANIMATION' && footballGroup) {
        // Project the moving football's 3D coordinates during the goal shot
        const tempV = new THREE.Vector3();
        footballGroup.getWorldPosition(tempV);
        tempV.project(camera);

        const screenX = (tempV.x * 0.5 + 0.5) * width;
        const screenY = (-(tempV.y) * 0.5 + 0.5) * height;

        const currentTeam = WORLD_CUP_DATA[selectedTeamId];
        if (currentTeam) {
          const movingNode = {
            teamId: selectedTeamId,
            country: currentTeam.country,
            flag: currentTeam.flag,
            x: screenX,
            y: screenY,
            visible: true,
            color: currentTeam.color,
            isTransitioning: true,
          };
          setProjectedNodes([movingNode]);
        }
      } else {
        setProjectedNodes([]);
      }

      requestRef.current = requestAnimationFrame(tick);
    };

    tick();

    // Clean up
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
        if (containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);

      // Recursive cleanup of geometries/materials to prevent memory leaks in dev environment
      scene.clear();
      starsGeo.dispose();
      starsMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      dustTexture.dispose();
      nebulaTexture.dispose();
      nebulaGeo.dispose();
      nebulaMat1.dispose();
      nebulaMat2.dispose();
      nebulaMat3.dispose();
      nebulaMat4.dispose();
      footballGeo.dispose();
      footballMat.dispose();
      mapTexture.dispose();
      bumpTexture.dispose();
      leftPostGeo.dispose();
      rightPostGeo.dispose();
      crossbarGeo.dispose();
      netGeo.dispose();
      edges.dispose();
      postMat.dispose();
      netBackGeo.dispose();
      netBackMat.dispose();
      renderer.dispose();
    };
  }, [phase]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto">
      {/* Three.js Canvas mounting point */}
      <div ref={containerRef} className="w-full h-full" id="canvas-container" />
    </div>
  );
}
