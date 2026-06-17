import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ASSET_BASE = '/first-screen/';

const ENTER_X = 16;
const CART_TARGET_SIZE = 3;
const FOOD_FORWARD = 0.55;
const FOOD_Y = 1.65;

const T_ENTER = 1.3;
const T_DROP = 1.7;
const T_ORBIT = 1.5;
const T_DRIVE = 1.4;

const A_END = T_ENTER;
const B_END = A_END + T_DROP;
const C_END = B_END + T_ORBIT;
const D_END = C_END + T_DRIVE;

const TYPING_SPEED = 150;

export interface IntroDomRefs {
  canvas: HTMLCanvasElement;
  screenRoot: HTMLElement;
  startScreen: HTMLElement;
  wipeLeft: HTMLElement;
  wipeRight: HTMLElement;
  endScreen: HTMLElement;
  endText: HTMLElement;
}

export interface IntroAnimationCallbacks {
  onReady: () => void;
  onExitReady: () => void;
}

export function initIntroAnimation(
  dom: IntroDomRefs,
  callbacks: IntroAnimationCallbacks,
): () => void {
  const { canvas, screenRoot, startScreen, wipeLeft, wipeRight, endScreen, endText } = dom;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a12);
  scene.fog = new THREE.FogExp2(0x0a0a12, 0.035);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    300,
  );

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 10, 5);
  sun.castShadow = true;
  scene.add(sun);

  const rimLight = new THREE.DirectionalLight(0x6688ff, 0.8);
  rimLight.position.set(-5, 3, -5);
  scene.add(rimLight);

  const endLight = new THREE.PointLight(0xffffff, 0, 120);
  endLight.position.set(-50, 4, 0);
  scene.add(endLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 60),
    new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const streaks: THREE.Mesh[] = [];
  const STREAK_MIN_X = -40;
  const STREAK_MAX_X = 40;
  const streakGeo = new THREE.BoxGeometry(2.2, 0.02, 0.12);
  const streakMat = new THREE.MeshStandardMaterial({
    color: 0x222230,
    emissive: 0x3344aa,
    emissiveIntensity: 0.6,
    roughness: 0.5,
  });

  for (let i = 0; i < 40; i++) {
    const s = new THREE.Mesh(streakGeo, streakMat);
    s.position.set(
      THREE.MathUtils.lerp(STREAK_MIN_X, STREAK_MAX_X, i / 40),
      0.02,
      THREE.MathUtils.randFloat(-7, 7),
    );
    scene.add(s);
    streaks.push(s);
  }

  const CAM = {
    side: { pos: new THREE.Vector3(2.5, 2.8, -8.5), look: new THREE.Vector3(0, 1.4, 0) },
    basket: { pos: new THREE.Vector3(-3.2, 5.6, -3.0), look: new THREE.Vector3(0, 1.7, 0) },
    behind: { pos: new THREE.Vector3(7.2, 2.9, 0.0), look: new THREE.Vector3(0, 1.7, 0) },
  };

  let cartGroup: THREE.Group | null = null;
  let cartBaseY = 0;

  const items: THREE.Object3D[] = [];
  const loader = new GLTFLoader();

  function registerItem(
    obj: THREE.Object3D,
    opts: {
      offsetX?: number;
      offsetZ?: number;
      landY?: number;
      spinX?: number;
      spinZ?: number;
      startDelay?: number;
    } = {},
  ) {
    obj.visible = false;
    obj.userData.offsetX = opts.offsetX ?? 0;
    obj.userData.offsetZ = opts.offsetZ ?? 0;
    obj.userData.landY = opts.landY ?? FOOD_Y;
    obj.userData.spinX = opts.spinX ?? Math.random() * 2 + 1;
    obj.userData.spinZ = opts.spinZ ?? Math.random() * 1.5;
    obj.userData.startDelay = opts.startDelay ?? Math.random() * 0.35;
    obj.userData.vy = 0;
    obj.userData.launched = false;
    obj.userData.landed = false;
    items.push(obj);
    scene.add(obj);
  }

  function createSimpleFoods() {
    const configs = [
      { geo: new THREE.SphereGeometry(0.22, 10, 10), color: 0xff4444, offsetX: -0.2, offsetZ: -0.3 },
      { geo: new THREE.SphereGeometry(0.18, 10, 10), color: 0xffcc00, offsetX: 0.55, offsetZ: 0.35 },
      { geo: new THREE.BoxGeometry(0.28, 0.35, 0.28), color: 0x44aa44, offsetX: 0.7, offsetZ: -0.2 },
      { geo: new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12), color: 0xff8800, offsetX: -0.55, offsetZ: 0.25 },
      { geo: new THREE.BoxGeometry(0.4, 0.2, 0.25), color: 0xddaa55, offsetX: 0.05, offsetZ: 0.42 },
    ];

    configs.forEach((cfg) => {
      const mesh = new THREE.Mesh(
        cfg.geo,
        new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.6 }),
      );
      mesh.castShadow = true;
      registerItem(mesh, {
        offsetX: cfg.offsetX,
        offsetZ: cfg.offsetZ,
        landY: FOOD_Y + Math.random() * 0.25,
      });
    });
  }

  function prepModel(model: THREE.Object3D, targetSize: number, rot?: { x?: number; y?: number; z?: number }) {
    if (rot) model.rotation.set(rot.x || 0, rot.y || 0, rot.z || 0);

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const s = targetSize / Math.max(size.x, size.y, size.z);
    model.position.sub(center);

    const wrapper = new THREE.Group();
    wrapper.add(model);
    wrapper.scale.setScalar(s);
    wrapper.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    return wrapper;
  }

  createSimpleFoods();

  loader.load(`${ASSET_BASE}shopping_cart.glb`, (gltf) => {
    cartGroup = gltf.scene;

    const box = new THREE.Box3().setFromObject(cartGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = CART_TARGET_SIZE / Math.max(size.x, size.y, size.z);
    cartGroup.scale.setScalar(scale);

    const center = new THREE.Vector3();
    box.getCenter(center);
    cartGroup.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    cartBaseY = cartGroup.position.y;

    cartGroup.traverse((c) => {
      if ((c as THREE.Mesh).isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    cartGroup.rotation.y = -Math.PI / 2;
    cartGroup.position.x += ENTER_X;
    scene.add(cartGroup);

    camera.position.copy(CAM.side.pos);
    camera.lookAt(CAM.side.look);
    ready = true;
    startScreen.classList.add('ready');
    callbacks.onReady();
  });

  loader.load(`${ASSET_BASE}milk.glb`, (gltf) => {
    registerItem(prepModel(gltf.scene, 0.95, { x: -Math.PI / 2 }), {
      offsetX: -0.15,
      offsetZ: -0.25,
      landY: FOOD_Y + 0.25,
      spinX: 0.6,
      spinZ: 0.3,
    });
  });

  loader.load(`${ASSET_BASE}dandys_world_eggs.glb`, (gltf) => {
    registerItem(prepModel(gltf.scene, 0.9), {
      offsetX: 0.25,
      offsetZ: 0.25,
      landY: FOOD_Y + 0.1,
      spinX: 0.5,
      spinZ: 0.4,
    });
  });

  let ready = false;
  let started = false;
  let endTextStarted = false;
  let exitReady = false;
  let elapsed = 0;

  const clock = new THREE.Clock();
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  let frameId = 0;

  function easeInOut(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function applyCam(
    a: { pos: THREE.Vector3; look: THREE.Vector3 },
    b: { pos: THREE.Vector3; look: THREE.Vector3 },
    t: number,
  ) {
    const e = easeInOut(THREE.MathUtils.clamp(t, 0, 1));
    tmpPos.lerpVectors(a.pos, b.pos, e);
    tmpLook.lerpVectors(a.look, b.look, e);
    camera.position.copy(tmpPos);
    camera.lookAt(tmpLook);
  }

  function setCinematicMode(mode: 'idle' | 'playing' | 'drive') {
    screenRoot.classList.remove('intro-screen--playing', 'intro-screen--drive');
    if (mode === 'playing') screenRoot.classList.add('intro-screen--playing');
    if (mode === 'drive') {
      screenRoot.classList.add('intro-screen--playing', 'intro-screen--drive');
    }
  }

  function setWipe(vw: number) {
    const w = `${vw.toFixed(2)}vw`;
    const glow = vw > 0.01 ? '0 0 60px 20px rgba(255, 255, 255, 0.6)' : 'none';
    wipeLeft.style.width = w;
    wipeLeft.style.boxShadow = glow;
    wipeRight.style.width = w;
    wipeRight.style.boxShadow = glow;
  }

  function startEndText() {
    if (endTextStarted) return;
    endTextStarted = true;
    setCinematicMode('idle');
    endScreen.classList.add('show');

    const brand = 'ZLAGODA';
    let charIdx = 0;

    const typeBrand = () => {
      charIdx += 1;
      endText.textContent = brand.slice(0, charIdx);
      if (charIdx < brand.length) {
        window.setTimeout(typeBrand, TYPING_SPEED);
      } else {
        window.setTimeout(showExitHint, 600);
      }
    };

    const showExitHint = () => {
      endText.textContent = brand;
      exitReady = true;
      callbacks.onExitReady();
    };

    window.setTimeout(typeBrand, 300);
  }

  function beginIntro() {
    if (!ready || started) return;
    started = true;
    setCinematicMode('playing');
    startScreen.classList.add('hidden');
    elapsed = 0;
    endLight.intensity = 0;
    setWipe(0);
    endTextStarted = false;
    exitReady = false;
    endScreen.classList.remove('show');
    endText.textContent = '';

    items.forEach((it) => {
      it.visible = false;
      it.userData.launched = false;
      it.userData.landed = false;
      it.userData.vy = 0;
    });

    camera.position.copy(CAM.side.pos);
    camera.lookAt(CAM.side.look);
    clock.start();
  }

  function launchItem(it: THREE.Object3D, cartX: number) {
    it.position.set(
      cartX - FOOD_FORWARD + it.userData.offsetX,
      9 + Math.random() * 2,
      it.userData.offsetZ,
    );
    it.visible = true;
    it.userData.launched = true;
    it.userData.vy = 0;
  }

  function updateFalling(dt: number, cartX: number) {
    items.forEach((it) => {
      if (!it.userData.launched) return;
      if (it.userData.landed) {
        it.position.x = cartX - FOOD_FORWARD + it.userData.offsetX;
        return;
      }
      it.userData.vy += 22 * dt;
      it.position.y -= it.userData.vy * dt;
      it.rotation.x += it.userData.spinX * dt;
      it.rotation.z += it.userData.spinZ * dt;
      if (it.position.y <= it.userData.landY) {
        it.position.y = it.userData.landY;
        it.userData.landed = true;
      }
    });
  }

  function driveSpeed() {
    if (elapsed < A_END) return 26;
    if (elapsed < C_END) return 9;
    return 60;
  }

  function updateStreaks(dt: number) {
    const sp = driveSpeed() * dt;
    for (const s of streaks) {
      s.position.x -= sp;
      if (s.position.x < STREAK_MIN_X) {
        s.position.x += STREAK_MAX_X - STREAK_MIN_X;
        s.position.z = THREE.MathUtils.randFloat(-7, 7);
      }
    }
  }

  function animate() {
    frameId = requestAnimationFrame(animate);

    if (!cartGroup || !started) {
      renderer.render(scene, camera);
      return;
    }

    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    updateStreaks(dt);

    const bob = Math.sin(elapsed * 13) * 0.045;
    const sway = Math.sin(elapsed * 9) * 0.012;
    cartGroup.position.y = cartBaseY + Math.abs(bob);
    cartGroup.rotation.z = sway;

    if (elapsed < A_END) {
      const t = easeInOut(elapsed / T_ENTER);
      cartGroup.position.x = ENTER_X * (1 - t);
      camera.position.copy(CAM.side.pos);
      camera.lookAt(CAM.side.look);
    } else if (elapsed < B_END) {
      const local = elapsed - A_END;
      cartGroup.position.x = 0;
      items.forEach((it) => {
        if (!it.userData.launched && local >= it.userData.startDelay) {
          launchItem(it, cartGroup!.position.x);
        }
      });
      updateFalling(dt, cartGroup.position.x);
      applyCam(CAM.side, CAM.basket, local / T_DROP);
    } else if (elapsed < C_END) {
      const t = (elapsed - B_END) / T_ORBIT;
      cartGroup.position.x = 0;
      updateFalling(dt, cartGroup.position.x);
      applyCam(CAM.basket, CAM.behind, t);
    } else if (elapsed < D_END) {
      const t = (elapsed - C_END) / T_DRIVE;
      const ease = easeInOut(t);
      setCinematicMode('drive');
      cartGroup.position.x = -ease * 45;
      updateFalling(dt, cartGroup.position.x);
      endLight.intensity = ease * 18;
      camera.position.copy(CAM.behind.pos);
      camera.lookAt(CAM.behind.look);
      const wipeT = easeInOut(Math.max(0, (t - 0.35) / 0.65));
      setWipe(wipeT * 50);
    } else {
      setWipe(50);
      startEndText();
    }

    renderer.render(scene, camera);
  }

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  const onPointerDown = () => {
    if (exitReady) return;
    beginIntro();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!exitReady) beginIntro();
    }
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('keydown', onKeyDown);
    renderer.dispose();
    streakGeo.dispose();
    streakMat.dispose();
  };
}
