/**
 * Demo application for Fladapt.
 * - Surface picker (built-in 4 + custom input).
 * - New surface form (FR-5).
 * - Trace panel showing per-element reasoning.
 */

import React, { useState, useCallback } from "react";
import { render } from "react-dom";
import { SurfaceProfile, Inset } from "../../backend/src/model";
import {
  mobilePortrait,
  mobileLandscape,
  broadcastLowerThird,
  squareKiosk,
  getSurfaceById,
} from "../../backend/src/surfaces/builtin";
import { resolve } from "../../backend/src/core/resolver";
import { exampleSpec } from "../../backend/src/specs/example";
import { Renderer } from "./Renderer";
import { classifySurface } from "../../backend/src/core/classify";

// ---------------------------------------------------------------------------
// UI types
// ---------------------------------------------------------------------------

interface SurfaceUI {
  id: string;
  name: string;
  profile: SurfaceProfile;
}

interface TracePanelProps {
  selectedElement: string | null;
  trace: string[];
  onSelect: (id: string) => void;
}

// ---------------------------------------------------------------------------
// App component
// ---------------------------------------------------------------------------

const SurfacePicker: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>("mobile-portrait");
  const surfaces: SurfaceUI[] = [
    { id: mobilePortrait.id, name: "Mobile Portrait", profile: mobilePortrait },
    { id: mobileLandscape.id, name: "Mobile Landscape", profile: mobileLandscape },
    { id: broadcastLowerThird.id, name: "Broadcast Lower‑Third", profile: broadcastLowerThird },
    { id: squareKiosk.id, name: "Square Kiosk", profile: squareKiosk },
  ];

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {surfaces.map((s) => (
        <button
          key={s.id}
          style={{
            padding: "6px 12px",
            fontSize: "12px",
            cursor: "pointer",
            background:
              selectedId === s.id ? "#6366f1" : "transparent",
            color: selectedId === s.id ? "#fff" : "#64748b",
            border: "1px solid #6366f1",
            borderRadius: 4,
          }
          onClick={() => setSelectedId(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// New surface form (FR-5: accept arbitrary surface profile at runtime)
// ---------------------------------------------------------------------------

const NewSurfaceForm: React.FC = ({
  onSurfaceDefined,
  initialProfile,
}) => {
  const [width, setWidth] = useState(initialProfile?.width ?? 640);
  const [height, setHeight] = useState(initialProfile?.height ?? 140);
  const [orientation, setOrientation] = useState<
    "portrait" | "landscape" | "square"
  >(initialProfile?.orientation ?? "landscape");
  const [category, setCategory] = useState(initialProfile?.category ?? "broadcast");
  const [safeArea, setSafeArea] = useState<
    { top: number; right: number; bottom: number; left: number }
  >(initialProfile?.safeArea ?? { top: 0, right: 0, bottom: 0, left: 0 });

  const handleDefine = useCallback(() => {
    const profile: SurfaceProfile = {
      id: `custom-${Date.now()}`,
      width: parseInt(width as string, 10) || 640,
      height: parseInt(height as string, 10) || 140,
      orientation: orientation as "portrait" | "landscape" | "square",
      category: category as string,
      safeArea: safeArea as Inset,
    };
    onSurfaceDefined(profile);
  }, [width, height, orientation, category, safeArea]);

  return (
    <div style={{ marginBottom: 16, padding: 12, border: "1px solid #94a3b8", borderRadius: 4 }}>
      <h3 style={{ margin: "0 0 8px", fontSize: "14px" }}>New Surface (FR‑5)</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: "12px" }}>Width</label>
        <input
          type="number"
          value width
          onChange={(e) => setWidth(e.target.value as any)}
          style={{ width: "100px", padding: "4px", fontSize: "12px" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: "12px" }}>Height</label>
        <input
          type="number"
          value height
          onChange={(e) => setHeight(e.target.value as any)}
          style={{ width: "100px", padding: "4px", fontSize: "12px" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: "12px" }}>Orientation</label>
        <select
          value={orientation}
          onChange={(e) => setOrientation(e.target.value as any)}
          style={{ width: "120px", padding: "4px", fontSize: "12px" }}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
          <option value="square">Square</option>
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: "12px" }}>Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          style={{ width: "120px", padding: "4px", fontSize: "12px" }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: "12px" }}>Safe Area (top right bottom left)</label>
        <input
          type="number"
          value={safeArea.top}
          onChange={(e) => setSafeArea({ top: parseInt(e.target.value as any) || 0, right: safeArea.right, bottom: safeArea.bottom, left: safeArea.left })}
          style={{ width: "40px", padding: "4px", fontSize: "12px" }}
        /> {" "}
        <input
          type="number"
          value={safeArea.right}
          onChange={(e) => setSafeArea({ top: safeArea.top, right: parseInt(e.target.value as any) || 0, bottom: safeArea.bottom, left: safeArea.left })}
          style={{ width: "40px", padding: "4px", fontSize: "12px" }}
        /> {" "}
        <input
          type="number"
          value={safeArea.bottom}
          onChange={(e) => setSafeArea({ top: safeArea.top, right: safeArea.right, bottom: parseInt(e.target.value as any) || 0, left: safeArea.left })}
          style={{ width: "40px", padding: "4px", fontSize: "12px" }}
        /> {" "}
        <input
          type="number"
          value={safeArea.left}
          onChange={(e) => setSafeArea({ top: safeArea.top, right: safeArea.right, bottom: safeArea.bottom, left: parseInt(e.target.value as any) || 0 })}
          style={{ width: "40px", padding: "4px", fontSize: "12px" }}
        />
      </div>
      <button
        onClick={handleDefine}
        style={{
          marginTop: 8,
          padding: "4px 8px",
          fontSize: "12px",
        }}
      >
        Define Surface
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Trace panel
// ---------------------------------------------------------------------------

const TracePanel: React.FC<TracePanelProps> = ({ selectedElement, trace, onSelect }) => {
  if (!selectedElement) return null;

  const elTrace = trace.filter((t) => t.startsWith(selectedElement + ":") || t.includes(`${selectedElement} `));

  return (
    <div
      style={{
        marginBottom: 16,
        padding: 12,
        border: "1px solid #94a3b8",
        borderRadius: 4,
        maxHeight: 300,
        overflowY: "auto",
        fontSize: "12px",
        lineHeight: "1.4",
      }}
    >
      <h4 style={{ margin: "0 0 8px", fontSize: "13px" }}>Trace for {selectedElement}</h4>
      <pre
        style={{
          margin: 0,
          padding: 8,
          background: "#0f172a",
          color: "#a0aec0",
          borderRadius: 3,
          overflowX: "auto",
        }}
      >
        {elTrace.length > 0 ? elTrace : trace.slice(0, 10).map((t) => <div key={t}>{t}</div>)}
      </pre>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export const App: React.FC = () => {
  const [surface, setSurface] = useState<SurfaceProfile>(mobilePortrait);
  const [resolved, setResolved] = useState<{
    surfaceId: string;
    specId: string;
    elements: {
      id: string;
      visible: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
      appliedDegradation: any[];
      trace: string[];
    }[] | null>(null);
  const [customSurface, setCustomSurface] = useState<SurfaceProfile | null>(null);
  const [tracePanelOpen, setTracePanelOpen] = useState<string | null>(null);

  // Resolve whenever surface or spec changes
  const handleResolve = useCallback(() => {
    const result = resolve(exampleSpec, surface, customSurface?.safeArea ? { safeArea: customSurface.safeArea, bleed: customSurface.bleed } : undefined);
    setResolved(result.elements.map((el) => ({
      id: el.id,
      visible: el.visible,
      position: el.position,
      size: el.size,
      appliedDegradation: el.appliedDegradation,
      trace: el.trace,
    })));
  }, [surface, customSurface]);

  // Update surface from built-in picker
  const handleSurfaceChange = useCallback((id: string) => {
    const surf = getSurfaceById(id);
    if (surf) {
      setSurface(surf);
      setCustomSurface(null);
      handleResolve();
    }
  }, [handleResolve]);

  // Update surface from custom form
  const handleCustomSurface = useCallback((profile: SurfaceProfile) => {
    setCustomSurface(profile);
    setSurface(profile);
    handleResolve();
  }, [handleResolve]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #94a3b8" }}>
        <h1 style={{ margin: "0", fontSize: "20px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#6366f1" }}>/\\_/\\_</span> Fladapt
        </h1>
        <SurfacePicker />
      </header>

      {/* Custom surface form (FR-5) */}
      {customSurface ? (
        <NewSurfaceForm initialProfile={customSurface} onSurfaceDefined={handleCustomSurface} />
      ) : (
        <NewSurfaceForm initialProfile={null} onSurfaceDefined={handleCustomSurface} />
      )}

      <main style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {["mobile-portrait", "mobile-landscape", "broadcast-lower-third", "square-kiosk"].map((id) => {
          const surf = getSurfaceById(id);
          if (!surf) return null;
          return (
            <div
              key={id}
              style={{
                border: "1px solid #94a3b8",
                borderRadius: 4,
                padding: 12,
                background: "#f1f5f9",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "14px" }}>{surf.name}</h3>
              <button
                onClick={() => {
                  setSurface(surf);
                  setCustomSurface(null);
                  handleResolve();
                }}
                style={{
                  marginBottom: 8,
                  padding: "6px 10px",
                  fontSize: "12px",
                }}
              >
                Resolve
              </button>
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#64748b" }}>
                {surf.width}×{surf.height} {surf.orientation}
              </p>
            </div>
          );
        })}
      </main>

      {/* Trace panel */}
      <TracePanel
        selectedElement={tracePanelOpen}
        trace={resolved ? resolved.map((el) => el.trace).flat() : []}
        onSelect=(id: string) => setTracePanelOpen(id)
      />

      {/* Element trace hover info */}
      {resolved && resolved.map((el) => (
        <div
          key={el.id}
          style={{
            padding: 8,
            margin: 4,
            border: "1px solid #cbd5e1",
            borderRadius: 4,
            background: "#f8fafc",
            fontSize: "12px",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={() => setTracePanelOpen(el.id)}
          onMouseLeave={() => setTracePanelOpen(null)}
        >
          <strong>{el.id}</strong> — {el.trace[0] || "no trace"}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Initialize the demo
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  const mountNode = document.getElementById("root");
  if (mountNode) {
    render(<App />, mountNode);
  }
}