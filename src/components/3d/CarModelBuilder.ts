import * as THREE from 'three';
import { VehicleConfiguration, VehicleModel } from '../../types/vehicle';

export interface CarMeshes {
  rootGroup: THREE.Group;
  bodyGroup: THREE.Group;
  leftDoorGroup: THREE.Group;
  rightDoorGroup: THREE.Group;
  spoilerGroup: THREE.Group;
  wheelGroups: THREE.Group[];
  bodyMaterials: THREE.MeshPhysicalMaterial[];
  caliperMaterials: THREE.MeshStandardMaterial[];
  wheelMaterials: THREE.MeshStandardMaterial[];
  interiorMaterials: THREE.MeshStandardMaterial[];
  ambientLightMaterials: THREE.MeshBasicMaterial[];
  glassMaterials: THREE.MeshPhysicalMaterial[];
  headlightMaterials: THREE.MeshBasicMaterial[];
  taillightMaterials: THREE.MeshBasicMaterial[];
  chassisMeshes: THREE.Mesh[];
  hotspotPositions: {
    aeroWing: THREE.Vector3;
    brakes: THREE.Vector3;
    powertrain: THREE.Vector3;
    cockpit: THREE.Vector3;
    chargePort: THREE.Vector3;
  };
}

export function buildCarModel(
  model: VehicleModel,
  config: VehicleConfiguration,
  scene: THREE.Scene
): CarMeshes {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'CarRoot';

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'CarBody';
  rootGroup.add(bodyGroup);

  const leftDoorGroup = new THREE.Group();
  leftDoorGroup.name = 'LeftDoor';
  leftDoorGroup.position.set(-0.95, 0.45, 0.2); // Door hinge pivot
  bodyGroup.add(leftDoorGroup);

  const rightDoorGroup = new THREE.Group();
  rightDoorGroup.name = 'RightDoor';
  rightDoorGroup.position.set(0.95, 0.45, 0.2); // Door hinge pivot
  bodyGroup.add(rightDoorGroup);

  const spoilerGroup = new THREE.Group();
  spoilerGroup.name = 'ActiveSpoiler';
  bodyGroup.add(spoilerGroup);

  const bodyMaterials: THREE.MeshPhysicalMaterial[] = [];
  const caliperMaterials: THREE.MeshStandardMaterial[] = [];
  const wheelMaterials: THREE.MeshStandardMaterial[] = [];
  const interiorMaterials: THREE.MeshStandardMaterial[] = [];
  const ambientLightMaterials: THREE.MeshBasicMaterial[] = [];
  const glassMaterials: THREE.MeshPhysicalMaterial[] = [];
  const headlightMaterials: THREE.MeshBasicMaterial[] = [];
  const taillightMaterials: THREE.MeshBasicMaterial[] = [];
  const chassisMeshes: THREE.Mesh[] = [];
  const wheelGroups: THREE.Group[] = [];

  // Determine active colors
  const activeColor = model.availableColors.find(c => c.id === config.colorId) || model.availableColors[0];
  const activeWheel = model.availableWheels.find(w => w.id === config.wheelId) || model.availableWheels[0];
  const activeWheelFinish = activeWheel.finishes.find(f => f.id === config.wheelFinishId) || activeWheel.finishes[0];
  const activeCaliper = model.availableCalipers.find(c => c.id === config.caliperColorId) || model.availableCalipers[0];
  const activeRoof = model.availableRoofs.find(r => r.id === config.roofId) || model.availableRoofs[0];
  const activeInterior = model.availableInteriors.find(i => i.id === config.interiorId) || model.availableInteriors[0];

  // Primary Car Paint Material
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(activeColor.hex),
    roughness: config.finishType === 'matte' ? 0.6 : (activeColor.roughness ?? 0.18),
    metalness: config.finishType === 'matte' ? 0.35 : (activeColor.metalness ?? 0.9),
    clearcoat: config.finishType === 'matte' ? 0.05 : (activeColor.clearcoat ?? 1.0),
    clearcoatRoughness: config.finishType === 'matte' ? 0.8 : 0.08,
    reflectivity: 0.9,
    envMapIntensity: 1.2,
  });
  bodyMaterials.push(paintMat);

  // Carbon Fiber Material
  const carbonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a1a1a),
    roughness: 0.35,
    metalness: 0.65,
    bumpScale: 0.05,
  });

  // Black Trim / Rubber Material
  const blackTrimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x111113),
    roughness: 0.7,
    metalness: 0.2,
  });

  // Chrome / Mirror Finish
  const chromeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xeeeeee),
    roughness: 0.05,
    metalness: 0.98,
  });

  // Glass Material
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(activeRoof.material === 'panoramic-glass' ? 0x182026 : 0x0d1117),
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.52,
    reflectivity: 0.95,
  });
  glassMaterials.push(glassMat);

  // Interior Upholstery Material
  const interiorLeatherMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(activeInterior.primaryHex),
    roughness: 0.65,
    metalness: 0.15,
  });
  interiorMaterials.push(interiorLeatherMat);

  const interiorAccentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(activeInterior.accentHex),
    roughness: 0.5,
    metalness: 0.3,
  });
  interiorMaterials.push(interiorAccentMat);

  // Ambient Interior LED Material
  const ambientLedMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(config.ambientLightColor || activeInterior.ambientLightHex),
  });
  ambientLightMaterials.push(ambientLedMat);

  // Headlights (LED Matrix)
  const headlightMat = new THREE.MeshBasicMaterial({
    color: config.headlightsOn ? new THREE.Color(0xdbeafe) : new THREE.Color(0x475569),
  });
  headlightMaterials.push(headlightMat);

  // Taillights (Neon OLED bar)
  const taillightMat = new THREE.MeshBasicMaterial({
    color: config.headlightsOn ? new THREE.Color(0xff1e27) : new THREE.Color(0x450a0a),
  });
  taillightMaterials.push(taillightMat);

  // Wheels Finish Material
  const wheelFinishMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(activeWheelFinish.hex),
    roughness: 0.25,
    metalness: 0.85,
  });
  wheelMaterials.push(wheelFinishMat);

  // Caliper Material
  const caliperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(activeCaliper.hex),
    roughness: 0.3,
    metalness: 0.6,
  });
  caliperMaterials.push(caliperMat);

  // Tire Rubber Material
  const tireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18181b),
    roughness: 0.85,
    metalness: 0.1,
  });

  // Brake Rotor Steel Material
  const rotorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x9ca3af),
    roughness: 0.28,
    metalness: 0.92,
  });

  // Model Dimension Modifiers based on model
  const isSuv = model.bodyStyle === 'suv';
  const isCoupe = model.bodyStyle === 'coupe';
  const heightScale = isSuv ? 1.35 : (isCoupe ? 0.92 : 1.0);
  const groundOffset = isSuv ? 0.22 : 0.0;
  const bodyLength = isSuv ? 4.5 : (isCoupe ? 4.2 : 4.6);
  const bodyWidth = isSuv ? 2.1 : (isCoupe ? 2.05 : 2.0);

  // ----------------------------------------------------
  // 1. MAIN CAR BODY SCULPTURE
  // ----------------------------------------------------
  // Lower Main Hull
  const hullGeo = new THREE.BoxGeometry(bodyWidth, 0.45 * heightScale, bodyLength - 0.4);
  const hullMesh = new THREE.Mesh(hullGeo, paintMat);
  hullMesh.position.set(0, 0.42 + groundOffset, 0);
  hullMesh.castShadow = true;
  hullMesh.receiveShadow = true;
  bodyGroup.add(hullMesh);

  // Front Hood & Nose Cone
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-bodyWidth * 0.48, 0);
  hoodShape.lineTo(bodyWidth * 0.48, 0);
  hoodShape.lineTo(bodyWidth * 0.42, 1.4);
  hoodShape.lineTo(-bodyWidth * 0.42, 1.4);
  hoodShape.closePath();

  const hoodExtrudeSettings = {
    steps: 2,
    depth: 0.15 * heightScale,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 4,
  };
  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, hoodExtrudeSettings);
  const hoodMesh = new THREE.Mesh(hoodGeo, paintMat);
  hoodMesh.rotation.x = -Math.PI / 2 + (isCoupe ? 0.12 : 0.08);
  hoodMesh.position.set(0, (0.55 + groundOffset) * heightScale, 0.8);
  hoodMesh.castShadow = true;
  bodyGroup.add(hoodMesh);

  // Front Aerodynamic Splitter (Carbon Fiber)
  const splitterGeo = new THREE.BoxGeometry(bodyWidth * 1.02, 0.06, 0.8);
  const splitterMesh = new THREE.Mesh(splitterGeo, carbonMat);
  splitterMesh.position.set(0, 0.18 + groundOffset, bodyLength * 0.48);
  splitterMesh.castShadow = true;
  bodyGroup.add(splitterMesh);

  // Front Grille & Air Intakes
  const grilleGeo = new THREE.BoxGeometry(bodyWidth * 0.75, 0.22, 0.1);
  const grilleMesh = new THREE.Mesh(grilleGeo, blackTrimMat);
  grilleMesh.position.set(0, 0.32 + groundOffset, bodyLength * 0.485);
  bodyGroup.add(grilleMesh);

  // Front Illuminated Aether Badge
  const badgeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
  const badgeMat = new THREE.MeshBasicMaterial({ color: config.headlightsOn ? 0x38bdf8 : 0xcccccc });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMesh.rotation.x = Math.PI / 2;
  badgeMesh.position.set(0, 0.52 + groundOffset, bodyLength * 0.485);
  bodyGroup.add(badgeMesh);

  // ----------------------------------------------------
  // 2. GREENHOUSE / ROOF CANOPY & PILLARS
  // ----------------------------------------------------
  const roofMaterialToUse = activeRoof.material === 'carbon-weave' 
    ? carbonMat 
    : (activeRoof.material === 'panoramic-glass' ? glassMat : paintMat);

  const cabinWidth = bodyWidth * 0.82;
  const cabinLength = isSuv ? bodyLength * 0.62 : (isCoupe ? bodyLength * 0.48 : bodyLength * 0.54);
  const cabinHeight = (isSuv ? 0.75 : (isCoupe ? 0.48 : 0.55)) * heightScale;

  // Roof Top Plate
  const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.88, 0.05, cabinLength * 0.8);
  const roofMesh = new THREE.Mesh(roofGeo, roofMaterialToUse);
  roofMesh.position.set(0, 0.65 + cabinHeight + groundOffset, -0.15);
  roofMesh.castShadow = true;
  bodyGroup.add(roofMesh);

  // Windshield (Front Glass)
  const windshieldGeo = new THREE.BoxGeometry(cabinWidth * 0.92, 0.03, 0.85);
  const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
  windshieldMesh.rotation.x = -Math.PI / 4 + (isCoupe ? -0.1 : 0);
  windshieldMesh.position.set(0, 0.65 + cabinHeight * 0.5 + groundOffset, 0.55);
  bodyGroup.add(windshieldMesh);

  // Rear Window (Back Glass)
  const rearGlassGeo = new THREE.BoxGeometry(cabinWidth * 0.88, 0.03, isSuv ? 0.55 : 0.95);
  const rearGlassMesh = new THREE.Mesh(rearGlassGeo, glassMat);
  rearGlassMesh.rotation.x = isSuv ? Math.PI / 8 : Math.PI / 3.2;
  rearGlassMesh.position.set(0, 0.65 + cabinHeight * 0.48 + groundOffset, isSuv ? -bodyLength * 0.38 : -0.9);
  bodyGroup.add(rearGlassMesh);

  // Side Windows (Left & Right)
  const sideWindowGeo = new THREE.BoxGeometry(0.02, cabinHeight * 0.7, cabinLength * 0.85);
  const leftWindow = new THREE.Mesh(sideWindowGeo, glassMat);
  leftWindow.position.set(-cabinWidth * 0.46, 0.65 + cabinHeight * 0.4 + groundOffset, -0.1);
  bodyGroup.add(leftWindow);

  const rightWindow = new THREE.Mesh(sideWindowGeo, glassMat);
  rightWindow.position.set(cabinWidth * 0.46, 0.65 + cabinHeight * 0.4 + groundOffset, -0.1);
  bodyGroup.add(rightWindow);

  // A-Pillars, B-Pillars, C-Pillars (Carbon/Black)
  const pillarMat = activeRoof.material === 'carbon-weave' ? carbonMat : blackTrimMat;
  const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, cabinHeight * 1.1, 8);
  
  const leftAPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftAPillar.rotation.x = -0.55;
  leftAPillar.position.set(-cabinWidth * 0.44, 0.65 + cabinHeight * 0.5 + groundOffset, 0.55);
  bodyGroup.add(leftAPillar);

  const rightAPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightAPillar.rotation.x = -0.55;
  rightAPillar.position.set(cabinWidth * 0.44, 0.65 + cabinHeight * 0.5 + groundOffset, 0.55);
  bodyGroup.add(rightAPillar);

  // ----------------------------------------------------
  // 3. BUTTERFLY / GULLWING DOORS (ANIMATED)
  // ----------------------------------------------------
  // Left Door Panel
  const doorGeo = new THREE.BoxGeometry(0.12, 0.48 * heightScale, 1.3);
  const leftDoorPanel = new THREE.Mesh(doorGeo, paintMat);
  leftDoorPanel.position.set(0, 0, 0); // Relative to door hinge
  leftDoorPanel.castShadow = true;
  leftDoorGroup.add(leftDoorPanel);

  // Left Door Mirror
  const mirrorGeo = new THREE.BoxGeometry(0.24, 0.1, 0.12);
  const leftMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  leftMirror.position.set(-0.15, 0.2, 0.4);
  leftDoorGroup.add(leftMirror);

  // Right Door Panel
  const rightDoorPanel = new THREE.Mesh(doorGeo, paintMat);
  rightDoorPanel.position.set(0, 0, 0);
  rightDoorPanel.castShadow = true;
  rightDoorGroup.add(rightDoorPanel);

  // Right Door Mirror
  const rightMirror = new THREE.Mesh(mirrorGeo, carbonMat);
  rightMirror.position.set(0.15, 0.2, 0.4);
  rightDoorGroup.add(rightMirror);

  // Initial door position/rotation
  if (config.doorsOpen) {
    leftDoorGroup.rotation.z = -0.85;
    leftDoorGroup.rotation.y = -0.4;
    leftDoorGroup.position.y = 0.75 + groundOffset;

    rightDoorGroup.rotation.z = 0.85;
    rightDoorGroup.rotation.y = 0.4;
    rightDoorGroup.position.y = 0.75 + groundOffset;
  } else {
    leftDoorGroup.rotation.set(0, 0, 0);
    leftDoorGroup.position.set(-0.96, 0.45 + groundOffset, 0.1);

    rightDoorGroup.rotation.set(0, 0, 0);
    rightDoorGroup.position.set(0.96, 0.45 + groundOffset, 0.1);
  }

  // ----------------------------------------------------
  // 4. INTERIOR COCKPIT (Visible through glass / open doors)
  // ----------------------------------------------------
  const interiorGroup = new THREE.Group();
  interiorGroup.name = 'CockpitInterior';
  interiorGroup.position.set(0, 0.38 + groundOffset, -0.1);
  bodyGroup.add(interiorGroup);

  // Dashboard Floor & Center Console
  const dashFloorGeo = new THREE.BoxGeometry(cabinWidth * 0.85, 0.1, cabinLength * 0.9);
  const dashFloor = new THREE.Mesh(dashFloorGeo, interiorLeatherMat);
  interiorGroup.add(dashFloor);

  // Dashboard Main Instrument Binnacle
  const dashGeo = new THREE.BoxGeometry(cabinWidth * 0.82, 0.25, 0.45);
  const dashMesh = new THREE.Mesh(dashGeo, blackTrimMat);
  dashMesh.position.set(0, 0.25, 0.65);
  interiorGroup.add(dashMesh);

  // Digital Gauge OLED Screens
  const screenGeo = new THREE.PlaneGeometry(0.45, 0.16);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const driverScreen = new THREE.Mesh(screenGeo, screenMat);
  driverScreen.position.set(-0.35, 0.35, 0.46);
  driverScreen.rotation.x = -0.2;
  interiorGroup.add(driverScreen);

  const centerScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.25), screenMat);
  centerScreen.position.set(0.05, 0.28, 0.48);
  centerScreen.rotation.x = -0.15;
  interiorGroup.add(centerScreen);

  // Sport Yoke / Steering Wheel
  const wheelTorusGeo = new THREE.TorusGeometry(0.14, 0.025, 12, 24);
  const steerWheel = new THREE.Mesh(wheelTorusGeo, carbonMat);
  steerWheel.position.set(-0.35, 0.32, 0.32);
  steerWheel.rotation.x = 0.35;
  interiorGroup.add(steerWheel);

  // Sport Bucket Seats (Driver & Passenger)
  const seatGeo = new THREE.BoxGeometry(0.42, 0.6, 0.48);
  const leftSeat = new THREE.Mesh(seatGeo, interiorLeatherMat);
  leftSeat.position.set(-0.38, 0.28, -0.15);
  interiorGroup.add(leftSeat);

  const leftSeatHeadrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), interiorAccentMat);
  leftSeatHeadrest.position.set(-0.38, 0.65, -0.15);
  interiorGroup.add(leftSeatHeadrest);

  const rightSeat = new THREE.Mesh(seatGeo, interiorLeatherMat);
  rightSeat.position.set(0.38, 0.28, -0.15);
  interiorGroup.add(rightSeat);

  const rightSeatHeadrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.15), interiorAccentMat);
  rightSeatHeadrest.position.set(0.38, 0.65, -0.15);
  interiorGroup.add(rightSeatHeadrest);

  // Ambient Lighting Strip across Dashboard
  const ambientStripGeo = new THREE.BoxGeometry(cabinWidth * 0.8, 0.02, 0.02);
  const ambientStrip = new THREE.Mesh(ambientStripGeo, ambientLedMat);
  ambientStrip.position.set(0, 0.32, 0.48);
  interiorGroup.add(ambientStrip);

  // ----------------------------------------------------
  // 5. LIGHTING: HEADLIGHTS & TAILLIGHTS
  // ----------------------------------------------------
  // Matrix LED Headlights (Left & Right)
  const headlightGeo = new THREE.BoxGeometry(0.35, 0.08, 0.15);
  const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
  leftHeadlight.position.set(-bodyWidth * 0.36, 0.48 + groundOffset, bodyLength * 0.47);
  leftHeadlight.rotation.y = 0.2;
  bodyGroup.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
  rightHeadlight.position.set(bodyWidth * 0.36, 0.48 + groundOffset, bodyLength * 0.47);
  rightHeadlight.rotation.y = -0.2;
  bodyGroup.add(rightHeadlight);

  // Headlight Light Cones when ON
  if (config.headlightsOn) {
    const leftSpot = new THREE.SpotLight(0xe0f2fe, 3.5, 18, Math.PI / 6, 0.4, 1.2);
    leftSpot.position.set(-bodyWidth * 0.36, 0.48 + groundOffset, bodyLength * 0.48);
    leftSpot.target.position.set(-bodyWidth * 0.36, 0, bodyLength * 0.48 + 10);
    bodyGroup.add(leftSpot);
    bodyGroup.add(leftSpot.target);

    const rightSpot = new THREE.SpotLight(0xe0f2fe, 3.5, 18, Math.PI / 6, 0.4, 1.2);
    rightSpot.position.set(bodyWidth * 0.36, 0.48 + groundOffset, bodyLength * 0.48);
    rightSpot.target.position.set(bodyWidth * 0.36, 0, bodyLength * 0.48 + 10);
    bodyGroup.add(rightSpot);
    bodyGroup.add(rightSpot.target);
  }

  // Full-Width Rear Taillight OLED Bar
  const rearBarGeo = new THREE.BoxGeometry(bodyWidth * 0.9, 0.06, 0.08);
  const rearTaillight = new THREE.Mesh(rearBarGeo, taillightMat);
  rearTaillight.position.set(0, 0.62 + groundOffset, -bodyLength * 0.48);
  bodyGroup.add(rearTaillight);

  // Rear Aerodynamic Diffuser Fins
  const diffuserGeo = new THREE.BoxGeometry(bodyWidth * 0.85, 0.18, 0.45);
  const diffuserMesh = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuserMesh.position.set(0, 0.22 + groundOffset, -bodyLength * 0.46);
  bodyGroup.add(diffuserMesh);

  // ----------------------------------------------------
  // 6. ACTIVE SPOILER / AERO WING
  // ----------------------------------------------------
  const activeAero = model.availableAero.find(a => a.id === config.aeroPackageId) || model.availableAero[0];
  const isWingActive = config.activeSpoilerDeployed || activeAero.type === 'carbon-track' || activeAero.type === 'active-wing';

  if (activeAero.type !== 'integrated') {
    const wingWidth = bodyWidth * 0.88;
    const wingGeo = new THREE.BoxGeometry(wingWidth, 0.04, 0.32);
    const wingMesh = new THREE.Mesh(wingGeo, carbonMat);
    wingMesh.castShadow = true;

    // Upright struts
    const strutGeo = new THREE.BoxGeometry(0.04, isWingActive ? 0.32 : 0.15, 0.12);
    const leftStrut = new THREE.Mesh(strutGeo, carbonMat);
    leftStrut.position.set(-wingWidth * 0.35, isWingActive ? -0.15 : -0.07, 0);

    const rightStrut = new THREE.Mesh(strutGeo, carbonMat);
    rightStrut.position.set(wingWidth * 0.35, isWingActive ? -0.15 : -0.07, 0);

    // Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.02, 0.18, 0.38);
    const leftEndplate = new THREE.Mesh(endplateGeo, carbonMat);
    leftEndplate.position.set(-wingWidth * 0.5, 0, 0);

    const rightEndplate = new THREE.Mesh(endplateGeo, carbonMat);
    rightEndplate.position.set(wingWidth * 0.5, 0, 0);

    spoilerGroup.add(wingMesh);
    spoilerGroup.add(leftStrut);
    spoilerGroup.add(rightStrut);
    spoilerGroup.add(leftEndplate);
    spoilerGroup.add(rightEndplate);

    spoilerGroup.position.set(
      0,
      (isWingActive ? 0.95 : 0.72) + groundOffset,
      -bodyLength * 0.44
    );
    spoilerGroup.rotation.x = isWingActive ? -0.12 : 0;
  }

  // ----------------------------------------------------
  // 7. WHEELS & BRAKE ASSEMBLIES (4 CORNERS)
  // ----------------------------------------------------
  const wheelRadius = isSuv ? 0.44 : 0.38;
  const wheelWidth = 0.28;
  const trackWidth = bodyWidth * 0.5 + 0.04;
  const wheelBase = bodyLength * 0.34;

  const wheelPositions = [
    { name: 'FrontLeft', x: -trackWidth, y: wheelRadius, z: wheelBase },
    { name: 'FrontRight', x: trackWidth, y: wheelRadius, z: wheelBase },
    { name: 'RearLeft', x: -trackWidth, y: wheelRadius, z: -wheelBase },
    { name: 'RearRight', x: trackWidth, y: wheelRadius, z: -wheelBase },
  ];

  wheelPositions.forEach((pos, idx) => {
    const isLeft = pos.x < 0;
    const wheelGroup = new THREE.Group();
    wheelGroup.name = `Wheel_${pos.name}`;
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Tire
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.rotation.z = Math.PI / 2;
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Rim Outer Lip / Barrel
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.82, wheelRadius * 0.82, wheelWidth * 0.95, 28);
    const rimMesh = new THREE.Mesh(rimGeo, wheelFinishMat);
    rimMesh.rotation.z = Math.PI / 2;
    wheelGroup.add(rimMesh);

    // Wheel Spokes based on wheel style
    const spokeCount = activeWheel.spokeCount || 10;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i * (Math.PI * 2)) / spokeCount;
      const spokeLength = wheelRadius * 0.72;
      const spokeGeo = new THREE.BoxGeometry(0.04, spokeLength, 0.03);
      const spokeMesh = new THREE.Mesh(spokeGeo, wheelFinishMat);
      spokeMesh.position.set(
        isLeft ? -wheelWidth * 0.42 : wheelWidth * 0.42,
        Math.sin(angle) * (spokeLength * 0.48),
        Math.cos(angle) * (spokeLength * 0.48)
      );
      spokeMesh.rotation.x = -angle;
      wheelGroup.add(spokeMesh);
    }

    // Center Hub Cap with Aether logo badge
    const hubGeo = new THREE.CylinderGeometry(0.08, 0.08, wheelWidth * 1.02, 16);
    const hubMesh = new THREE.Mesh(hubGeo, chromeMat);
    hubMesh.rotation.z = Math.PI / 2;
    wheelGroup.add(hubMesh);

    // Brake Rotor (Drilled Steel / Ceramic)
    const rotorGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, 0.03, 24);
    const rotorMesh = new THREE.Mesh(rotorGeo, rotorMat);
    rotorMesh.rotation.z = Math.PI / 2;
    rotorMesh.position.set(isLeft ? 0.05 : -0.05, 0, 0);
    wheelGroup.add(rotorMesh);

    // High-Performance Multi-Piston Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.1, 0.22, 0.16);
    const caliperMesh = new THREE.Mesh(caliperGeo, caliperMat);
    caliperMesh.position.set(isLeft ? 0.05 : -0.05, wheelRadius * 0.38, 0);
    wheelGroup.add(caliperMesh);

    rootGroup.add(wheelGroup);
    wheelGroups.push(wheelGroup);
  });

  // ----------------------------------------------------
  // 8. CHASSIS / X-RAY POWERTRAIN MODE COMPONENTS
  // ----------------------------------------------------
  const chassisGroup = new THREE.Group();
  chassisGroup.name = 'ChassisXRay';

  // Battery Pack (Underfloor)
  const batteryGeo = new THREE.BoxGeometry(bodyWidth * 0.78, 0.14, bodyLength * 0.58);
  const batteryMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: config.xRayMode ? 0.8 : 0.1,
    wireframe: config.xRayMode,
  });
  const batteryMesh = new THREE.Mesh(batteryGeo, batteryMat);
  batteryMesh.position.set(0, 0.25 + groundOffset, 0);
  chassisGroup.add(batteryMesh);
  chassisMeshes.push(batteryMesh);

  // Front Electric Drive Unit
  const frontMotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 16);
  const motorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: config.xRayMode ? 1.0 : 0.2,
    wireframe: config.xRayMode,
  });
  const frontMotor = new THREE.Mesh(frontMotorGeo, motorMat);
  frontMotor.rotation.z = Math.PI / 2;
  frontMotor.position.set(0, 0.38 + groundOffset, wheelBase);
  chassisGroup.add(frontMotor);
  chassisMeshes.push(frontMotor);

  // Rear Twin-Motor Torque Vectoring Unit
  const rearMotorGeo = new THREE.BoxGeometry(0.85, 0.32, 0.38);
  const rearMotor = new THREE.Mesh(rearMotorGeo, motorMat);
  rearMotor.position.set(0, 0.38 + groundOffset, -wheelBase);
  chassisGroup.add(rearMotor);
  chassisMeshes.push(rearMotor);

  rootGroup.add(chassisGroup);

  // If X-Ray mode is activated, turn body transparent wireframe
  if (config.xRayMode) {
    paintMat.wireframe = true;
    paintMat.transparent = true;
    paintMat.opacity = 0.3;
    glassMat.opacity = 0.1;
  }

  // ----------------------------------------------------
  // 9. HOTSPOT 3D WORLD COORDINATES
  // ----------------------------------------------------
  const hotspotPositions = {
    aeroWing: new THREE.Vector3(0, 1.05 + groundOffset, -bodyLength * 0.44),
    brakes: new THREE.Vector3(-trackWidth - 0.1, wheelRadius, wheelBase),
    powertrain: new THREE.Vector3(0, 0.5 + groundOffset, -0.2),
    cockpit: new THREE.Vector3(0, 0.95 + groundOffset, 0.1),
    chargePort: new THREE.Vector3(-bodyWidth * 0.5 - 0.05, 0.6 + groundOffset, -bodyLength * 0.3),
  };

  return {
    rootGroup,
    bodyGroup,
    leftDoorGroup,
    rightDoorGroup,
    spoilerGroup,
    wheelGroups,
    bodyMaterials,
    caliperMaterials,
    wheelMaterials,
    interiorMaterials,
    ambientLightMaterials,
    glassMaterials,
    headlightMaterials,
    taillightMaterials,
    chassisMeshes,
    hotspotPositions,
  };
}
