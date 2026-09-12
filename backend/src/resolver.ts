

import { computeCanvas } from "./classify";
import { DegradationStep, ElementSpec, Inset, ResolvedElement, ResolvedLayout, SurfaceProfile } from "./model";
import { computeContrastRatio, measureRenderedText } from "./textMeasure";

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
  const canvas = computeCanvas(surface, overrideInsets ?? surface.safeArea, surface.bleed);

  // Track remaining available width for a simple left-to-right/top-to-bottom flow.
  let remainingWidth = canvas.width;
  const remainingHeight = canvas.height;

  const resolvedElements: ResolvedElement[] = [];
  const a11yIssues: string[] = [];

  for (const element of elements) {
    const result = allocateElement(
      element,
      remainingWidth,
      remainingHeight,
      surface
    );

    if (result.a11yStatus && !result.a11yStatus.touchTargetCompliant) {
      a11yIssues.push(`${element.id}: touch target size ${result.a11yStatus.touchTargetSize}px is below WCAG 2.5.5 minimum.`);
    }

    // Subtract the placed element's width from remaining space (flow layout).
    remainingWidth = Math.max(0, remainingWidth - result.size.width);

    resolvedElements.push(result);
  }

  return {
    surfaceId: surface.id || "unknown",
    specId,
    elements: resolvedElements,
    a11ySummary: {
      touchCompliant: a11yIssues.length === 0,
      contrastCompliant: true,
      issues: a11yIssues,
    },
  };
}

// ---------------------------------------------------------------------------
// Allocate a single element: try preferred → degradation ladder → hide
// ---------------------------------------------------------------------------

interface AllocateResult {
  id: string;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  appliedDegradation: DegradationStep[];
  trace: string[];
  a11yStatus?: {
    touchTargetCompliant: boolean;
    touchTargetSize: number;
    contrastRatio?: number;
    notes?: string;
  };
}

function allocateElement(
  element: ElementSpec,
  containerWidth: number,
  containerHeight: number,
  surface?: SurfaceProfile
): AllocateResult {
  const applied: DegradationStep[] = [];
  const trace: string[] = [];

  // --- Accessibility Pre-Check: Touch Targets ---
  const isTouchSurface = !surface || surface.category === "mobile" || surface.category === "kiosk" || surface.orientation === "portrait";
  const requiredMinTouch = element.a11y?.minTouchTarget || (element.kind === "cta" && isTouchSurface ? 48 : 0);

  // --- Text-Measurement-Aware Sizing ---
  let effectivePref = { ...element.preferredSize };
  if (element.kind === "text") {
    const textContent = (element.content?.text as string) || element.id;
    const measured = measureRenderedText(textContent, {
      maxWidth: containerWidth,
      fontSize: 26,
      lineHeight: 1.15,
      maxLines: 4,
    });
    trace.push(
      `[TextMeasure] Measured '${textContent}': ${measured.measuredWidth}×${measured.measuredHeight}px across ${measured.lineCount} line(s) (single-line: ${measured.rawMetrics.singleLineWidth}px).`
    );
    // If text naturally wraps to be taller or shorter, refine preferred size
    if (measured.measuredHeight > effectivePref.height) {
      effectivePref.height = measured.measuredHeight;
    }
  }

  // --- Step 1: Try preferred size ---
  if (fitsIn(effectivePref, containerWidth, containerHeight, element.aspectLocked)) {
    applied.push({ type: "preferred" } as any);
    trace.push(
      `${element.id}: preferred size ${effectivePref.width}×${effectivePref.height} fits in ${containerWidth}×${containerHeight}; placed at preferred size.`
    );

    let a11yStatus = undefined;
    if (requiredMinTouch > 0) {
      const compliant = effectivePref.height >= requiredMinTouch && effectivePref.width >= requiredMinTouch;
      a11yStatus = {
        touchTargetCompliant: compliant,
        touchTargetSize: Math.min(effectivePref.width, effectivePref.height),
        notes: compliant ? `WCAG 2.5.5 Compliant (≥${requiredMinTouch}px)` : `Under target minimum (${requiredMinTouch}px)`,
      };
      trace.push(`[A11Y] Touch target check: ${a11yStatus.notes}`);
    }

    return {
      visible: true,
      id: element.id,
      position: { x: 0, y: 0 },
      size: effectivePref,
      appliedDegradation: applied as DegradationStep[],
      trace,
      a11yStatus,
    };
  }

  trace.push(
    `${element.id}: preferred size ${effectivePref.width}×${effectivePref.height} does not fit in ${containerWidth}×${containerHeight}; attempting degradation ladder.`
  );

  // --- Step 2: Walk degradation ladder ---
  let placed = false;
  for (const step of element.degradation) {
    if (step.type === "shrink") {
      let targetSize = step.to;

      // Accessibility Constraint: Prevent shrinking below minimum touch target on touch surfaces
      if (requiredMinTouch > 0 && (targetSize.height < requiredMinTouch || targetSize.width < requiredMinTouch)) {
        trace.push(
          `[A11Y Constraint] Shrink to ${targetSize.width}×${targetSize.height} would violate ${requiredMinTouch}px touch target; padding to touch target boundary.`
        );
        targetSize = {
          width: Math.max(targetSize.width, requiredMinTouch),
          height: Math.max(targetSize.height, requiredMinTouch),
        };
      }

      const shrinkResult = checkShrinkFits(targetSize, containerWidth, containerHeight);
      if (shrinkResult.fits) {
        applied.push(step);
        trace.push(
          `${element.id}: shrink to ${targetSize.width}×${targetSize.height} fits; placed at that size.`
        );
        placed = true;
        break;
      } else {
        trace.push(
          `${element.id}: shrink to ${targetSize.width}×${targetSize.height} does not fit; trying next step.`
        );
      }
    } else if (step.type === "reflow") {
      trace.push(
        `${element.id}: reflow ${step.layout} attempted; continuing degradation ladder.`
      );
    } else if (step.type === "truncate") {
      trace.push(
        `${element.id}: truncate to ${step.maxLines} lines; continuing degradation ladder.`
      );
    } else if (step.type === "hide") {
      applied.push(step);
      trace.push(
        `${element.id}: no degradation step fit remaining space (${containerWidth}×${containerHeight}); hidden.`
      );
      return {
        visible: false,
        id: element.id,
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        appliedDegradation: applied,
        trace,
      };
    }
  }

  if (!placed) {
    trace.push(
      `${element.id}: degradation exhausted; hidden as implicit fallback.`
    );
    return {
      visible: false,
      id: element.id,
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
    if (requiredMinTouch > 0) {
      finalSize = {
        width: Math.max(finalSize.width, requiredMinTouch),
        height: Math.max(finalSize.height, requiredMinTouch),
      };
    }
  } else {
    finalSize = effectivePref;
  }

  let a11yStatus = undefined;
  if (requiredMinTouch > 0) {
    const compliant = finalSize.height >= requiredMinTouch && finalSize.width >= requiredMinTouch;
    a11yStatus = {
      touchTargetCompliant: compliant,
      touchTargetSize: Math.min(finalSize.width, finalSize.height),
      notes: compliant ? `WCAG 2.5.5 Compliant (≥${requiredMinTouch}px)` : `Under target minimum (${requiredMinTouch}px)`,
    };
  }

  return {
    visible: true,
    id: element.id,
    position: { x: 0, y: 0 },
    size: finalSize,
    appliedDegradation: applied as DegradationStep[],
    trace,
    a11yStatus,
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
