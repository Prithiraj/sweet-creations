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

const stage = document.querySelector('#facet-field');
const host = document.querySelector('#facet-webgl');
const allowWebGL = stage && host && !reduceMotion && window.innerWidth >= 900 && !navigator.connection?.saveData;

if (allowWebGL) {
  initFacetField().catch(() => {
    // The CSS facet composition remains as the complete fallback.
  });
}

async function initFacetField() {
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/+esm');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 10.8);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfffbf6, 0x8d6d67, 2.1));
  const key = new THREE.DirectionalLight(0xfff3e7, 2.5);
  key.position.set(4, 6, 8);
  scene.add(key);

  const group = new THREE.Group();
  group.position.set(.45, .05, 0);
  scene.add(group);

  const planes = [
    createFacet(THREE, [[-4.2,2.7,-.5],[1.2,3.35,-.2],[2.5,.4,.15],[-2.8,.9,.05]], 0xe7c6cf, .34),
    createFacet(THREE, [[-3.7,-.4,-.25],[.1,.5,.1],[1.45,-3.1,-.1],[-3.0,-2.65,-.35]], 0xd2a986, .18),
    createFacet(THREE, [[1.6,2.25,-.35],[4.4,1.45,-.55],[4.1,-1.9,-.25],[2.15,-.4,.08]], 0xf1dfd5, .28)
  ];

  planes[0].rotation.z = -.05;
  planes[1].rotation.z = .035;
  planes[2].rotation.z = .06;
  planes.forEach((mesh) => group.add(mesh));

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
      pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * 2;
      pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * 2;
    }, { passive: true });
    stage.addEventListener('pointerleave', () => { pointer.tx = 0; pointer.ty = 0; });
  }

  let running = true;
  let raf = 0;
  const observer = new IntersectionObserver(([entry]) => {
    running = Boolean(entry?.isIntersecting) && !document.hidden;
    if (running && !raf) raf = requestAnimationFrame(render);
  }, { threshold: 0.02 });
  observer.observe(stage);

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden && stage.getBoundingClientRect().bottom > 0;
    if (running && !raf) raf = requestAnimationFrame(render);
  });

  function render(now) {
    raf = 0;
    if (!running) return;

    pointer.x += (pointer.tx - pointer.x) * .025;
    pointer.y += (pointer.ty - pointer.y) * .025;

    group.rotation.y = pointer.x * .018;
    group.rotation.x = -pointer.y * .012;
    group.position.x = .45 + pointer.x * .035;
    group.position.y = .05 - pointer.y * .028 + Math.sin(now * .00018) * .012;

    planes[0].position.z = Math.sin(now * .00014) * .02;
    planes[1].position.z = Math.sin(now * .00011 + 1.2) * .018;
    planes[2].position.z = Math.sin(now * .00013 + 2.4) * .016;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  }

  renderer.render(scene, camera);
  stage.classList.add('webgl-ready');
  raf = requestAnimationFrame(render);
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
    roughness: .96,
    metalness: 0,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  }));
}
