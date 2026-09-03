# Design revision — Origami as a design principle

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

Three.js is now a very quiet **faceted depth field** behind the hero photography.

- 3 translucent, low-poly planes.
- No crease lines, paper edges, folding animation, or origami models.
- No fake cake rendering.
- No orbit controls or game-like input.
- Pointer response is limited to a few pixels/degrees of perceived depth.
- Motion is nearly static and stops when off-screen.
- CSS geometric layers provide the full visual fallback.
- WebGL remains desktop-only by default and is skipped for reduced motion and data-saving users.

Three.js can be removed entirely if it does not improve the final composition after visual QA.

## Photography rule

Photography is always the primary visual medium. Current images are licensed editorial placeholders and are visibly disclosed as representative. Replace them with owner-approved Two Sweet Creations photography before commercial launch.

## Acceptance criteria for the revision

- [ ] No element reads as a literal origami object.
- [ ] The hero photo is immediately recognizable as the dominant visual.
- [ ] 3D effects remain behind photography and content.
- [ ] Desktop hero fits comfortably within a normal first-screen composition instead of producing an oversized image wall.
- [ ] Mobile layout works without Three.js.
- [ ] Reduced-motion mode has no nonessential motion.
- [ ] All call, directions, and Google-profile actions remain obvious.
- [ ] The visual system feels editorial and premium rather than experimental or game-like.
