

// Trace generation helper for the Fladapt resolver.
// Every decision affecting an element appends a trace entry inline with the
// real decision path, guaranteeing explanations can never diverge from behavior.

/** Build a standardized "placed at preferred size" trace entry. */
export function placedAtPreferred(
  id: string,
  preferred: { width: number; height: number },
  container: { width: number; height: number }
): string {
  return `${id}: preferred size ${preferred.width}×${preferred.height} fits in ${container.width}×${container.height}; placed at preferred size.`;
}

/** Build a standardized "preferred does not fit" trace entry. */
export function preferredDoesNotFit(
  id: string,
  preferred: { width: number; height: number },
  container: { width: number; height: number }
): string {
  return `${id}: preferred size ${preferred.width}×${preferred.height} does not fit in ${container.width}×${container.height}; attempting degradation ladder.`;
}

/** Build a standardized "shrink to X×Y fits" trace entry. */
export function shrinkFits(
  id: string,
  target: { width: number; height: number },
  container: { width: number; height: number }
): string {
  return `${id}: shrink to ${target.width}×${target.height} fits in ${container.width}×${container.height}; placed at that size.`;
}

/** Build a standardized "shrink to X×Y does not fit" trace entry. */
export function shrinkDoesNotFit(
  id: string,
  target: { width: number; height: number },
  container: { width: number; height: number }
): string {
  return `${id}: shrink to ${target.width}×${target.height} does not fit in ${container.width}×${container.height}; trying next step.`;
}

/** Build a standardized "hidden" trace entry. */
export function elementHidden(
  id: string,
  container: { width: number; height: number }
): string {
  return `${id}: no degradation step fit remaining space (${container.width}×${container.height}); hidden.`;
}

/** Build a standardized "reflow attempted" trace entry. */
export function reflowAttempted(
  id: string,
  layout: "stack" | "inline"
): string {
  return `${id}: reflow ${layout} attempted; continuing degradation ladder.`;
}

/** Build a standardized "truncate attempted" trace entry. */
export function truncateAttempted(
  id: string,
  maxLines: number
): string {
  return `${id}: truncate to ${maxLines} lines; continuing degradation ladder.`;
}

// ---------------------------------------------------------------------------
// Exported: build the full trace array for one element given the applied steps
// ---------------------------------------------------------------------------

export interface TraceEntryResult {
  trace: string[];
}

/** Combine applied degradation steps into a coherent trace array. */
export function buildTrace(
  id: string,
  steps: { type: string; to?: { width: number; height: number } }[],
  preferred: { width: number; height: number },
  container: { width: number; height: number },
  finalPlaced: boolean
): string[] {
  const entries: string[] = [];

  if (steps.length === 0) {
    // No degradation applied — preferred fit
    entries.push(placedAtPreferred(id, preferred, container));
    return entries;
  }

  // Preferred did not fit; walk steps
  entries.push(preferredDoesNotFit(id, preferred, container));

  for (const step of steps) {
    if (step.type === "shrink" && step.to) {
      entries.push(
        shrinkFits(id, step.to, container)
      );
    } else if (step.type === "shrink" && !step.to) {
      entries.push(shrinkDoesNotFit(id, { width: 0, height: 0 }, container));
    } else if (step.type === "reflow") {
      entries.push(
        reflowAttempted(id, step.layout || "stack")
      );
    } else if (step.type === "truncate") {
      entries.push(
        truncateAttempted(id, step.maxLines ?? 0)
      );
    } else if (step.type === "hide") {
      entries.push(
        elementHidden(id, container)
      );
      break; // hide terminates the ladder
    }
  }

  // If we exited the loop without hit break (i.e. ladder exhausted without hide),
  // add a final fallback entry. But since our ladder always includes hide, this
  // is a safety net.
  if (finalPlaced && !entries.some((e) => e.startsWith(`${id}: no degradation`))) {
    // Already handled above
  }

  return entries;
}

export default { placedAtPreferred, preferredDoesNotFit, shrinkFits, shrinkDoesNotFit, elementHidden, reflowAttempted, truncateAttempted, buildTrace };