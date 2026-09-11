# Architecture Document: Fladapt

**Project:** Fladapt — Adaptive Multi-Surface Layout Engine
**Author:** M Harish Gautham

## 1. Overview
Fladapt is split into two cleanly separated layers:
1. **Resolution Core** — pure TypeScript, no rendering concerns. Converts `(LayoutSpec, SurfaceProfile) → ResolvedLayout`.
2. **Presentation Layer** — React components that take a `ResolvedLayout` and paint it using CSS Grid/Flexbox, plus a demo harness for switching surfaces and injecting new ones.

This separation is the architectural answer to the assignment's central constraint: *the decision of what goes where must be made by TypeScript, not by CSS media queries choosing between hardcoded layouts.*

## 2. High-Level Diagram (textual)

```
┌─────────────────────────────────────────────────────────┐
│                      Demo App (React)                     │
│  ┌───────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Surface Picker │  │ New-Surface Form │  │ Trace Panel│ │
│  └───────┬───────┘  └────────┬─────────┘  └─────┬──────┘ │
│          │                    │                   │       │
│          ▼                    ▼                   │       │
│  ┌─────────────────────────────────────────┐      │       │
│  │        SurfaceProfile (selected)          │      │       │
│  └───────────────────┬───────────────────────┘      │       │
│                       ▼                              │       │
│  ┌───────────────────────────────┐                  │       │
│  │   Resolution Core (pure TS)    │──── trace ───────┘       │
│  │   resolve(spec, surface)       │                          │
│  └───────────────┬────────────────┘                          │
│                   ▼                                           │
│         ResolvedLayout (positions/sizes/visibility)           │
│                   ▼                                           │
│  ┌───────────────────────────────┐                            │
│  │   Renderer (React + CSS Grid)  │                            │
│  └───────────────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

## 3. Modules

### 3.1 `core/model.ts`
Type definitions: `LayoutSpec`, `ElementSpec`, `SurfaceProfile`, `Inset`, `ResolvedLayout`, `ResolvedElement`, `DegradationStep`. No behavior, only contracts.

### 3.2 `core/classify.ts`
Pure functions that derive generic properties from any `SurfaceProfile`: effective canvas (after insets), size tier (e.g., compact/regular/large based on area thresholds), orientation normalization. This module is what lets an unseen 5th surface be handled correctly — classification is computed from geometry, never looked up by `id`.

### 3.3 `core/resolver.ts`
The engine: `resolve(spec, surface): ResolvedLayout`. Implements the priority-ordered allocation and degradation-ladder walk described in the TRD. Depends only on `model.ts` and `classify.ts`.

### 3.4 `core/trace.ts`
Small helper for building consistent, readable trace strings, used by `resolver.ts` so explanations are generated inline with decisions, not reconstructed afterward.

### 3.5 `surfaces/builtin.ts`
The 4 required `SurfaceProfile` instances (mobile portrait, mobile landscape, broadcast lower-third, square kiosk) plus one or two example specs (`specs/example.ts`) used for the demo.

### 3.6 `render/Renderer.tsx`
Takes a `ResolvedLayout` and renders a grid where each element is CSS-Grid/absolutely positioned according to the resolver's output. Contains **no** layout decision logic — only translates numbers into CSS.

### 3.7 `demo/App.tsx`
- Surface picker (built-in 4 + "custom").
- A form to define a new `SurfaceProfile` live (width, height, orientation, category, optional insets) — this feeds FR-5.
- Trace panel showing, per selected element, the ordered trace entries from `ResolvedElement.trace`.

## 4. Data Flow
1. User selects or defines a `SurfaceProfile`.
2. `App.tsx` calls `resolve(exampleSpec, surface)`.
3. `resolver.ts` computes the effective canvas via `classify.ts`, iterates elements in priority order, applies degradation as needed, and emits a `ResolvedLayout` with per-element trace.
4. `Renderer.tsx` consumes the `ResolvedLayout` and paints it with CSS Grid/Flexbox — a pure projection step with no branching on surface identity.

## 5. Extension Points
- **New surface type:** add a `SurfaceProfile` object; no resolver changes are needed since classification is geometry-driven.
- **Broadcast-safe-area / print-bleed:** already modeled as `Inset` on `SurfaceProfile`, subtracted from canvas before allocation in `classify.ts`. Extending to print-bleed means adding another `Inset`-shaped field, with no new control flow — this is the direct answer to demo topic 5.
- **New element kind:** `ElementSpec.kind` is an open string; the renderer can switch on `kind` for painting without the resolver caring what "kind" means.
- **New degradation step:** extend the `DegradationStep` union; the ladder-walking loop in `resolver.ts` iterates generically over whatever steps are present.

## 6. Directory Structure
```
fladapt/
  src/
    core/
      model.ts
      classify.ts
      resolver.ts
      trace.ts
    surfaces/
      builtin.ts
    specs/
      example.ts
    render/
      Renderer.tsx
    demo/
      App.tsx
      SurfacePicker.tsx
      NewSurfaceForm.tsx
      TracePanel.tsx
    main.tsx
  tests/
    resolver.test.ts
    classify.test.ts
  README.md
```

## 7. Key Architectural Decision
The resolver never imports React or touches the DOM. This is enforced structurally (a separate `core/` folder with no framework imports) so the "framework-agnostic resolution, React only for painting" requirement is a build-time fact, not just a convention.
