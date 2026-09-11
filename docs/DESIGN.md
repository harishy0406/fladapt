# Design Document: Resolution Algorithm

**Project:** Fladapt — Adaptive Multi-Surface Layout Engine
**Author:** M Harish Gautham

## 1. Purpose
This document describes the concrete, step-by-step design of the priority/degradation resolution algorithm — the part of Fladapt that will be explained live and interrogated with a new element/surface combination.

## 2. Design Principle
Prefer a **greedy, priority-ordered allocator** over a general constraint solver. Elements are processed from highest to lowest priority; each element gets the best size it can given what's left; the process is a single linear pass plus, per element, a short deterministic fallback ladder. This trades mathematical generality for full explainability — every outcome can be traced to one priority comparison and one space check.

## 3. Step-by-Step Algorithm

### Step 1 — Compute effective canvas
```
effectiveCanvas = {
  width:  surface.width  - (insets.left + insets.right),
  height: surface.height - (insets.top + insets.bottom)
}
```
where `insets` merges `safeArea` and `bleed` if both are present (they compose additively, since both shrink usable space from the outer edge). This is the *only* place surface-specific numbers enter the algorithm.

### Step 2 — Classify surface (generic, id-agnostic)
Derive from geometry alone:
- `orientation`: explicit if provided, else `width > height ? "landscape" : width < height ? "portrait" : "square"`.
- `sizeTier`: bucket by effective canvas area against fixed thresholds (e.g., `< 0.05MP → "micro"`, `< 0.5MP → "compact"`, else `"regular"`) — used only to bias degradation aggressiveness, never to branch on identity.

### Step 3 — Sort elements by priority
Ascending `priority` value = processed first = most protected. Stable sort so tie-break order is deterministic and traceable.

### Step 4 — Allocate per element (loop)
For each element, in priority order, with `remaining` space shrunk by already-placed elements' bounding boxes:
1. Try `preferredSize`. If it fits within `remaining` (and respects `aspectLocked` if set) → place it there; trace: *"placed at preferred size; fits within remaining space."*
2. Else walk the `degradation` ladder in the order authored on the spec:
   - `shrink → to`: check if the shrink target fits; if yes, place at that size; trace records old vs. new size and the deficit that caused it.
   - `reflow → stack|inline`: change internal arrangement (relevant for composite/group elements); re-check fit.
   - `truncate → maxLines`: reduce content footprint (mainly affects text elements' height estimate); re-check fit.
   - `hide`: element is dropped; trace: *"no degradation step fit remaining space (W×H); hidden."*
3. The first ladder step that fits wins; later steps are not attempted. If the ladder is exhausted with nothing fitting, and `hide` was not explicitly listed, the element is hidden anyway as an implicit final fallback (documented, not silent).

### Step 5 — Position placed elements
Placement follows a simple, deterministic rule set (documented, replaceable): higher-priority elements get first claim on the "anchor" region for their `kind` (e.g., logos anchor to a configured corner, primary text anchors to the region most protected by safe-area insets); remaining elements fill leftover space top-to-bottom / left-to-right. This positioning rule is intentionally simple and is the first thing to call out as a candidate for generalization if the demo's 5th surface exposes a gap.

### Step 6 — Emit trace + ResolvedLayout
Every element carries its ordered `trace: string[]`, generated inline during steps 4–5, not reconstructed afterward — this guarantees the explanation can never drift from the real decision path.

## 4. Worked Example
Spec: `logo` (priority 1, preferred 200×80, degradation: shrink→120×48, hide), `headline` (priority 2, preferred 480×120, degradation: shrink→320×80, truncate→2 lines, hide), `cta` (priority 3, preferred 160×48, degradation: hide).

Surface: broadcast lower-third, effective canvas after title-safe inset ≈ 640×140.

Trace (abbreviated):
- `logo`: preferred 200×80 fits in 640×140 → placed at (0,0), 200×80. Remaining width: 440.
- `headline`: preferred 480×120 does not fit in remaining 440×140 → shrink step to 320×80 fits → placed at (200,0), 320×80. Remaining width: 120.
- `cta`: preferred 160×48 does not fit in remaining 120×140 → no further degradation steps besides hide → hidden. Trace: *"remaining width 120 < required 160; no shrink/reflow step defined; hidden."*

This is exactly the "why did element X end up here" narrative that demo topic 4 requires.

## 5. Handling an Unseen 5th Surface
Because Steps 1–2 only consume `width`, `height`, `orientation`, and `insets`, a brand-new profile (e.g., a smartwatch face, 1:1 at 200×200, with a small circular safe inset approximated as a rectangular inset) flows through the identical code path: canvas shrinks, elements are attempted in the same priority order, the same degradation ladders apply. No special-casing is required or permitted — this is the core proof point for the live demo.

## 6. Extending to Safe-Area / Print-Bleed
Both are already first-class `Inset` fields on `SurfaceProfile`, consumed identically in Step 1. Print-bleed differs semantically (it *adds* printable margin outside the trim line rather than protecting content) but mechanically composes the same way: it can be modeled as a negative inset (expanding canvas) or as a separate `bleed` field merged in Step 1 alongside `safeArea`. No resolver control-flow changes are needed — only the merge formula in Step 1.

## 7. Known Simplifications (to disclose live)
- Positioning (Step 5) uses simple anchor/flow rules, not a general 2D packing algorithm — acceptable per assignment FAQ guidance to avoid an over-engineered solver.
- Text measurement (`truncate`) uses an estimated character/line budget rather than real font metrics, since accurate text shaping is out of scope for the resolution algorithm itself.
- No two-pass "if hiding element A frees enough space to un-shrink element B" optimization; degradation is monotonic and one-directional per the greedy design.

## 8. Validation Strategy
- Unit tests per algorithm step (canvas computation, classification, ladder walking, positioning).
- Golden tests: same spec fixture across all 4 required surfaces, checked into the repo, asserted for stability.
- Manual live test: define a 5th surface in the demo UI and confirm trace output is coherent, to rehearse demo topic 2.
