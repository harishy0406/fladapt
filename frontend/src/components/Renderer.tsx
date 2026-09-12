/**
 * Renderer: takes a ResolvedLayout and paints it using CSS Grid/Flexbox.
 * Pure projection — no layout decision logic. All positions/sizes come from
 * the resolver's output.
 */

import React from "react";

/** Inline styles for one resolved element. */
interface ElementStyles {
  position: "absolute" | "relative";
  left: number;
  top: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius: number;
  display: "flex" | "grid" | "none";
  alignItems: "start" | "center" | "end";
  justifyContent: "start" | "center" | "end";
  color: string;
  fontFamily: string;
  padding: number;
  border?: string;
}

/** Props for the Renderer component. */
interface RendererProps {
  layout: {
    surfaceId: string;
    specId: string;
    elements: {
      id: string;
      visible: boolean;
      position: { x: number; y: number };
      size: { width: number; height: number };
      appliedDegradation: any[];
      trace: string[];
    }[];
  };
  surfaceWidth: number;
  surfaceHeight: number;
}

/** Renderer component — projects resolved layout into CSS-positioned boxes. */
export const Renderer: React.FC<RendererProps> = ({
  layout,
  surfaceWidth,
  surfaceHeight,
}) => {
  const elementStyles = layout.elements.map((el) => {
    if (!el.visible) {
      return {
        ...(el.appliedDegradation.some(
          (d: any) => d.type === "hide"
        )
          ? { display: "none" }
          : {}),
        left: el.position.x,
        top: el.position.y,
        width: el.size.width,
        height: el.size.height,
        backgroundColor: "#e2e8f0",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1e293b",
        fontFamily: "'Inter', sans-serif",
        padding: 8,
      } as ElementStyles;
    }

    return {
      position: "absolute",
      left: el.position.x,
      top: el.position.y,
      width: el.size.width,
      height: el.size.height,
      backgroundColor: "#e2e8f0",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1e293b",
      fontFamily: "'Inter', sans-serif",
      padding: 8,
      border: "1px solid #cbd5e1",
    } as ElementStyles;
  });

  return (
    <div
      style={{
        position: "relative",
        width: surfaceWidth,
        height: surfaceHeight,
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        border: "1px solid #94a3b8",
        borderRadius: 4,
      }}
    >
      {elementStyles.map((styles, i) => {
        const el = layout.elements[i];
        if (!el.visible) return null;
        const style: React.CSSProperties = {
          position: styles.position,
          left: styles.left,
          top: styles.top,
          width: styles.width,
          height: styles.height,
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          display: styles.display,
          alignItems: styles.alignItems,
          justifyContent: styles.justifyContent,
          color: styles.color,
          fontFamily: styles.fontFamily,
          padding: styles.padding,
          border: styles.border,
        };
        return (
          <div
            key={el.id}
            style={style}
            title={el.trace.join("\n")}
          >
            {el.id}
          </div>
        );
      })}
    </div>
  );
};

/** Default export for convenience. */
export default Renderer;
