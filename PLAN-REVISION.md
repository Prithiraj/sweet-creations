# Design revision — Origami as a design principle

> **Status:** Planning only. Do not implement the scroll-linked 3D work until explicitly approved.

This revision supersedes the literal folded-paper/origami treatment described in the original plan.

## What changed

The earlier implementation interpreted “origami” too literally: large folded planes, visible paper objects, an arched image mask, and copy that referenced folding directly. That made the 3D effect compete with the business photography and made the page feel like a 3D concept demo rather than a polished bakery website.

The revised direction treats origami as an **abstract design principle**, not a literal object.

## Revised visual rule

Use the qualities of origami without drawing origami:

- controlled geometry;
- asymmetric composition;
- layered planes;
- subtle changes in depth;
- angular transitions between sections or media;
- precise alignment and negative space;
- restrained motion that suggests depth rather than folding paper.

The customer should never look at the page and think “there is an origami object on this website.” The intended impression is simply that the layout feels crafted, dimensional, editorial, and distinctive.

## Revised hero

- Conventional two-column editorial composition.
- Copy and conversion actions occupy the left side.
- One strong cake photograph is the visual focus on the right.
- Normal rounded rectangular photo crop; no arch, envelope, folded box, or paper silhouette.
- Small faceted layers sit **behind** the photograph as visual depth only.
- The photo remains fully recognizable and visually dominant.
- No decorative phrase such as “Folded with care.”

## Revised Three.js role

Three.js is a quiet **faceted depth field** behind the photography.

- 3–4 translucent or softly shaded low-poly planes.
- No crease lines, paper edges, folding animation, or origami models.
- No fake cake rendering.
- No orbit controls or game-like input.
- CSS geometric layers provide the complete visual fallback.
- WebGL is desktop/tablet enhancement only by default and is skipped for reduced motion and data-saving users.

Three.js can be removed entirely if it does not improve the final composition after visual QA.

---

# Proposed 3D scroll experience

## Experience concept

### **Composed depth**

The geometry should behave as if the page composition has physical depth. As the visitor scrolls, the background planes subtly separate, drift, and settle into new alignments around the real photographs.

The motion should communicate **layering and precision**, not literal paper folding.

The visitor should perceive:

1. a calm dimensional hero;
2. a slight opening of space as they begin to scroll;
3. geometry guiding the eye into the cakes/pastries content;
4. the 3D layer settling and disappearing before the gallery so photography takes over completely.

This creates a memorable scroll experience without turning the site into a WebGL demo.

## Scope

The scroll-linked Three.js scene should exist only across:

1. **Hero**
2. **Google proof band**
3. **Beginning of Cakes & Pastries**

The scene should be fully settled/stopped before the main gallery.

Do **not** run a persistent WebGL background through the entire website.

## Normal scrolling only

Hard rules:

- no scroll hijacking;
- no synthetic smooth-scroll library;
- no forcing the user through animation before content advances;
- no full-screen scene that traps the page;
- no horizontal-scroll section;
- no camera fly-through;
- no content pinned for multiple viewport heights solely to showcase animation.

The browser's normal vertical scroll remains authoritative.

---

## Scroll storyboard

| Scroll phase | Approximate range | 3D behavior | DOM / photography behavior | Purpose |
| --- | ---: | --- | --- | --- |
| **A. Composed** | Hero at top → ~20% | Three planes sit quietly behind the hero image at slightly different Z depths. | Photo and copy are completely stable. | Strong first impression without obvious animation. |
| **B. Separate** | ~20–45% | Planes move apart by small amounts in X/Y/Z; rotations change only a few degrees. Camera advances very slightly. | Hero photo may translate upward by roughly 8–12 px using CSS, not Three.js. | Reveal depth as the visitor intentionally scrolls. |
| **C. Guide** | ~45–70% | One accent plane drifts diagonally toward the lower section edge while the others flatten and recede. | Proof band enters normally. No content is covered. | Visually connect hero and business proof instead of treating them as unrelated blocks. |
| **D. Settle** | ~70–100% | Geometry becomes wider/flatter and moves toward the outside edges of the composition. Opacity/depth reduces. | Cakes & pastries heading and first image enter through normal document flow. | Hand the visual focus from atmosphere to product imagery. |
| **E. Rest** | After opening sequence | Renderer stops. 3D is no longer visually active. | Gallery and remaining sections are photo/content led. | Prevent visual fatigue and improve performance. |

