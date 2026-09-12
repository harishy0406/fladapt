<p align="center">
  <img src="assets/Fladapt-ani.gif" alt="Fladapt Logo" width="420" />
</p>
<p align="center">
  <strong>An explainable, deterministic adaptive layout engine that transforms a single content specification into optimized layouts for multiple surfaces — mobile, social, kiosks, digital billboards, and broadcast displays.</strong>
</p>

<p align="center">
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js_18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

---

## 🎯 Overview

Modern content (broadcast lower-thirds, kiosks, mobile apps) must present the same logical information across radically different physical surfaces — different aspect ratios, resolutions, orientations, and safe-area constraints. Traditional responsive design solves this with hardcoded breakpoints and CSS media queries: a fixed layout per known screen size. This does not generalize to unseen surfaces, and it hides the actual decision logic inside CSS, making layout choices unexplainable.

<p align="center">
  <img src="docs/images/layout.png" alt="Fladapt Demo" width="600" height="400" />
</p>

- 🎯 **Surface-agnostic resolution** — One layout spec resolves correctly across mobile portrait, mobile landscape, broadcast lower-third, and square kiosk out of the box
- 🔍 **Explainable** — Every layout decision (position, size, hide/show, degradation) carries a human-readable trace explaining exactly why it occurred
- 🧩 **Graceful degradation** — Lower-priority elements shrink, reflow, or hide before higher-priority elements are affected
- 📐 **Framework-agnostic core** — Pure TypeScript resolver with zero DOM/React dependency; React only for painting
- 🚀 **Unseen surface support** — Any new surface profile (smartwatch, print, etc.) flows through the identical code path without code changes

> **Not just a CSS media query system.** Fladapt uses a priority-ordered greedy allocator over a general constraint solver — preferring full explainability over mathematical generality. Every outcome can be traced to one priority comparison and one space check.

---

## ✨ Key Features

| Feature | Description |
| --- | --- |
| 🎯 **Priority-Ordered Allocation** | Elements processed from highest to lowest priority; each gets the best size it can given what's left — a single linear pass |
| 📐 **Geometry-Driven Classification** | Orientation and size tier inferred from `width`, `height`, `orientation` alone — no `if (surfaceId === "kiosk")` branches |
| 📉 **Degradation Ladder** | Each element has an authored fallback sequence: `shrink → reflow → truncate → hide` — first step that fits wins |
| 🔗 **Effective Canvas Computation** | Surface bounds minus safeArea/bleed insets computed before any allocation — both compose additively |
| 📝 **Inline Trace Generation** | Every decision appends a trace entry at the point of making it — the explanation can never drift from actual behavior |
| 🖼️ **React + CSS Grid Renderer** | Pure projection layer — takes `ResolvedLayout` and paints it with CSS Grid/Flexbox, no layout logic |
| ⚡ **Sub-5ms Resolution** | Full resolution of a ~20-element spec across a surface in under 5ms — no async/network calls |
| 🧪 **4 Built-in Surfaces** | Mobile portrait, mobile landscape, broadcast lower-third, square kiosk — all working out of the box |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend (Core)** | TypeScript (strict mode), zero DOM/React dependency |
| **Frontend (Demo)** | React 18, TypeScript, CSS Grid/Flexbox |
| **Build Tooling** | Vite (fast dev server, TS + React support) |
| **Testing** | Vitest (unit tests for the resolver) |
| **Deployment** | Vercel / Netlify / GitHub Pages (static build) |
| **Containerization** | Docker Compose (optional) |

---

## 🏗️ Architecture

<p align="center">
  <img src="docs/images/architecture.jpg" alt="Fladapt System Architecture" width="800" height="500" />
</p>

Fladapt is split into two cleanly separated layers:

**Resolution Core** — Pure TypeScript, no rendering concerns. Converts `(LayoutSpec, SurfaceProfile) → ResolvedLayout`.

**Presentation Layer** — React components that take a `ResolvedLayout` and paint it using CSS Grid/Flexbox, plus a demo harness for switching surfaces and injecting new ones.

### Module Breakdown

