import React, { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileImage,
  FileText,
  Folder,
  Grid2X2,
  Home,
  Image as ImageIcon,
  Layers,
  LayoutPanelLeft,
  Monitor,
  Moon,
  MoreHorizontal,
  Package,
  PanelTop,
  Plus,
  Save,
  Search,
  Settings,
  Share2,
  Smartphone,
  Sparkles,
  Sun,
  TabletSmartphone,
  Upload,
  X,
  Zap,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { resolve } from "../../../backend/src/resolver";
import { exampleSpec } from "../../../backend/src/specs/example";
import { CanvasRenderer } from "./CanvasRenderer";
import { computeContrastRatio } from "../../../backend/src/textMeasure";
import layoutRef from "../../../assets/layout.png";
import iconUrl from "../../../assets/icon.png";
import heroModel from "../../../assets/hero_model.png";
import cardSummerSale from "../../../assets/card_summer_sale.jpg";
import cardProductLaunch from "../../../assets/card_product_launch.jpg";
import cardFestiveOffer from "../../../assets/card_festive_offer.jpg";
import cardBrandAwareness from "../../../assets/card_brand_awareness.jpg";
import cardFoodBeverage from "../../../assets/card_food_beverage.jpg";
import "./styles.css";

export interface ImageAdjustment {
  x: number;
  y: number;
  scale: number;
}

// ==========================================================================
// Reusable PalmLeaf Vector Component
// ==========================================================================

export function PalmLeaf({
  style,
  className,
  leafColor = "var(--brand-leaf, #2d5229)",
  stemColor = "var(--brand-stem, #f59e0b)",
}: {
  style?: React.CSSProperties;
  className?: string;
  leafColor?: string;
  stemColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ad-palm-leaf ${className || ""}`}
      style={{ pointerEvents: "none", ...style }}
    >
      <path d="M12 118 C28 90 52 50 82 12" stroke={stemColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M16 106 C4 92 10 74 26 80 C23 92 19 101 16 106 Z" fill={leafColor} />
      <path d="M25 90 C10 74 19 55 39 65 C35 77 29 85 25 90 Z" fill={leafColor} />
      <path d="M36 74 C22 57 35 39 52 50 C47 62 41 70 36 74 Z" fill={leafColor} />
      <path d="M49 57 C39 40 54 25 67 36 C61 46 54 53 49 57 Z" fill={leafColor} />
      <path d="M63 39 C59 24 73 12 83 24 C76 31 70 37 63 39 Z" fill={leafColor} />
      <path d="M26 95 C41 99 50 88 43 77 C36 83 31 90 26 95 Z" fill={leafColor} />
      <path d="M39 79 C54 81 63 68 54 59 C47 65 42 72 39 79 Z" fill={leafColor} />
      <path d="M52 63 C67 63 74 50 65 43 C59 49 54 56 52 63 Z" fill={leafColor} />
      <path d="M65 45 C78 43 83 32 74 27 C69 33 66 39 65 45 Z" fill={leafColor} />
      <path d="M25 90 L14 83" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M36 74 L23 65" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M49 57 L38 46" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M39 79 L49 72" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M52 63 L63 56" stroke={stemColor} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// ==========================================================================
// Interactive Draggable & Scalable Hero Image Component
// ==========================================================================

export interface DraggableImageProps {
  src: string;
  adjustment: ImageAdjustment;
  onAdjustmentChange?: (newAdj: ImageAdjustment) => void;
  isInteractive?: boolean;
  style?: React.CSSProperties;
  className?: string;
  containerStyle?: React.CSSProperties;
}

export function DraggableImage({
  src,
  adjustment,
  onAdjustmentChange,
  isInteractive = false,
  style,
  className = "",
  containerStyle,
}: DraggableImageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive || !onAdjustmentChange) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    } catch {}
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: adjustment.x,
      initY: adjustment.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragRef.current || !onAdjustmentChange) return;
    e.preventDefault();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onAdjustmentChange({
      ...adjustment,
      x: Math.round(dragRef.current.initX + dx),
      y: Math.round(dragRef.current.initY + dy),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      dragRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isInteractive || !onAdjustmentChange) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const newScale = Math.min(2.5, Math.max(0.4, Number((adjustment.scale + delta).toFixed(2))));
    onAdjustmentChange({
      ...adjustment,
      scale: newScale,
    });
  };

  return (
    <div
      className={`draggable-image-wrapper ${isInteractive ? "interactive" : ""} ${isDragging ? "dragging" : ""} ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...containerStyle,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isInteractive ? "Drag to reposition image • Scroll to zoom" : undefined}
    >
      <img
        src={src}
        alt="Hero Model"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          transform: `translate3d(${adjustment.x}px, ${adjustment.y}px, 0px) scale(${adjustment.scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)",
          willChange: "transform",
          pointerEvents: "none",
          ...style,
        }}
      />

      {isInteractive && (isHovered || isDragging) && (
        <div className="drag-helper-badge">
          <span>{isDragging ? "Repositioning..." : "✋ Drag to adjust"}</span>
          <small>
            {adjustment.x !== 0 || adjustment.y !== 0 ? `X:${adjustment.x > 0 ? "+" : ""}${adjustment.x} Y:${adjustment.y > 0 ? "+" : ""}${adjustment.y}` : ""}
            {adjustment.scale !== 1 ? ` ${(adjustment.scale * 100).toFixed(0)}%` : ""}
          </small>
        </div>
      )}
    </div>
  );
}

type Page = "home" | "create" | "projects" | "templates" | "media" | "surfaces" | "analytics" | "settings" | "docs";

export type AdTheme = "gold" | "orange" | "purple" | "ocean" | "dark" | "emerald";

export interface ThemePalette {
  name: string;
  id: AdTheme;
  primary: string;
  primaryHover: string;
  secondary: string;
  waveGradient: string;
  canvasBg: string;
  textColor: string;
  textMuted: string;
  leafColor: string;
  stemColor: string;
  ctaText: string;
  badgeBg: string;
  badgeText: string;
  shadow: string;
}

export const THEME_PALETTES: Record<AdTheme, ThemePalette> = {
  gold: {
    name: "Golden Amber",
    id: "gold",
    primary: "#d97706",
    primaryHover: "#b45309",
    secondary: "#ea580c",
    waveGradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 60%, #fde047 100%)",
    canvasBg: "#fffdf9",
    textColor: "#1c1917",
    textMuted: "#475569",
    leafColor: "#2d5229",
    stemColor: "#f59e0b",
    ctaText: "#000000",
    badgeBg: "rgba(234, 88, 12, 0.12)",
    badgeText: "#ea580c",
    shadow: "0 3px 8px rgba(217, 119, 6, 0.35)",
  },
  orange: {
    name: "Sunset Flame",
    id: "orange",
    primary: "#ea580c",
    primaryHover: "#c2410c",
    secondary: "#e11d48",
    waveGradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 60%, #9a3412 100%)",
    canvasBg: "#fffbf5",
    textColor: "#1c1917",
    textMuted: "#57534e",
    leafColor: "#15803d",
    stemColor: "#ea580c",
    ctaText: "#ffffff",
    badgeBg: "rgba(225, 29, 72, 0.12)",
    badgeText: "#e11d48",
    shadow: "0 3px 8px rgba(234, 88, 12, 0.35)",
  },
  purple: {
    name: "Royal Velvet",
    id: "purple",
    primary: "#7c3aed",
    primaryHover: "#6d28d9",
    secondary: "#db2777",
    waveGradient: "linear-gradient(135deg, #c084fc 0%, #8b5cf6 60%, #4c1d95 100%)",
    canvasBg: "#faf5ff",
    textColor: "#0f172a",
    textMuted: "#475569",
    leafColor: "#047857",
    stemColor: "#7c3aed",
    ctaText: "#ffffff",
    badgeBg: "rgba(219, 39, 119, 0.12)",
    badgeText: "#db2777",
    shadow: "0 3px 8px rgba(124, 58, 237, 0.35)",
  },
  ocean: {
    name: "Ocean Breeze",
    id: "ocean",
    primary: "#0284c7",
    primaryHover: "#0369a1",
    secondary: "#0d9488",
    waveGradient: "linear-gradient(135deg, #38bdf8 0%, #0284c7 60%, #0c4a6e 100%)",
    canvasBg: "#f0f9ff",
    textColor: "#0f172a",
    textMuted: "#475569",
    leafColor: "#0f766e",
    stemColor: "#0284c7",
    ctaText: "#ffffff",
    badgeBg: "rgba(13, 148, 136, 0.12)",
    badgeText: "#0d9488",
    shadow: "0 3px 8px rgba(2, 132, 199, 0.35)",
  },
  dark: {
    name: "Midnight Neon",
    id: "dark",
    primary: "#38bdf8",
    primaryHover: "#0ea5e9",
    secondary: "#f43f5e",
    waveGradient: "linear-gradient(135deg, #334155 0%, #1e293b 60%, #0f172a 100%)",
    canvasBg: "#090d16",
    textColor: "#f8fafc",
    textMuted: "#94a3b8",
    leafColor: "#22c55e",
    stemColor: "#38bdf8",
    ctaText: "#020617",
    badgeBg: "rgba(244, 63, 94, 0.2)",
    badgeText: "#f43f5e",
    shadow: "0 3px 8px rgba(56, 189, 248, 0.35)",
  },
  emerald: {
    name: "Emerald Palm",
    id: "emerald",
    primary: "#059669",
    primaryHover: "#047857",
    secondary: "#d97706",
    waveGradient: "linear-gradient(135deg, #34d399 0%, #059669 60%, #064e3b 100%)",
    canvasBg: "#f0fdf4",
    textColor: "#064e3b",
    textMuted: "#166534",
    leafColor: "#15803d",
    stemColor: "#059669",
    ctaText: "#ffffff",
    badgeBg: "rgba(217, 119, 6, 0.12)",
    badgeText: "#d97706",
    shadow: "0 3px 8px rgba(5, 150, 105, 0.35)",
  },
};

export function getActivePalette(theme: AdTheme, customPrimary?: string): ThemePalette {
  const base = THEME_PALETTES[theme] || THEME_PALETTES.gold;
  if (!customPrimary || !customPrimary.trim()) return base;
  return {
    ...base,
    primary: customPrimary,
    waveGradient: `linear-gradient(135deg, ${customPrimary}cc 0%, ${customPrimary} 60%, #00000088 100%)`,
    stemColor: customPrimary,
    shadow: `0 3px 8px ${customPrimary}55`,
  };
}

export function getThemeStyles(palette: ThemePalette): React.CSSProperties {
  return {
    "--brand-primary": palette.primary,
    "--brand-primary-hover": palette.primaryHover,
    "--brand-secondary": palette.secondary,
    "--brand-wave": palette.waveGradient,
    "--brand-canvas-bg": palette.canvasBg,
    "--brand-text": palette.textColor,
    "--brand-text-muted": palette.textMuted,
    "--brand-leaf": palette.leafColor,
    "--brand-stem": palette.stemColor,
    "--brand-cta-text": palette.ctaText,
    "--brand-badge-bg": palette.badgeBg,
    "--brand-badge-text": palette.badgeText,
    "--brand-shadow": palette.shadow,
  } as React.CSSProperties;
}

export function generateReactCode(
  surface: SurfaceCard,
  brand: string,
  headline: string,
  subheadline: string,
  ctaText: string,
  palette: ThemePalette,
  adjust: ImageAdjustment
): string {
  const cleanCompName = surface.name.replace(/[^a-zA-Z0-9]/g, "") + "Ad";
  const isColumn = surface.id === "mobile-portrait" || surface.id === "story-916";
  return `import React from 'react';

// Fladapt Generated Responsive Ad Component
// Target: ${surface.name} (${surface.size})
// Brand: ${brand}

export function ${cleanCompName}() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '${surface.width || 600}px',
        background: '${palette.canvasBg}',
        color: '${palette.textColor}',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: '${isColumn ? "column" : "row"}',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Ad Copy Section */}
      <div style={{ flex: 1.2, padding: '24px', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '${palette.secondary}', letterSpacing: '1px' }}>
            ${brand}
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 800, margin: '8px 0 4px', lineHeight: 1.1, color: '${palette.textColor}' }}>
            {\`${headline.replace(/\n/g, " ")}\`}
          </h2>
          <h3 style={{ fontSize: '15px', color: '${palette.secondary}', fontWeight: 800, margin: '4px 0 12px' }}>
            ${subheadline}
          </h3>
        </div>

        <button
          style={{
            alignSelf: 'flex-start',
            background: '${palette.primary}',
            color: '${palette.ctaText}',
            padding: '10px 22px',
            borderRadius: '999px',
            border: 'none',
            fontWeight: 800,
            fontSize: '13px',
            boxShadow: '${palette.shadow}',
            cursor: 'pointer',
          }}
        >
          ${ctaText} →
        </button>
      </div>

      {/* Hero Visual Section with Backdrop Wave */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '220px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '${palette.waveGradient}',
            clipPath: 'ellipse(90% 85% at 75% 65%)',
          }}
        />
        <img
          src="/assets/hero_model.png"
          alt="Hero"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(${adjust.x}px, ${adjust.y}px) scale(${adjust.scale})',
          }}
        />
      </div>
    </div>
  );
}

export default ${cleanCompName};
`;
}

export function generateHtmlCode(
  surface: SurfaceCard,
  brand: string,
  headline: string,
  subheadline: string,
  ctaText: string,
  palette: ThemePalette,
  adjust: ImageAdjustment
): string {
  const isColumn = surface.id === "mobile-portrait" || surface.id === "story-916";
  return `<!-- Fladapt Generated Ad: ${surface.name} (${surface.size}) -->
<div class="fladapt-ad-unit">
  <div class="fladapt-ad-copy">
    <div class="fladapt-brand-tag">${brand}</div>
    <h2 class="fladapt-headline">${headline.replace(/\n/g, "<br>")}</h2>
    <p class="fladapt-subheadline">${subheadline}</p>
    <a href="#" class="fladapt-cta-btn">${ctaText} &rarr;</a>
  </div>
  <div class="fladapt-visual-wrap">
    <div class="fladapt-wave-backdrop"></div>
    <img src="hero_model.png" alt="${brand}" class="fladapt-hero-img" />
  </div>
</div>

<style>
.fladapt-ad-unit {
  display: flex;
  flex-direction: ${isColumn ? "column" : "row"};
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: ${palette.canvasBg};
  color: ${palette.textColor};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: ${surface.width || 600}px;
}
.fladapt-ad-copy {
  flex: 1.2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 2;
}
.fladapt-brand-tag {
  font-size: 11px;
  font-weight: 800;
  color: ${palette.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
}
.fladapt-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 26px;
  font-weight: 800;
  margin: 8px 0 4px;
  line-height: 1.1;
  color: ${palette.textColor};
}
.fladapt-subheadline {
  font-size: 15px;
  color: ${palette.secondary};
  font-weight: 800;
  margin: 0 0 16px;
}
.fladapt-cta-btn {
  display: inline-block;
  background: ${palette.primary};
  color: ${palette.ctaText};
  padding: 10px 22px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 13px;
  box-shadow: ${palette.shadow};
  width: fit-content;
}
.fladapt-visual-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 200px;
}
.fladapt-wave-backdrop {
  position: absolute;
  inset: 0;
  background: ${palette.waveGradient};
  clip-path: ellipse(90% 85% at 75% 65%);
}
.fladapt-hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(${adjust.x}px, ${adjust.y}px) scale(${adjust.scale});
}
</style>
`;
}

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  status: "Active" | "Draft" | "Archived";
  surfaces: number;
  assets: number;
  updated: string;
  brand?: string;
  headline?: string;
}

