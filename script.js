const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!reduceMotion) {
  document.documentElement.classList.add('motion-ready');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((node) => revealObserver.observe(node));
}

const journey = document.querySelector('#opening-journey');
const depthLayer = document.querySelector('#scroll-depth-layer');
const depthHost = document.querySelector('#scroll-depth-webgl');
const saveData = Boolean(navigator.connection?.saveData);
const allowWebGL = journey && depthLayer && depthHost && !reduceMotion && window.innerWidth >= 900 && !saveData;

if (allowWebGL) {
  const startDepth = () => {
    initScrollDepth().catch(() => {
      // Static CSS facets remain as the complete fallback if WebGL cannot initialize.
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(startDepth, { timeout: 1200 });
  } else {
    window.setTimeout(startDepth, 320);
  }
}

async function initScrollDepth() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/+esm');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10.9);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  depthHost.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfffbf6, 0x8b6d67, 1.85));
  const key = new THREE.DirectionalLight(0xfff4e8, 2.15);
  key.position.set(4.5, 6, 8);
  scene.add(key);

  const group = new THREE.Group();
  group.position.set(.55, .05, 0);
  scene.add(group);

  const definitions = [
    {
      points: [[.3, 3.15, -1.1], [5.7, 2.8, -.75], [4.15, .55, -.12], [1.15, 1.05, .08]],
      color: 0xe7c6cf,
      opacity: .25,
      base: [.35, .18, 0],
      separate: [-.95, .38, .72],
      guide: [-.32, -.48, .18],
      settle: [.78, .03, -.54],
      rotation: [-.02, -.045, -.035],
      turn: [.025, -.035, -.055]
    },
    {
      points: [[-5.2, -1.45, -1.35], [-1.35, -.75, -.52], [.2, -3.25, -.72], [-4.35, -3.35, -1.22]],
      color: 0xc8a27c,
      opacity: .13,
      base: [-.15, -.15, 0],
      separate: [.52, -.58, .5],
      guide: [.72, -.22, .22],
      settle: [-.52, .45, -.46],
      rotation: [.025, .02, .035],
      turn: [-.03, .025, .045]
    },
    {
      points: [[2.35, .85, -.68], [5.95, .25, -1.08], [5.05, -2.65, -.48], [1.8, -1.62, .06]],
      color: 0xf0dfd5,
      opacity: .22,
      base: [.1, .05, 0],
      separate: [.7, -.18, .62],
      guide: [-.55, -.5, .22],
      settle: [-.3, .55, -.58],
      rotation: [-.018, .04, .045],
      turn: [.035, -.025, -.05]
    },
    {
      points: [[-3.85, 2.55, -1.55], [-.35, 3.02, -1.12], [-.9, 1.28, -.72], [-4.55, .92, -1.38]],
      color: 0xf6eee6,
      opacity: .12,
      base: [-.25, .12, 0],
      separate: [.65, .18, .42],
      guide: [.18, -.62, .16],
      settle: [-.58, .36, -.38],
      rotation: [.018, -.025, -.025],
      turn: [-.025, .03, .038]
    }
  ];

  const facets = definitions.map((definition) => {
    const mesh = createFacet(THREE, definition.points, definition.color, definition.opacity);
    mesh.position.set(...definition.base);
    mesh.rotation.set(...definition.rotation);
    mesh.userData = {
      base: new THREE.Vector3(...definition.base),
      separate: new THREE.Vector3(...definition.separate),
      guide: new THREE.Vector3(...definition.guide),
      settle: new THREE.Vector3(...definition.settle),
      rotation: new THREE.Vector3(...definition.rotation),
      turn: new THREE.Vector3(...definition.turn),
      opacity: definition.opacity
    };
    group.add(mesh);
    return mesh;
  });

  function resizeRenderer() {
    const rect = depthHost.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let inView = false;
  let targetProgress = 0;
  let progress = 0;
  let scrollDirty = true;
  let raf = 0;

  function measureProgress() {
    const rect = journey.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight, 1);
    const headerOffset = 70;
    const travel = Math.max(viewportHeight * .8, rect.height - viewportHeight * .68);
    targetProgress = clamp((headerOffset - rect.top) / travel, 0, 1);

    const visuallyActive = inView && targetProgress < .995;
    depthLayer.classList.toggle('is-active', visuallyActive);
  }

  function requestFrame() {
    if (!raf && !document.hidden) raf = window.requestAnimationFrame(render);
  }

  function markScrollDirty() {
    scrollDirty = true;
    requestFrame();
  }

  const journeyObserver = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting);
    scrollDirty = true;
    if (!inView) depthLayer.classList.remove('is-active');
    requestFrame();
  }, { threshold: 0, rootMargin: '16% 0px 12% 0px' });
  journeyObserver.observe(journey);

  window.addEventListener('scroll', markScrollDirty, { passive: true });
  window.addEventListener('resize', () => {
    resizeRenderer();
    markScrollDirty();
  }, { passive: true });

  if (finePointer) {
    journey.addEventListener('pointermove', (event) => {
      if (!inView) return;
      pointer.tx = (event.clientX / Math.max(window.innerWidth, 1) - .5) * 2;
      pointer.ty = (event.clientY / Math.max(window.innerHeight, 1) - .5) * 2;
      requestFrame();
    }, { passive: true });

    journey.addEventListener('pointerleave', () => {
      pointer.tx = 0;
      pointer.ty = 0;
      requestFrame();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    scrollDirty = true;
    requestFrame();
  });

  function render() {
    raf = 0;

    if (scrollDirty) {
      measureProgress();
      scrollDirty = false;
    }

    if (!inView && (targetProgress <= .001 || targetProgress >= .999)) {
      progress = targetProgress;
    } else {
      progress += (targetProgress - progress) * .105;
    }

    pointer.x += (pointer.tx - pointer.x) * .09;
    pointer.y += (pointer.ty - pointer.y) * .09;

    applyScene(progress, pointer.x, pointer.y);
    renderer.render(scene, camera);

    const progressMoving = Math.abs(targetProgress - progress) > .0007;
    const pointerMoving = Math.abs(pointer.tx - pointer.x) > .001 || Math.abs(pointer.ty - pointer.y) > .001;
    if (!document.hidden && (progressMoving || pointerMoving || scrollDirty)) {
      raf = window.requestAnimationFrame(render);
    }
  }

  function applyScene(value, pointerX, pointerY) {
    const separate = smoothRange(value, .12, .43);
    const guide = smoothRange(value, .36, .70);
    const settle = smoothRange(value, .68, .92);
    const rest = smoothRange(value, .86, 1);
    const pointerWeight = 1 - smoothRange(value, .58, .84);

    camera.position.z = 10.9 - separate * .34 + settle * .18;
    camera.position.y = guide * .11 - settle * .06;

    group.rotation.y = pointerX * .012 * pointerWeight + separate * .012 - settle * .009;
    group.rotation.x = -pointerY * .008 * pointerWeight;
    group.position.x = .55 + pointerX * .028 * pointerWeight;
    group.position.y = .05 - pointerY * .022 * pointerWeight - guide * .08 + settle * .06;

    facets.forEach((mesh, index) => {
      const data = mesh.userData;
      mesh.position.x = data.base.x + data.separate.x * separate + data.guide.x * guide + data.settle.x * settle;
      mesh.position.y = data.base.y + data.separate.y * separate + data.guide.y * guide + data.settle.y * settle;
      mesh.position.z = data.base.z + data.separate.z * separate + data.guide.z * guide + data.settle.z * settle;

      const direction = index % 2 === 0 ? 1 : -1;
      mesh.rotation.x = data.rotation.x + data.turn.x * separate - data.turn.x * settle * .55 + pointerY * .006 * direction * pointerWeight;
      mesh.rotation.y = data.rotation.y + data.turn.y * guide - data.turn.y * settle * .6 + pointerX * .007 * -direction * pointerWeight;
      mesh.rotation.z = data.rotation.z + data.turn.z * separate - data.turn.z * settle * .68;
      mesh.material.opacity = data.opacity * (1 - rest * .94);
    });

    journey.style.setProperty('--hero-scroll', smoothRange(value, .02, .38).toFixed(4));
  }

  resizeRenderer();
  measureProgress();
  applyScene(0, 0, 0);
  renderer.render(scene, camera);
  journey.classList.add('webgl-ready');
  requestFrame();
}

function createFacet(THREE, points, color, opacity) {
  const vertices = [];
  const p = points.map((value) => new THREE.Vector3(...value));
  vertices.push(
    ...p[0].toArray(), ...p[1].toArray(), ...p[2].toArray(),
    ...p[0].toArray(), ...p[2].toArray(), ...p[3].toArray()
  );

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color,
    roughness: .97,
    metalness: 0,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
}

function smoothRange(value, start, end) {
  const t = clamp((value - start) / Math.max(end - start, .0001), 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