The exact percentages are implementation tuning values, not rigid layout constraints.

---

## 3D scene design

### Geometry

Use only a few custom low-poly forms:

- 3 primary faceted planes;
- optional 1 very subtle accent plane if visual testing justifies it;
- triangles/quads only;
- no loaded GLTF model;
- no text meshes;
- no food objects;
- no particles;
- no ribbons that look like literal packaging.

### Materials

- low-saturation cream / rose / warm neutral tones;
- matte or softly shaded surfaces;
- enough contrast to reveal depth, but substantially less contrast than the photography;
- no chrome, glass, glow, bloom, neon, or reflective materials;
- no photographic textures.

### Depth budget

Motion should stay intentionally small:

- mesh rotation changes: generally **≤ 4–6°** across the full scroll sequence;
- camera Z travel: approximately **0.2–0.5 scene units**;
- mesh translations: enough to reveal parallax, not enough to cross the central content/photo area;
- perceived photo parallax: roughly **8–12 px maximum**;
- no 180°/360° rotations.

If the user consciously notices a plane “performing a move,” the animation is probably too strong.

---

## Scroll control architecture

### Preferred approach: native scroll progress + requestAnimationFrame

Do **not** add GSAP/ScrollTrigger for the first implementation.

Use:

- one opening experience container spanning the hero through the start of Cakes & Pastries;
- `IntersectionObserver` to activate/deactivate the scene;
- a passive `scroll` listener only to update target progress;
- `requestAnimationFrame` to smoothly interpolate toward the target;
- normalized progress calculated from the container's position relative to the viewport;
- interpolation (`lerp`) for mesh transforms so trackpads and wheel input do not create jitter.

Reasons:

- fewer dependencies;
- smaller JavaScript payload;
- easier GitHub Pages deployment;
- precise control over when the renderer runs;
- the existing page does not require a general animation framework.

### Renderer lifecycle

- initialize after the hero image/core content has loaded or during browser idle time;
- cap device pixel ratio around `1.25–1.5`;
- render only while the opening experience is visible **and** its transforms are changing;
- pause when the document is hidden;
- stop the render loop once the final resting state is reached;
- resume only if the visitor scrolls back into the active range;
- resize via `ResizeObserver` rather than continuous checks.

---

## Layering model

The 3D canvas must remain decorative.

Proposed stack:

1. page background;
2. Three.js faceted depth field;
3. CSS fallback/fine geometric accents where needed;
4. real photography;
5. copy, proof, links, and CTAs.

Rules:

- canvas uses `pointer-events: none`;
- canvas is `aria-hidden="true"` / not focusable;
- 3D geometry cannot pass in front of CTA text or rating information;
- geometry should not cover meaningful parts of the cake photo;
- the hero remains understandable if the entire canvas is removed from the DOM.

---

## Relationship with the real photographs

The 3D scene must **frame and transition around** the photographs rather than animate a substitute for them.

Recommended coordination:

- Hero photograph: tiny CSS translate/parallax synchronized with scroll progress.
- Cakes photograph: no 3D distortion; it enters normally.
- Pastry photograph: normal static/editorial treatment.
- Gallery: no scroll-linked Three.js at all.

Do not upload photographs as WebGL textures merely to achieve a 3D effect. Keeping them as semantic HTML images preserves accessibility, image optimization, SEO, responsive loading, and the clear distinction between actual photography and decoration.

---

## Mobile behavior

### Phones

Default: **no Three.js scroll scene**.

Use the same layout with static CSS facets behind the hero.

Reasons:

- scrolling is already a physically direct gesture on touch devices;
- WebGL scroll effects can create unnecessary battery/GPU cost;
- a smaller screen gives the 3D layer less room to contribute without obscuring photography;
- preserving a stable mobile experience matters more than visual parity.

A lightweight mobile version can be reconsidered only after desktop/tablet QA proves the interaction adds real value.

### Tablet

Allow the scene only if viewport and capability checks pass. Reduce geometry count or movement amplitude if needed.

---

## Reduced motion and constrained environments

