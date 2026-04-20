/**
 * Извлекает кадр из локального видеофайла для превью (JPEG blob).
 * При ошибке возвращает null — тогда можно использовать /placeholder-product.svg.
 */
export async function captureVideoFrameAsJpegBlob(
  file: File,
  seekSeconds = 0.1
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    const fail = () => {
      cleanup();
      resolve(null);
    };

    video.onerror = fail;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        video.currentTime = Math.min(seekSeconds, duration * 0.05);
      } else {
        video.currentTime = seekSeconds;
      }
    };

    video.onseeked = () => {
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width === 0 || height === 0) {
          fail();
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          fail();
          return;
        }
        context.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve(blob);
          },
          "image/jpeg",
          0.88
        );
      } catch {
        fail();
      }
    };

    video.src = objectUrl;
  });
}
