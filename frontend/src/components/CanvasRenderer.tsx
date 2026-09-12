import React, { useEffect, useRef, useState } from "react";
import { ResolvedLayout } from "../../../backend/src/model";
import { ThemePalette, SurfaceCard } from "./App";

export interface CanvasRendererProps {
  width?: number;
  height?: number;
  surface?: SurfaceCard;
  layout?: ResolvedLayout;
  resolvedLayout?: ResolvedLayout;
  brand: string;
  headline: string;
  subheadline: string;
  description?: string;
  ctaText: string;
  userImage: string;
  iconUrl?: string;
  imageAdjustment: { x: number; y: number; scale: number };
  palette: ThemePalette;
  showDebugBoxes?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onDragAdjustment?: (adj: { x: number; y: number; scale: number }) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  width,
  height,
  surface,
  layout,
  resolvedLayout,
  brand,
  headline,
  subheadline,
  description = "Live Brighter Everyday.",
  ctaText,
  userImage,
  iconUrl,
  imageAdjustment,
  palette,
  showDebugBoxes = false,
  className = "",
  style,
  onDragAdjustment,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const iconObjRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Dragging state on canvas
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialAdjust = useRef<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });

  const layoutObj = layout || resolvedLayout;

  // Calculate target surface dimensions and determine responsive render dimensions
  const surfaceWidth = surface?.width || layoutObj?.surface.width || 1920;
  const surfaceHeight = surface?.height || layoutObj?.surface.height || 1080;
  const aspect = surfaceWidth / surfaceHeight;
  const isPortrait = surfaceHeight > surfaceWidth;
  const isWide = surfaceWidth >= surfaceHeight * 2;

  let renderW = width;
  let renderH = height;

  if (!renderW || !renderH) {
    if (isPortrait) {
      renderW = 280;
      renderH = Math.min(540, Math.round(280 / aspect));
    } else if (isWide) {
      renderW = Math.min(580, surfaceWidth);
      renderH = Math.max(110, Math.min(220, Math.round(renderW / aspect)));
    } else if (Math.abs(aspect - 1) < 0.15) {
      renderW = 380;
      renderH = 380;
    } else {
      renderW = 540;
      renderH = Math.round(540 / aspect);
    }
  }

  // Preload Brand Icon
  useEffect(() => {
    if (!iconUrl) return;
    const iconImg = new Image();
    iconImg.src = iconUrl;
    iconImg.onload = () => {
      iconObjRef.current = iconImg;
      renderCanvas();
    };
  }, [iconUrl]);

  // Preload Hero Image (handles data URLs, blob URLs, and external assets)
  useEffect(() => {
    let active = true;
    const img = new Image();
    if (!userImage.startsWith("data:") && !userImage.startsWith("blob:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      if (!active) return;
      imageObjRef.current = img;
      setImageLoaded(true);
    };

    img.onerror = () => {
      if (!active) return;
      imageObjRef.current = null;
      setImageLoaded(false);
    };

    img.src = userImage;
    if (img.complete && img.naturalWidth > 0) {
      imageObjRef.current = img;
      setImageLoaded(true);
    }

    return () => {
      active = false;
    };
  }, [userImage]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = renderW || 540;
    const h = renderH || 300;

    const dpr = Math.max(window.devicePixelRatio || 1, 2); // crisp HiDPI
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // 1. Clear & Paint Background
    ctx.fillStyle = palette.canvasBg;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Decorative Wave Backdrop (Bézier Curve)
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, palette.primary);
    grad.addColorStop(0.7, palette.primaryHover);
    grad.addColorStop(1, palette.secondary);
    ctx.fillStyle = grad;

    ctx.beginPath();
    if (isPortrait) {
      // Bottom wave for portrait/mobile
      ctx.moveTo(0, h * 0.44);
      ctx.bezierCurveTo(w * 0.3, h * 0.36, w * 0.7, h * 0.52, w, h * 0.42);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
    } else if (isWide) {
      // Right side wave for banner/billboard
      ctx.moveTo(w * 0.48, 0);
      ctx.bezierCurveTo(w * 0.56, h * 0.35, w * 0.44, h * 0.8, w * 0.54, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
      ctx.closePath();
    } else {
      // Standard landscape wave
      ctx.moveTo(w * 0.48, 0);
      ctx.bezierCurveTo(w * 0.58, h * 0.35, w * 0.46, h * 0.75, w * 0.52, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();

    // 3. Draw Hero Image (respecting user pan & zoom transforms)
    if (imageObjRef.current && imageObjRef.current.naturalWidth > 0) {
      ctx.save();
      // Clip to visual half
      ctx.beginPath();
      if (isPortrait) {
        ctx.rect(0, h * 0.38, w, h * 0.62);
      } else {
        ctx.rect(w * 0.46, 0, w * 0.54, h);
      }
      ctx.clip();

      const img = imageObjRef.current;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetW = isPortrait ? w : w * 0.54;
      const targetH = isPortrait ? h * 0.62 : h;

      let drawW = targetW * imageAdjustment.scale;
      let drawH = drawW / imgAspect;
      if (drawH < targetH * imageAdjustment.scale) {
        drawH = targetH * imageAdjustment.scale;
        drawW = drawH * imgAspect;
      }

      const imgX = (isPortrait ? (w - drawW) / 2 : w * 0.46 + (targetW - drawW) / 2) + imageAdjustment.x;
      const imgY = (isPortrait ? h * 0.38 : (targetH - drawH) / 2) + imageAdjustment.y;

      ctx.drawImage(img, imgX, imgY, drawW, drawH);
      ctx.restore();
    }

    // 4. Draw Tropical Foliage (Palm Leaf vector on canvas)
    ctx.save();
    ctx.fillStyle = palette.leafColor;
    ctx.strokeStyle = palette.stemColor;
    ctx.lineWidth = 2;

    const leafBaseX = isPortrait ? 20 : w * 0.44;
    const leafBaseY = isPortrait ? h - 28 : h - 16;

    // Curved stem
    ctx.beginPath();
    ctx.moveTo(leafBaseX, leafBaseY);
    ctx.quadraticCurveTo(leafBaseX + 14, leafBaseY - 26, leafBaseX + 32, leafBaseY - 48);
    ctx.stroke();

    // Palm frond petals
    const drawFrond = (fx: number, fy: number, radX: number, radY: number, rot: number) => {
      ctx.beginPath();
      ctx.ellipse(fx, fy, radX, radY, rot, 0, Math.PI * 2);
      ctx.fill();
    };
    drawFrond(leafBaseX + 10, leafBaseY - 18, 9, 3.5, -0.6);
    drawFrond(leafBaseX + 20, leafBaseY - 30, 11, 4.5, -0.5);
    drawFrond(leafBaseX + 28, leafBaseY - 42, 10, 4, -0.3);
    drawFrond(leafBaseX + 16, leafBaseY - 12, 8, 3, 0.4);
    drawFrond(leafBaseX + 26, leafBaseY - 24, 10, 4, 0.5);
    ctx.restore();

    // 5. Draw Typography (Copy Layout)
    const copyX = 22;
    let copyY = isPortrait ? 36 : Math.max(30, h * 0.2);

    // Brand tag with optional icon
    if (iconObjRef.current) {
      ctx.drawImage(iconObjRef.current, copyX, copyY - 14, 18, 18);
      ctx.fillStyle = palette.textColor;
      ctx.font = "800 13px Inter, sans-serif";
      ctx.fillText(brand, copyX + 24, copyY);
    } else {
      ctx.fillStyle = palette.secondary;
      ctx.font = "800 11px Inter, sans-serif";
      ctx.fillText(brand.toUpperCase(), copyX, copyY);
    }

    copyY += 24;

    // Category / Eyebrow tag
    ctx.fillStyle = palette.textMuted;
    ctx.font = "700 9.5px Inter, sans-serif";
    ctx.fillText("SUMMER COLLECTION", copyX, copyY);

    copyY += 16;

    // Headline (Playfair serif)
    ctx.fillStyle = palette.textColor;
    const headFontSize = isPortrait ? 24 : isWide ? 26 : 22;
    ctx.font = `800 ${headFontSize}px "Playfair Display", Georgia, serif`;
    const headlineLines = headline.split("\n");
    for (const line of headlineLines) {
      ctx.fillText(line, copyX, copyY);
      copyY += headFontSize * 1.06;
    }

    copyY += 2;

    // Subheadline
    ctx.fillStyle = palette.secondary;
    ctx.font = "800 13px Inter, sans-serif";
    ctx.fillText(subheadline, copyX, copyY);

    copyY += 16;

    // Description (if space permits)
    if (!isWide && h > 220) {
      ctx.fillStyle = palette.textMuted;
      ctx.font = "500 10.5px Inter, sans-serif";
      ctx.fillText(description, copyX, copyY);
      copyY += 18;
    }

    // 6. Draw CTA Pill Button
    const btnY = isPortrait ? copyY + 12 : Math.min(h - 44, copyY + 14);
    const btnText = `${ctaText} →`;
    ctx.font = "800 12px Inter, sans-serif";
    const textWidth = ctx.measureText(btnText).width;
    const btnPaddingX = 18;
    const btnH = 32;
    const btnW = textWidth + btnPaddingX * 2;
    const btnRadius = isPortrait ? btnH / 2 : 6;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(copyX, btnY, btnW, btnH, btnRadius);
    ctx.fill();
    ctx.restore();

    // Button label
    ctx.fillStyle = palette.ctaText;
    ctx.font = "800 11.5px Inter, sans-serif";
    ctx.fillText(btnText, copyX + btnPaddingX, btnY + btnH / 2 + 4);

    // Sustainable Crafted Tag
    if (!isPortrait && h > 200) {
      ctx.fillStyle = palette.leafColor;
      ctx.font = "600 10px Inter, sans-serif";
      ctx.fillText("🌿 Sustainably Crafted", copyX, h - 14);
    }

    // 7. Optional Debug Bounding Boxes (Resolver Visual Inspector)
    if (showDebugBoxes && layoutObj?.elements) {
      ctx.save();
      // Scale factor from theoretical solver coordinate space to canvas viewport
      const scaleX = w / surfaceWidth;
      const scaleY = h / surfaceHeight;

      for (const el of layoutObj.elements) {
        if (!el.visible) continue;
        const bx = el.position.x * scaleX;
        const by = el.position.y * scaleY;
        const bw = Math.max(30, el.size.width * scaleX);
        const bh = Math.max(20, el.size.height * scaleY);

        ctx.strokeStyle = el.a11yStatus?.touchTargetCompliant === false ? "#ef4444" : "#6366f1";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(bx, by, bw, bh);

        // Badge
        ctx.fillStyle = "rgba(99, 102, 241, 0.85)";
        ctx.fillRect(bx, by, Math.min(bw, 54), 14);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8.5px monospace";
        ctx.fillText(el.id, bx + 3, by + 10);
      }
      ctx.restore();
    }
  };

  // Re-render whenever parameters change
  useEffect(() => {
    renderCanvas();
  }, [
    renderW,
    renderH,
    brand,
    headline,
    subheadline,
    description,
    ctaText,
    palette,
    imageAdjustment,
    imageLoaded,
    layoutObj,
    showDebugBoxes,
  ]);

  // Mouse drag handlers on canvas for intuitive image positioning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialAdjust.current = { ...imageAdjustment };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !onDragAdjustment) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    onDragAdjustment({
      ...initialAdjust.current,
      x: initialAdjust.current.x + dx,
      y: initialAdjust.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!onDragAdjustment) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    const newScale = Math.min(2.5, Math.max(0.5, Number((imageAdjustment.scale + delta).toFixed(2))));
    onDragAdjustment({
      ...imageAdjustment,
      scale: newScale,
    });
  };

  const w = renderW || 540;
  const h = renderH || 300;

  return (
    <div
      className={`canvas-renderer-device-mockup ${isPortrait ? "portrait-device" : "landscape-device"} ${className}`}
      style={{
        position: "relative",
        width: w + (isPortrait ? 24 : 20),
        height: h + (isPortrait ? 24 : 20),
        borderRadius: isPortrait ? "36px" : "18px",
        background: "#1e293b",
        padding: isPortrait ? "12px" : "10px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* Top Phone Notch / Speaker */}
      {isPortrait && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            width: "56px",
            height: "4px",
            background: "#334155",
            borderRadius: "999px",
            zIndex: 10,
          }}
        />
      )}

      <div
        style={{
          width: w,
          height: h,
          borderRadius: isPortrait ? "24px" : "10px",
          overflow: "hidden",
          position: "relative",
          cursor: onDragAdjustment ? "grab" : "default",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

export default CanvasRenderer;
