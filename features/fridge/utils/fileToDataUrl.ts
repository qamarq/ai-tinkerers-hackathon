interface FileToDataUrlOptions {
  maxDimension?: number;
  quality?: number;
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image file"));
    };

    image.src = objectUrl;
  });
}

function getScaledSize(width: number, height: number, maxDimension: number) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestSide;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function fileToDataUrl(
  file: File,
  options: FileToDataUrlOptions = {},
): Promise<string> {
  const { maxDimension = 1280, quality = 0.8 } = options;
  const image = await loadImageFromFile(file);
  const { width, height } = getScaledSize(
    image.width,
    image.height,
    maxDimension,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering context is unavailable");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