```
fladapt/
├── backend/
│   ├── src/
│   │   ├── model.ts          # Type definitions (LayoutSpec, SurfaceProfile, ElementSpec, etc.)
│   │   ├── classify.ts       # Surface classification (effective canvas, orientation, size tier)
│   │   ├── resolver.ts       # The engine: resolve(spec, surface): ResolvedLayout
│   │   ├── trace.ts          # Trace string generation helper
│   │   ├── textMeasure.ts    # Text measurement engine (canvas 2D + typographic fallback)
│   │   ├── surfaces/
│   │   │   └── builtin.ts    # 4 built-in SurfaceProfile instances
│   │   └── specs/
│   │       └── example.ts    # Example layout spec (logo, headline, CTA)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx       # Demo application (surface picker, trace panel)
│   │   │   ├── Renderer.tsx  # CSS Grid/Flexbox renderer
│   │   │   ├── CanvasRenderer.tsx  # Canvas-based rendering
│   │   │   └── styles.css    # Component styles with design tokens
│   │   ├── main.tsx          # React entry point
│   │   └── vite-env.d.ts     # Vite type declarations
│   ├── public/
│   │   └── favicon.png       # Site favicon
│   ├── index.html            # HTML entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                     # Architecture, Design, PRD, TRD documentation
├── assets/                   # Icons, UI samples, product card images
├── vercel.json               # Vercel deployment configuration
├── package.json              # Root workspace package.json
└── .gitignore
```

---

## 🎯 How It Works

The resolution engine follows a deterministic, priority-ordered algorithm:

**Step 1 — Compute effective canvas**
```
effectiveCanvas = {
  width:  surface.width  - (insets.left + insets.right),
  height: surface.height - (insets.top + insets.bottom)
}
```
where `insets` merges `safeArea` and `bleed` if both are present (they compose additively).

**Step 2 — Classify surface (generic, id-agnostic)**
Derive from geometry alone:
- `orientation`: explicit if provided, else `width > height ? "landscape" : width < height ? "portrait" : "square"`
- `sizeTier`: bucket by effective canvas area against fixed thresholds

**Step 3 — Sort elements by priority**
Ascending `priority` value = processed first = most protected. Stable sort so tie-break order is deterministic.

**Step 4 — Allocate per element (loop)**
For each element, in priority order:
1. Try `preferredSize`. If it fits → place it there
2. Else walk the `degradation` ladder in order authored on the spec:
   - `shrink → to`: check if the shrink target fits
   - `reflow → stack|inline`: change internal arrangement
   - `truncate → maxLines`: reduce content footprint
   - `hide`: element is dropped
3. The first ladder step that fits wins; later steps are not attempted

**Step 5 — Position placed elements**
Higher-priority elements get first claim on the anchor region for their `kind`; remaining elements fill leftover space top-to-bottom / left-to-right.

**Step 6 — Emit trace + ResolvedLayout**
Every element carries its ordered `trace: string[]`, generated inline during steps 4–5, not reconstructed afterward.

### Example Trace

```
logo: preferred size 200×80 fits in 640×140; placed at preferred size.
headline: preferred size 480×120 does not fit in 640×140; attempting degradation ladder.
headline: shrink to 320×80 fits; placed at that size.
cta: preferred size 160×48 does not fit in remaining 120×140; no further degradation steps besides hide → hidden.
```

### Unseen Surface Handling

Because Steps 1–2 only consume `width`, `height`, `orientation`, and `insets`, a brand-new profile (e.g., a smartwatch face, 1:1 at 200×200, with a small circular safe inset) flows through the identical code path. No special-casing is required or permitted — this is the core proof point for the live demo.

---

## 📂 The Four Required Surfaces

Fladapt resolves the same layout spec correctly across all four built-in surface types out of the box:

<p align="center">
<img width="800" height="500" alt="Fladapt Surfaces" src="https://github.com/user-attachments/assets/0b699c32-79f1-4c89-9cb9-c6c6c782d20c" />
</p>

| Surface | Dimensions | Category | Safe Area |
| --- | --- | --- | --- |
| 📱 Mobile Portrait | 360 × 640 | mobile | 40px all sides |
| 📱 Mobile Landscape | 640 × 360 | mobile | 40px all sides |
| 📺 Broadcast Lower-Third | 640 × 140 | broadcast | 0px |
| 🖥️ Square Kiosk | 800 × 800 | kiosk | 50px all sides |

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | 18+ | Frontend runtime |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | 5.x | Core engine language |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | 5.x | Build tool & dev server |

#### Option A: Vite Dev Server (Recommended) 🚀

The fastest way to see the demo:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

