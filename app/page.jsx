"use client";

import { Download, PanelLeft, Rows3, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getContentInset, getImageCoverRect, OUTPUT_SIZES } from "../lib/canvasMath";

const THEME = {
  background: "#fcfcfc",
  foreground: "#1e2c33",
  muted: "#4a6370",
  accent: "#3e7e9a",
  mid: "#73a0b1",
  light: "#bdcbcc",
  panel: "#ffffff",
  wash: "#edf3f4",
  labelBg: "rgba(252, 252, 252, 0.84)"
};

const LAYOUTS = [
  { id: "side", label: "左右", icon: PanelLeft },
  { id: "split", label: "分割", icon: SlidersHorizontal },
  { id: "stack", label: "上下", icon: Rows3 }
];

const CANVAS_FONT = 'fot-tsukuardgothic-std, "Hiragino Maru Gothic ProN", "TsukuARdGothic-Regular", "Noto Sans JP", ui-rounded, "Hiragino Sans", "Yu Gothic", sans-serif';

function InstagramIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.4" cy="7.7" r="1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M14 5v9.1a4.1 4.1 0 1 1-3.6-4.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
      <path d="M14 5c.7 2.7 2.3 4.2 5 4.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
    </svg>
  );
}

function YouTubeIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <rect x="4" y="7" width="16" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.5 9.8v4.4l4-2.2z" fill="currentColor" />
    </svg>
  );
}

function XIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M4 4l6.5 8.5L4 20h2l5.3-6.8L16 20h4l-6.8-8.8L19.5 4h-2l-4.9 6.3L8 4z" fill="currentColor" />
    </svg>
  );
}

function FacebookLinkedInIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 28 24" width={size + 4}>
      <rect x="2" y="5" width="10" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.6 8.2H7.3c-1.3 0-2 .8-2 2v1.1H4.1v2h1.2V18h2.1v-4.7h1.5l.3-2H7.4v-.8c0-.4.2-.7.8-.7h.4z" fill="currentColor" />
      <rect x="16" y="5" width="10" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="19.1" cy="9" r="1" fill="currentColor" />
      <path d="M18.1 11.2h2v5.2h-2zm3.1 0h1.9v.7c.3-.5.9-.9 1.7-.9 1.3 0 2.1.8 2.1 2.5v2.9h-2v-2.6c0-.8-.3-1.1-.8-1.1s-.9.4-.9 1.2v2.5h-2z" fill="currentColor" transform="translate(-.7 0)" />
    </svg>
  );
}

function PinterestIcon({ size = 20 }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 24 24" width={size}>
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.6 17.4l1.1-4.4m0 0c.3.7 1 1.2 1.9 1.2 1.7 0 2.8-1.5 2.8-3.4 0-2.1-1.7-3.8-4.2-3.8-3 0-4.7 2-4.7 4.3 0 1.3.5 2.3 1.5 2.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

const SIZE_PRESETS = {
  facebookLinkedin: { icon: FacebookLinkedInIcon, label: "FB / in" },
  instagramPortrait: { icon: InstagramIcon, label: "IG 4:5" },
  instagramSquare: { icon: InstagramIcon, label: "IG 1:1" },
  instagramStory: { icon: InstagramIcon, label: "IG 9:16" },
  pinterestPin: { icon: PinterestIcon, label: "Pin" },
  tiktok: { icon: TikTokIcon, label: "TikTok" },
  xPost: { icon: XIcon, label: "X" },
  youtubeShorts: { icon: YouTubeIcon, label: "Shorts" },
  youtubeThumbnail: { icon: YouTubeIcon, label: "YT 16:9" }
};

function isPortraitOutput(output) {
  const size = OUTPUT_SIZES[output];
  return size.height > size.width;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function useLoadedImage(src) {
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const nextImage = new Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = src;
  }, [src]);

  return image;
}

