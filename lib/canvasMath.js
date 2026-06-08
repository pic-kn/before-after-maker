export const OUTPUT_SIZES = {
  instagramSquare: { width: 1080, height: 1080, label: "Instagram 投稿 正方形", shortLabel: "Instagram 1:1" },
  instagramPortrait: { width: 1080, height: 1350, label: "Instagram 投稿 縦長", shortLabel: "Instagram 4:5" },
  instagramStory: { width: 1080, height: 1920, label: "Instagram ストーリー / リール", shortLabel: "Instagram 9:16" },
  tiktok: { width: 1080, height: 1920, label: "TikTok 動画カバー", shortLabel: "TikTok 9:16" },
  youtubeShorts: { width: 1080, height: 1920, label: "YouTube Shorts", shortLabel: "Shorts 9:16" },
  youtubeThumbnail: { width: 1280, height: 720, label: "YouTube サムネイル", shortLabel: "YouTube 16:9" },
  xPost: { width: 1600, height: 900, label: "X 投稿 横長", shortLabel: "X 16:9" },
  facebookLinkedin: { width: 1200, height: 630, label: "Facebook / LinkedIn リンク", shortLabel: "FB / LinkedIn" },
  pinterestPin: { width: 1000, height: 1500, label: "Pinterest ピン", shortLabel: "Pinterest 2:3" }
};

export function getImageCoverRect(imageWidth, imageHeight, box) {
  const imageRatio = imageWidth / imageHeight;
  const boxRatio = box.width / box.height;
  let width = box.width;
  let height = box.height;

  if (imageRatio > boxRatio) {
    height = box.height;
    width = height * imageRatio;
  } else {
    width = box.width;
    height = width / imageRatio;
  }

  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height
  };
}

export function getContentInset(width, height) {
  return Math.round(Math.min(width, height) * 0.055);
}