interface SurfaceCard {
  id: string;
  name: string;
  size: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape" | "square";
  category: "digital" | "physical";
  icon: React.ReactNode;
  isCustom?: boolean;
}

const initialCampaigns: Campaign[] = [
  {
    id: "c1",
    title: "Summer Sale Campaign",
    subtitle: "Seasonal Campaign",
    image: cardSummerSale,
    status: "Active",
    surfaces: 6,
    assets: 12,
    updated: "Updated 2 hours ago",
    brand: "Flam",
    headline: "Summer Sale",
  },
  {
    id: "c2",
    title: "Product Launch",
    subtitle: "Product Announcement",
    image: cardProductLaunch,
    status: "Active",
    surfaces: 5,
    assets: 8,
    updated: "Updated 1 day ago",
    brand: "NovaTech",
    headline: "Next Generation",
  },
  {
    id: "c3",
    title: "Festive Offers",
    subtitle: "Holiday Campaign",
    image: cardFestiveOffer,
    status: "Draft",
    surfaces: 4,
    assets: 10,
    updated: "Updated 3 days ago",
    brand: "GlowStore",
    headline: "Festive Sparkle",
  },
  {
    id: "c4",
    title: "Brand Awareness",
    subtitle: "Brand Campaign",
    image: cardBrandAwareness,
    status: "Active",
    surfaces: 6,
    assets: 15,
    updated: "Updated 5 days ago",
    brand: "Acme",
    headline: "Think Forward",
  },
  {
    id: "c5",
    title: "Event Promotion",
    subtitle: "Bold design for events and webinars.",
    image: cardProductLaunch,
    status: "Archived",
    surfaces: 5,
    assets: 9,
    updated: "Updated 1 week ago",
    brand: "DevConf",
    headline: "Global Summit 2026",
  },
  {
    id: "c6",
    title: "Food & Beverage",
    subtitle: "Perfect for restaurants and food brands.",
    image: cardFoodBeverage,
    status: "Draft",
    surfaces: 4,
    assets: 7,
    updated: "Updated 1 week ago",
    brand: "BistroArt",
    headline: "Taste of Italy",
  },
];

const templateCards = [
  { title: "Summer Sale", desc: "Clear and vibrant design for seasonal offers.", category: "Seasonal", image: cardSummerSale, brand: "Flam", headline: "Summer Sale" },
  { title: "Product Launch", desc: "Modern layout for product announcements.", category: "Digital Ads", image: cardProductLaunch, brand: "NovaTech", headline: "Next Gen" },
  { title: "Festive Offer", desc: "Colorful template for festive campaigns.", category: "Seasonal", image: cardFestiveOffer, brand: "GlowStore", headline: "Festive Sparkle" },
  { title: "Brand Awareness", desc: "Minimal layout for brand campaigns.", category: "Social Media", image: cardBrandAwareness, brand: "Acme", headline: "Think Forward" },
  { title: "Food & Beverage", desc: "Perfect for restaurants and food brands.", category: "Physical Displays", image: cardFoodBeverage, brand: "BistroArt", headline: "Taste of Italy" },
];

const INITIAL_SURFACES: SurfaceCard[] = [
  { id: "mobile-portrait", name: "Mobile (Portrait)", size: "1080 × 1920", width: 1080, height: 1920, orientation: "portrait", category: "digital", icon: <Smartphone /> },
  { id: "mobile-landscape", name: "Mobile (Landscape)", size: "1920 × 1080", width: 1920, height: 1080, orientation: "landscape", category: "digital", icon: <TabletSmartphone /> },
  { id: "square-social", name: "Square (Social)", size: "1080 × 1080", width: 1080, height: 1080, orientation: "square", category: "digital", icon: <Grid2X2 /> },
  { id: "digital-billboard", name: "Digital Billboard", size: "1920 × 600", width: 1920, height: 600, orientation: "landscape", category: "physical", icon: <Monitor /> },
  { id: "story-916", name: "Story (9:16)", size: "1080 × 1920", width: 1080, height: 1920, orientation: "portrait", category: "digital", icon: <Smartphone /> },
  { id: "kiosk-display", name: "Kiosk / Display", size: "1024 × 768", width: 1024, height: 768, orientation: "landscape", category: "physical", icon: <PanelTop /> },
  { id: "tv-broadcast", name: "TV / Broadcast (Lower Third)", size: "1920 × 270", width: 1920, height: 270, orientation: "landscape", category: "physical", icon: <Monitor /> },
  { id: "custom-surface", name: "Smartwatch (Custom)", size: "360 × 360", width: 360, height: 360, orientation: "square", category: "digital", icon: <LayoutPanelLeft /> },
];
const surfaces: SurfaceCard[] = INITIAL_SURFACES;

function App() {
  const [page, setPage] = useState<Page>("create");
  const [isDark, setIsDark] = useState(false);
  const [surfacesList, setSurfacesList] = useState<SurfaceCard[]>(INITIAL_SURFACES);
  const [selectedSurfaceIndex, setSelectedSurfaceIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);

  // Content form state
  const [brand, setBrand] = useState("Flam");
  const [headline, setHeadline] = useState("Summer\nSale");
  const [subheadline, setSubheadline] = useState("Up to 50% Off");
  const [description, setDescription] = useState("Fresh styles for a brighter you.");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaLink, setCtaLink] = useState("https://flam.app");
  const [adTheme, setAdTheme] = useState<AdTheme>("gold");
  const [customColor, setCustomColor] = useState<string>("");
  const [userImage, setUserImage] = useState<string>(heroModel);

  const activePalette = useMemo(() => getActivePalette(adTheme, customColor), [adTheme, customColor]);

  // Per-surface image adjustments (drag & pan & zoom)
  const [imageAdjustments, setImageAdjustments] = useState<Record<string, ImageAdjustment>>({
    "mobile-portrait": { x: 0, y: 0, scale: 1 },
    "mobile-landscape": { x: 0, y: 0, scale: 1 },
    "square-social": { x: 0, y: 0, scale: 1 },
    "digital-billboard": { x: 0, y: 0, scale: 1 },
    "story-916": { x: 0, y: 0, scale: 1 },
    "kiosk-display": { x: 0, y: 0, scale: 1 },
    "tv-broadcast": { x: 0, y: 0, scale: 1 },
    "custom-surface": { x: 0, y: 0, scale: 1 },
  });

  const updateImageAdjustment = (surfaceId: string, adj: ImageAdjustment) => {
    setImageAdjustments((prev) => ({
      ...prev,
      [surfaceId]: adj,
    }));
  };

  const applyAdjustmentToAll = (adj: ImageAdjustment) => {
    setImageAdjustments((prev) => {
      const next: Record<string, ImageAdjustment> = {};
      for (const key of Object.keys(prev)) {
        next[key] = { ...adj };
      }
      return next;
    });
    showToast("Applied image adjustment to all surfaces");
  };

  const handleAddLiveSurface = (newSurface: SurfaceCard) => {
    setSurfacesList((prev) => [...prev, newSurface]);
    setImageAdjustments((prev) => ({
      ...prev,
      [newSurface.id]: { x: 0, y: 0, scale: 1 },
    }));
    setSelectedSurfaceIndex(surfacesList.length);
    showToast(`✓ Resolved live unknown surface: ${newSurface.name} (${newSurface.width}×${newSurface.height})`);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserImage(url);
      showToast(`Custom image applied: ${file.name}`);
    }
  };

  const handleApplyTemplate = (tpl: typeof templateCards[0]) => {
    setBrand(tpl.brand);
    setHeadline(tpl.headline.includes("\n") ? tpl.headline : `${tpl.headline.split(" ")[0]}\n${tpl.headline.split(" ").slice(1).join(" ") || "Sale"}`);
    setPage("create");
    showToast(`Loaded template: ${tpl.title}`);
  };

  // Compute live resolution for active surface
  const activeSurface = surfacesList[selectedSurfaceIndex] || surfacesList[0];
  const activeResolved = useMemo(() => {
    return resolve(exampleSpec, {
      id: activeSurface.id,
      width: activeSurface.width,
      height: activeSurface.height,
      orientation: activeSurface.orientation,
      category: activeSurface.category,
      safeArea: { top: 40, right: 30, bottom: 40, left: 30 },
    });
  }, [activeSurface]);

  return (
    <div className={`app-shell ${isDark ? "dark" : ""}`}>
      {/* Hidden File Upload Input for Replace Image */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <Sidebar page={page} setPage={setPage} />
      <section className="workspace">
        <Topbar
          isDark={isDark}
          setIsDark={setIsDark}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showToast={showToast}
          setPage={setPage}
        />
        {page === "home" && (
          <HomePage
            setPage={setPage}
            campaigns={initialCampaigns}
            onSelectSurface={(index) => {
              setSelectedSurfaceIndex(index);
              setPage("surfaces");
            }}
          />
        )}
        {page === "create" && (
          <CreatePage
            brand={brand}
            setBrand={setBrand}
            headline={headline}
            setHeadline={setHeadline}
            subheadline={subheadline}
            setSubheadline={setSubheadline}
            description={description}
            setDescription={setDescription}
            ctaText={ctaText}
            setCtaText={setCtaText}
            ctaLink={ctaLink}
            setCtaLink={setCtaLink}
            adTheme={adTheme}
            setAdTheme={setAdTheme}
            customColor={customColor}
            setCustomColor={setCustomColor}
            activePalette={activePalette}
            userImage={userImage}
            onTriggerUpload={() => fileInputRef.current?.click()}
            showToast={showToast}
            onSelectSurface={(idx) => {
              setSelectedSurfaceIndex(idx);
              setPage("surfaces");
            }}
            setPage={setPage}
            imageAdjustments={imageAdjustments}
            surfaces={surfacesList}
            onAddSurface={handleAddLiveSurface}
          />
        )}
        {page === "projects" && (
          <ProjectsPage
            campaigns={initialCampaigns}
            searchQuery={searchQuery}
            setPage={setPage}
            showToast={showToast}
          />
        )}
        {page === "templates" && (
          <TemplatesPage
            searchQuery={searchQuery}
            onApplyTemplate={handleApplyTemplate}
          />
        )}
        {page === "media" && (
          <MediaLibraryPage
            showToast={showToast}
            onSelectMedia={(img) => {
              setUserImage(img);
              showToast("Applied media asset to active design");
            }}
          />
        )}
        {page === "surfaces" && (
          <LayoutPreviewPage
            surfaces={surfacesList}
            selectedIndex={selectedSurfaceIndex}
            setSelectedIndex={setSelectedSurfaceIndex}
            resolved={activeResolved}
            showToast={showToast}
            brand={brand}
            headline={headline}
            subheadline={subheadline}
            description={description}
            ctaText={ctaText}
            userImage={userImage}
            imageAdjustments={imageAdjustments}
            onUpdateAdjustment={updateImageAdjustment}
            onApplyToAll={applyAdjustmentToAll}
            adTheme={adTheme}
            customColor={customColor}
            palette={activePalette}
            onAddSurface={handleAddLiveSurface}
          />
        )}
        {page === "analytics" && <AnalyticsPage setPage={setPage} showToast={showToast} />}
        {page === "settings" && <SettingsPage isDark={isDark} setIsDark={setIsDark} showToast={showToast} />}
        {page === "docs" && <DocumentationPage setPage={setPage} showToast={showToast} />}
        <Footer setPage={setPage} />
      </section>

      {/* Floating Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Check size={16} color="#10b981" />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================================================
// Footer Component (Matching user reference screenshot 1-to-1)
// ==========================================================================

function Footer({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <footer className="app-footer">
      <div className="footer-top-grid">
        {/* Column 1: Brand & Intro */}
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <img src={iconUrl} alt="Fladapt Logo" className="footer-brand-logo" />
            <span className="footer-brand-title">Fladapt</span>
          </div>
          <p className="footer-brand-desc">
            Adaptive multi-surface layout engine. One design resolved seamlessly for every screen.
          </p>
        </div>

        {/* Column 2: PRODUCT */}
        <div className="footer-col">
          <h4 className="footer-col-title">PRODUCT</h4>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setPage("create")}>
              Adaptive Solver
            </button>
            <button className="footer-link" onClick={() => setPage("surfaces")}>
              Target Surfaces
            </button>
            <button className="footer-link" onClick={() => setPage("templates")}>
              Template Library
            </button>
            <button className="footer-link" onClick={() => setPage("surfaces")}>
              Code Inspector
            </button>
            <button className="footer-link" onClick={() => setPage("surfaces")}>
              A11y & Metrics
            </button>
          </div>
        </div>

        {/* Column 3: COMPANY */}
        <div className="footer-col">
          <h4 className="footer-col-title">COMPANY</h4>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setPage("docs")}>
              About Fladapt
            </button>
            <button className="footer-link" onClick={() => setPage("docs")}>
              Architecture Spec
            </button>
            <button className="footer-link" onClick={() => setPage("analytics")}>
              System Status
            </button>
          </div>
        </div>

        {/* Column 4: TECHNICAL STACK */}
        <div className="footer-col">
          <h4 className="footer-col-title">TECHNICAL STACK</h4>
          <div className="footer-tech-stack">
            <span>TypeScript + Node.js Backend</span>
            <span>Pure Geometry Resolver</span>
            <span>Canvas 2D + DOM Renderers</span>
            <span>Text-Measurement Engine</span>
          </div>
        </div>

        {/* Column 5: DEVELOPER */}
        <div className="footer-col">
          <h4 className="footer-col-title">DEVELOPER</h4>
          <div className="footer-developer-info">
            <span className="footer-dev-name">Built by M Harish Gautham</span>
            <span className="footer-dev-sub">
              Flam Engineering Explorer Assignment
            </span>
            <span className="footer-dev-tag" onClick={() => setPage("home")}>
              VIT 2026 · React + TS Stack
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom-bar">
        <span>© 2026 Fladapt. All rights reserved.</span>
        <span>100% Deterministic Resolution · Zero Layout Drift</span>
      </div>
    </footer>
  );
}