function drawPlaceholder(ctx, box, theme, label) {
  // 1. 背景のグラデーション
  const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.width, box.y + box.height);
  gradient.addColorStop(0, theme.panel);
  gradient.addColorStop(1, theme.wash);
  ctx.fillStyle = gradient;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  ctx.save();
  // 2. 内側の点線枠（境界からインセット）
  const inset = Math.max(8, Math.round(Math.min(box.width, box.height) * 0.04));
  const innerW = box.width - inset * 2;
  const innerH = box.height - inset * 2;
  
  if (innerW > 20 && innerH > 20) {
    ctx.strokeStyle = theme.light;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]); // 点線
    ctx.beginPath();
    ctx.roundRect(box.x + inset, box.y + inset, innerW, innerH, 8);
    ctx.stroke();
  }

  // 3. 中央座標の計算
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // 基準スケール（ボックスサイズに応じたフォントとアイコンサイズの決定）
  const minDim = Math.min(box.width, box.height);
  const baseScale = Math.max(0.6, Math.min(1.2, minDim / 350));

  // 4. プラス記号（+ Icon）の描画
  const iconSize = Math.round(24 * baseScale);
  ctx.strokeStyle = theme.mid;
  ctx.lineWidth = Math.max(2, Math.round(2.5 * baseScale));
  ctx.setLineDash([]); // 実線に戻す
  ctx.lineCap = "round";
  
  // 縦線
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - iconSize / 2 - Math.round(10 * baseScale));
  ctx.lineTo(centerX, centerY - iconSize / 2 + Math.round(10 * baseScale));
  ctx.stroke();
  // 横線
  ctx.beginPath();
  ctx.moveTo(centerX - Math.round(10 * baseScale), centerY - iconSize / 2);
  ctx.lineTo(centerX + Math.round(10 * baseScale), centerY - iconSize / 2);
  ctx.stroke();

  // 5. テキスト描画
  ctx.fillStyle = theme.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // タイトルラベル（Before画像を追加 / After画像を追加）
  const titleFontSize = Math.max(12, Math.round(14 * baseScale));
  ctx.font = `600 ${titleFontSize}px ${CANVAS_FONT}`;
  const displayLabel = label === "BEFORE" ? "Before画像を追加" : "After画像を追加";
  ctx.fillText(displayLabel, centerX, centerY + Math.round(18 * baseScale));

  // 補助テキスト（クリックして選択）
  const subFontSize = Math.max(10, Math.round(11 * baseScale));
  ctx.font = `400 ${subFontSize}px ${CANVAS_FONT}`;
  ctx.fillStyle = theme.light;
  ctx.fillText("クリックして選択", centerX, centerY + Math.round(38 * baseScale));

  ctx.restore();
}

function drawImage(ctx, image, box, theme, label) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  if (image) {
    const rect = getImageCoverRect(image.naturalWidth, image.naturalHeight, box);
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = image.naturalWidth;
    imageCanvas.height = image.naturalHeight;
    const imageCtx = imageCanvas.getContext("2d");
    imageCtx.fillStyle = "#ffffff";
    imageCtx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageCtx.drawImage(image, 0, 0);
    ctx.drawImage(imageCanvas, rect.x, rect.y, rect.width, rect.height);
  } else {
    drawPlaceholder(ctx, box, theme, label);
  }
  ctx.restore();
}