For `prefers-reduced-motion: reduce`:

- do not initialize the scroll-linked renderer;
- show the final static CSS depth composition;
- do not apply photo parallax;
- keep all page content unchanged.

Also skip WebGL when appropriate for:

- `navigator.connection?.saveData`;
- unsupported WebGL;
- initialization errors;
- extremely small viewport/layout states.

Failure must be invisible to the visitor: the page simply behaves like a polished static website.

---

## Accessibility

- The 3D canvas is decorative and excluded from the accessibility tree.
- Normal scroll position remains under the user's control.
- No essential information appears only during a certain animation state.
- Focusable controls never move because of WebGL.
- Keyboard users receive the same content hierarchy and conversion paths.
- Reduced motion eliminates all scroll-linked decorative transforms.
- No flashing, rapid zooming, or high-frequency movement.

---

## Performance budget

### Three.js

- use the existing dynamically imported Three.js dependency;
- 3–4 very low-poly meshes;
- no post-processing;
- no shadows unless profiling proves them effectively free and visually necessary;
- no physics;
- no GLTF loaders;
- no large textures;
- no continuous render loop while the scene is idle/off-screen.

### Page performance safeguards

The scroll experience must not materially regress:

- hero LCP;
- scrolling responsiveness;
- image loading;
- layout stability;
- CTA responsiveness.

Target remains:

- **LCP < 2.5 s** on a realistic mid-range mobile profile (mobile gets static fallback);
- **CLS < 0.1**;
- **INP < 200 ms** where measurable;
- no long main-thread tasks caused by scroll animation.

If animation materially damages these targets, reduce or remove it.

---

## Visual QA tests

Before accepting the implementation, test these questions rather than only asking whether the animation “works”:

1. Does the hero still look good in a screenshot with the 3D layer disabled?
2. Is the cake photograph always the first visual subject?
3. Does normal scrolling still feel native?
4. Does the geometry guide the eye downward rather than asking for attention itself?
5. Is the transition into Cakes & Pastries smoother with the effect than without it?
6. Does the gallery feel like a deliberate visual reset?
7. Can the effect be removed without changing any copy, CTA, image, or information architecture?

If the answer to #4, #5, or #7 is no, simplify the scene.

---

## Implementation sequence — after approval

1. Define a single opening scroll-experience container around the existing hero/proof/creations transition.
2. Preserve existing HTML content and semantic images.
3. Refactor the current faceted Three.js scene into explicit start/end transform states.
4. Add normalized native scroll progress calculation.
5. Add rAF interpolation and visibility-based renderer lifecycle.
6. Synchronize only the hero photo's tiny CSS parallax; do not WebGL-render images.
7. Add the settle/stop behavior before the gallery.
8. Verify static fallback first.
9. Verify reduced-motion path.
10. Profile desktop scroll performance and adjust DPR/geometry/movement.
11. Test Safari, Chrome, Firefox, trackpad, mouse wheel, keyboard scrolling, and browser zoom.
12. Only then publish the revised GitHub Pages build.

---

## Acceptance criteria for the scroll experience

- [ ] No element reads as a literal origami object.
- [ ] The hero photo remains the dominant visual.
- [ ] Scroll remains completely native and reversible.
- [ ] No content is pinned or blocked to showcase the 3D effect.
- [ ] Three.js runs only across the opening experience and settles before the gallery.
- [ ] 3D geometry remains behind all meaningful content.
- [ ] No 3D-rendered cake, pastry, text, or replacement photography.
- [ ] Scroll-linked rotations stay within the restrained motion budget.
- [ ] Mobile has a complete static experience without WebGL.
- [ ] Reduced-motion mode initializes no scroll animation.
- [ ] Renderer pauses/stops outside the active section and when the tab is hidden.
- [ ] LCP/CLS/INP targets are not materially regressed.
- [ ] Call, Directions, and Google-profile actions remain obvious and immediately usable.
- [ ] The page remains polished if Three.js fails entirely.
- [ ] The final effect feels editorial and dimensional, not cinematic, game-like, or experimental.

---

## Photography rule

Photography is always the primary visual medium. Current images are licensed editorial placeholders and are visibly disclosed as representative. Replace them with owner-approved Two Sweet Creations photography before commercial launch.
