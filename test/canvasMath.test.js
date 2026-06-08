import assert from "node:assert/strict";
import test from "node:test";
import { getContentInset, getImageCoverRect, OUTPUT_SIZES } from "../lib/canvasMath.js";

test("cover rect fills the requested box", () => {
  const rect = getImageCoverRect(1600, 900, { x: 20, y: 30, width: 400, height: 400 });
  assert.equal(rect.height, 400);
  assert.ok(rect.width > 400);
  assert.equal(rect.y, 30);
});

test("content inset scales from the smaller output edge", () => {
  assert.equal(getContentInset(OUTPUT_SIZES.instagramSquare.width, OUTPUT_SIZES.instagramSquare.height), 59);
  assert.equal(getContentInset(OUTPUT_SIZES.youtubeThumbnail.width, OUTPUT_SIZES.youtubeThumbnail.height), 40);
});
