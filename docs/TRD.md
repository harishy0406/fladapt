# Technical Requirements Document: Fladapt

**Project:** Fladapt — Adaptive Multi-Surface Layout Engine
**Author:** M Harish Gautham

## 1. Tech Stack
- **Language:** TypeScript (strict mode) for the core engine — zero DOM/React dependency.
- **Rendering:** React (function components) + CSS Grid/Flexbox for the demo UI only.
- **Build tooling:** Vite (fast dev server, TS + React support). Not a hard requirement, just the default choice.
- **Testing:** Vitest (or Jest) for unit tests of the resolver. No e2e testing required for this scope.
- No backend/server component; fully client-side demo app.

## 2. Core Data Contracts

### 2.1 LayoutSpec
```ts
interface LayoutSpec {
  id: string;
  elements: ElementSpec[];
}

interface ElementSpec {
  id: string;
  kind: "text" | "image" | "logo" | "cta" | "meta" | string; // open-ended
  priority: number;                 // lower = more important
  minSize: { width: number; height: number };
  preferredSize: { width: number; height: number };
  aspectLocked?: boolean;
  degradation: DegradationStep[];   // ordered fallback behaviors
  content?: Record<string, unknown>; // opaque payload for renderer
}

type DegradationStep =
  | { type: "shrink"; to: { width: number; height: number } }
  | { type: "reflow"; layout: "stack" | "inline" }
  | { type: "truncate"; maxLines: number }
  | { type: "hide" };
```

### 2.2 SurfaceProfile
```ts
interface SurfaceProfile {
  id: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
  category: "mobile" | "broadcast" | "kiosk" | "print" | string; // open, unknown values allowed
  safeArea?: Inset;   // broadcast title-safe / action-safe
  bleed?: Inset;      // print bleed
  pixelDensity?: number;
}

interface Inset { top: number; right: number; bottom: number; left: number; }
```

### 2.3 ResolvedLayout (engine output)
```ts
interface ResolvedLayout {
  surfaceId: string;
  specId: string;
  elements: ResolvedElement[];
}

interface ResolvedElement {
  id: string;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  appliedDegradation: DegradationStep[]; // steps actually applied, in order
  trace: string[];   // human-readable reasoning, one entry per decision
}
```

## 3. Algorithmic Requirements
- Resolution must be a pure function: `resolve(spec: LayoutSpec, surface: SurfaceProfile): ResolvedLayout`.
- Must compute an **effective canvas** = surface bounds minus safeArea/bleed insets before allocating any element.
- Elements are processed in **priority order** (ascending priority number = processed first / protected first).
- For each element, in order: attempt preferred size → if insufficient remaining space, walk its `degradation` ladder in order (shrink → reflow → truncate → hide) → stop at first step that fits, or hide if none fit.
- Once an element's final size/position is committed, it is subtracted from remaining available space for subsequently processed (lower-priority) elements.
- Unseen surfaces must be handled by the *same* code path: classification (portrait/landscape/square, size tier) is inferred generically from `width`, `height`, `orientation` — never from an `if (surfaceId === "kiosk")` branch.
- Every decision affecting an element must append a trace entry (e.g., `"logo: preferred size 200x80 exceeds remaining width 140, applying shrink to 140x56"`).

## 4. Extensibility Requirements
- New surface categories (e.g., `"watch"`, `"print"`) must be usable without resolver code changes — only geometry (width/height/orientation/insets) matters to the core algorithm.
- New constraint types (safe-area, bleed) are modeled uniformly as `Inset`, subtracted from canvas — the same mechanism should extend to future inset-like constraints.
- New degradation step types can be added to the `DegradationStep` union without changing the element-processing loop's control flow (the loop iterates over whatever steps are present).

## 5. Testing Requirements
- Unit tests for the resolver covering: element fits without degradation; single degradation step applied; full ladder exhausted → hidden; safe-area/bleed reduces canvas correctly; unseen surface with an extreme aspect ratio.
- Golden/snapshot tests: one fixed spec resolved against each of the 4 required surfaces, asserting stable output.
- Trace tests: assert trace text references the actual reason (priority, remaining space) so explanations stay honest as code evolves.

## 6. Explainability Requirements
- `trace` must be generated as a side effect of the real decision path (not synthesized after the fact from the final output), so the explanation can never diverge from actual behavior.
- The demo UI must expose the trace for any selected element on any surface.

## 7. Performance
- Target: full resolution of a ~20-element spec across a surface in under 5ms in a modern browser; no async/network calls in the resolution path.

## 8. Deployment
- Optional. If deployed, a static build (`vite build`) hosted on any static host (Vercel/Netlify/GitHub Pages) is sufficient. A local `npm run dev` demo is acceptable per assignment FAQ.

## 9. Out of Scope
- Persistence layer, authentication, multi-user collaboration.
- Automated visual regression testing.
- Full LP/constraint-solver implementation (explicitly discouraged by assignment FAQ).
