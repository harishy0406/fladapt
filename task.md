# Fladapt Implementation Tasks

## Overview
Implement an explainable, deterministic adaptive layout engine that transforms a single content specification into optimized layouts for multiple surfaces.

## Project Structure
```
fladapt/
├── backend/          # Core resolution engine (pure TypeScript)
│   ├── src/
│   │   ├── model.ts
│   │   ├── classify.ts
│   │   ├── resolver.ts
│   │   ├── trace.ts
│   │   ├── surfaces/builtin.ts
│   │   └── specs/example.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React demo app
│   ├── src/components/App.tsx, Renderer.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/             # PRD, TRD, ARCHITECTURE, DESIGN
├── assets/           # Icons and UI samples
├── .gitignore
├── task.md
└── README.md
```

## Completed Phases

### Phase 1: Core Data Models [complete] → backend/src/model.ts
- [x] `Inset`, `SurfaceProfile`, `ElementSpec`, `DegradationStep`
- [x] `ResolvedLayout`, `ResolvedElement`
- [x] `computeEffectiveCanvas()`, `classifySurface()`

### Phase 2: Surface Classification [complete] → backend/src/classify.ts
- [x] `computeCanvas()` — subtract safeArea/bleed insets
- [x] `classifySurface()` — geometry-driven, id-agnostic

### Phase 3: Resolution Engine [complete] → backend/src/resolver.ts
- [x] `resolve(spec, surface): ResolvedLayout`
- [x] Priority-ordered element allocation
- [x] Degradation ladder walk (shrink → reflow → truncate → hide)
- [x] Remaining space tracking
- [x] Trace entry generation per decision

### Phase 4: Trace Helper [complete] → backend/src/trace.ts
- [x] Standardized trace string generation

### Phase 5: Built-in Surfaces [complete] → backend/src/surfaces/builtin.ts
- [x] Mobile portrait, landscape, broadcast lower-third, square kiosk

### Phase 6: Example Spec [complete] → backend/src/specs/example.ts
- [x] Logo, headline, CTA elements with degradation ladders

### Phase 7: React Renderer [complete] → frontend/src/components/Renderer.tsx
- [x] Pure CSS projection — no layout decision logic

### Phase 8: Demo App [complete] → frontend/src/components/App.tsx
- [x] Surface picker (4 built-in + custom)
- [x] New surface form (FR-5)
- [x] Trace panel per selected element

### Phase 9: Tests [pending]
- [ ] Create `backend/tests/resolver.test.ts`
- [ ] Create `backend/tests/classify.test.ts`

### Phase 10: Package Setup [complete]
- [x] backend/package.json + tsconfig.json
- [x] frontend/package.json + tsconfig.json + vite.config.ts
- [x] .gitignore files (root, backend, frontend, docs)
- [x] Updated README.md with new structure

## Verification

The core resolver logic satisfies all requirements:

1. **Effective canvas** = surface bounds minus safeArea/bleed insets ✅
2. **Priority ordering** — ascending priority number = processed first ✅
3. **Degradation ladder** — preferred → shrink → reflow → truncate → hide ✅
4. **Remaining space tracking** ✅
5. **Unseen surfaces** — geometry-driven classification ✅
6. **Inline trace generation** ✅
7. **Graceful degradation** ✅

## Next Steps (to resume)

- [ ] Write unit tests (resolver, classify)
- [ ] Run `npm install` in frontend and verify the demo compiles
- [ ] Test with a 5th unseen surface (FR-5)
- [ ] Integrate graphify skill for knowledge graph analysis

---

*Last updated: 2026-09-12*
