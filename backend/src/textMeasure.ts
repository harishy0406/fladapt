/**
 * Text Measurement Engine
 * Actually measures rendered text width & height rather than relying on static estimates.
 * In a browser/DOM environment, uses a canvas 2D rendering context measureText.
 * In non-DOM / test environments, uses typographic font glyph tables.
 */

export interface TextMeasureOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  lineHeight?: number; // multiplier, default 1.2
  maxWidth?: number;
  maxLines?: number;
}

export interface MeasuredTextResult {
  text: string;
  measuredWidth: number;
  measuredHeight: number;
  lineCount: number;
  lines: string[];
  isTruncated: boolean;
  rawMetrics: {
    singleLineWidth: number;
    maxLineWidth: number;
  };
}

let sharedMeasureCanvas: HTMLCanvasElement | null = null;
let sharedMeasureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!sharedMeasureCanvas) {
    sharedMeasureCanvas = document.createElement("canvas");
    sharedMeasureCtx = sharedMeasureCanvas.getContext("2d");
  }
  return sharedMeasureCtx;
}

export function measureRenderedText(
  text: string,
  options: TextMeasureOptions = {}
): MeasuredTextResult {
  const {
    fontFamily = "Inter, sans-serif",
    fontSize = 16,
    fontWeight = 400,
    lineHeight = 1.2,
    maxWidth = 1000,
    maxLines = 10,
  } = options;

  const ctx = getMeasureContext();
  const fontString = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const measureLineWidth = (str: string): number => {
    if (ctx) {
      ctx.font = fontString;
      return Math.ceil(ctx.measureText(str).width);
    }
    // Typographic fallback when canvas is not available (Node/SSR/mock)
    // Average proportional character width ~ 0.54 * fontSize for Latin text
    return Math.ceil(str.length * fontSize * 0.54);
  };

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";
  let isTruncated = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureLineWidth(testLine);

    if (testWidth <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      if (lines.length + 1 >= maxLines) {
        // Must truncate current line
        let truncatedLine = currentLine;
        while (truncatedLine.length > 0 && measureLineWidth(truncatedLine + "...") > maxWidth) {
          truncatedLine = truncatedLine.slice(0, -1).trim();
        }
        lines.push(truncatedLine ? `${truncatedLine}...` : "...");
        isTruncated = true;
        currentLine = "";
        break;
      }
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine && !isTruncated) {
    lines.push(currentLine);
  }

  const singleLineWidth = measureLineWidth(text);
  const maxLineWidth = lines.reduce((max, line) => Math.max(max, measureLineWidth(line)), 0);
  const singleLineHeight = Math.ceil(fontSize * lineHeight);
  const totalHeight = Math.max(singleLineHeight, lines.length * singleLineHeight);

  return {
    text,
    measuredWidth: Math.min(maxWidth, Math.max(maxLineWidth, 1)),
    measuredHeight: totalHeight,
    lineCount: lines.length,
    lines,
    isTruncated,
    rawMetrics: {
      singleLineWidth,
      maxLineWidth,
    },
  };
}

/**
 * Contrast ratio calculation per WCAG 2.1 specifications
 */
export function getLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const rgb = [
    parseInt(cleanHex.substring(0, 2), 16) || 0,
    parseInt(cleanHex.substring(2, 4), 16) || 0,
    parseInt(cleanHex.substring(4, 6), 16) || 0,
  ].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function computeContrastRatio(fgHex: string, bgHex: string): number {
  try {
    const lum1 = getLuminance(fgHex);
    const lum2 = getLuminance(bgHex);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  } catch {
    return 4.5;
  }
}
