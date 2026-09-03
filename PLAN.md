# Two Sweet Creations — Website Implementation Plan

## Goal

Build and publish a polished, mobile-first single-page website for **Two Sweet Creations** in Kissimmee, Florida. The experience should make the business feel warm, handcrafted, modern, and easy to contact while keeping the page fast enough for a static GitHub Pages deployment.

## Confirmed public business details used

- Business name: **Two Sweet Creations**
- Google categories: **Cake shop** and **Pastry shop**
- Google rating observed during implementation: **5.0 / 5 from 27 reviews**
- Phone: **+1 (407) 922-1969**
- Location shown on Google: **Turret Bay Ct, Kissimmee, FL 34743**
- Listed hours observed: **Monday–Saturday, 8:00 AM–8:00 PM**
- Primary map destination: the Google Maps listing supplied for the project

Because this is a static marketing site, all ordering CTAs will hand off to phone, SMS, or Google Maps rather than implying an online checkout system exists.

## Visual direction

- Editorial bakery aesthetic rather than a template-like restaurant layout.
- Warm ivory background, berry/rose accents, cocoa text, and restrained gold highlights.
- Large typography and asymmetrical photo composition.
- Real food photography remains the primary visual content.
- Photography sourced for launch is licensed Unsplash photography and is treated as **visual inspiration**, not represented as the bakery's own customer portfolio. Replace these images with owner-approved Two Sweet Creations photography when available.
- Photo credits remain accessible in the page footer.

## Three.js usage

Three.js will be used only as a **subtle enhancement** behind the hero photography:

- lightweight floating sugar pearls / confection-inspired forms;
- low contrast and transparent so they never compete with the cake image or text;
- pointer movement adds a small amount of parallax;
- disabled for `prefers-reduced-motion` users and skipped on constrained experiences if initialization fails;
- the entire page remains functional without Three.js.

## Page structure

1. **Header / navigation**
   - Brand wordmark
   - Anchors to Creations, Process, Reviews, Contact
   - Persistent “Start an order” CTA

2. **Hero**
   - Local-business positioning for Kissimmee
   - Google-rating proof point
   - Primary SMS order CTA and secondary call CTA
   - Large real cake photograph
   - Decorative Three.js layer behind the photograph only

3. **Creations / services**
   - Custom celebration cakes
   - Cupcakes and sweet treats
   - Pastries and dessert moments
   - Copy avoids inventing specific prices, flavors, delivery promises, or turnaround times

4. **Real-photo inspiration gallery**
   - Multiple real bakery/dessert photos
   - Gallery explicitly framed as celebration inspiration, not claimed portfolio work
   - Responsive editorial mosaic

5. **Ordering process**
   - Share the occasion and inspiration
   - Confirm details directly with the bakery
   - Finalize the plan and celebrate

6. **Reviews / trust**
   - 5.0 Google rating and 27-review count
   - Link back to the live Google Maps profile
   - No fabricated review quotes

7. **Contact**
   - Phone / SMS CTAs
   - Kissimmee location context
   - Listed hours
   - Directions link to the supplied Google Maps listing

8. **Footer**
   - Business details
   - Photography attribution
   - No unsupported social-media links

## UX and accessibility

- Semantic HTML landmarks and headings.
- Keyboard-visible focus states.
- Responsive navigation with an accessible menu button.
- Descriptive image alt text.
- `prefers-reduced-motion` support.
- Adequate color contrast and minimum touch target sizing.
- Lazy-loading for non-hero photos.
- No required JavaScript for primary content or contact actions.

## Technical approach

- Plain **HTML + CSS + JavaScript** to avoid a build step and keep GitHub Pages deployment simple.
- Pinned Three.js CDN version loaded dynamically so a CDN failure does not break navigation or page interactions.
- CSS custom properties for the design system.
- Progressive reveal effects via `IntersectionObserver`.
- Static local-business structured data (`JSON-LD`) for discoverability.

## Deployment

- Files live at repository root so the GitHub Pages base path works without framework configuration.
- Add `.nojekyll`.
- Add a GitHub Actions Pages workflow using the official Pages actions.
- Deploy on pushes to `main` and allow manual dispatch.
- After implementation, inspect the workflow run and published URL. If GitHub Pages is not yet enabled at repository level and GitHub rejects the deployment, document the exact one-time Pages setting required; the code and workflow will already be ready to publish immediately after that setting is enabled.

## Acceptance criteria

- [ ] Responsive layout from small phones through desktop.
- [ ] Real photography is the dominant visual medium.
- [ ] Three.js is decorative only and gracefully optional.
- [ ] No fabricated testimonials, prices, menu items, or social links.
- [ ] Call, SMS, and Maps CTAs work without a backend.
- [ ] Google rating/review count and business contact details are visible.
- [ ] Plan remains documented in this file.
- [ ] GitHub Pages workflow is committed and a deployment is attempted.
