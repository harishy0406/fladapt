

import { SurfaceProfile } from "../model";

// ---------------------------------------------------------------------------
// The 4 required built-in surface profiles
// ---------------------------------------------------------------------------

/** Mobile portrait (phone held vertically) */
export const mobilePortrait: SurfaceProfile = {
  id: "mobile-portrait",
  width: 360,
  height: 640,
  orientation: "portrait",
  category: "mobile",
  safeArea: { top: 40, right: 40, bottom: 40, left: 40 },
};

/** Mobile landscape (phone held horizontally) */
export const mobileLandscape: SurfaceProfile = {
  id: "mobile-landscape",
  width: 640,
  height: 360,
  orientation: "landscape",
  category: "mobile",
  safeArea: { top: 40, right: 40, bottom: 40, left: 40 },
};

/** Broadcast lower-third (typical TV lower-third broadcast area) */
export const broadcastLowerThird: SurfaceProfile = {
  id: "broadcast-lower-third",
  width: 640,
  height: 140,
  orientation: "landscape",
  category: "broadcast",
  safeArea: { top: 0, right: 0, bottom: 0, left: 0 }, // title-safe inset applied per spec
};

/** Square kiosk (e.g., information kiosk screen) */
export const squareKiosk: SurfaceProfile = {
  id: "square-kiosk",
  width: 800,
  height: 800,
  orientation: "square",
  category: "kiosk",
  safeArea: { top: 50, right: 50, bottom: 50, left: 50 },
};

// ---------------------------------------------------------------------------
// Union type for convenience
// ---------------------------------------------------------------------------

export type BuiltInSurface =
  | typeof mobilePortrait
  | typeof mobileLandscape
  | typeof broadcastLowerThird
  | typeof squareKiosk;

// ---------------------------------------------------------------------------
// Lookup by id
// ---------------------------------------------------------------------------

export function getSurfaceById(
  id: string
): BuiltInSurface | undefined {
  switch (id) {
    case mobilePortrait.id:
      return mobilePortrait;
    case mobileLandscape.id:
      return mobileLandscape;
    case broadcastLowerThird.id:
      return broadcastLowerThird;
    case squareKiosk.id:
      return squareKiosk;
    default:
      return undefined;
  }
}

export default {
  mobilePortrait,
  mobileLandscape,
  broadcastLowerThird,
  squareKiosk,
  getSurfaceById,
};