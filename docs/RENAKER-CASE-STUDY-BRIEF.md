# Renaker Life Case Study — Source of Truth Brief

> Cinematic interactive case study for Renaker Life, powered by Aiyla.  
> This document is the narrative and technical north star for the experience.

## Visitor takeaways

1. Renaker is one of the most technologically progressive residential developers in the UK.
2. Renaker Life has transformed a fragmented resident/building-management experience into one connected platform powered by AI.
3. Renaker uses technology not only inside developments, but to connect residents with the neighbourhood, high street and city.
4. Aiyla is the intelligence underneath that ecosystem.

## Brand relationship

- **Aiyla main site** = product proposition (“The AI Operating System for Buildings”)
- **This case study** = evidence + experience + story + placemaking through Renaker
- Visual system inherits Aiyla tokens (Manrope, stone/ink, glass, restrained accent)
- Renaker remains prominent until the finale Aiyla reveal

## Core creative principle

Manchester itself is the interface. The 3D city changes meaning:

```
PHYSICAL CITY
→ CONNECTED ESTATE
→ RESIDENT EXPERIENCE
→ OPERATIONAL NETWORK
→ DIGITAL HIGH STREET
→ LOCAL ECONOMY
→ EXPLORATION
→ CONNECTED CITY
```

Generic Manchester = warm architectural white. Renaker developments = full material colour. Contrast is intentional.

## Section order

1. Cinematic hero / Renaker estate (7 developments)
2. Original problem (fragmented channels → one experience)
3. Early Digital High Street reveal + AI neighbourhood demo + business perspective
4. Return home / resident experience (AI concierge, marketplace, service request)
5. Staff experience
6. Management / AI insight
7. Results / proof (editorial metrics)
8. Doorly / the doorstep (+ George)
9. Digital High Street deep dive
10. TRSRE / exploration
11. Placemaking message
12. People / video
13. Finale → Aiyla

## Production anchors (inside Manchester GLB)

### Renaker developments

- `ANCHOR_DGS`
- `ANCHOR_360`
- `ANCHOR_BLADE`
- `ANCHOR_VRG`
- `ANCHOR_CROWNST`
- `ANCHOR_BANKSIDE`
- `ANCHOR_CW`

### Digital High Street businesses

- `ANCHOR_BIZ1`
- `ANCHOR_BIZ2`
- `ANCHOR_BIZ3`

Resolved via `scene.getObjectByName()` / R3F equivalent. Fallback coordinates live only in `src/config/scene.ts` and are clearly marked temporary.

## Visual principles

- Architectural, premium, editorial, cinematic, restrained
- Warm neutrals (`#F1F0E8` / Aiyla stone `#f5f2ed`), charcoal typography
- Single replaceable accent CSS variable
- Architectural glass UI: warm translucent white, fine border, soft shadow, ~20px radius
- Enormous typography over Manchester at key moments
- No purple SaaS gradients, neon, cyberpunk, or endless feature cards

## Technical decisions

| Decision | Choice |
|---|---|
| Framework | Next.js App Router + TypeScript |
| 3D | One persistent R3F Canvas |
| Scroll | GSAP + ScrollTrigger |
| Content | Central configs under `src/config/` |
| Styling | Tailwind v4 + Aiyla design tokens |
| Font | Manrope (swap centrally) |
| Assets | Configurable paths; temp procedural city until GLBs |
| Debug | `?debug3d=1` |
| Performance | Quality profiles, InstancedMesh TRSRE, demand frameloop, reduced motion |

## When real GLBs arrive

1. Place Manchester GLB at configured path
2. Load + inspect scene for `ANCHOR_*` nodes
3. Registry replaces fallbacks with world positions
4. Load Renaker GLBs with preserved transforms
5. Tune camera compositions only — no section rewrites

## Copy principles

Short, confident, architectural. Avoid buzzword soup (“revolutionary”, “seamless”, repeated “cutting-edge”). Let visuals carry large moments.