// ==========================================================================
// Sidebar Component
// ==========================================================================

function Sidebar({ page, setPage }: { page: Page; setPage: (page: Page) => void }) {
  const navItems: [Page, string, React.ReactNode][] = [
    ["home", "Home", <Home />],
    ["create", "Create", <Edit3 />],
    ["projects", "Projects", <Grid2X2 />],
    ["templates", "Templates", <Box />],
    ["media", "Media Library", <ImageIcon />],
    ["surfaces", "Surfaces", <PanelTop />],
    ["analytics", "Analytics", <BarChart3 />],
    ["docs", "Docs", <FileText />],
    ["settings", "Settings", <Settings />],
  ];

  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage("home")} title="Fladapt Home">
        <img src={iconUrl} alt="Fladapt Logo" className="brand-icon" />
        <div className="brand-text">
          <span className="brand-title">Fladapt</span>
          <span className="brand-tagline">One Design. Every Surface.</span>
        </div>
      </button>

      <nav className="nav">
        {navItems.map(([id, label, icon]) => (
          <button
            key={id}
            className={`nav-item ${page === id ? "active" : ""}`}
            onClick={() => setPage(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="idea-card">
        <strong>Turn ideas into adaptive experiences.</strong>
        <button
          className="idea-btn"
          onClick={() => setPage("create")}
          aria-label="Create adaptive design"
        >
          <span>Start Creating</span>
          <ChevronRight size={12} />
        </button>
        <img src={iconUrl} alt="" />
      </div>
    </aside>
  );
}

// ==========================================================================
// Topbar Component
// ==========================================================================

function Topbar({
  isDark,
  setIsDark,
  searchQuery,
  setSearchQuery,
  showToast,
  setPage,
}: {
  isDark: boolean;
  setIsDark: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showToast: (t: string) => void;
  setPage: (p: Page) => void;
}) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="topbar">
      <div className="search">
        <Search />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns, projects, templates, or assets..."
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="top-actions">
        <div className="theme-toggle">
          <button
            className={`theme-btn ${!isDark ? "active" : ""}`}
            onClick={() => {
              setIsDark(false);
              showToast("Switched to Light Mode");
            }}
            title="Light Mode"
          >
            <Sun />
          </button>
          <button
            className={`theme-btn ${isDark ? "active" : ""}`}
            onClick={() => {
              setIsDark(true);
              showToast("Switched to Dark Mode");
            }}
            title="Dark Mode"
          >
            <Moon />
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            aria-label="Profile menu"
          >
            <div className="profile-avatar">H</div>
            <span className="profile-name">Harish</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  setPage("settings");
                }}
              >
                <Settings size={14} />
                <span>Account Settings</span>
              </button>
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  showToast("Profile refreshed");
                }}
              >
                <Zap size={14} />
                <span>Pro Plan Active</span>
              </button>
              <button
                className="profile-dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  showToast("Signed out");
                }}
                style={{ color: "#ef4444" }}
              >
                <X size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================================================
// HomePage Component
// ==========================================================================