| Service | URL |
| --- | --- |
| 🌐 Demo App | [http://localhost:5173](http://localhost:5173) |
| 📖 Backend API | [http://localhost:5173](http://localhost:5173) |

#### Option B: Build & Preview ⚙️

```bash
# Build the frontend
cd frontend && npm run build

# Preview the production build
npm run preview
```

#### Option C: Docker Compose 🐳

```bash
# Build and run all services
docker compose up --build
```

#### Option D: Deploy to Vercel ☁️

```bash
# Deploy with the vercel.json configuration
vercel deploy
```

---

### 📽️ Video Demo

A video demonstration of the system resolving layouts across surfaces can be accessed here:

- **Demo Video Link:** _click the icon for Video_

[<img width="321" height="82" alt="image" src="https://github.com/user-attachments/assets/b7481505-0d8a-4e6d-b340-b55a68008447" />](https://drive.google.com/file/d/1eis1cdGP6pnC0L0JYVis4U4JpVaSbi8O/view?usp=sharing)

---

### 💡 Approach

Fladapt was built around **explainability** and **generalizability**.

1. **Stack Selection (TypeScript + React + Vite):**
   We chose TypeScript for the core engine to ensure framework-agnostic resolution with strict type safety. The resolver has zero DOM/React dependency — it is a pure function that can run in any environment. React is used only in the presentation layer to paint already-resolved layouts.

2. **Greedy Priority Allocator Over Constraint Solver:**
   We deliberately chose a greedy, priority-ordered allocator over a general constraint solver (LP-style). Elements are processed from highest to lowest priority; each element gets the best size it can given what's left. This trades mathematical generality for full explainability — every outcome can be traced to one priority comparison and one space check.

3. **Geometry-Driven Classification:**
   Surfaces are classified by their dimensions and orientation alone — never by an ID lookup. This means a brand-new surface (smartwatch, print, kiosk) flows through the identical code path without any code changes. This is the architectural answer to "what happens when the interviewer gives you a 5th surface live?"

4. **Inline Trace Generation:**
   Every decision appends a trace entry at the point of making it. The trace array is never reconstructed after the fact from the final output — this guarantees the explanation can never diverge from actual behavior.

5. **Inset Merging:**
   `safeArea` and `bleed` compose additively — they shrink/expand usable space from the outer edge by the same amount. This means future constraint types (print-bleed, broadcast-safe-area) are modeled uniformly as `Inset` fields, with no new control flow needed.

### AI Tools Used

| Tool | Purpose |
| --- | --- |
| **Claude Code** | AI pair-programming for development, debugging, and testing |
| **Vite** | Build tooling and dev server |
| **React** | Presentation layer rendering |

---

### 🚨🔜 Limitations and Next Steps

- **Positioning Algorithm**: Uses simple anchor/flow rules, not a general 2D packing algorithm — acceptable per assignment guidance to avoid over-engineering
- **Text Measurement**: Uses an estimated character/line budget rather than real font metrics — accurate text shaping is out of scope for the resolution algorithm itself
- **No Two-Pass Optimization**: Degradation is monotonic and one-directional per the greedy design — no "if hiding element A frees enough space to un-shrink element B" optimization
- **In-Memory FAISS Index**: Currently, the FAISS index is kept in memory and rebuilt from database rows on startup. For massive datasets, we would migrate this to the `pgvector` extension in PostgreSQL so embeddings reside alongside relational data.
- **PDF Viewer Highlighting**: The current frontend displays the page number and quoted verbatim snippet. In the next iteration, we would use a PDF renderer library like `react-pdf` to highlight the exact bounding box of the source text inside the PDF page.
- **Human-in-the-Loop Edits**: Fladapt v1 is read-only over generated facts. Adding support for analysts to manually correct or annotate disputed relationships would make it a complete collaborative audit tool.
- **Streaming Extraction**: Currently, the entire document is processed synchronously. Adding WebSocket-based streaming would show facts appearing in real-time as pages are processed.
- **Multi-Modal Extraction**: Tables and charts in PDFs are currently extracted as text. Adding vision-based extraction would improve accuracy for structured tabular data.

---

### Before You Submit Checklist

- [x] The project runs from these instructions and accepts new surfaces through a form and API
- [x] Results contain resolved layouts, positions, sizes, and per-element traces
- [x] All four required surfaces are demonstrated and a 5th unseen surface works
- [x] Approach is documented with a demo video (3 minutes or less)

---

## 📂 Project Structure

```
fladapt/
├── backend/
│   ├── src/
│   │   ├── model.ts          # Type definitions (LayoutSpec, SurfaceProfile, etc.)
│   │   ├── classify.ts       # Surface classification (effective canvas, orientation, size tier)
│   │   ├── resolver.ts       # The engine: resolve(spec, surface): ResolvedLayout
│   │   ├── trace.ts          # Trace string generation helper
│   │   ├── textMeasure.ts    # Text measurement engine (canvas 2D + typographic fallback)
│   │   ├── surfaces/
│   │   │   └── builtin.ts    # 4 built-in SurfaceProfile instances
│   │   └── specs/
│   │       └── example.ts    # Example layout spec (logo, headline, CTA)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx       # Demo application (surface picker, trace panel)
│   │   │   ├── Renderer.tsx  # CSS Grid/Flexbox renderer
│   │   │   ├── CanvasRenderer.tsx  # Canvas-based rendering
│   │   │   └── styles.css    # Component styles with design tokens
│   │   ├── main.tsx          # React entry point
│   │   └── vite-env.d.ts     # Vite type declarations
│   ├── public/
│   │   └── favicon.png       # Site favicon
│   ├── index.html            # HTML entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/                     # Architecture, Design, PRD, TRD documentation
├── assets/                   # Icons, UI samples, product card images
├── vercel.json               # Vercel deployment configuration
├── package.json              # Root workspace package.json
└── .gitignore
```

---

## 🔑 API Reference

### Resolution Engine

| Method | Endpoint | Description |
| --- | --- | --- |
| `function` | `resolve(spec, surface)` | Resolve a `LayoutSpec` against a `SurfaceProfile` → `ResolvedLayout` |
| `function` | `classifySurface(surface)` | Derive orientation and size tier from geometry alone |
| `function` | `computeEffectiveCanvas(surface, insets)` | Compute canvas bounds minus safeArea/bleed insets |
| `function` | `measureRenderedText(text, options)` | Measure text width/height using canvas 2D or typographic fallback |
| `function` | `computeContrastRatio(fg, bg)` | Calculate WCAG 2.1 contrast ratio between two hex colors |

### Data Contracts

| Type | Description |
| --- | --- |
| `LayoutSpec` | Surface-independent layout description with elements and their priorities |
| `ElementSpec` | Content element with preferred size, min size, degradation ladder, a11y constraints |
| `SurfaceProfile` | Target physical surface with dimensions, orientation, category, and optional insets |
| `ResolvedLayout` | Output: concrete layout with position, size, visibility, and trace per element |
| `ResolvedElement` | Single resolved element with applied degradation steps and trace entries |
| `DegradationStep` | Fallback behavior: shrink, reflow, truncate, or hide |
| `Inset` | Rectangular inset (safeArea or bleed) with top/right/bottom/left |

### React Components

| Component | Description |
| --- | --- |
| `App.tsx` | Demo application with surface picker, new-surface form, and trace panel |
| `Renderer.tsx` | Pure CSS projection — takes `ResolvedLayout` and paints with CSS Grid/Flexbox |
| `CanvasRenderer.tsx` | Canvas-based rendering for advanced visualization |

---

## 📊 Monitoring & Observability

<img width="900" height="300" alt="Fladapt_Monitoring" src="https://github.com/user-attachments/assets/525a3e80-8e1a-4715-a590-ca280f6e4a0d" />

### Performance Targets

- **Resolution**: Full resolution of a ~20-element spec across a surface in under 5ms
- **No async/network calls** in the resolution path — pure synchronous computation
- **Deterministic**: Same (spec, surface) input always produces the same output and trace

---

## 🧪 Testing

```bash
cd backend

# Run the test suite
npm test
```

**Test Coverage:**

| Test File | Covers |
| --- | --- |
| `resolver.test.ts` | Element fits without degradation, single degradation step, full ladder exhausted → hidden, safe-area/bleed canvas, unseen surface |
| `classify.test.ts` | Orientation inference, size tier bucketing, effective canvas computation |
| Trace tests | Assert trace text references actual reason (priority, remaining space) |

---

## 🚀 Deployment

### Vercel (Recommended) ☁️

```bash
vercel deploy
```

This launches the frontend with the Vite build pipeline configured in `vercel.json`.

### Docker Compose 🐳

```bash
docker compose up --build
```

This launches all services: **Frontend** + **Backend**.

### Individual Services

| Service | Deployment Target | Notes |
| --- | --- | --- |
| Frontend | Vercel / Netlify | Set `VITE_API_URL` to your backend URL |
| Backend | Render / Railway | Set `NODE_ENV` and `TS_NODE` |
| Database | Supabase / Neon | Optional, for persisted specs |

---

## 📄 License

This project was built as part of the Fladapt assignment.

---

<div align="center">

**Built with ❤️ by [M Harish Gautham](https://github.com/harishy0406)**

⭐ If you find this project impressive, give it a star! ⭐

</div>
