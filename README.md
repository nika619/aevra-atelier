# AÉVRA — Horological Conservation Atelier

[![CI](https://github.com/nika619/aevra-atelier/actions/workflows/ci.yml/badge.svg)](https://github.com/nika619/aevra-atelier/actions/workflows/ci.yml)

A precision-engineered, cinematic web experience for high-end watch restoration. Built for the **Lovable AI Hackathon**.

> "Every timepiece deserves careful hands."

## 🏆 Lovable AI Hackathon Submission
AÉVRA tackles the appointment-based business archetype by transforming the cumbersome intake process of luxury watch restoration. Instead of back-and-forth emails negotiating service scopes, AÉVRA turns an inbound "can I book with you?" directly into a confident "you're booked," completely minimizing manual effort for the watchmaker.

It features:
- **Cinematic Photography Architecture**: High-end continuous scrolling GSAP mechanics without heavy 3D loading times.
- **Inclusive Horology**: A smart intake state machine that adjusts phrasing for everything from standard Seiko mechanics to heirloom Patek Philippes.
- **Golden Dust Particle Field**: An abstract, highly-optimized WebGL Three.js particle layer to create atmospheric depth.
- **Lenis Smooth Scrolling**: A hyper-fluid, 60fps cinematic journey.
- **State-Driven Orchestration**: Intake buttons that automatically fly the user to the correct narrative section using Zustand state.

## Owner cockpit
**Live:** https://nika619.github.io/aevra-atelier/#owner

The atelier owner's side of the intake: one dense queue of repair requests, oldest first. Each request opens beside the list with the client's own words, the likely diagnosis and the words it came from, a quote whose total and bench hours are summed from its lines, and a bench strip that shows whether the work fits the next two weeks. Accept, ask for photos or decline from the row's detail, with undo.

- Keyboard: `J` / `K` move, `A` accept and send, `P` ask for photos, `D` decline, `/` search, `Z` undo.
- Phone: one region at a time; a request opens full screen with a thumb-height action bar.
- The queue starts with labelled demo requests. A request sent through the customer intake lands in it too (kept in your browser; this demo has no backend).
- Code: `src/owner/` (data with self-checking totals, a Zustand store, the screen and its CSS). It loads as its own chunk, so the customer site never ships it.

## 🛠 Tech Stack
- **Framework**: React 19 / TypeScript / Vite
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP (ScrollTrigger) & Framer Motion
- **Scroll Engine**: Lenis 
- **3D Render**: Three.js & React Three Fiber (r3f)
- **State**: Zustand

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

## 📐 Design Philosophy
The atelier rejects standard "vibe-coded" SaaS templates. The typography is a highly specific, editorial mix of `font-serif`, `italic`, and `font-normal` wrapped around a custom `#c9a263` gold accent, designed to evoke the pages of a high-end horological magazine rather than a software dashboard.


---

Built by [Mayank Tiwari](https://github.com/nika619) · [Hire me on Contra](https://contra.com/mayank_tiwari_a4vkcjsh)
