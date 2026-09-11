

import { computeCanvas, classifySurface, Inset } from "./classify";
import { DegradationStep } from "./model";

// ---------------------------------------------------------------------------
// Resolution entry point
// ---------------------------------------------------------------------------

/**
 * Resolve a layout spec against a surface profile.
 * Pure function: same (spec, surface) → same output and same trace.
 */
export function resolve(
  spec: { id: string; elements: ElementSpec[] },
  surface: SurfaceProfile,
  overrideInsets?: Inset
): ResolvedLayout {
  const specId = spec.id;
  const elements = [...spec.elements].sort((a, b) => a.priority - b.priority);

  // Compute effective canvas; use empty insets if none provided.
  const insets: Inset = overrideInsets || { top: 0, right: 0, bottom: 0, left: 0 };
  const canvas = computeCanvas(surface, insets.safeArea, insets.bleed);

  // Track remaining available width for a simple left-to-right/top-to-bottom flow.
  let remainingWidth = canvas.width;
  let remainingHeight = canvas.height;

  const resolvedElements: ResolvedElement[] = [];

  for (const element of elements) {
    const result = allocateElement(
      element,
      remainingWidth,
      remainingHeight
    );

    // Subtract the placed element's width from remaining space (flow layout).
    remainingWidth = Math.max(0, remainingWidth - result.size.width);

    resolvedElements.push(result);
  }

  return {
    surfaceId: surface.id || "unknown",
    specId,
    elements: resolvedElements,
  };
}

// ---------------------------------------------------------------------------
// Allocate a single element: try preferred → degradation ladder → hide
// ---------------------------------------------------------------------------

interface AllocateResult {
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  appliedDegradation: DegradationStep[];
  trace: string[];
}

function allocateElement(
  element: ElementSpec,
  containerWidth: number,
  containerHeight: number
): AllocateResult {
  const applied: DegradationStep[] = [];
  const trace: string[] = [];

  // --- Step 1: Try preferred size ---
  const pref = element.preferredSize;
  if (fitsIn(pref, containerWidth, containerHeight, element.aspectLocked)) {
    applied.push({ type: "preferred" } as any); // marker, not a DegradationStep
    trace.push(
      `${element.id}: preferred size ${pref.width}×${pref.height} fits in ${containerWidth}×${containerHeight}; placed at preferred size.`
    );
    return {
      visible: true,
      position: { x: 0, y: 0 },
      size: pref,
      appliedDegradation: applied as DegradationStep[],
      trace,
    };
  }

  trace.push(
    `${element.id}: preferred size ${pref.width}×${pref.height} does not fit in ${containerWidth}×${containerHeight}; attempting degradation ladder.`
  );

  // --- Step 2: Walk degradation ladder ---
  let placed = false;
  for (const step of element.degradation) {
    if (step.type === "shrink") {
      const shrinkResult = checkShrinkFits(step.to, containerWidth, containerHeight);
      if (shrinkResult.fits) {
        applied.push(step);
        trace.push(
          `${element.id}: shrink to ${step.to.width}×${step.to.height} fits; placed at that size.`
        );
        placed = true;
        break;
      } else {
        trace.push(
          `${element.id}: shrink to ${step.to.width}×${step.to.height} does not fit; trying next step.`
        );
      }
    } else if (step.type === "reflow") {
      // reflow changes internal arrangement; for our model, just record and continue
      trace.push(
        `${element.id}: reflow ${step.layout} attempted; continuing degradation ladder.`
      );
    } else if (step.type === "truncate") {
      // truncate reduces content footprint; record and continue
      trace.push(
        `${element.id}: truncate to ${step.maxLines} lines; continuing degradation ladder.`
      );
    } else if (step.type === "hide") {
      // hide is the final fallback
      trace.push(
        `${element.id}: no degradation step fit remaining space (${containerWidth}×${containerHeight}); hidden.`
      );
      placed = true;
      break;
    }
  }

  if (!placed) {
    // Safety net: should not happen because ladder includes "hide", but just in case
    trace.push(
      `${element.id}: degradation exhausted; hidden as implicit fallback.`
    );
    return {
      visible: false,
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
      appliedDegradation: [],
      trace,
    };
  }

  // Determine final size based on what was applied
  let finalSize: { width: number; height: number };
  if (applied.some((s) => s.type === "shrink")) {
    const shrinkStep = applied.find((s) => s.type === "shrink") as {
      type: "shrink";
      to: { width: number; height: number };
    };
    finalSize = shrinkStep.to;
  } else {
    // preferred was applied (the marker was pushed), fallback to preferredSize
    finalSize = element.preferredSize;
  }

  return {
    visible: true,
    position: { x: 0, y: 0 },
    size: finalSize,
    appliedDegradation: applied as DegradationStep[],
    trace,
  };
}

// ---------------------------------------------------------------------------
// Helper: does size fit within container, respecting aspect lock?
// ---------------------------------------------------------------------------

function fitsIn(
  size: { width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  aspectLocked?: boolean
): boolean {
  if (aspectLocked) {
    // With aspect locked, ensure both dimensions fit within container
    return size.width <= containerWidth && size.height <= containerHeight;
  }
  return size.width <= containerWidth && size.height <= containerHeight;
}

// ---------------------------------------------------------------------------
// Helper: check if a shrink target fits in the container
// ---------------------------------------------------------------------------

function checkShrinkFits(
  target: { width: number; height: number },
  containerWidth: number,
  containerHeight: number
): { fits: boolean; size: { width: number; height: number } } {
  if (target.width <= containerWidth && target.height <= containerHeight) {
    return { fits: true, size: target };
  }
  return { fits: false, size: target };
}

export default { resolve };