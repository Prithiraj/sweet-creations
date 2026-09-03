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

const stage = document.querySelector('#origami-stage');
const host = document.querySelector('#origami-webgl');
const allowWebGL = stage && host && !reduceMotion && window.innerWidth >= 760 && !navigator.connection?.saveData;

if (allowWebGL) {
  initOrigami().catch(() => {
    // CSS origami remains visible if Three.js or WebGL cannot initialize.
  });
}

async function initOrigami() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/+esm');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0, 10.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const group = new THREE.Group();
  group.position.x = 0.35;
  scene.add(group);

  scene.add(new THREE.HemisphereLight(0xfffaf4, 0x8d6f6a, 2.3));
  const key = new THREE.DirectionalLight(0xfff2e2, 3.2);
  key.position.set(4.5, 6.5, 8);
  scene.add(key);

  const colors = [0xe8c8cf, 0xf4e3d6, 0xdba8b5, 0xf8efe3, 0xc98d9e, 0xead0bd];
  const panels = [
    { pts: [[-4.7, 3.4, 0], [-0.5, 2.9, .25], [-2.2, .15, .65]], rot: [-.05, .18, -.14], start: [.11, -.03, -.18] },
    { pts: [[.2, 3.2, .2], [4.8, 2.5, 0], [4.05, -.35, .7], [1.45, .65, .9]], rot: [.02, -.12, .10], start: [-.05, .12, .13] },
    { pts: [[-4.6, -.4, .15], [-1.2, -1.0, .85], [-.4, -4.0, 0], [-4.0, -3.25, .1]], rot: [.1, .08, .07], start: [-.11, -.08, .12] },
    { pts: [[1.2, -.65, .85], [4.4, -.35, .38], [4.7, -3.4, .05], [.7, -3.8, .1]], rot: [-.06, -.08, -.05], start: [.09, .06, -.1] },
    { pts: [[-4.0, 2.9, -.8], [-2.1, 4.2, -.85], [.6, 3.1, -.6]], rot: [.05, .1, .07], start: [-.08, .04, .12] },
    { pts: [[2.8, 3.0, -.65], [5.0, 1.2, -.8], [4.3, -1.1, -.55]], rot: [-.04, -.08, .05], start: [.08, -.06, -.12] }
  ];

  const meshes = panels.map((panel, index) => {
    const geometry = polygonGeometry(THREE, panel.pts);
    const material = new THREE.MeshStandardMaterial({
      color: colors[index],
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(panel.rot[0] + panel.start[0], panel.rot[1] + panel.start[1], panel.rot[2] + panel.start[2]);
    mesh.userData.baseRotation = new THREE.Euler(...panel.rot);
    mesh.userData.entryOffset = new THREE.Vector3(...panel.start);
    group.add(mesh);

    mesh.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry, 18),
      new THREE.LineBasicMaterial({ color: 0x8f6a64, transparent: true, opacity: 0.18 })
    ));
    return mesh;
  });

  function resize() {
    const rect = host.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      pointer.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });
  }

  let active = true;
  let raf = 0;
  const startedAt = performance.now();
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    active = Boolean(entry?.isIntersecting) && !document.hidden;
    if (active && !raf) raf = requestAnimationFrame(render);
  }, { threshold: 0.02 });
  visibilityObserver.observe(stage);

  document.addEventListener('visibilitychange', () => {
    active = !document.hidden && stage.getBoundingClientRect().bottom > 0;
    if (active && !raf) raf = requestAnimationFrame(render);
  });

  function render(now) {
    raf = 0;
    if (!active) return;

    const entry = Math.min(1, (now - startedAt) / 980);
    const eased = 1 - Math.pow(1 - entry, 3);
    pointer.x += (pointer.tx - pointer.x) * 0.035;
    pointer.y += (pointer.ty - pointer.y) * 0.035;

    meshes.forEach((mesh, index) => {
      const base = mesh.userData.baseRotation;
      const offset = mesh.userData.entryOffset;
      mesh.rotation.x = base.x + offset.x * (1 - eased) + pointer.y * 0.012 * (index % 2 ? 1 : -1);
      mesh.rotation.y = base.y + offset.y * (1 - eased) + pointer.x * 0.014 * (index % 2 ? -1 : 1);
      mesh.rotation.z = base.z + offset.z * (1 - eased);
    });

    group.rotation.y = pointer.x * 0.018;
    group.rotation.x = -pointer.y * 0.012;
    group.position.y = Math.sin(now * 0.00022) * 0.025;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }

  renderer.render(scene, camera);
  stage.classList.add('webgl-ready');
  raf = requestAnimationFrame(render);
}

function polygonGeometry(THREE, points) {
  const vertices = [];
  const source = points.map((point) => new THREE.Vector3(...point));

  if (source.length === 3) {
    vertices.push(...source[0].toArray(), ...source[1].toArray(), ...source[2].toArray());
  } else {
    vertices.push(
      ...source[0].toArray(), ...source[1].toArray(), ...source[2].toArray(),
      ...source[0].toArray(), ...source[2].toArray(), ...source[3].toArray()
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
