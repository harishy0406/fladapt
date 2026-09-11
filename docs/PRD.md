# Product Requirements Document: Fladapt

**Project:** Fladapt — Adaptive Multi-Surface Layout Engine
**Author:** M Harish Gautham
**Status:** Draft — Assignment Submission

## 1. Problem Statement
Modern content (broadcast lower-thirds, kiosks, mobile apps) must present the same logical information across radically different physical surfaces — different aspect ratios, resolutions, orientations, and safe-area constraints. Traditional responsive design solves this with hardcoded breakpoints and CSS media queries: a fixed layout per known screen size. This does not generalize to unseen surfaces, and it hides the actual decision logic inside CSS, making layout choices unexplainable.

Fladapt is a resolution engine that takes one abstract layout **spec** (a description of content elements and their relative importance) and a **surface profile** (a description of a target physical/rendering context) and computes a concrete layout — position, size, and visibility of every element — through an explicit, inspectable, priority-ordered algorithm rather than per-surface hardcoding.

## 2. Goals
- One layout spec must resolve correctly across at least 4 distinct surface types out of the box: mobile portrait, mobile landscape, broadcast lower-third, square kiosk.
- The resolution algorithm must generalize to a 5th, previously unseen surface profile supplied live, without code changes.
- Every layout decision (position, size, hide/show, degradation) must be explainable: given an element and a surface, the system can state *why* that outcome occurred.
- The core decision logic must live in framework-agnostic TypeScript, not in CSS media queries or hardcoded per-surface branches.
- Final rendering may use React + CSS Grid/Flexbox, but only to *paint* a layout already fully resolved by the TypeScript engine.

## 3. Non-Goals
- A general-purpose constraint solver (LP-style, or a from-scratch CSS Flexbox re-implementation) is explicitly not required, and is discouraged if it adds complexity without improving explainability.
- A large library of element types/widgets — depth of the resolution algorithm matters more than breadth of supported content types.
- Guaranteed pixel-perfect parity with native platform layout systems.
- Production deployment, auth, persistence, or multi-user concerns.

## 4. Target Context & Users
This is a technical assignment / live-interview deliverable. The "users" are:
- **The candidate (author)**, who must build and explain the system live.
- **The interviewer/reviewer**, who will inspect the resolution logic, introduce a new surface live, and probe *why* specific elements land where they do.

## 5. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Accept a single, surface-independent layout spec describing content elements, each with a relative priority/importance. |
| FR-2 | Accept a surface profile describing dimensions, orientation, type, and any safe-area/inset constraints. |
| FR-3 | Resolve (spec, surface) → concrete layout (position, size, visibility per element) via a deterministic, priority-ordered algorithm. |
| FR-4 | Support at least 4 built-in surface profiles: mobile portrait, mobile landscape, broadcast lower-third, square kiosk. |
| FR-5 | Accept a new, arbitrary surface profile at runtime and resolve the same spec against it without code changes. |
| FR-6 | Produce a human-readable explanation/trace for each element describing why it received its final position, size, and visibility. |
| FR-7 | Degrade gracefully under space pressure: lower-priority elements shrink, reflow, or hide before higher-priority elements are affected. |
| FR-8 | Render the resolved layout visually (React + CSS Grid/Flexbox) purely as a projection of the resolver's output. |
| FR-9 | Provide a demo harness that can switch between surfaces and inject a new surface profile live. |

## 6. Non-Functional Requirements
- **Explainability over generality** — prefer a well-reasoned priority/degradation heuristic over a mathematically general but opaque solver.
- **Framework independence** of the core resolver (plain TypeScript, no React/DOM dependency).
- **Determinism** — the same (spec, surface) input always produces the same output and the same trace.
- **Extensibility** — adding a new surface *type* or a new constraint class (e.g., safe-area, print bleed) should not require touching per-surface conditional branches.
- **Performance** — resolution must be effectively instantaneous (single-digit ms) for realistic spec sizes (≤ ~20 elements).

## 7. Acceptance Criteria (mapped to demo script)
1. The same spec visibly resolves correctly across mobile portrait, mobile landscape, broadcast lower-third, and square kiosk.
2. A new surface profile can be entered live and the spec resolves sensibly against it, using the same code path as the built-in surfaces.
3. The priority/degradation algorithm can be explained step-by-step from the actual code, not from a separate description that doesn't match the implementation.
4. For any element on any surface, the system can justify its resulting position/size by reference to priority, available space, and degradation rules applied.
5. The design can be extended to broadcast-safe-area and print-bleed constraints with a clear, articulable extension point (even if not fully implemented).

## 8. Assumptions
- The spec is authored once, by hand or programmatically, and is not re-derived per surface.
- Surfaces are described declaratively (dimensions, orientation, category, optional insets) — no live measurement of physical hardware is required.
- A README will document any AI-tool usage, per the assignment's disclosure requirement.

## 9. Timeline
3–5 days total, prioritizing a genuinely working, explainable resolver over a large feature set, per assignment guidance.
