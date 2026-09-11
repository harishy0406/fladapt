

// Core data contracts for the Fladapt layout engine.

export interface Inset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
  category: "mobile" | "broadcast" | "kiosk" | "print" | string;
  safeArea?: Inset;
  bleed?: Inset;
  pixelDensity?: number;
}

export interface ElementSpec {
  id: string;
  kind: "text" | "image" | "logo" | "cta" | "meta" | string;
  priority: number; // lower = more important
  minSize: { width: number; height: number };
  preferredSize: { width: number; height: number };
  aspectLocked?: boolean;
  degradation: DegradationStep[];
  content?: Record<string, unknown>;
}

export type DegradationStep =
  | { type: "shrink"; to: { width: number; height: number } }
  | { type: "reflow"; layout: "stack" | "inline" }
  | { type: "truncate"; maxLines: number }
  | { type: "hide" };

export interface ResolvedLayout {
  surfaceId: string;
  specId: string;
  elements: ResolvedElement[];
}

export interface ResolvedElement {
  id: string;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  appliedDegradation: DegradationStep[];
  trace: string[];
}

// ---------------------------------------------------------------------------
// Helper: compute effective canvas = surface bounds minus insets
// ---------------------------------------------------------------------------

export function computeEffectiveCanvas(
  surface: SurfaceProfile,
  insets: Inset
): { width: number; height: number } {
  return {
    width: surface.width - (insets.left + insets.right),
    height: surface.height - (insets.top + insets.bottom),
  };
}

// ---------------------------------------------------------------------------
// Helper: classify surface from geometry alone (id-agnostic)
// ---------------------------------------------------------------------------

export function classifySurface(surface: SurfaceProfile): {
  orientation: "portrait" | "landscape" | "square";
  sizeTier: "micro" | "compact" | "regular";
} {
  // Orientation: explicit if provided, otherwise inferred from dimensions
  const orientation =
    surface.orientation ||
    (surface.width > surface.height
      ? "landscape"
      : surface.width < surface.height
      ? "portrait"
      : "square");

  // Size tier by effective canvas area (using full surface area as proxy;
  // insets are applied per-surface in the resolver)
  const area = surface.width * surface.height;
  let sizeTier: "micro" | "compact" | "regular";
  if (area < 0.05 * 1_000_000) {
    // < 0.05MP (e.g. smaller than ~316×316)
    sizeTier = "micro";
  } else if (area < 0.5 * 1_000_000) {
    // < 0.5MP (e.g. smaller than ~707×707)
    sizeTier = "compact";
  } else {
    sizeTier = "regular";
  }

  return { orientation, sizeTier };
}

export default { computeEffectiveCanvas, classifySurface };