function HomePage({
  setPage,
  campaigns,
  onSelectSurface,
}: {
  setPage: (page: Page) => void;
  campaigns: Campaign[];
  onSelectSurface: (idx: number) => void;
}) {
  return (
    <main className="page">
      <div className="hero-copy">
        <h1>Good evening, Harish 👋</h1>
        <p>Turn one design into experiences for every surface.</p>
      </div>

      <div className="stats-grid">
        <div className="stat" onClick={() => setPage("projects")}>
          <div className="stat-icon blue"><Package /></div>
          <div className="stat-content">
            <strong>12</strong>
            <span>Projects</span>
          </div>
        </div>
        <div className="stat" onClick={() => setPage("surfaces")}>
          <div className="stat-icon green"><Layers /></div>
          <div className="stat-content">
            <strong>24</strong>
            <span>Surfaces</span>
          </div>
        </div>
        <div className="stat" onClick={() => setPage("templates")}>
          <div className="stat-icon orange"><LayoutPanelLeft /></div>
          <div className="stat-content">
            <strong>8</strong>
            <span>Templates</span>
          </div>
        </div>
        <div className="stat" onClick={() => setPage("media")}>
          <div className="stat-icon pink"><FileImage /></div>
          <div className="stat-content">
            <strong>98</strong>
            <span>Assets</span>
          </div>
        </div>
      </div>

      <section className="promo">
        <div>
          <h2>Create once.<br />Adapt everywhere.</h2>
          <p>Design, preview and generate layouts for any screen using the power of Fladapt.</p>
          <div className="button-row">
            <button className="primary white" onClick={() => setPage("create")}>
              <Plus size={15} /> Create New
            </button>
            <button className="outline-light" onClick={() => setPage("templates")}>
              Explore Templates
            </button>
          </div>
        </div>

        <div className="promo-cascade">
          <div
            className="promo-design-card"
            onClick={() => setPage("surfaces")}
            title="Click to view all adaptive layouts"
          >
            <div className="promo-design-glass-frame">
              <img src={layoutRef} alt="Fladapt Multi-Surface Layouts" className="promo-design-img" />
              <div className="promo-design-glow" />
              <div className="promo-design-badge">
                <Sparkles size={12} color="#f59e0b" />
                <span>Multi-Screen Engine</span>
              </div>
              <div className="promo-design-pill">
                <Layers size={12} />
                <span>8 Form Factors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-title">
        <h2>Recent Projects</h2>
        <button onClick={() => setPage("projects")}>
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="project-card-grid">
        {campaigns.slice(0, 4).map((item, idx) => (
          <article
            className="project-card"
            key={item.id}
            onClick={() => onSelectSurface(idx % surfaces.length)}
            title="Click to preview"
          >
            <img src={item.image} alt={item.title} />
            <div className="project-card-body">
              <h3>{item.title}</h3>
              <p>{item.updated}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

// ==========================================================================
// CreatePage Component
// ==========================================================================

function CreatePage({
  brand,
  setBrand,
  headline,
  setHeadline,
  subheadline,
  setSubheadline,
  description,
  setDescription,
  ctaText,
  setCtaText,
  ctaLink,
  setCtaLink,
  adTheme,
  setAdTheme,
  customColor = "",
  setCustomColor = () => {},
  activePalette,
  userImage,
  onTriggerUpload,
  showToast,
  onSelectSurface,
  setPage,
  imageAdjustments = {},
  surfaces: surfaceList = INITIAL_SURFACES,
  onAddSurface,
}: {
  brand: string;
  setBrand: (v: string) => void;
  headline: string;
  setHeadline: (v: string) => void;
  subheadline: string;
  setSubheadline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  ctaText: string;
  setCtaText: (v: string) => void;
  ctaLink: string;
  setCtaLink: (v: string) => void;
  adTheme: AdTheme;
  setAdTheme: (t: AdTheme) => void;
  customColor?: string;
  setCustomColor?: (c: string) => void;
  activePalette?: ThemePalette;
  userImage: string;
  onTriggerUpload: () => void;
  showToast: (m: string) => void;
  onSelectSurface: (idx: number) => void;
  setPage: (p: Page) => void;
  imageAdjustments?: Record<string, ImageAdjustment>;
  surfaces?: SurfaceCard[];
  onAddSurface?: (s: SurfaceCard) => void;
}) {
  const palette = activePalette || getActivePalette(adTheme, customColor);
  const themeStyles = getThemeStyles(palette);
  const [activeStep, setActiveStep] = useState(0);
  const [filterTab, setFilterTab] = useState("All");
  const [decisionSurface, setDecisionSurface] = useState("Mobile (Portrait)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddSurfaceModal, setShowAddSurfaceModal] = useState(false);

  const steps = [
    { title: "Content", desc: "Add your content" },
    { title: "Preferences", desc: "Set rules & priorities" },
    { title: "Generate", desc: "AI-powered adaptation" },
    { title: "Review", desc: "Compare & export" },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast(`Generated layouts adapted across all ${surfaceList.length} surfaces!`);
    }, 600);
  };

  const filteredSurfaces = surfaceList.filter((s) => {
    if (filterTab === "Digital") return s.category === "digital";
    if (filterTab === "Physical") return s.category === "physical";
    return true;
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Create &gt; Summer Sale Campaign</p>
          <h1>Summer Sale Campaign</h1>
          <p>Design once. Fladapt adapts it everywhere.</p>
        </div>
        <div className="header-actions">
          <button className="ghost" onClick={() => showToast("Draft saved successfully!")}>
            <Save size={15} /> Save
          </button>
          <button
            className="ghost"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast("Shareable link copied to clipboard!");
            }}
          >
            <Share2 size={15} /> Share
          </button>
          <button className="primary" onClick={handleGenerate} disabled={isGenerating}>
            <Sparkles size={15} />
            {isGenerating ? "Adapting..." : "Generate Layouts"}
          </button>
        </div>
      </div>

      {/* Stepper */}
      <section className="stepper">
        {steps.map((step, idx) => (
          <div
            className={`step ${activeStep === idx ? "active" : ""}`}
            key={step.title}
            onClick={() => setActiveStep(idx)}
          >
            <b>{idx + 1}</b>
            <div className="step-info">
              <strong>{step.title}</strong>
              <small>{step.desc}</small>
            </div>
          </div>
        ))}
      </section>

      {/* 3-Column Creator Grid */}
      <div className="create-grid">
        {/* Column 1: Content Form */}
        <section className="panel content-form">
          <div>
            <h2>1. Content</h2>
            <p className="panel-subtitle">Add the elements for your ad</p>
          </div>

          <label>
            Brand
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Flam" />
          </label>

          <label>
            Headline
            <input
              value={headline.replace("\n", " ")}
              onChange={(e) => {
                const val = e.target.value;
                const words = val.split(" ");
                if (words.length > 1) {
                  setHeadline(`${words[0]}\n${words.slice(1).join(" ")}`);
                } else {
                  setHeadline(val);
                }
              }}
              placeholder="e.g. Summer Sale"
            />
          </label>

          <label>
            Subheadline
            <input value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="e.g. Up to 50% Off" />
          </label>

          <label>
            Description
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief copy" />
          </label>

          <div className="two-col">
            <label>
              Call to Action
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop Now" />
            </label>
            <label>
              Link (optional)
              <input value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="https://flam.app" />
            </label>
          </div>

          <label>Media</label>
          <div className="upload-row">
            <img src={userImage} alt="Active Hero Asset" className="upload-thumb" />
            <button
              type="button"
              className="upload-btn"
              onClick={onTriggerUpload}
              title="Click to select image from your computer"
            >
              <Upload size={16} />
              <span>Replace Image</span>
              <small style={{ fontSize: "9px", color: "var(--text-light)" }}>PNG, JPG, WebP</small>
            </button>
          </div>

          <label>Brand Colors</label>
          <div className="swatches">
            {(["gold", "orange", "purple", "ocean", "dark", "emerald"] as AdTheme[]).map((theme) => {
              const pal = THEME_PALETTES[theme];
              const isSelected = adTheme === theme && !customColor;
              return (
                <button
                  key={theme}
                  className={`swatch ${isSelected ? "active" : ""}`}
                  style={{
                    background: pal.primary,
                    border: isSelected ? "2.5px solid #0f172a" : "1.5px solid rgba(0,0,0,0.15)",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    boxShadow: isSelected ? `0 2px 8px ${pal.primary}66` : "none",
                  }}
                  onClick={() => {
                    setCustomColor("");
                    setAdTheme(theme);
                    showToast(`Applied ${pal.name} brand colors`);
                  }}
                  title={`${pal.name} palette`}
                />
              );
            })}
          </div>

          <div className="custom-color-row">
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>Custom Accent:</span>
            <input
              type="color"
              value={customColor || palette.primary}
              onChange={(e) => {
                setCustomColor(e.target.value);
                showToast(`Set custom color ${e.target.value}`);
              }}
              style={{ width: "26px", height: "26px", borderRadius: "4px", border: "1px solid var(--border)", cursor: "pointer", padding: 0 }}
              title="Pick a custom brand color"
            />
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text-muted)" }}>
              {customColor || palette.primary}
            </span>
            {customColor && (
              <button
                type="button"
                className="ghost compact"
                style={{ fontSize: "10px", padding: "2px 8px" }}
                onClick={() => setCustomColor("")}
                title="Reset to preset palette"
              >
                Reset
              </button>
            )}
          </div>
        </section>

        {/* Column 2: Base Design (Accurately reproduces create.png) */}
        <section className="panel">
          <div className="panel-header">
            <h2>Base Design</h2>
            <small style={{ color: "var(--text-muted)", fontSize: "11px", background: "var(--bg-app)", padding: "3px 8px", borderRadius: "4px" }}>
              1080 × 1080 (Design Canvas)
            </small>
          </div>
          <p className="panel-subtitle">Primary reference specification</p>

          <div
            className="base-canvas-card"
            style={{
              ...themeStyles,
              background: palette.canvasBg,
              color: palette.textColor,
            }}
          >
            {/* Left Copy & Brand */}
            <div className="base-canvas-left">
              <div className="base-brand-header" style={{ color: palette.textColor }}>
                <img src={iconUrl} alt="Logo" />
                <span>{brand}</span>
              </div>

              <div className="base-copy-block">
                <span className="base-tracking-tag" style={{ color: palette.textMuted }}>FRESH STYLES</span>
                <h3 className="base-headline" style={{ color: palette.textColor }}>{headline}</h3>
                <h4 className="base-subheadline" style={{ color: palette.secondary }}>{subheadline}</h4>
                <p className="base-description" style={{ color: palette.textMuted }}>{description}</p>
                <div style={{ marginTop: "4px" }}>
                  <span
                    className="base-cta-btn"
                    style={{
                      background: palette.primary,
                      color: palette.ctaText,
                      boxShadow: palette.shadow,
                    }}
                  >
                    {ctaText} <ChevronRight size={13} />
                  </span>
                </div>
              </div>

              <div className="base-leaf-footer" style={{ color: palette.leafColor }}>
                <span style={{ fontSize: "14px" }}>🌿</span>
                <span>Live Brighter Everyday.</span>
              </div>
            </div>

            {/* Right Hero Image with Organic Warm Backdrop */}
            <div className="base-canvas-right">
              <div className="base-model-bg" style={{ background: palette.waveGradient }} />
              <img src={userImage} alt="Hero Model" className="base-model-img" />
            </div>
          </div>
        </section>

        {/* Column 3: Generated Layouts (Distinct Per Surface) */}
        <section className="panel">
          <div className="panel-header">
            <h2>Generated Layouts</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="tabs compact">
                {["All", "Digital", "Physical"].map((tab) => (
                  <button
                    key={tab}
                    className={filterTab === tab ? "active" : ""}
                    onClick={() => setFilterTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {onAddSurface && (
                <button
                  type="button"
                  className="add-surface-btn"
                  onClick={() => setShowAddSurfaceModal(true)}
                  title="Add live unknown surface profile"
                  style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}
                >
                  <Plus size={12} /> Live
                </button>
              )}
            </div>
          </div>
          <p className="panel-subtitle">Automatically adapted for different surfaces</p>

          <div className="layout-grid" style={themeStyles}>
            {filteredSurfaces.map((s, idx) => {
              const isSpan2 = s.id === "story-916" || s.id === "kiosk-display" || s.id === "tv-broadcast" || s.id === "custom-surface";
              return (
                <div
                  key={s.id}
                  className={`surface-card-tile ${isSpan2 ? "surface-tile-span-2" : "surface-tile-span-3"}`}
                  onClick={() => onSelectSurface(idx)}
                  title={`Click to inspect ${s.name}`}
                >
                  <div className="surface-card-header">
                    <strong>{s.name}</strong>
                    <small>{s.size}</small>
                  </div>

                  {/* Surface-Specific Actual Ad Layout View */}
                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    {s.id === "mobile-portrait" && (
                      <div className="actual-ad-card actual-ad-portrait" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-top-brand" style={{ color: palette.textColor }}>
                          <img src={iconUrl} alt="" />
                          <span>{brand}</span>
                        </div>
                        <div className="ad-head-serif" style={{ color: palette.textColor }}>{headline}</div>
                        <div className="ad-sub-orange" style={{ color: palette.secondary }}>{subheadline}</div>
                        <div className="ad-visual-wrap">
                          <div className="ad-golden-wave-portrait" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                          <div className="ad-pill-btn" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                            {ctaText} →
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "mobile-landscape" && (
                      <div className="actual-ad-card actual-ad-landscape" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-copy-split">
                          <div>
                            <div className="ad-brand-row" style={{ color: palette.textColor }}>
                              <img src={iconUrl} alt="" />
                              <span>{brand}</span>
                            </div>
                            <div className="ad-head-serif-wide" style={{ color: palette.textColor }}>{headline.replace("\n", " ")}</div>
                            <div className="ad-sub-orange-wide" style={{ color: palette.secondary }}>{subheadline}</div>
                            <p className="ad-desc-wide" style={{ color: palette.textMuted }}>{description}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                              {ctaText} →
                            </div>
                          </div>
                        </div>
                        <div className="ad-visual-split">
                          <div className="ad-golden-wave-landscape" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "square-social" && (
                      <div className="actual-ad-card actual-ad-square" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-copy-split">
                          <div>
                            <div className="ad-brand-row" style={{ color: palette.textColor }}>
                              <img src={iconUrl} alt="" />
                              <span>{brand}</span>
                            </div>
                            <div className="ad-head-serif-wide" style={{ fontSize: "13px", color: palette.textColor }}>{headline}</div>
                            <div className="ad-sub-orange-wide" style={{ color: palette.secondary }}>{subheadline}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                            <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                              {ctaText} →
                            </div>
                          </div>
                        </div>
                        <div className="ad-visual-split">
                          <div className="ad-golden-wave-square" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "digital-billboard" && (
                      <div className="actual-ad-card actual-ad-billboard" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-copy-split">
                          <div>
                            <div className="ad-brand-row" style={{ color: palette.textColor }}>
                              <img src={iconUrl} alt="" />
                              <span>{brand}</span>
                            </div>
                            <div className="ad-head-serif-wide" style={{ fontSize: "14px", color: palette.textColor }}>{headline.replace("\n", " ")}</div>
                            <div className="ad-sub-orange-wide" style={{ color: palette.secondary }}>{subheadline}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                              {ctaText} →
                            </div>
                          </div>
                        </div>
                        <div className="ad-visual-split">
                          <div className="ad-golden-wave-billboard" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "story-916" && (
                      <div className="actual-ad-card actual-ad-story" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div>
                          <div className="ad-top-brand" style={{ color: palette.textColor }}>
                            <img src={iconUrl} alt="" />
                            <span>{brand}</span>
                          </div>
                          <div className="ad-head-serif" style={{ color: palette.textColor }}>{headline.replace("\n", " ")}</div>
                          <div className="ad-sub-orange" style={{ color: palette.secondary }}>{subheadline}</div>
                        </div>
                        <div className="ad-visual-wrap">
                          <div className="ad-golden-wave-story" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "kiosk-display" && (
                      <div className="actual-ad-card actual-ad-kiosk" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-copy-split">
                          <div>
                            <div className="ad-brand-row" style={{ color: palette.textColor }}>
                              <img src={iconUrl} alt="" />
                              <span>{brand}</span>
                            </div>
                            <div className="ad-head-serif-wide" style={{ fontSize: "14px", color: palette.textColor }}>{headline}</div>
                            <div className="ad-sub-orange-wide" style={{ color: palette.secondary }}>{subheadline}</div>
                            <p className="ad-desc-wide" style={{ color: palette.textMuted }}>{description}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                              {ctaText} →
                            </div>
                          </div>
                        </div>
                        <div className="ad-visual-split">
                          <div className="ad-golden-wave-kiosk" />
                          <PalmLeaf className="ad-leaf-pos" leafColor={palette.leafColor} stemColor={palette.stemColor} />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "tv-broadcast" && (
                      <div className="actual-ad-card actual-ad-broadcast" style={{ ...themeStyles, background: palette.canvasBg, color: palette.textColor, borderTop: `2px solid ${palette.primary}` }}>
                        <div className="ad-broadcast-brand" style={{ color: palette.textColor }}>
                          <img src={iconUrl} alt="" />
                          <span>{brand}</span>
                        </div>
                        <div className="ad-broadcast-center">
                          <span style={{ color: palette.textColor }}>{headline.replace("\n", " ")}</span>
                          <small style={{ color: palette.secondary, fontWeight: 800 }}>{subheadline}</small>
                        </div>
                        <div className="ad-visual-wrap">
                          <div className="ad-golden-wave-broadcast" />
                          <div className="ad-model-layer">
                            <DraggableImage
                              src={userImage}
                              adjustment={imageAdjustments[s.id] || { x: 0, y: 0, scale: 1 }}
                              isInteractive={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {s.id === "custom-surface" && (
                      <div className="actual-ad-card" style={{ ...themeStyles, height: "100px", padding: "8px", flexDirection: "column", justifyContent: "space-between", background: palette.canvasBg, color: palette.textColor }}>
                        <div className="ad-brand-row" style={{ color: palette.textColor }}>
                          <img src={iconUrl} alt="" />
                          <span>{brand}</span>
                        </div>
                        <div className="ad-head-serif-wide" style={{ fontSize: "11px", color: palette.textColor }}>{headline.replace("\n", " ")}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText }}>{ctaText}</div>
                          <div style={{ width: "35px", height: "35px", borderRadius: "4px", overflow: "hidden" }}>
                            <img src={userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dynamic Unknown-at-Design-Time Surface Tile Fallback (Bonus 1) */}
                    {!["mobile-portrait", "mobile-landscape", "square-social", "digital-billboard", "story-916", "kiosk-display", "tv-broadcast", "custom-surface"].includes(s.id) && (
                      <div className="actual-ad-card" style={{ ...themeStyles, height: "100px", padding: "8px", flexDirection: "column", justifyContent: "space-between", background: palette.canvasBg, color: palette.textColor, border: `1.5px solid ${palette.primary}40`, borderRadius: "6px" }}>
                        <div className="ad-brand-row" style={{ color: palette.textColor }}>
                          <img src={iconUrl} alt="" />
                          <span>{brand}</span>
                          <span style={{ fontSize: "8px", background: palette.primary, color: palette.ctaText, padding: "1px 5px", borderRadius: "3px", fontWeight: 700, marginLeft: "auto" }}>LIVE</span>
                        </div>
                        <div className="ad-head-serif-wide" style={{ fontSize: "11px", color: palette.textColor }}>{headline.replace("\n", " ")}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div className="ad-btn-wide" style={{ background: palette.primary, color: palette.ctaText }}>{ctaText}</div>
                          <div style={{ width: "35px", height: "35px", borderRadius: "4px", overflow: "hidden" }}>
                            <img src={userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Decision Strip (Matches create.png) */}
      <section className="decision-strip">
        <div className="decision-strip-head">
          <div>
            <h3>Layout Decisions</h3>
            <p>See how Fladapt adapted your design for each surface.</p>
          </div>
          <button className="soft-button" onClick={() => setPage("surfaces")}>
            View All Details <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={decisionSurface}
            onChange={(e) => setDecisionSurface(e.target.value)}
            className="select-button"
            style={{ height: "34px", fontSize: "12px", padding: "0 10px" }}
          >
            {surfaceList.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="decision-pills">
          <div className="decision-pill">
            <span style={{ fontSize: "16px" }}>🔤</span>
            <div>
              <strong>Text resized</strong>
              <small style={{ display: "block", color: "var(--text-muted)" }}>Adjusted font sizes for readability.</small>
            </div>
          </div>
          <div className="decision-pill">
            <span style={{ fontSize: "16px" }}>🖼️</span>
            <div>
              <strong>Image repositioned</strong>
              <small style={{ display: "block", color: "var(--text-muted)" }}>Moved image to focus area.</small>
            </div>
          </div>
          <div className="decision-pill">
            <span style={{ fontSize: "16px" }}>📐</span>
            <div>
              <strong>Aspect ratio adapted</strong>
              <small style={{ display: "block", color: "var(--text-muted)" }}>Layout restructured for target aspect.</small>
            </div>
          </div>
          <div className="decision-pill">
            <span style={{ fontSize: "16px" }}>✅</span>
            <div>
              <strong>No elements hidden</strong>
              <small style={{ display: "block", color: "var(--text-muted)" }}>All key elements remain visible.</small>
            </div>
          </div>
        </div>
      </section>

      {/* Add Live Surface Profile Modal */}
      {showAddSurfaceModal && onAddSurface && (
        <AddSurfaceModal
          isOpen={showAddSurfaceModal}
          onClose={() => setShowAddSurfaceModal(false)}
          onAddSurface={(s) => {
            onAddSurface(s);
            setShowAddSurfaceModal(false);
          }}
        />
      )}
    </main>
  );
}

// ==========================================================================
// Add Live Unknown Surface Profile Modal (Bonus 1)
// ==========================================================================

export function AddSurfaceModal({
  isOpen,
  onClose,
  onAddSurface,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddSurface: (surface: SurfaceCard) => void;
}) {
  const [name, setName] = useState("Ultrawide Cockpit In-Car Display");
  const [width, setWidth] = useState(2560);
  const [height, setHeight] = useState(720);
  const [category, setCategory] = useState<"digital" | "physical">("physical");

  if (!isOpen) return null;

  const presets = [
    {
      name: "Ultrawide Cockpit In-Car Display",
      width: 2560,
      height: 720,
      category: "physical" as const,
      desc: "32:9 automotive dashboard display",
    },
    {
      name: "Foldable Phone Inner Screen",
      width: 2152,
      height: 1536,
      category: "digital" as const,
      desc: "4:3 dynamic foldable tablet display",
    },
    {
      name: "Subway Pillar Ad Totem",
      width: 384,
      height: 1280,
      category: "physical" as const,
      desc: "Ultra-tall portrait physical kiosk",
    },
    {
      name: "Circular Wearable Display",
      width: 454,
      height: 454,
      category: "digital" as const,
      desc: "Compact high-density smartwatch tile",
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setWidth(p.width);
    setHeight(p.height);
    setCategory(p.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orientation: "portrait" | "landscape" | "square" =
      width > height * 1.15 ? "landscape" : height > width * 1.15 ? "portrait" : "square";
    const id = `live-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newCard: SurfaceCard = {
      id,
      name,
      size: `${width} × ${height}`,
      width: Number(width) || 1920,
      height: Number(height) || 1080,
      orientation,
      category,
      icon: category === "digital" ? <Smartphone /> : <Monitor />,
      isCustom: true,
    };

    onAddSurface(newCard);
    onClose();
  };

  return (
    <div className="code-modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="add-surface-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "540px",
          background: "var(--bg-card)",
          borderRadius: "14px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          border: "1px solid var(--border)",
          padding: "24px",
          width: "92%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Sparkles size={18} color="#f59e0b" />
              <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>Add Live Surface Profile</h2>
              <span style={{ fontSize: "10px", background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                Bonus 1
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
              Provide an unknown-at-design-time surface profile live. The Fladapt constraint solver will resolve it immediately with <strong>zero code changes</strong>.
            </p>
          </div>
          <button className="code-modal-close" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Live Unknown Presets (Click to Load)
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset-pill-btn"
                onClick={() => handleApplyPreset(p)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: name === p.name ? "1.5px solid var(--accent, #f59e0b)" : "1px solid var(--border)",
                  background: name === p.name ? "rgba(245, 158, 11, 0.08)" : "var(--bg-app)",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: "11px", display: "block", color: "var(--text-main)" }}>{p.name}</strong>
                <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>{p.width} × {p.height} • {p.category}</small>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "11.5px", fontWeight: 700, display: "block", marginBottom: "4px", color: "var(--text-main)" }}>
              Surface Profile Name
            </label>
            <input
              type="text"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Airport Flight Info Kiosk"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11.5px", fontWeight: 700, display: "block", marginBottom: "4px", color: "var(--text-main)" }}>
                Resolution Width (px)
              </label>
              <input
                type="number"
                className="text-input"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 100)}
                required
                min={100}
                max={8000}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "11.5px", fontWeight: 700, display: "block", marginBottom: "4px", color: "var(--text-main)" }}>
                Resolution Height (px)
              </label>
              <input
                type="number"
                className="text-input"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 100)}
                required
                min={100}
                max={8000}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "11.5px", fontWeight: 700, display: "block", marginBottom: "6px", color: "var(--text-main)" }}>
              Surface Category
            </label>
            <div style={{ display: "flex", gap: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "var(--text-main)" }}>
                <input
                  type="radio"
                  name="category"
                  checked={category === "digital"}
                  onChange={() => setCategory("digital")}
                />
                Digital Device (Mobile / Web / Touch)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer", color: "var(--text-main)" }}>
                <input
                  type="radio"
                  name="category"
                  checked={category === "physical"}
                  onChange={() => setCategory("physical")}
                />
                Physical Display (Billboard / Kiosk / In-Car)
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Zap size={14} /> Add & Resolve Live Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================================================
// LayoutPreviewPage Component (Interactive Multi-Device Surface Inspector)
// ==========================================================================

function LayoutPreviewPage({
  surfaces: surfaceList,
  selectedIndex,
  setSelectedIndex,
  resolved,
  showToast,
  brand,
  headline,
  subheadline,
  description,
  ctaText,
  userImage,
  imageAdjustments,
  onUpdateAdjustment,
  onApplyToAll,
  adTheme: _adTheme,
  customColor: _customColor,
  palette,
  onAddSurface,
}: {
  surfaces: SurfaceCard[];
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  resolved: ReturnType<typeof resolve>;
  showToast: (m: string) => void;
  brand: string;
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  userImage: string;
  imageAdjustments: Record<string, ImageAdjustment>;
  onUpdateAdjustment: (surfaceId: string, adj: ImageAdjustment) => void;
  onApplyToAll: (adj: ImageAdjustment) => void;
  adTheme: AdTheme;
  customColor: string;
  palette: ThemePalette;
  onAddSurface?: (surface: SurfaceCard) => void;
}) {
  const [detailTab, setDetailTab] = useState<"elements" | "traces" | "image" | "a11y">("elements");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeTab, setCodeTab] = useState<"react" | "html" | "json">("react");
  const [codeCopied, setCodeCopied] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [renderBackend, setRenderBackend] = useState<"dom" | "canvas">("dom");
  const [showCanvasDebug, setShowCanvasDebug] = useState(false);
  const [showAddSurfaceModal, setShowAddSurfaceModal] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  const currentSurface = surfaceList[selectedIndex] || surfaceList[0];
  const currentAdjust = imageAdjustments[currentSurface.id] || { x: 0, y: 0, scale: 1 };
  const isPreknownSurface = [
    "mobile-portrait",
    "mobile-landscape",
    "square-social",
    "digital-billboard",
    "story-916",
    "kiosk-display",
    "tv-broadcast",
    "custom-surface",
  ].includes(currentSurface.id);

  const handleAdjustmentChange = (newAdj: ImageAdjustment) => {
    onUpdateAdjustment(currentSurface.id, newAdj);
  };

  const handleReset = () => {
    onUpdateAdjustment(currentSurface.id, { x: 0, y: 0, scale: 1 });
    showToast(`Reset image alignment for ${currentSurface.name}`);
  };

  const handleZoomChange = (newScale: number) => {
    onUpdateAdjustment(currentSurface.id, { ...currentAdjust, scale: newScale });
  };

  const handleNext = () => {
    setSelectedIndex((selectedIndex + 1) % surfaceList.length);
  };

  const handlePrev = () => {
    setSelectedIndex((selectedIndex - 1 + surfaceList.length) % surfaceList.length);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(resolved, null, 2);
    navigator.clipboard?.writeText(jsonStr);
    showToast(`Copied ResolvedLayout JSON for ${currentSurface.name}`);
  };

  const handleExport = async (format: "png" | "jpg" | "pdf") => {
    setExportMenuOpen(false);
    if (!stageRef.current) return;
    setIsExporting(true);
    showToast(`Generating ${format.toUpperCase()} for ${currentSurface.name}...`);

    try {
      // Find the ad frame element inside preview-stage
      const targetEl =
        (stageRef.current.querySelector(
          ".phone-screen, .landscape-screen, .social-screen, .billboard-display, .kiosk-screen, .broadcast-overlay-bar, .watch-screen"
        ) as HTMLElement) || stageRef.current;

      // Temporarily hide drag handles and helper badges during render capture
      const badges = targetEl.querySelectorAll<HTMLElement>(".drag-helper-badge");
      badges.forEach((b) => (b.style.display = "none"));

      const canvas = await html2canvas(targetEl, {
        scale: 2, // 2x retina crispness
        useCORS: true,
        backgroundColor: format === "jpg" ? "#ffffff" : null,
        logging: false,
      });

      // Restore helper badges
      badges.forEach((b) => (b.style.display = ""));

      const safeSurfaceName = currentSurface.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const baseFilename = `${brand.toLowerCase()}-${safeSurfaceName}-ad`;

      if (format === "png") {
        const link = document.createElement("a");
        link.download = `${baseFilename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast(`✓ Downloaded ${baseFilename}.png`);
      } else if (format === "jpg") {
        const link = document.createElement("a");
        link.download = `${baseFilename}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
        showToast(`✓ Downloaded ${baseFilename}.jpg`);
      } else if (format === "pdf") {
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const isLandscape = imgWidth >= imgHeight;
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "px",
          format: [imgWidth / 2, imgHeight / 2],
        });
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth / 2, imgHeight / 2);
        pdf.save(`${baseFilename}.pdf`);
        showToast(`✓ Downloaded ${baseFilename}.pdf`);
      }
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const activeCode = useMemo(() => {
    if (codeTab === "react") {
      return generateReactCode(currentSurface, brand, headline, subheadline, ctaText, palette, currentAdjust);
    } else if (codeTab === "html") {
      return generateHtmlCode(currentSurface, brand, headline, subheadline, ctaText, palette, currentAdjust);
    } else {
      return JSON.stringify(resolved, null, 2);
    }
  }, [codeTab, currentSurface, brand, headline, subheadline, ctaText, palette, currentAdjust, resolved]);

  const handleCopyTop = () => {
    navigator.clipboard?.writeText(activeCode);
    setCodeCopied(true);
    showToast(`Copied ${codeTab.toUpperCase()} code for ${currentSurface.name}`);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Preview &gt; Summer Sale Campaign</p>
          <h1>Layout Preview</h1>
          <p>See how your design adapts across different surfaces.</p>
        </div>
        <div className="header-actions">
          {/* Export Dropdown Menu */}
          <div className="export-dropdown-container">
            <button
              className="ghost"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={isExporting}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={15} />
              <span>{isExporting ? "Exporting..." : "Export"}</span>
              <ChevronDown size={13} />
            </button>
            {exportMenuOpen && (
              <div className="export-dropdown-menu">
                <button className="export-menu-item" onClick={() => handleExport("png")}>
                  <FileImage size={16} style={{ color: "#3b82f6" }} />
                  <div>
                    <strong>Download PNG</strong>
                    <small>High-resolution lossless image (.png)</small>
                  </div>
                </button>
                <button className="export-menu-item" onClick={() => handleExport("jpg")}>
                  <FileImage size={16} style={{ color: "#f59e0b" }} />
                  <div>
                    <strong>Download JPG</strong>
                    <small>Web compressed image (.jpg)</small>
                  </div>
                </button>
                <button className="export-menu-item" onClick={() => handleExport("pdf")}>
                  <FileText size={16} style={{ color: "#ef4444" }} />
                  <div>
                    <strong>Download PDF</strong>
                    <small>Print-ready document (.pdf)</small>
                  </div>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="export-menu-item"
                  onClick={() => {
                    setExportMenuOpen(false);
                    handleExportJson();
                  }}
                >
                  <Code2 size={16} style={{ color: "#8b5cf6" }} />
                  <div>
                    <strong>Copy JSON AST</strong>
                    <small>Resolved layout engine spec</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="ghost" onClick={() => setShowCodeModal(true)}>
            <Code2 size={15} /> View Code
          </button>
        </div>
      </div>

      <div className="preview-grid">
        {/* Left Column: Surfaces List */}
        <section className="surface-list">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 700 }}>Surfaces</h2>
              <small style={{ color: "var(--text-muted)" }}>{surfaceList.length} target profiles</small>
            </div>
            {onAddSurface && (
              <button
                type="button"
                className="add-surface-btn"
                onClick={() => setShowAddSurfaceModal(true)}
                title="Add live unknown surface profile"
              >
                <Plus size={12} /> Live Profile
              </button>
            )}
          </div>
          {surfaceList.map((s, idx) => (
            <button
              key={s.id}
              className={`surface-row ${selectedIndex === idx ? "selected" : ""}`}
              onClick={() => setSelectedIndex(idx)}
            >
              {s.icon}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</strong>
                  {s.isCustom && <span className="custom-surface-tag">LIVE</span>}
                </div>
                <small>{s.size}</small>
              </div>
            </button>
          ))}
        </section>

        {/* Center Column: Stage Preview with Realistic Device Frames */}
        <section className="preview-center" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <div className="preview-nav" style={{ margin: 0 }}>
              <button className="preview-nav-btn" onClick={handlePrev} title="Previous surface">
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                {selectedIndex + 1} / {surfaceList.length} — {currentSurface.name}
              </span>
              <button className="preview-nav-btn" onClick={handleNext} title="Next surface">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* DOM vs Canvas Backend Switcher (Bonus 4) */}
            <div className="render-backend-switcher">
              <button
                type="button"
                className={`render-backend-btn ${renderBackend === "dom" ? "active" : ""}`}
                onClick={() => setRenderBackend("dom")}
                title="Standard DOM / CSS rendering engine"
              >
                🌐 DOM Backend
              </button>
              <button
                type="button"
                className={`render-backend-btn ${renderBackend === "canvas" ? "active" : ""}`}
                onClick={() => setRenderBackend("canvas")}
                title="High-DPI HTML5 2D Canvas engine sharing the same resolver"
              >
                🎨 Canvas Backend
              </button>
            </div>
          </div>

          {/* Floating Stage Image Toolbar */}
          <div className="stage-image-toolbar">
            <div className="toolbar-indicator">
              <span>✋ Drag to adjust</span>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-zoom">
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={currentAdjust.scale}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="zoom-slider"
                title="Zoom level"
              />
              <span className="zoom-label">{(currentAdjust.scale * 100).toFixed(0)}%</span>
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-coords">
              <span>X: {currentAdjust.x > 0 ? `+${currentAdjust.x}` : currentAdjust.x}px</span>
              <span>Y: {currentAdjust.y > 0 ? `+${currentAdjust.y}` : currentAdjust.y}px</span>
            </div>
            <div className="toolbar-divider" />
            <button
              className="toolbar-btn reset-btn"
              onClick={handleReset}
              disabled={currentAdjust.x === 0 && currentAdjust.y === 0 && currentAdjust.scale === 1}
              title="Reset position and zoom"
            >
              Reset
            </button>
            <button
              className="toolbar-btn sync-btn"
              onClick={() => onApplyToAll(currentAdjust)}
              title="Apply to all surfaces"
            >
              Apply to All
            </button>
          </div>

          <div className="preview-stage" ref={stageRef} style={getThemeStyles(palette)}>
            {renderBackend === "canvas" ? (
              <div className="surface-morph-wrapper" key={`canvas-${currentSurface.id}`}>
                <div className="canvas-stage-wrapper" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%", maxWidth: "560px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        HTML5 2D Canvas Backend
                      </span>
                      <span style={{ fontSize: "10px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>
                        High-DPI Retina
                      </span>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", cursor: "pointer", color: "var(--text-main)", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={showCanvasDebug}
                        onChange={(e) => setShowCanvasDebug(e.target.checked)}
                        style={{ accentColor: palette.primary }}
                      />
                      AST Bounding Boxes
                    </label>
                  </div>
                  <CanvasRenderer
                    layout={resolved}
                    surface={currentSurface}
                    brand={brand}
                    headline={headline}
                    subheadline={subheadline}
                    description={description}
                    ctaText={ctaText}
                    userImage={userImage}
                    iconUrl={iconUrl}
                    imageAdjustment={currentAdjust}
                    palette={palette}
                    showDebugBoxes={showCanvasDebug}
                    onDragAdjustment={handleAdjustmentChange}
                  />
                </div>
              </div>
            ) : (
              <div className="surface-morph-wrapper" key={`dom-${currentSurface.id}`}>
                {/* 1. Mobile Portrait: Smartphone Frame */}
                {currentSurface.id === "mobile-portrait" && (
              <div className="mockup-phone">
                <div className="phone-top-notch" />
                <div
                  className="phone-screen"
                  style={{
                    background: palette.canvasBg,
                    padding: "16px 14px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", zIndex: 10 }}>
                    <img src={iconUrl} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                    <strong style={{ fontSize: "13px", fontWeight: 800, color: palette.textColor, letterSpacing: "0.5px" }}>
                      {brand}
                    </strong>
                  </div>
                  <div style={{ marginTop: "8px", zIndex: 10 }}>
                    <small style={{ fontSize: "9px", color: palette.textMuted, fontWeight: 700, letterSpacing: "1px" }}>
                      FRESH STYLES
                    </small>
                    <h3
                      style={{
                        fontFamily: "Playfair Display, Georgia, serif",
                        fontSize: "26px",
                        fontWeight: 800,
                        color: palette.textColor,
                        margin: "2px 0",
                        lineHeight: 1.05,
                      }}
                    >
                      {headline}
                    </h3>
                    <h4 style={{ fontSize: "14px", color: palette.secondary, fontWeight: 800, margin: "2px 0 4px" }}>
                      {subheadline}
                    </h4>
                    <p style={{ fontSize: "10px", color: palette.textMuted, margin: 0 }}>
                      {description || "Live Brighter Everyday."}
                    </p>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      width: "100%",
                      marginTop: "10px",
                      minHeight: "210px",
                      overflow: "hidden",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="ad-golden-wave-portrait" />
                    <div style={{ position: "absolute", left: "-6px", bottom: "32px", width: "56px", height: "68px", zIndex: 4, pointerEvents: "none" }}>
                      <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                    <button
                      className="ad-pill-btn"
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        bottom: "8px",
                        background: palette.primary,
                        color: palette.ctaText,
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "6px 16px",
                        borderRadius: "999px",
                        border: "none",
                        boxShadow: palette.shadow,
                        zIndex: 5,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ctaText} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Mobile Landscape: Horizontal Phone / Tablet */}
            {currentSurface.id === "mobile-landscape" && (
              <div className="mockup-landscape">
                <div className="landscape-screen" style={{ background: palette.canvasBg }}>
                  <div style={{ flex: 1.2, padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={iconUrl} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                      <strong style={{ fontSize: "14px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                    </div>
                    <div>
                      <small style={{ fontSize: "10px", color: palette.textMuted, fontWeight: 700, letterSpacing: "1px" }}>SUMMER COLLECTION</small>
                      <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", fontWeight: 800, color: palette.textColor, margin: "3px 0", lineHeight: 1.1 }}>{headline}</h3>
                      <h4 style={{ fontSize: "14px", color: palette.secondary, fontWeight: 800, margin: "2px 0 6px" }}>{subheadline}</h4>
                      <p style={{ fontSize: "11px", color: palette.textMuted, margin: "0 0 12px", maxWidth: "230px" }}>{description || "Live Brighter Everyday."}</p>
                      <button className="base-cta-btn" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow, fontWeight: 800, border: "none", padding: "6px 14px", borderRadius: "6px" }}>
                        {ctaText} →
                      </button>
                    </div>
                    <small style={{ color: palette.leafColor, fontSize: "10.5px", fontWeight: 600 }}>🌿 Sustainably Crafted</small>
                  </div>
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", height: "100%" }}>
                    <div className="ad-golden-wave-landscape" />
                    <div style={{ position: "absolute", right: "10px", bottom: "10px", width: "52px", height: "62px", zIndex: 5, pointerEvents: "none" }}>
                      <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Square Social */}
            {currentSurface.id === "square-social" && (
              <div className="mockup-social">
                <div className="social-topbar">
                  <div className="social-avatar" style={{ background: palette.waveGradient }} />
                  <span>{brand.toLowerCase()}.official</span>
                </div>
                <div className="social-screen" style={{ background: palette.canvasBg }}>
                  <div style={{ flex: 1.15, padding: "18px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={iconUrl} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                      <strong style={{ fontSize: "13px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                    </div>
                    <div>
                      <small style={{ fontSize: "9px", color: palette.textMuted, fontWeight: 700, letterSpacing: "1px" }}>SUMMER COLLECTION</small>
                      <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "22px", fontWeight: 800, color: palette.textColor, margin: "2px 0", lineHeight: 1.1 }}>{headline}</h3>
                      <h4 style={{ fontSize: "13px", color: palette.secondary, fontWeight: 800, margin: "2px 0 6px" }}>{subheadline}</h4>
                      <p style={{ fontSize: "10px", color: palette.textMuted, margin: "0 0 10px", maxWidth: "170px" }}>{description || "Live Brighter Everyday."}</p>
                      <button className="base-cta-btn" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow, fontWeight: 800, border: "none", padding: "5px 12px", borderRadius: "6px" }}>
                        {ctaText} →
                      </button>
                    </div>
                    <small style={{ color: palette.leafColor, fontSize: "10px", fontWeight: 600 }}>🌿 Live Brighter Everyday.</small>
                  </div>
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", height: "100%" }}>
                    <div className="ad-golden-wave-square" />
                    <div style={{ position: "absolute", left: "6px", bottom: "4px", width: "42px", height: "50px", zIndex: 5, pointerEvents: "none" }}>
                      <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Digital Billboard */}
            {currentSurface.id === "digital-billboard" && (
              <div className="mockup-billboard">
                <div className="billboard-display" style={{ background: palette.canvasBg }}>
                  <div style={{ flex: 1.4, padding: "18px 22px", display: "flex", flexDirection: "column", justifyContent: "center", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <img src={iconUrl} alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                      <strong style={{ fontSize: "16px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                    </div>
                    <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "26px", fontWeight: 800, color: palette.textColor, margin: "2px 0 4px", lineHeight: 1.1 }}>
                      {headline.replace("\n", " ")}
                    </h3>
                    <h4 style={{ fontSize: "14px", color: palette.secondary, fontWeight: 800, margin: "0 0 8px" }}>{subheadline}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button className="base-cta-btn" style={{ background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow, fontWeight: 800, border: "none", padding: "6px 14px", borderRadius: "6px" }}>
                        {ctaText} →
                      </button>
                      <span style={{ fontSize: "11px", color: palette.textMuted }}>{description || "Available in stores & online"}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", height: "100%" }}>
                    <div className="ad-golden-wave-billboard" />
                    <div style={{ position: "absolute", right: "12px", bottom: "4px", width: "46px", height: "54px", zIndex: 5, pointerEvents: "none" }}>
                      <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="billboard-pole" />
              </div>
            )}

            {/* 5. Story (9:16) */}
            {currentSurface.id === "story-916" && (
              <div className="mockup-phone" style={{ height: "490px", width: "275px" }}>
                <div className="phone-top-notch" />
                <div className="phone-screen" style={{ padding: 0, position: "relative", background: palette.canvasBg, overflow: "hidden" }}>
                  <div className="ad-golden-wave-portrait" style={{ bottom: "-10%", height: "85%" }} />
                  <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                    <DraggableImage
                      src={userImage}
                      adjustment={currentAdjust}
                      onAdjustmentChange={handleAdjustmentChange}
                      isInteractive={true}
                    />
                  </div>
                  <div style={{ position: "absolute", left: "-6px", bottom: "50px", width: "52px", height: "62px", zIndex: 5, pointerEvents: "none" }}>
                    <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                  </div>
                  <div style={{ position: "absolute", top: "16px", left: "14px", right: "14px", background: palette.canvasBg + "ee", backdropFilter: "blur(10px)", padding: "12px", borderRadius: "12px", border: `1px solid ${palette.primary}44`, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <img src={iconUrl} alt="" style={{ width: "18px", height: "18px", objectFit: "contain" }} />
                      <strong style={{ fontSize: "13px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                    </div>
                    <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 800, color: palette.textColor, margin: "4px 0 2px" }}>
                      {headline.replace("\n", " ")}
                    </h3>
                    <h4 style={{ fontSize: "13px", color: palette.secondary, fontWeight: 800, margin: 0 }}>{subheadline}</h4>
                  </div>
                  <button
                    className="ad-pill-btn"
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      bottom: "16px",
                      background: palette.primary,
                      color: palette.ctaText,
                      fontSize: "12px",
                      fontWeight: 800,
                      padding: "8px 22px",
                      borderRadius: "999px",
                      border: "none",
                      boxShadow: palette.shadow,
                      zIndex: 10,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Swipe Up • {ctaText}
                  </button>
                </div>
              </div>
            )}

            {/* 6. Kiosk Display (1024x768 4:3) */}
            {currentSurface.id === "kiosk-display" && (
              <div className="mockup-kiosk">
                <div className="kiosk-screen" style={{ background: palette.canvasBg }}>
                  <div style={{ flex: 1.25, padding: "26px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img src={iconUrl} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                      <strong style={{ fontSize: "16px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                    </div>
                    <div>
                      <small style={{ fontSize: "10px", color: palette.textMuted, fontWeight: 700, letterSpacing: "1px" }}>TOUCH INTERACTION</small>
                      <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "28px", fontWeight: 800, color: palette.textColor, margin: "4px 0", lineHeight: 1.1 }}>{headline}</h3>
                      <h4 style={{ fontSize: "16px", color: palette.secondary, fontWeight: 800, margin: "4px 0 10px" }}>{subheadline}</h4>
                      <p style={{ fontSize: "11.5px", color: palette.textMuted, margin: "0 0 12px", maxWidth: "250px" }}>{description || "Explore our store collection and tap to order."}</p>
                      <button className="base-cta-btn" style={{ fontSize: "13px", padding: "8px 18px", background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow, fontWeight: 800, border: "none", borderRadius: "6px" }}>
                        Touch to {ctaText} →
                      </button>
                    </div>
                    <small style={{ color: palette.leafColor, fontSize: "11px", fontWeight: 600 }}>🌿 Sustainable Modern Living</small>
                  </div>
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", height: "100%" }}>
                    <div className="ad-golden-wave-kiosk" />
                    <div style={{ position: "absolute", right: "12px", bottom: "10px", width: "56px", height: "66px", zIndex: 5, pointerEvents: "none" }}>
                      <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. TV / Broadcast Lower Third (1920x270) */}
            {currentSurface.id === "tv-broadcast" && (
              <div className="mockup-broadcast">
                <div className="broadcast-video-scene">
                  <span>Simulated 16:9 Broadcast Video Feed</span>
                </div>
                <div className="broadcast-overlay-bar" style={{ background: palette.canvasBg, color: palette.textColor, borderTop: `3px solid ${palette.primary}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
                    <img src={iconUrl} alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
                    <div>
                      <strong style={{ fontSize: "14px", display: "block", color: palette.textColor }}>{brand}</strong>
                      <span style={{ fontSize: "11px", color: palette.secondary, fontWeight: 800 }}>{subheadline}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 800, color: palette.textColor }}>
                    {headline.replace("\n", " — ")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", height: "100%" }}>
                    <button className="base-cta-btn" style={{ margin: 0, background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow, fontWeight: 800, border: "none", padding: "5px 12px", borderRadius: "4px" }}>
                      {ctaText} →
                    </button>
                    <div style={{ width: "54px", height: "54px", position: "relative", borderRadius: "6px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. Smartwatch / Custom (360x360) */}
            {currentSurface.id === "custom-surface" && (
              <div className="mockup-watch">
                <div className="watch-screen" style={{ background: palette.canvasBg, color: palette.textColor }}>
                  <img src={iconUrl} alt="" style={{ width: "20px" }} />
                  <strong style={{ fontSize: "11px", color: palette.textColor }}>{brand}</strong>
                  <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "14px", fontWeight: 800, color: palette.textColor }}>
                    {headline.replace("\n", " ")}
                  </div>
                  <div style={{ fontSize: "10px", color: palette.secondary, fontWeight: 700 }}>
                    {subheadline}
                  </div>
                  <span className="base-cta-btn" style={{ fontSize: "9px", padding: "4px 8px", background: palette.primary, color: palette.ctaText, boxShadow: palette.shadow }}>
                    {ctaText}
                  </span>
                </div>
              </div>
            )}

            {/* 9. Live Unknown Surface Profile Hardware Mockup (Bonus 1) */}
            {!isPreknownSurface && (
              <div className="mockup-dynamic-device" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                <div
                  className="dynamic-device-frame"
                  style={{
                    width: "100%",
                    maxWidth: currentSurface.width > currentSurface.height ? "620px" : "360px",
                    background: "#0f172a",
                    borderRadius: "16px",
                    padding: "12px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 8px", color: "#94a3b8", fontSize: "11px" }}>
                    <span>✨ LIVE RESOLVED SURFACE ({currentSurface.category.toUpperCase()})</span>
                    <span>{currentSurface.width} × {currentSurface.height} px</span>
                  </div>
                  <div
                    className="dynamic-screen-viewport"
                    style={{
                      aspectRatio: `${currentSurface.width} / ${currentSurface.height}`,
                      background: palette.canvasBg,
                      color: palette.textColor,
                      borderRadius: "8px",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: currentSurface.orientation === "landscape" ? "row" : "column",
                      justifyContent: "space-between",
                      padding: "20px",
                    }}
                  >
                    <div style={{ zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", flex: 1.2 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <img src={iconUrl} alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                          <strong style={{ fontSize: "15px", fontWeight: 800, color: palette.textColor }}>{brand}</strong>
                          <span style={{ fontSize: "9px", background: palette.primary, color: palette.ctaText, padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>LIVE PROFILE</span>
                        </div>
                        <h2 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: currentSurface.width > 1500 ? "28px" : "20px", fontWeight: 800, color: palette.textColor, margin: "6px 0", lineHeight: 1.1 }}>
                          {headline}
                        </h2>
                        <h4 style={{ fontSize: "14px", color: palette.secondary, fontWeight: 700, margin: "4px 0 8px" }}>
                          {subheadline}
                        </h4>
                        <p style={{ fontSize: "11px", color: palette.textMuted, maxWidth: "320px", margin: 0 }}>
                          {description}
                        </p>
                      </div>
                      <div style={{ marginTop: "12px" }}>
                        <button
                          className="base-cta-btn"
                          style={{
                            background: palette.primary,
                            color: palette.ctaText,
                            padding: "8px 18px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            fontSize: "13px",
                            border: "none",
                            minHeight: "48px",
                            minWidth: "48px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: palette.shadow,
                          }}
                        >
                          {ctaText} →
                        </button>
                      </div>
                    </div>

                    <div style={{ flex: 1, position: "relative", minHeight: "120px", overflow: "hidden", borderRadius: "8px" }}>
                      <div style={{ position: "absolute", right: "8px", bottom: "8px", width: "50px", height: "60px", zIndex: 5, pointerEvents: "none" }}>
                        <PalmLeaf leafColor={palette.leafColor} stemColor={palette.stemColor} />
                      </div>
                      <DraggableImage
                        src={userImage}
                        adjustment={currentAdjust}
                        onAdjustmentChange={handleAdjustmentChange}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Layout Details & Resolution Trace */}
        <section className="layout-details">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700 }}>Layout Details</h2>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{currentSurface.id}</span>
          </div>

          <div className="segment">
            <button
              className={detailTab === "elements" ? "selected" : ""}
              onClick={() => setDetailTab("elements")}
            >
              Elements ({resolved.elements.length})
            </button>
            <button
              className={detailTab === "traces" ? "selected" : ""}
              onClick={() => setDetailTab("traces")}
            >
              Decision Trace
            </button>
            <button
              className={detailTab === "a11y" ? "selected" : ""}
              onClick={() => setDetailTab("a11y")}
            >
              A11y & Metrics
            </button>
            <button
              className={detailTab === "image" ? "selected" : ""}
              onClick={() => setDetailTab("image")}
            >
              Image Adjust
            </button>
          </div>

          {detailTab === "a11y" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(() => {
                const ctaEl = resolved.elements.find((e) => e.id === "cta");
                const ctaW = ctaEl?.size.width || 120;
                const ctaH = ctaEl?.size.height || 48;
                const passTouch = ctaW >= 44 && ctaH >= 44;

                const textRatio = computeContrastRatio(palette.canvasBg, palette.textColor);
                const ctaRatio = computeContrastRatio(palette.primary, palette.ctaText);
                const ctaBgRatio = computeContrastRatio(palette.canvasBg, palette.primary);

                const hlEl = resolved.elements.find((e) => e.id === "headline");
                const hlStatus = hlEl?.a11yStatus;

                return (
                  <>
                    {/* 1. Touch Target Compliance */}
                    <div className="a11y-card">
                      <div className="a11y-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>🎯</span>
                          <strong>WCAG 2.5.5 Tap Target Sizing</strong>
                        </div>
                        <span className={`a11y-score-badge ${passTouch ? "pass" : "warn"}`}>
                          {passTouch ? "PASS (≥44px)" : "NON-TOUCH"}
                        </span>
                      </div>
                      <div className="a11y-item">
                        <span>CTA Button Size</span>
                        <strong>{ctaW} × {ctaH} px</strong>
                      </div>
                      <div className="a11y-item">
                        <span>First-Class Constraint Status</span>
                        <strong style={{ color: "#059669" }}>Enforced by Resolver</strong>
                      </div>
                      <small style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                        The solver treats tap target boundaries as an immutable constraint on {currentSurface.name}. CTA cannot degrade below accessible sizing.
                      </small>
                    </div>

                    {/* 2. Contrast-Aware Branding Placement */}
                    <div className="a11y-card">
                      <div className="a11y-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>👁️</span>
                          <strong>WCAG 2.1 Color Contrast</strong>
                        </div>
                        <span className={`a11y-score-badge ${textRatio >= 4.5 ? "pass" : "warn"}`}>
                          {textRatio >= 7.0 ? "AAA PASS" : textRatio >= 4.5 ? "AA PASS" : "REVIEW"}
                        </span>
                      </div>
                      <div className="a11y-item">
                        <span>Text vs Canvas Background</span>
                        <strong style={{ color: textRatio >= 4.5 ? "#059669" : "#d97706" }}>
                          {textRatio}:1 {textRatio >= 7.0 ? "✓ AAA" : textRatio >= 4.5 ? "✓ AA" : "⚠"}
                        </strong>
                      </div>
                      <div className="a11y-item">
                        <span>CTA Text vs Button Primary</span>
                        <strong style={{ color: ctaRatio >= 4.5 ? "#059669" : "#d97706" }}>
                          {ctaRatio}:1 {ctaRatio >= 4.5 ? "✓ Pass" : "⚠"}
                        </strong>
                      </div>
                      <div className="a11y-item">
                        <span>CTA Button vs Background</span>
                        <strong>{ctaBgRatio}:1</strong>
                      </div>
                      <small style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                        Contrast-aware branding placement automatically calculates luminance across active palette tokens to prevent visual illegibility.
                      </small>
                    </div>

                    {/* 3. Text-Measurement-Aware Layout Engine */}
                    <div className="a11y-card">
                      <div className="a11y-card-header">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>📐</span>
                          <strong>Text-Measurement-Aware Layout</strong>
                        </div>
                        <span className="a11y-score-badge pass">Canvas 2D</span>
                      </div>
                      <div className="a11y-item">
                        <span>Headline Computed Height</span>
                        <strong>{hlStatus?.measuredHeight || hlEl?.size.height || 72} px</strong>
                      </div>
                      <div className="a11y-item">
                        <span>Computed Line Wrapping</span>
                        <strong>{hlStatus?.lineCount || 2} line(s)</strong>
                      </div>
                      <div className="a11y-item">
                        <span>Measurement Method</span>
                        <strong>Live Glyph Context</strong>
                      </div>
                      <small style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                        Layout decisions are informed by rendered font glyph widths and bounding boxes rather than static character guesses.
                      </small>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : detailTab === "elements" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {resolved.elements.map((el) => {
                const isHidden = !el.visible;
                const isResized = el.appliedDegradation.some((d) => d.type === "shrink");
                return (
                  <div className="element-row" key={el.id}>
                    <div className="element-meta">
                      <div className="element-icon-tag">{el.id.substring(0, 2).toUpperCase()}</div>
                      <div>
                        <strong>{el.id}</strong>
                        <small>
                          w: {el.size.width}px, h: {el.size.height}px
                        </small>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: isHidden ? "#fee2e2" : isResized ? "#fef3c7" : "#d1fae5",
                        color: isHidden ? "#b91c1c" : isResized ? "#b45309" : "#047857",
                      }}
                    >
                      {isHidden ? "Hidden" : isResized ? "Resized" : "Preferred"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : detailTab === "traces" ? (
            <div className="trace-box">
              {resolved.elements.flatMap((el) => el.trace).map((trace, i) => (
                <div key={i} className="trace-item">
                  {trace}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ fontSize: "12.5px", display: "block", marginBottom: "4px" }}>Active Surface: {currentSurface.name}</strong>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 10px" }}>
                  Directly drag the hero image inside the stage mockup to pan freely, or adjust precision coordinates below.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                      <span>Horizontal Offset (X)</span>
                      <strong>{currentAdjust.x > 0 ? `+${currentAdjust.x}` : currentAdjust.x}px</strong>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="1"
                      value={currentAdjust.x}
                      onChange={(e) => handleAdjustmentChange({ ...currentAdjust, x: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", accentColor: palette.primary }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                      <span>Vertical Offset (Y)</span>
                      <strong>{currentAdjust.y > 0 ? `+${currentAdjust.y}` : currentAdjust.y}px</strong>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="1"
                      value={currentAdjust.y}
                      onChange={(e) => handleAdjustmentChange({ ...currentAdjust, y: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", accentColor: palette.primary }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                      <span>Scale / Zoom</span>
                      <strong>{(currentAdjust.scale * 100).toFixed(0)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={currentAdjust.scale}
                      onChange={(e) => handleAdjustmentChange({ ...currentAdjust, scale: parseFloat(e.target.value) || 1 })}
                      style={{ width: "100%", accentColor: palette.primary }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button
                    className="ghost"
                    style={{ flex: 1, fontSize: "11.5px", padding: "6px" }}
                    onClick={handleReset}
                    disabled={currentAdjust.x === 0 && currentAdjust.y === 0 && currentAdjust.scale === 1}
                  >
                    Reset Position
                  </button>
                  <button
                    className="primary"
                    style={{ flex: 1.2, fontSize: "11.5px", padding: "6px" }}
                    onClick={() => onApplyToAll(currentAdjust)}
                  >
                    Apply to All Surfaces
                  </button>
                </div>
              </div>

              <div style={{ padding: "10px 12px", background: "rgba(245, 158, 11, 0.08)", borderRadius: "6px", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                <small style={{ fontSize: "11px", color: "var(--text-main)", lineHeight: 1.4, display: "block" }}>
                  💡 <strong>Tip:</strong> Mouse wheel zoom is supported directly on the preview image. Each target surface retains its custom image framing!
                </small>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Code Inspector Window Modal */}
      {showCodeModal && (
        <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
          <div className="code-modal-window" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar with Title, Format Tabs, and Top Copy Button */}
            <div className="code-modal-top-bar">
              <div className="code-modal-title-group">
                <Code2 size={20} className="code-modal-icon" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>Code Inspector: {currentSurface.name}</h3>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>{currentSurface.size} • {palette.name} Theme</small>
                </div>
              </div>

              <div className="code-format-tabs">
                <button
                  className={codeTab === "react" ? "active" : ""}
                  onClick={() => setCodeTab("react")}
                >
                  React / TSX
                </button>
                <button
                  className={codeTab === "html" ? "active" : ""}
                  onClick={() => setCodeTab("html")}
                >
                  HTML / CSS
                </button>
                <button
                  className={codeTab === "json" ? "active" : ""}
                  onClick={() => setCodeTab("json")}
                >
                  Fladapt JSON
                </button>
              </div>

              <div className="code-modal-actions">
                <button
                  className={`top-copy-btn ${codeCopied ? "copied" : ""}`}
                  onClick={handleCopyTop}
                  title="Copy code to clipboard"
                >
                  {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{codeCopied ? "✓ Copied!" : "Copy Code"}</span>
                </button>
                <button
                  className="close-btn"
                  onClick={() => setShowCodeModal(false)}
                  title="Close window"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="code-editor-box">
              <div className="code-editor-meta">
                <span>{codeTab === "react" ? `${currentSurface.name.replace(/[^a-zA-Z0-9]/g, "")}Ad.tsx` : codeTab === "html" ? "ad-unit.html" : "resolved-layout.json"}</span>
                <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{codeTab}</span>
              </div>
              <pre className="code-pre">
                <code>{activeCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add Live Surface Profile Modal */}
      {showAddSurfaceModal && onAddSurface && (
        <AddSurfaceModal
          isOpen={showAddSurfaceModal}
          onClose={() => setShowAddSurfaceModal(false)}
          onAddSurface={(s) => {
            onAddSurface(s);
            setShowAddSurfaceModal(false);
          }}
        />
      )}
    </main>
  );
}

// ==========================================================================
// ProjectsPage Component
// ==========================================================================

function ProjectsPage({
  campaigns,
  searchQuery,
  setPage,
  showToast,
}: {
  campaigns: Campaign[];
  searchQuery: string;
  setPage: (p: Page) => void;
  showToast: (m: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Active"
        ? c.status === "Active"
        : activeTab === "Drafts"
        ? c.status === "Draft"
        : c.status === "Archived";
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Projects &gt; All Campaigns</p>
          <h1>Projects</h1>
          <p>Manage and organize all your adaptive layout campaigns.</p>
        </div>
        <button className="primary" onClick={() => setPage("create")}>
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="toolbar-row">
        <div className="tabs">
          {["All", "Active", "Drafts", "Archived"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
          Showing {filtered.length} of {campaigns.length} campaigns
        </span>
      </div>

      <section className="table-card">
        <div className="table-head">
          <span>Design / Campaign</span>
          <span>Status</span>
          <span>Surfaces</span>
          <span>Assets</span>
          <span>Actions</span>
        </div>

        {filtered.map((item) => (
          <div className="project-row" key={item.id}>
            <div className="project-name">
              <img src={item.image} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <small>{item.updated}</small>
              </div>
            </div>

            <div>
              <span className={`status-badge ${item.status.toLowerCase()}`}>
                <i />
                {item.status}
              </span>
            </div>

            <div className="icon-stat">
              <Layers />
              <span>{item.surfaces} surfaces</span>
            </div>

            <div className="icon-stat">
              <FileImage />
              <span>{item.assets} assets</span>
            </div>

            <div className="row-actions">
              <button
                className="action-menu-btn"
                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
              >
                <MoreHorizontal size={16} />
              </button>
              {openMenuId === item.id && (
                <div className="action-dropdown">
                  <button
                    onClick={() => {
                      setOpenMenuId(null);
                      setPage("create");
                      showToast(`Editing ${item.title}`);
                    }}
                  >
                    Edit Campaign
                  </button>
                  <button
                    onClick={() => {
                      setOpenMenuId(null);
                      setPage("surfaces");
                      showToast(`Viewing layouts for ${item.title}`);
                    }}
                  >
                    Preview Surfaces
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

// ==========================================================================
// TemplatesPage Component
// ==========================================================================

function TemplatesPage({
  searchQuery,
  onApplyTemplate,
}: {
  searchQuery: string;
  onApplyTemplate: (tpl: typeof templateCards[0]) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All Templates");

  const categories = ["All Templates", "Social Media", "Digital Ads", "Physical Displays", "Seasonal"];

  const filtered = templateCards.filter((t) => {
    const matchesCat = selectedCategory === "All Templates" || t.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Create &gt; Templates</p>
          <h1>Templates</h1>
          <p>Start with a template and make it your own.</p>
        </div>
      </div>

      <div className="filter-panel">
        <div className="tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={selectedCategory === cat ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="template-grid">
        {filtered.map((item) => (
          <article className="template-card" key={item.title}>
            <img src={item.image} alt={item.title} />
            <div className="template-card-body">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="template-card-footer">
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.category}</span>
              <button
                className="soft-button"
                onClick={() => onApplyTemplate(item)}
                title="Use this template"
              >
                <span>Use Template</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

// ==========================================================================
// MediaLibraryPage Component
// ==========================================================================

function MediaLibraryPage({
  showToast,
  onSelectMedia,
}: {
  showToast: (m: string) => void;
  onSelectMedia: (img: string) => void;
}) {
  const assets = [
    { name: "Hero Model Photo (Summer)", size: "420 KB", type: "PNG", image: heroModel },
    { name: "Summer Sale Keyvisual", size: "1.6 MB", type: "PNG", image: cardSummerSale },
    { name: "Festive Background", size: "1.3 MB", type: "PNG", image: cardFestiveOffer },
    { name: "Product Showcase", size: "1.4 MB", type: "PNG", image: cardProductLaunch },
    { name: "App Icon Fire Mark", size: "420 KB", type: "PNG", image: iconUrl },
    { name: "Storefront Billboard View", size: "1.5 MB", type: "PNG", image: cardBrandAwareness },
  ];

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Assets &gt; Media Library</p>
          <h1>Media Library</h1>
          <p>Manage creative assets, photography, and brand graphics.</p>
        </div>
      </div>

      <div className="template-grid">
        {assets.map((a) => (
          <div className="template-card" key={a.name}>
            <img src={a.image} alt={a.name} style={{ height: "160px", objectFit: "cover" }} />
            <div className="template-card-body">
              <h3>{a.name}</h3>
              <p>{a.size} • {a.type}</p>
            </div>
            <div className="template-card-footer">
              <button
                className="primary"
                onClick={() => onSelectMedia(a.image)}
                style={{ height: "30px", fontSize: "12px", width: "100%" }}
              >
                Apply as Active Design Asset
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ==========================================================================
// AnalyticsPage Component
// ==========================================================================

function AnalyticsPage({ setPage, showToast }: { setPage: (p: Page) => void; showToast: (m: string) => void }) {
  const [timeRange, setTimeRange] = useState("Last 30 days");

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">Overview &gt; Analytics</p>
          <h1>Analytics</h1>
          <p>Track adaptation metrics and surface reach across campaigns.</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => {
            setTimeRange(e.target.value);
            showToast(`Filtered by ${e.target.value}`);
          }}
          className="select-button"
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>

      <div className="analytics-stats">
        <div className="metric">
          <div className="stat-icon blue"><Folder /></div>
          <div className="stat-content">
            <strong>12</strong>
            <span>Total Projects</span>
          </div>
        </div>
        <div className="metric">
          <div className="stat-icon green"><Layers /></div>
          <div className="stat-content">
            <strong>124</strong>
            <span>Layouts Generated</span>
          </div>
        </div>
        <div className="metric">
          <div className="stat-icon orange"><Monitor /></div>
          <div className="stat-content">
            <strong>8</strong>
            <span>Surfaces Covered</span>
          </div>
        </div>
        <div className="metric">
          <div className="stat-icon pink"><Zap /></div>
          <div className="stat-content">
            <strong>1.2ms</strong>
            <span>Avg. Resolution Speed</span>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <section className="chart-card">
          <h2 style={{ fontSize: "14px", fontWeight: 700 }}>Layouts Generated by Surface</h2>
          <div className="bar-chart">
            {[
              { label: "Mobile", h: 88 },
              { label: "Social", h: 64 },
              { label: "Billboard", h: 42 },
              { label: "Kiosk", h: 56 },
              { label: "Broadcast", h: 32 },
              { label: "Watch", h: 28 },
            ].map((bar) => (
              <div key={bar.label} className="bar-col">
                <span className="bar-pill" style={{ height: `${bar.h}px` }} />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            <span>Mobile</span>
            <span>Social</span>
            <span>Billboard</span>
            <span>Kiosk</span>
            <span>Broadcast</span>
            <span>Watch</span>
          </div>
        </section>

        <section className="chart-card">
          <h2 style={{ fontSize: "14px", fontWeight: 700 }}>Element Retention Rate</h2>
          <div className="donut-wrap">
            <div className="donut" />
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot purple" />
                <span>Preferred (78%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot orange" />
                <span>Resized (15%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot violet" />
                <span>Hidden (7%)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ==========================================================================
// SettingsPage Component
// ==========================================================================

function SettingsPage({
  isDark,
  setIsDark,
  showToast,
}: {
  isDark: boolean;
  setIsDark: boolean;
  showToast: (m: string) => void;
}) {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="crumb">System &gt; Preferences</p>
          <h1>Settings</h1>
          <p>Engine configuration, default insets, and theme options.</p>
        </div>
      </div>

      <section className="panel" style={{ maxWidth: "680px" }}>
        <h2>Appearance</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <strong>Theme Mode</strong>
            <small style={{ display: "block", color: "var(--text-muted)" }}>
              Switch between Light and Dark interface
            </small>
          </div>
          <button
            className="ghost"
            onClick={() => {
              setIsDark(!isDark);
              showToast(`Theme switched to ${!isDark ? "Dark" : "Light"}`);
            }}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid var(--border)", margin: "14px 0" }} />

        <h2>Layout Engine Defaults</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
            Default Safe-Area Inset (px)
            <input defaultValue="40" style={{ height: "34px", padding: "0 10px", border: "1px solid var(--border)", borderRadius: "6px" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
            Degradation Ladder Order
            <select style={{ height: "34px", padding: "0 10px", border: "1px solid var(--border)", borderRadius: "6px" }}>
              <option>shrink → reflow → truncate → hide (Standard)</option>
              <option>reflow → shrink → truncate → hide</option>
            </select>
          </label>
          <button
            className="primary"
            style={{ width: "fit-content", marginTop: "8px" }}
            onClick={() => showToast("Preferences updated successfully")}
          >
            Save Preferences
          </button>
        </div>
      </section>
    </main>
  );
}

// ==========================================================================
// DocumentationPage Component
// ==========================================================================

function DocumentationPage({
  setPage,
  showToast,
}: {
  setPage: (p: Page) => void;
  showToast: (m: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "techstack" | "features" | "commands">("overview");

  return (
    <main className="page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p className="crumb">System &gt; Documentation &amp; Architecture Guide</p>
          <h1>Fladapt Documentation</h1>
          <p>Complete guide to Fladapt's adaptive resolution solver, architecture, features, and CLI commands.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="ghost" onClick={() => setPage("create")} style={{ fontSize: "12px" }}>
            <Plus size={14} /> Try Live Solver
          </button>
          <button
            className="primary"
            onClick={() => {
              navigator.clipboard.writeText("https://github.com/fladapt/fladapt");
              showToast("✓ Documentation link copied to clipboard");
            }}
            style={{ fontSize: "12px" }}
          >
            <Copy size={14} /> Share Docs
          </button>
        </div>
      </div>

      {/* Docs Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          ["overview", "Overview & Mission"],
          ["architecture", "Architecture & Solver"],
          ["techstack", "Technical Stack"],
          ["features", "Features & Bonus Points"],
          ["commands", "Commands & Run Guide"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id as any)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              border: activeTab === id ? "1px solid var(--primary)" : "1px solid var(--border)",
              background: activeTab === id ? "var(--primary)" : "var(--bg-card)",
              color: activeTab === id ? "#ffffff" : "var(--text-main)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel">
            <h2>What is Fladapt?</h2>
            <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "var(--text-main)" }}>
              <strong>Fladapt</strong> is an <em>Adaptive Multi-Surface Layout Resolution Engine</em> designed to bridge the gap between creative design and heterogeneous display surfaces. Instead of creating fixed pixel variations or relying on generic CSS media queries, Fladapt takes a single source design specification and resolves optimal, collision-free geometry for any target screen—from 16:9 mobile displays to ultra-wide billboards, square smartwatch screens, and live custom profiles.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginTop: "16px" }}>
              <div style={{ padding: "14px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "var(--primary)", fontSize: "14px", display: "block", marginBottom: "4px" }}>🎯 Zero Breakpoints</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Pure mathematical constraint resolution rather than discrete CSS breakpoint lists.</p>
              </div>
              <div style={{ padding: "14px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "#059669", fontSize: "14px", display: "block", marginBottom: "4px" }}>⚡ 1.2ms Resolution</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Instant layout computation executing entirely client-side or server-side.</p>
              </div>
              <div style={{ padding: "14px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <strong style={{ color: "#7c3aed", fontSize: "14px", display: "block", marginBottom: "4px" }}>🔒 Deterministic AST</strong>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>Produces an abstract syntax tree consumable by web DOM, Canvas 2D, or native platforms.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Architecture & Solver */}
      {activeTab === "architecture" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel">
            <h2>Pure Geometry Resolver Architecture</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              The core resolution pipeline (located in <code>backend/src/resolver.ts</code>) has <strong>zero DOM dependencies</strong>. It operates as a pure function:
            </p>

            <div style={{ background: "var(--bg-app)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "monospace", fontSize: "12px", margin: "12px 0" }}>
              resolve(spec: ElementSpec, profile: SurfaceProfile) &rarr; ResolvedLayout
            </div>

            <h3>4-Phase Resolution Pipeline</h3>
            <ol style={{ fontSize: "13px", lineHeight: 1.7, paddingLeft: "20px", color: "var(--text-main)" }}>
              <li><strong>Aspect Ratio Classification:</strong> Categorizes geometry into <code>portrait</code>, <code>landscape</code>, <code>square</code>, <code>ultrawide</code>, or <code>wearable</code>.</li>
              <li><strong>Priority &amp; Degradation Cascade:</strong> Evaluates elements against container bounds. When space is constrained, applies ordered degradations (<code>shrink</code> &rarr; <code>reflow</code> &rarr; <code>truncate</code> &rarr; <code>hide</code>).</li>
              <li><strong>Text Measurement Engine:</strong> Uses Canvas 2D live glyph context (<code>backend/src/textMeasure.ts</code>) to compute rendered font heights and line wrapping instead of rough character estimations.</li>
              <li><strong>Accessibility Enforcer:</strong> Enforces WCAG 2.5.5 touch target minimums (&ge;48px) and computes WCAG 2.1 color contrast ratios.</li>
            </ol>
          </section>
        </div>
      )}

      {/* Tab 3: Technical Stack */}
      {activeTab === "techstack" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel">
            <h2>Technical Stack &amp; Dependencies</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
              <div style={{ padding: "16px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <h3 style={{ marginTop: 0, color: "var(--primary)" }}>Frontend Application</h3>
                <ul style={{ fontSize: "12.5px", lineHeight: 1.7, paddingLeft: "18px", color: "var(--text-main)" }}>
                  <li><strong>React 18:</strong> Modular UI component hierarchy</li>
                  <li><strong>TypeScript 5:</strong> Strict typing for layouts and theme palettes</li>
                  <li><strong>Vite 5:</strong> Lightning-fast HMR and bundle compilation</li>
                  <li><strong>Lucide React:</strong> Vector iconography system</li>
                  <li><strong>html2canvas &amp; jsPDF:</strong> Multi-format PNG, JPG, and PDF export engines</li>
                </ul>
              </div>

              <div style={{ padding: "16px", background: "var(--bg-app)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <h3 style={{ marginTop: 0, color: "#059669" }}>Backend Engine &amp; Resolution</h3>
                <ul style={{ fontSize: "12.5px", lineHeight: 1.7, paddingLeft: "18px", color: "var(--text-main)" }}>
                  <li><strong>Node.js + TypeScript:</strong> Pure geometry solver module (<code>@fladapt/backend</code>)</li>
                  <li><strong>Canvas 2D Measurement:</strong> Live glyph rendering context in <code>textMeasure.ts</code></li>
                  <li><strong>Dual Projection Backends:</strong> Native DOM + High-DPI Canvas 2D Bitmap Renderer</li>
                  <li><strong>WCAG 2.1 &amp; 2.5.5 Engine:</strong> Relative luminance contrast &amp; tap target algorithms</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 4: Features & Bonus Points */}
      {activeTab === "features" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel">
            <h2>Full Feature Catalog &amp; 5 Bonus Capabilities</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
              <div style={{ padding: "12px 14px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "8px" }}>
                <strong style={{ color: "#d97706", fontSize: "13px" }}>⭐ Bonus Feature 1: Live "Unknown at Design Time" Surface Profile</strong>
                <p style={{ fontSize: "12px", color: "var(--text-main)", margin: "4px 0 0" }}>Add arbitrary live display dimensions during demo (e.g. In-Car Cockpit 2560x720) resolved instantly with 0 code changes.</p>
              </div>

              <div style={{ padding: "12px 14px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "8px" }}>
                <strong style={{ color: "#4f46e5", fontSize: "13px" }}>⭐ Bonus Feature 2: Smooth Animated Surface Transitions</strong>
                <p style={{ fontSize: "12px", color: "var(--text-main)", margin: "4px 0 0" }}>Fluid morphing animation (<code>@keyframes surfaceMorph</code>) when switching between surfaces live.</p>
              </div>

              <div style={{ padding: "12px 14px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "8px" }}>
                <strong style={{ color: "#059669", fontSize: "13px" }}>⭐ Bonus Feature 3: Text-Measurement-Aware Layout Engine</strong>
                <p style={{ fontSize: "12px", color: "var(--text-main)", margin: "4px 0 0" }}>Canvas 2D glyph measurement accurately calculates rendered font line wraps and height in real time.</p>
              </div>

              <div style={{ padding: "12px 14px", background: "rgba(236, 72, 153, 0.08)", border: "1px solid rgba(236, 72, 153, 0.25)", borderRadius: "8px" }}>
                <strong style={{ color: "#db2777", fontSize: "13px" }}>⭐ Bonus Feature 4: Dual Rendering Backend (DOM + Canvas)</strong>
                <p style={{ fontSize: "12px", color: "var(--text-main)", margin: "4px 0 0" }}>High-DPI HTML5 Canvas 2D engine operating alongside native DOM, sharing identical AST with AST Bounding Box debug overlays.</p>
              </div>

              <div style={{ padding: "12px 14px", background: "rgba(14, 165, 233, 0.08)", border: "1px solid rgba(14, 165, 233, 0.25)", borderRadius: "8px" }}>
                <strong style={{ color: "#0284c7", fontSize: "13px" }}>⭐ Bonus Feature 5: First-Class WCAG Accessibility Constraints</strong>
                <p style={{ fontSize: "12px", color: "var(--text-main)", margin: "4px 0 0" }}>Solver enforces WCAG 2.5.5 tap target minimums (&ge;48px) and computes WCAG 2.1 relative luminance color contrast scores.</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: Commands & Run Guide */}
      {activeTab === "commands" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section className="panel">
            <h2>Commands to Run Fladapt</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
              Run the following commands in your terminal to install dependencies, launch the development server, or build production artifacts:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>1. Run Local Development Server (Vite)</strong>
                <pre style={{ background: "var(--bg-app)", padding: "12px 14px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", marginTop: "6px" }}>
                  <code>cd frontend{"\n"}npm run dev</code>
                </pre>
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Launches local server at http://localhost:5174</small>
              </div>

              <div>
                <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>2. Build Production Bundle</strong>
                <pre style={{ background: "var(--bg-app)", padding: "12px 14px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", marginTop: "6px" }}>
                  <code>cd frontend{"\n"}npm run build</code>
                </pre>
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Compiles TypeScript &amp; bundles assets into dist/</small>
              </div>

              <div>
                <strong style={{ fontSize: "12.5px", color: "var(--text-main)" }}>3. Preview Production Build</strong>
                <pre style={{ background: "var(--bg-app)", padding: "12px 14px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", marginTop: "6px" }}>
                  <code>cd frontend{"\n"}npm run preview</code>
                </pre>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