function drawTinyLabel(ctx, text, box, theme) {
  const fontSize = Math.max(11, Math.round(Math.min(box.width, box.height) * 0.035));
  const paddingX = Math.round(fontSize * 1.2);
  const paddingY = Math.round(fontSize * 0.65);
  const x = box.x + Math.round(fontSize * 1.25);
  const y = box.y + Math.round(fontSize * 1.25);

  ctx.save();
  ctx.font = `400 ${fontSize}px ${CANVAS_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const textWidth = ctx.measureText(text).width;
  const tagWidth = textWidth + paddingX * 2;
  const tagHeight = fontSize + paddingY * 2;

  ctx.fillStyle = "rgba(252, 252, 252, 0.72)";
  ctx.strokeStyle = "rgba(189, 203, 204, 0.62)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, tagWidth, tagHeight, tagHeight / 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.fillText(text, x + paddingX, y + paddingY);
  ctx.restore();
}

function colorDistance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function extractPalette(image, theme) {
  const samples = new Map();
  const sampleCanvas = document.createElement("canvas");
  const sampleSize = 96;
  sampleCanvas.width = sampleSize;
  sampleCanvas.height = sampleSize;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

  if (image) {
    sampleCtx.clearRect(0, 0, sampleSize, sampleSize);
    const rect = getImageCoverRect(image.naturalWidth, image.naturalHeight, { x: 0, y: 0, width: sampleSize, height: sampleSize });
    sampleCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    const data = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;

    for (let i = 0; i < data.length; i += 16) {
      const alpha = data[i + 3];
      if (alpha < 180) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 12 || brightness > 252) continue;

      const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
      const current = samples.get(key) || { r: 0, g: 0, b: 0, count: 0 };
      samples.set(key, { r: current.r + r, g: current.g + g, b: current.b + b, count: current.count + 1 });
    }
  }

  const ranked = [...samples.values()]
    .map((color) => ({
      r: Math.round(color.r / color.count),
      g: Math.round(color.g / color.count),
      b: Math.round(color.b / color.count),
      count: color.count
    }))
    .sort((a, b) => b.count - a.count);

  const palette = [];
  ranked.forEach((color) => {
    if (palette.length >= 5) return;
    if (palette.every((picked) => colorDistance(color, picked) > 34)) {
      palette.push(color);
    }
  });

  if (palette.length) {
    return palette;
  }

  return [theme.accent, theme.mid, theme.light, theme.wash, theme.panel].map((hex) => {
    const normalized = hex.replace("#", "").slice(0, 6);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  });
}

function drawPaletteGroup(ctx, palette, box, theme) {
  const swatchGap = Math.max(2, Math.round(box.height * 0.08));
  const swatchWidth = (box.width - swatchGap * (palette.length - 1)) / palette.length;

  palette.forEach((color, index) => {
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(box.x + index * (swatchWidth + swatchGap), box.y, swatchWidth, box.height);
  });
}

function drawVerticalPalette(ctx, palette, box, theme) {
  const swatchGap = Math.max(2, Math.round(box.width * 0.12));
  const swatchHeight = (box.height - swatchGap * (palette.length - 1)) / palette.length;

  ctx.fillStyle = theme.background;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  palette.forEach((color, index) => {
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(box.x, box.y + index * (swatchHeight + swatchGap), box.width, swatchHeight);
  });
}

function drawPalettes(ctx, beforePalette, afterPalette, box, theme, layout) {
  ctx.fillStyle = theme.background;
  ctx.fillRect(box.x, box.y, box.width, box.height);

  if (layout === "stack") {
    const rowGap = Math.max(8, Math.round(box.height * 0.1));
    const rowHeight = (box.height - rowGap) / 2;
    drawPaletteGroup(ctx, beforePalette, { x: box.x, y: box.y, width: box.width, height: rowHeight }, theme);
    drawPaletteGroup(ctx, afterPalette, { x: box.x, y: box.y + rowHeight + rowGap, width: box.width, height: rowHeight }, theme);
    return;
  }

  const gap = Math.max(8, Math.round(box.width * 0.012));
  const groupWidth = (box.width - gap) / 2;
  drawPaletteGroup(ctx, beforePalette, { x: box.x, y: box.y, width: groupWidth, height: box.height }, theme);
  drawPaletteGroup(ctx, afterPalette, { x: box.x + groupWidth + gap, y: box.y, width: groupWidth, height: box.height }, theme);
}

function getRenderRegions(output, layout) {
  const size = OUTPUT_SIZES[output];
  const inset = getContentInset(size.width, size.height);
  const paletteHeight = Math.max(34, Math.round(Math.min(size.width, size.height) * 0.058));
  const gap = Math.round(inset * 0.42);
  const mediaTop = inset;
  const mediaWidth = size.width - inset * 2;

  if (layout === "stack") {
    const verticalPaletteWidth = Math.max(36, Math.round(Math.min(size.width, size.height) * 0.07));
    const imagePaletteGap = Math.max(8, Math.round(gap * 0.45));
    const pairGap = gap;
    const imageWidth = mediaWidth - verticalPaletteWidth - imagePaletteGap;
    const halfHeight = (size.height - inset * 2 - pairGap) / 2;
    const beforeBox = { x: inset, y: mediaTop, width: imageWidth, height: halfHeight };
    const beforePaletteBox = {
      x: beforeBox.x + beforeBox.width + imagePaletteGap,
      y: beforeBox.y,
      width: verticalPaletteWidth,
      height: beforeBox.height
    };
    const afterBox = {
      x: inset,
      y: beforeBox.y + beforeBox.height + pairGap,
      width: imageWidth,
      height: halfHeight
    };
    const afterPaletteBox = {
      x: afterBox.x + afterBox.width + imagePaletteGap,
      y: afterBox.y,
      width: verticalPaletteWidth,
      height: afterBox.height
    };

    return {
      size,
      inset,
      gap,
      mediaTop,
      mediaHeight: beforeBox.height + afterBox.height,
      mediaWidth,
      beforeBox,
      afterBox,
      beforePaletteBox,
      afterPaletteBox
    };
  }

  const mediaHeight = size.height - inset * 2 - paletteHeight - Math.round(gap * 0.75);
  const paletteBox = {
    x: inset,
    y: mediaTop + mediaHeight + Math.round(gap * 0.75),
    width: mediaWidth,
    height: paletteHeight
  };

  return {
    size,
    inset,
    gap,
    mediaTop,
    mediaHeight,
    mediaWidth,
    beforeBox: { x: inset, y: mediaTop, width: mediaWidth / 2, height: mediaHeight },
    afterBox: { x: inset + mediaWidth / 2, y: mediaTop, width: mediaWidth / 2, height: mediaHeight },
    fullBox: { x: inset, y: mediaTop, width: mediaWidth, height: mediaHeight },
    paletteBox
  };
}

function renderCanvas(canvas, options) {
  const { afterImage, beforeImage, layout, output, theme } = options;
  const ctx = canvas.getContext("2d");
  const {
    afterBox,
    afterPaletteBox,
    beforeBox,
    beforePaletteBox,
    fullBox,
    gap,
    mediaHeight,
    mediaTop,
    mediaWidth,
    paletteBox,
    size
  } = getRenderRegions(output, layout);
  const beforePalette = extractPalette(beforeImage, theme);
  const afterPalette = extractPalette(afterImage, theme);

  canvas.width = size.width;
  canvas.height = size.height;

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, size.width, size.height);

  const glow = ctx.createRadialGradient(size.width * 0.48, -size.height * 0.12, 0, size.width * 0.48, -size.height * 0.12, size.width * 0.7);
  glow.addColorStop(0, theme.wash);
  glow.addColorStop(1, "rgba(252, 252, 252, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size.width, size.height);

  if (layout === "stack") {
    drawImage(ctx, beforeImage, beforeBox, theme, "BEFORE");
    drawImage(ctx, afterImage, afterBox, theme, "AFTER");
    drawTinyLabel(ctx, "BEFORE", beforeBox, theme);
    drawTinyLabel(ctx, "AFTER", afterBox, theme);
    ctx.strokeStyle = theme.light;
    ctx.strokeRect(beforeBox.x, beforeBox.y, beforeBox.width, beforeBox.height);
    ctx.strokeRect(afterBox.x, afterBox.y, afterBox.width, afterBox.height);
    drawVerticalPalette(ctx, beforePalette, beforePaletteBox, theme);
    drawVerticalPalette(ctx, afterPalette, afterPaletteBox, theme);
  } else {
    if (layout === "split") {
      drawImage(ctx, afterImage, fullBox, theme, "AFTER");
      ctx.save();
      ctx.beginPath();
      ctx.rect(beforeBox.x, beforeBox.y, beforeBox.width, beforeBox.height);
      ctx.clip();
      drawImage(ctx, beforeImage, fullBox, theme, "BEFORE");
      ctx.restore();
      ctx.strokeStyle = theme.background;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(afterBox.x, mediaTop);
      ctx.lineTo(afterBox.x, mediaTop + mediaHeight);
      ctx.stroke();
    } else {
      drawImage(ctx, beforeImage, beforeBox, theme, "BEFORE");
      drawImage(ctx, afterImage, afterBox, theme, "AFTER");
      ctx.fillStyle = theme.background;
      ctx.fillRect(afterBox.x - 2, mediaTop, 4, mediaHeight);
    }
    ctx.strokeStyle = theme.light;
    ctx.lineWidth = 1;
    ctx.strokeRect(beforeBox.x, mediaTop, mediaWidth, mediaHeight);
    drawTinyLabel(ctx, "BEFORE", beforeBox, theme);
    drawTinyLabel(ctx, "AFTER", afterBox, theme);
    drawPalettes(ctx, beforePalette, afterPalette, paletteBox, theme, layout);
  }
}

export default function Home() {
  const canvasRef = useRef(null);
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const [beforeSrc, setBeforeSrc] = useState("");
  const [afterSrc, setAfterSrc] = useState("");
  const [layout, setLayout] = useState("side");
  const [output, setOutput] = useState("instagramSquare");
  const [fontTick, setFontTick] = useState(0);
  const beforeImage = useLoadedImage(beforeSrc);
  const afterImage = useLoadedImage(afterSrc);
  const theme = THEME;

  const drawOptions = useMemo(
    () => ({ afterImage, beforeImage, fontTick, layout, output, theme }),
    [afterImage, beforeImage, fontTick, layout, output, theme]
  );

  useEffect(() => {
    let isMounted = true;
    if (canvasRef.current) {
      renderCanvas(canvasRef.current, drawOptions);
    }

    document.fonts?.ready.then(() => {
      if (isMounted && canvasRef.current) {
        renderCanvas(canvasRef.current, drawOptions);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [drawOptions]);

  useEffect(() => {
    const timers = [800, 1800, 3200].map((delay) => setTimeout(() => setFontTick((tick) => tick + 1), delay));

    document.fonts?.ready.then(() => {
      setFontTick((tick) => tick + 1);
    });

    window.Typekit?.load?.({
      active: () => setFontTick((tick) => tick + 1),
      inactive: () => setFontTick((tick) => tick + 1)
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const handleFile = useCallback((setter) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setter(await fileToDataUrl(file));
  }, []);

  const handleClearImage = useCallback((type) => {
    if (type === "before") {
      setBeforeSrc("");
      if (beforeInputRef.current) beforeInputRef.current.value = "";
    } else {
      setAfterSrc("");
      if (afterInputRef.current) afterInputRef.current.value = "";
    }
  }, []);

  const handleOutputChange = (nextOutput) => {
    setOutput(nextOutput);
    if (isPortraitOutput(nextOutput)) {
      setLayout("stack");
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const size = OUTPUT_SIZES[output];
    const link = document.createElement("a");
    link.download = `before-after-${output}-${size.width}x${size.height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * canvas.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * canvas.height;
    const { afterBox, beforeBox } = getRenderRegions(output, layout);

    const insideBefore = x >= beforeBox.x && x <= beforeBox.x + beforeBox.width && y >= beforeBox.y && y <= beforeBox.y + beforeBox.height;
    const insideAfter = x >= afterBox.x && x <= afterBox.x + afterBox.width && y >= afterBox.y && y <= afterBox.y + afterBox.height;

    if (insideBefore) {
      beforeInputRef.current?.click();
    } else if (insideAfter) {
      afterInputRef.current?.click();
    }
  };

  const handleCanvasKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      beforeInputRef.current?.click();
    }
  };

  return (
    <main className="page-shell">
      <section className="preview-panel" aria-label="プレビュー">
        <div className="preview-toolbar">
          <span>{OUTPUT_SIZES[output].shortLabel}</span>
          <span>{OUTPUT_SIZES[output].width} x {OUTPUT_SIZES[output].height}px</span>
        </div>
        <div className="canvas-wrapper">
          <canvas
            aria-label="プレビュー画像。左または上をタップするとBefore画像、右または下をタップするとAfter画像を選択できます。"
            onClick={handleCanvasClick}
            onKeyDown={handleCanvasKeyDown}
            ref={canvasRef}
            role="button"
            tabIndex={0}
          />
          { (beforeSrc || afterSrc) && (
            <button aria-label="PNGを書き出す" className="download-button" onClick={download} title="PNGを書き出す">
              <Download size={18} />
              <span>保存する</span>
            </button>
          ) }
        </div>
      </section>

      <section className="control-panel" aria-label="画像作成設定">
        <input
          className="hidden-file-input"
          id="before"
          ref={beforeInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile(setBeforeSrc)}
        />
        <input
          className="hidden-file-input"
          id="after"
          ref={afterInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile(setAfterSrc)}
        />

        <div className="brand-row">
          <div>
            <p className="eyebrow">Before After Maker</p>
          </div>
        </div>

        {/* IMAGES SECTION */}
        <div className="control-section">
          <h2 className="control-section-title">Images / 画像</h2>
          <div className="control-card upload-group">
            {/* Before Upload */}
            <div className="upload-column">
              <span className="upload-label">BEFORE</span>
              {beforeSrc ? (
                <div className="thumbnail-preview-container">
                  <img src={beforeSrc} alt="Before preview" className="thumbnail-img" onClick={() => beforeInputRef.current?.click()} />
                  <button className="clear-btn" onClick={() => handleClearImage("before")} title="画像をクリア">
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <button className="upload-placeholder" onClick={() => beforeInputRef.current?.click()} aria-label="Before画像をアップロード">
                  <Upload size={15} />
                  <span>選択する</span>
                </button>
              )}
            </div>

            {/* After Upload */}
            <div className="upload-column">
              <span className="upload-label">AFTER</span>
              {afterSrc ? (
                <div className="thumbnail-preview-container">
                  <img src={afterSrc} alt="After preview" className="thumbnail-img" onClick={() => afterInputRef.current?.click()} />
                  <button className="clear-btn" onClick={() => handleClearImage("after")} title="画像をクリア">
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <button className="upload-placeholder" onClick={() => afterInputRef.current?.click()} aria-label="After画像をアップロード">
                  <Upload size={15} />
                  <span>選択する</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LAYOUT SECTION */}
        <div className="control-section">
          <h2 className="control-section-title">Layout / レイアウト</h2>
          <div className="control-card">
            <div className="icon-grid layout-grid" aria-label="レイアウト">
              {LAYOUTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    aria-label={item.label}
                    className={layout === item.id ? "icon-button active" : "icon-button"}
                    key={item.id}
                    onClick={() => setLayout(item.id)}
                    title={item.label}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIZE SECTION */}
        <div className="control-section">
          <h2 className="control-section-title">Preset Size / サイズ</h2>
          <div className="control-card">
            <div className="icon-grid size-grid" aria-label="サイズ">
              {Object.entries(OUTPUT_SIZES).map(([id, size]) => {
                const preset = SIZE_PRESETS[id];
                const Icon = preset.icon;
                return (
                  <button
                    aria-label={`${size.label} ${size.width}x${size.height}`}
                    className={output === id ? "icon-button size-button active" : "icon-button size-button"}
                    key={id}
                    onClick={() => handleOutputChange(id)}
                    title={`${size.label} - ${size.width}x${size.height}`}
                  >
                    <Icon size={20} />
                    <span className="size-label">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
