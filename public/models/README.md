# AÉVRA Horological 3D Asset Drop-In Specification

This directory is the production destination for the production-grade **AÉVRA Luxury Mechanical Wristwatch 3D model**.

## Target File
`public/models/aevra-watch.glb`

## Scene Graph Hierarchy & Node Contract
To bind seamlessly to the existing Lenis / GSAP 0–100% scroll explosion and reassembly choreography without requiring any code changes, the GLB must contain the following 8 top-level nodes (or groups):

| Node Name | Horological Component Description | Exploded Travel Behavior (Disassembly 20–36%) |
| :--- | :--- | :--- |
| `crystal` | Double-domed sapphire crystal glass (with anti-reflective coating) | Floats forward (+Z) along optical axis |
| `bezel` | 18k honey gold stepped & micro-fluted outer bezel ring | Floats forward (+Z) with slight upward pitch |
| `dial` | Openworked chapter ring, 60 minute ticks, 12 faceted gold batons | Floats forward (+Z) revealing movement underneath |
| `hands` | Faceted Dauphine hour/minute hands, blued seconds hand, center arbor | Floats forward (+Z) with subtle axial rotation |
| `bridges` | Openworked rhodium movement bridges, balance cock, ruby jewels, screws | Separates radially from movement center |
| `gears` | Mainspring barrel, balance wheel, Breguet hairspring, gear train | Disperses around movement plane with rotation |
| `movement` | Anthracite circular baseplate with perlage graining, 22k gold rotor | Central anchor on movement plane |
| `caseBack` | 316L steel caseband, 4 sculpted curved lugs, crown at 3 o'clock, strap & caseback | Translates backward (-Z) and downward (-Y) |

## Dimensions & Coordinate Framing
- **Origin:** Center of the watch movement at `[0, 0, 0]`
- **Diameter:** Watch case diameter $\approx 5.6$ units (radius $\approx 2.8$ units)
- **Thickness:** Total assembled thickness from caseback to crystal dome $\approx 0.84$ units
- **Format:** Binary glTF (`.glb`), glTF 2.0 PBR materials (Roughness/Metalness workflow)
- **Texture resolution:** 2048x2048 or 4096x4096 WebP/PNG baked normal, roughness, metalness, and ambient occlusion maps.
- **Draco Compression:** Optional / Supported via Drei `useGLTF`.
