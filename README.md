# fladapt

An explainable, deterministic adaptive layout engine that transforms a single content specification into optimized layouts for multiple surfaces — mobile, social, kiosks, digital billboards, and broadcast displays.

## Project Structure

```
fladapt/
├── backend/          # Core resolution engine (pure TypeScript)
│   ├── src/
│   │   ├── model.ts      # Type definitions (LayoutSpec, SurfaceProfile, etc.)
│   │   ├── classify.ts   # Surface classification (geometry-driven, id-agnostic)
│   │   ├── resolver.ts   # Priority-ordered resolution engine
│   │   ├── trace.ts      # Trace generation helper
│   │   ├── surfaces/
│   │   │   └── builtin.ts    # 4 built-in surface profiles
│   │   └── specs/
│   │       └── example.ts    # Example layout spec
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React demo app
│   ├── src/
│   │   └── components/
│   │       ├── App.tsx     # Demo application
│   │       └── Renderer.tsx    # CSS projection renderer
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/             # Project documentation
│   ├── PRD.md          # Product Requirements Document
│   ├── TRD.md          # Technical Requirements Document
│   ├── ARCHITECTURE.md # Architecture Document
│   └── DESIGN.md       # Design Document (Resolution Algorithm)
├── .gitignore
├── task.md           # Task tracking
└── README.md
```

## Features

- **Surface-agnostic resolution** — One layout spec resolves correctly across mobile portrait, mobile landscape, broadcast lower-third, and square kiosk out of the box
- **Unseen surface support** — Any new surface profile (smartwatch, print, etc.) flows through the identical code path without code changes
- **Explainable** — Every layout decision (position, size, hide/show, degradation) carries a human-readable trace explaining why it occurred
- **Graceful degradation** — Lower-priority elements shrink, reflow, or hide before higher-priority elements are affected
- **Framework-agnostic core** — Pure TypeScript resolver with zero DOM/React dependency; React only for painting

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Install and run

```bash
# Install frontend dependencies (includes backend as workspace dependency)
cd frontend && npm install

# Start the demo app
cd frontend && npm run dev
```

### Build the backend

```bash
cd backend && npm run build
```

## How It Works

The resolution engine follows a priority-ordered algorithm:

1. **Compute effective canvas** — Surface bounds minus safeArea/bleed insets
2. **Classify surface** — Derive orientation and size tier from geometry alone (id-agnostic)
3. **Sort elements by priority** — Lower priority number = processed first = more protected
4. **Allocate per element** — Try preferred size → walk degradation ladder (shrink → reflow → truncate → hide)
5. **Position elements** — Higher-priority elements get first claim on anchor regions
6. **Emit trace + ResolvedLayout** — Every decision has a human-readable explanation

### Example trace

```
logo: preferred size 200×80 fits in 640×140; placed at preferred size.
headline: preferred size 480×120 does not fit in 640×140; attempting degradation ladder.
headline: shrink to 320×80 fits; placed at that size.
cta: preferred size 160×48 does not fit in remaining 120×140; no further degradation steps besides hide → hidden.
```

## Running the Demo

The demo app provides:
- **Surface Picker** — Switch between the 4 built-in surfaces
- **New Surface Form** — Define a custom surface profile at runtime (FR-5)
- **Trace Panel** — View per-element reasoning for any layout decision

## Architecture

- **Backend** (`backend/src/`) — Pure TypeScript, no rendering concerns. Converts `(LayoutSpec, SurfaceProfile) → ResolvedLayout`.
- **Frontend** (`frontend/src/`) — React components that take a `ResolvedLayout` and paint it using CSS Grid/Flexbox.
- **Docs** (`docs/`) — PRD, TRD, ARCHITECTURE, and DESIGN documents.

## License

MIT
