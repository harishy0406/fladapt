

import { ElementSpec, DegradationStep } from "../model";

// Example layout spec with three elements: logo, headline, CTA.
// Priorities: lower number = more important (processed first).
export const exampleSpec = {
  id: "example-spec",
  elements: [
    {
      id: "logo",
      kind: "logo",
      priority: 1,
      minSize: { width: 40, height: 40 },
      preferredSize: { width: 200, height: 80 },
      aspectLocked: true,
      degradation: [
        { type: "shrink", to: { width: 120, height: 48 } },
        { type: "hide" },
      ],
    },
    {
      id: "headline",
      kind: "text",
      priority: 2,
      minSize: { width: 80, height: 20 },
      preferredSize: { width: 480, height: 120 },
      aspectLocked: false,
      degradation: [
        { type: "shrink", to: { width: 320, height: 80 } },
        { type: "truncate", maxLines: 2 },
        { type: "hide" },
      ],
    },
    {
      id: "cta",
      kind: "cta",
      priority: 3,
      minSize: { width: 50, height: 24 },
      preferredSize: { width: 160, height: 48 },
      aspectLocked: false,
      degradation: [
        { type: "hide" },
      ],
    },
  ],
};

// Degradation steps are ordered fallbacks.
// - "shrink" reduces the element to the specified target dimensions.
// - "reflow" changes internal arrangement (stack/inline) — relevant for composite elements.
// - "truncate" reduces content footprint (e.g., maxLines for text).
// - "hide" drops the element entirely; always the last resort.

export default { exampleSpec };