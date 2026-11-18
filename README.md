# Sovereign: a private Rolls-Royce showroom site

Dark, glass-surfaced, scroll-driven 3D website built with Next.js (App Router),
Tailwind CSS v4, React Three Fiber, GSAP ScrollTrigger and Lenis.

As you scroll, the camera walks around a car in a dark showroom: front three-quarter,
side profile, a wheel close-up, a tracking shot along the flank while model cards
slide past, a low front angle, up into a Starlight sky, round to the rear for the
configurator, overhead for the commission steps, and wide for the booking form.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires Node 18.18 or newer.

**Adding to an existing project instead?** Copy `public/models/`,
`postcss.config.mjs`, then install:

```bash
npm i three @react-three/fiber @react-three/drei gsap @gsap/react lenis
npm i -D @types/three tailwindcss @tailwindcss/postcss
```

## What's in it

| Feature | Where |
| --- | --- |
| Preloader with counter, curtain lift, camera dolly-in, lights switching on | `components/ui/Preloader.tsx` |
| Scroll-driven camera (one shot per section) | `lib/scenes.ts`, `components/ScrollScenes.tsx`, `three/CameraRig.tsx` |
| Smooth scrolling synced to ScrollTrigger | `components/providers/SmoothScroll.tsx` |
| Glass nav that hides on scroll down, page-progress hairline, active section | `components/ui/Navbar.tsx` |
| Hero headline rising word by word | `sections/Hero.tsx` |
| Words brightening as you scroll | `ui/RevealText.tsx` |
| Pinned horizontal model gallery with pointer spotlight cards | `sections/Collection.tsx` |
| Counting performance figures | `sections/Performance.tsx` |
| Starlight sky (1,340 twinkling stars) + "Send a shooting star" button | `three/Starfield.tsx`, `sections/Starlight.tsx` |
| Live configurator: paint, coachline, wheels update the 3D car | `sections/Bespoke.tsx` |
| Booking form, prefilled from the configurator, with API route | `sections/Visit.tsx`, `app/api/enquiry/route.ts` |
| Custom cursor + magnetic buttons (mouse/trackpad only) | `ui/Cursor.tsx`, `ui/Magnetic.tsx` |
| Wheels that turn with scroll speed | `three/ConceptCar.tsx` |

Reduced-motion users get instant transitions and no smooth-scroll inertia.
The custom cursor never appears on touch devices.

## Edit content

- Name, phone, address, hours, legal line, model copy, paint/coachline options: `lib/site.ts`
- Camera angles per section: `lib/scenes.ts` (each shot is a camera position and a look-at point)
- Colours and fonts: `@theme` block in `app/globals.css`, fonts in `app/layout.tsx`
- Logo: `components/ui/Monogram.tsx` is a placeholder monogram; swap in the client's mark

## Using a real car model

The site ships with an original, code-built concept car so it works out of the box.
To use a real model, save it as **`public/models/car.glb`**. The site detects it on
load, scales it to 5.6 m, centres it, sits it on the floor and swaps it in.

- If it faces backwards, set `carModel.rotationY` to `Math.PI` in `lib/site.ts`.
- For the paint picker to recolour it, the body paint material's name must match
  `carModel.paintMaterials` (default matches `paint`, `body`, `carpaint`, `exterior`).
  Rename the material in Blender if needed.
- Compress it before shipping (aim for under 8 MB):
  `npx @gltf-transform/cli optimize input.glb public/models/car.glb --compress draco --texture-compress webp`

**Licensing:** Rolls-Royce car designs, logos and the Spirit of Ecstasy are protected.
Use assets supplied by the manufacturer's dealer programme, or a model whose licence
explicitly allows commercial use, and confirm the client is entitled to use the
brand on their site. The `legal` line in `site.ts` should match their actual status
(authorised dealer vs. independent).

## Connect the booking form

`app/api/enquiry/route.ts` validates the request and logs it. Replace the
`console.info` with your email or CRM call (Resend, Postmark, HubSpot, etc.).

## Before launch

- Confirm every performance figure in `site.ts` and `Performance.tsx` against current
  spec sheets for the client's market.
- Replace placeholder phone, email and address.
- Test on a mid-range Android phone; if the frame rate drops, lower `dpr` in
  `three/Experience.tsx` to `[1, 1.25]` or reduce `MeshReflectorMaterial` resolution in
  `three/Studio.tsx`.
