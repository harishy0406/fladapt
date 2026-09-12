

import { computeEffectiveCanvas, classifySurface, Inset, SurfaceProfile } from "./model";

// Inset merger: merges safeArea and bleed if both are present.
// They compose additively since both shrink/expand usable space from the outer edge.
export function mergeInsets(
  safeArea?: Inset,
  bleed?: Inset
): Inset {
  if (!safeArea && !bleed) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (!safeArea) return bleed!;
  if (!bleed) return safeArea;
  return {
    top: safeArea.top + bleed.top,
    right: safeArea.right + bleed.right,
    bottom: safeArea.bottom + bleed.bottom,
    left: safeArea.left + bleed.left,
  };
}

// ---------------------------------------------------------------------------
// Public: compute effective canvas after insets are merged and applied
// ---------------------------------------------------------------------------

export interface ComputedCanvas {
  width: number;
  height: number;
}

/** Return the effective canvas (surface bounds minus merged insets). */
export function computeCanvas(
  surface: SurfaceProfile,
  safeArea?: Inset,
  bleed?: Inset
): ComputedCanvas {
  const merged = mergeInsets(safeArea, bleed);
  const { width, height } = computeEffectiveCanvas(surface, merged);
  return { width, height };
}

export default {
  computeCanvas,
  mergeInsets,
  classifySurface,
};
