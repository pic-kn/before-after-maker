"use client";

import { Download, Palette, PanelLeft, Rows3, SlidersHorizontal, Tag, Trash2, Upload } from "lucide-react";
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

function getDefaultLayoutForOutput(output) {
  if (output === "instagramSquare" || isPortraitOutput(output)) {
    return "stack";
  }

  return "side";
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

function clampColor(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToLab(r, g, b) {
  const toLinear = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  const x = (toLinear(r) * 0.4124564 + toLinear(g) * 0.3575761 + toLinear(b) * 0.1804375) / 0.95047;
  const y = toLinear(r) * 0.2126729 + toLinear(g) * 0.7151522 + toLinear(b) * 0.072175;
  const z = (toLinear(r) * 0.0193339 + toLinear(g) * 0.119192 + toLinear(b) * 0.9503041) / 1.08883;
  const pivot = (value) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
  const fx = pivot(x);
  const fy = pivot(y);
  const fz = pivot(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function labDistance(a, b) {
  return Math.hypot(a.l - b.l, a.a - b.a, a.b - b.b);
}

function fallbackPalette(theme) {
  return [theme.foreground, theme.accent, theme.mid, theme.light, "#edf3f4"].map((hex) => {
    const normalized = hex.replace("#", "").slice(0, 6);
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  });
}

function initializeCentroids(samples, count) {
  const weighted = [...samples].sort((a, b) => b.weight * (0.75 + b.chroma / 80) - a.weight * (0.75 + a.chroma / 80));
  const centroids = [{ ...weighted[0] }];

  while (centroids.length < count && centroids.length < weighted.length) {
    let next = weighted[0];
    let bestScore = -Infinity;

    weighted.forEach((sample) => {
      const nearest = Math.min(...centroids.map((centroid) => labDistance(sample, centroid)));
      const score = nearest * Math.sqrt(sample.weight) * (0.75 + Math.min(sample.chroma / 70, 1) * 0.35);
      if (score > bestScore) {
        bestScore = score;
        next = sample;
      }
    });

    centroids.push({ ...next });
  }

  return centroids;
}

function extractPalette(image, theme) {
  const sampleCanvas = document.createElement("canvas");
  const sampleSize = 120;
  sampleCanvas.width = sampleSize;
  sampleCanvas.height = sampleSize;
  const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

  if (!image) {
    return fallbackPalette(theme);
  }

  sampleCtx.clearRect(0, 0, sampleSize, sampleSize);
  const rect = getImageCoverRect(image.naturalWidth, image.naturalHeight, { x: 0, y: 0, width: sampleSize, height: sampleSize });
  sampleCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  const data = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;
  const samples = [];
  const center = (sampleSize - 1) / 2;
  const maxRadius = Math.hypot(center, center);

  for (let y = 0; y < sampleSize; y += 2) {
    for (let x = 0; x < sampleSize; x += 2) {
      const index = (y * sampleSize + x) * 4;
      const alpha = data[index + 3];
      if (alpha < 180) continue;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const lab = rgbToLab(r, g, b);
      const chroma = Math.hypot(lab.a, lab.b);
      const centerDistance = Math.hypot(x - center, y - center) / maxRadius;
      const centerWeight = 0.85 + (1 - centerDistance) ** 2 * 0.55;
      const chromaWeight = 0.82 + Math.min(chroma / 55, 1) * 0.28;
      const neutralWeight = chroma < 5 ? 0.72 : 1;
      const extremeWeight = lab.l < 5 || lab.l > 97 ? 0.38 : 1;

      samples.push({
        r,
        g,
        blue: b,
        l: lab.l,
        a: lab.a,
        b: lab.b,
        chroma,
        weight: (alpha / 255) * centerWeight * chromaWeight * neutralWeight * extremeWeight
      });
    }
  }

  if (!samples.length) {
    return fallbackPalette(theme);
  }

  let centroids = initializeCentroids(samples, Math.min(8, samples.length));

  for (let iteration = 0; iteration < 10; iteration += 1) {
    const clusters = centroids.map(() => ({ r: 0, g: 0, blue: 0, l: 0, a: 0, labB: 0, weight: 0 }));

    samples.forEach((sample) => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      centroids.forEach((centroid, index) => {
        const distance = labDistance(sample, centroid);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const cluster = clusters[nearestIndex];
      cluster.r += sample.r * sample.weight;
      cluster.g += sample.g * sample.weight;
      cluster.blue += sample.blue * sample.weight;
      cluster.l += sample.l * sample.weight;
      cluster.a += sample.a * sample.weight;
      cluster.labB += sample.b * sample.weight;
      cluster.weight += sample.weight;
    });

    centroids = centroids.map((centroid, index) => {
      const cluster = clusters[index];
      if (!cluster.weight) return centroid;
      return {
        r: cluster.r / cluster.weight,
        g: cluster.g / cluster.weight,
        blue: cluster.blue / cluster.weight,
        l: cluster.l / cluster.weight,
        a: cluster.a / cluster.weight,
        b: cluster.labB / cluster.weight,
        chroma: Math.hypot(cluster.a / cluster.weight, cluster.labB / cluster.weight),
        weight: cluster.weight
      };
    });
  }

  const totalWeight = centroids.reduce((sum, color) => sum + color.weight, 0);
  const ranked = centroids
    .filter((color) => color.weight / totalWeight > 0.01)
    .map((color) => ({
      ...color,
      importance: color.weight * (0.78 + Math.min(color.chroma / 60, 1) * 0.32) * (color.l < 8 || color.l > 94 ? 0.72 : 1)
    }))
    .sort((a, b) => b.importance - a.importance);

  const pickDiverse = (minDistance) => {
    const result = [];
    ranked.forEach((color) => {
      if (result.length >= 5) return;
      if (result.every((picked) => labDistance(color, picked) >= minDistance)) {
        result.push(color);
      }
    });
    return result;
  };

  let palette = pickDiverse(18);
  if (palette.length < 5) palette = pickDiverse(14);
  if (palette.length < 5) palette = pickDiverse(10);
  if (palette.length < 5) palette = pickDiverse(6);

  ranked.forEach((color) => {
    if (palette.length < 5 && !palette.includes(color)) {
      palette.push(color);
    }
  });

  return palette
    .slice(0, 5)
    .sort((a, b) => a.l - b.l)
    .map((color) => ({
      r: clampColor(color.r),
      g: clampColor(color.g),
      b: clampColor(color.blue)
    }));
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

function getRenderRegions(output, layout, showPalette = true) {
  const size = OUTPUT_SIZES[output];
  const inset = getContentInset(size.width, size.height);
  const paletteHeight = showPalette ? Math.max(34, Math.round(Math.min(size.width, size.height) * 0.058)) : 0;
  const gap = Math.round(inset * 0.42);
  const mediaTop = inset;
  const mediaWidth = size.width - inset * 2;

  if (layout === "stack") {
    const verticalPaletteWidth = showPalette ? Math.max(36, Math.round(Math.min(size.width, size.height) * 0.07)) : 0;
    const imagePaletteGap = showPalette ? Math.max(8, Math.round(gap * 0.45)) : 0;
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

  const paletteGap = showPalette ? Math.round(gap * 0.75) : 0;
  const mediaHeight = size.height - inset * 2 - paletteHeight - paletteGap;
  const paletteBox = {
    x: inset,
    y: mediaTop + mediaHeight + paletteGap,
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
  const { afterImage, beforeImage, layout, output, showLabels, showPalette, theme } = options;
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
  } = getRenderRegions(output, layout, showPalette);
  const beforePalette = showPalette ? extractPalette(beforeImage, theme) : [];
  const afterPalette = showPalette ? extractPalette(afterImage, theme) : [];

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
    if (showLabels) {
      drawTinyLabel(ctx, "BEFORE", beforeBox, theme);
      drawTinyLabel(ctx, "AFTER", afterBox, theme);
    }
    ctx.strokeStyle = theme.light;
    ctx.strokeRect(beforeBox.x, beforeBox.y, beforeBox.width, beforeBox.height);
    ctx.strokeRect(afterBox.x, afterBox.y, afterBox.width, afterBox.height);
    if (showPalette) {
      drawVerticalPalette(ctx, beforePalette, beforePaletteBox, theme);
      drawVerticalPalette(ctx, afterPalette, afterPaletteBox, theme);
    }
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
    if (showLabels) {
      drawTinyLabel(ctx, "BEFORE", beforeBox, theme);
      drawTinyLabel(ctx, "AFTER", afterBox, theme);
    }
    if (showPalette) {
      drawPalettes(ctx, beforePalette, afterPalette, paletteBox, theme, layout);
    }
  }
}

export default function Home() {
  const canvasRef = useRef(null);
  const beforeInputRef = useRef(null);
  const afterInputRef = useRef(null);
  const sizeGridRef = useRef(null);
  const [beforeSrc, setBeforeSrc] = useState("");
  const [afterSrc, setAfterSrc] = useState("");
  const [output, setOutput] = useState("instagramSquare");
  const [layout, setLayout] = useState(() => getDefaultLayoutForOutput("instagramSquare"));
  const [showLabels, setShowLabels] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [fontTick, setFontTick] = useState(0);
  const beforeImage = useLoadedImage(beforeSrc);
  const afterImage = useLoadedImage(afterSrc);
  const theme = THEME;

  const drawOptions = useMemo(
    () => ({ afterImage, beforeImage, fontTick, layout, output, showLabels, showPalette, theme }),
    [afterImage, beforeImage, fontTick, layout, output, showLabels, showPalette, theme]
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
    setLayout(getDefaultLayoutForOutput(nextOutput));

    if (typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches) {
      window.requestAnimationFrame(() => {
        sizeGridRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
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
    const { afterBox, beforeBox } = getRenderRegions(output, layout, showPalette);

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

        {/* DISPLAY SECTION */}
        <div className="control-section">
          <h2 className="control-section-title">Display / 表示</h2>
          <div className="control-card">
            <div className="icon-grid toggle-grid" aria-label="表示オプション">
              <button
                aria-pressed={showLabels}
                className={showLabels ? "icon-button toggle-button active" : "icon-button toggle-button"}
                onClick={() => setShowLabels((value) => !value)}
                title="Before / After ラベル"
              >
                <Tag size={17} />
                <span className="toggle-label">Label</span>
              </button>
              <button
                aria-pressed={showPalette}
                className={showPalette ? "icon-button toggle-button active" : "icon-button toggle-button"}
                onClick={() => setShowPalette((value) => !value)}
                title="カラーパレット"
              >
                <Palette size={17} />
                <span className="toggle-label">Palette</span>
              </button>
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
            <div className="icon-grid size-grid" aria-label="サイズ" ref={sizeGridRef}>
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
