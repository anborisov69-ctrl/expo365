"use client";

import { PRODUCT_IMAGE_PLACEHOLDER_PATH } from "@/lib/exhibitor-default-images";
import {
  classifyUploadMime,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES
} from "@/lib/upload-rules";
import { captureVideoFrameAsJpegBlob } from "@/lib/video-thumbnail-client";
import type { ProductApiRow, ProductFormPayload, ProductMediaType } from "@/types/product-api";
import { PRODUCT_CATEGORY_LABEL_RU } from "@/lib/product-category-labels";
import { ProductCategory } from "@prisma/client";
import { ImageIcon, Loader2, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  initialProduct: ProductApiRow | null;
  onSubmit: (payload: ProductFormPayload) => Promise<void>;
}

function validateClientFile(file: File): string | null {
  const kind = classifyUploadMime(file.type);
  if (!kind) {
    return "Недопустимый тип файла. Разрешены JPEG, PNG, GIF, WebP, MP4, WebM.";
  }
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return kind === "image"
      ? "Изображение больше 5 МБ."
      : "Видео больше 20 МБ.";
  }
  return null;
}

async function postUpload(file: File): Promise<{ url: string; type: "image" | "video" }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  const data = (await response.json()) as { error?: string; url?: string; type?: "image" | "video" };
  if (!response.ok) {
    throw new Error(data.error ?? "Не удалось загрузить файл");
  }
  if (!data.url || !data.type) {
    throw new Error("Некорректный ответ сервера");
  }
  return { url: data.url, type: data.type };
}

export function AddProductModal({ open, onClose, initialProduct, onSubmit }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.COFFEE);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<ProductMediaType>("image");
  const [isSampleAvailable, setIsSampleAvailable] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setUploadError(null);
    if (initialProduct) {
      setName(initialProduct.name);
      setDescription(initialProduct.description);
      setPrice(initialProduct.price);
      setCategory(initialProduct.category);
      setImageUrl(initialProduct.imageUrl);
      setMediaUrl(initialProduct.mediaUrl);
      setMediaType(initialProduct.mediaType);
      setIsSampleAvailable(initialProduct.isSampleAvailable);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategory(ProductCategory.COFFEE);
      setImageUrl(null);
      setMediaUrl(null);
      setMediaType("image");
      setIsSampleAvailable(false);
    }
  }, [open, initialProduct]);

  const clearMedia = useCallback(() => {
    setImageUrl(null);
    setMediaUrl(null);
    setMediaType("image");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const processFile = useCallback(async (file: File | undefined) => {
    if (!file) {
      return;
    }
    const err = validateClientFile(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const kind = classifyUploadMime(file.type);
      if (kind === "image") {
        const { url } = await postUpload(file);
        setMediaType("image");
        setImageUrl(url);
        setMediaUrl(url);
        return;
      }
      if (kind === "video") {
        const videoResult = await postUpload(file);
        if (videoResult.type !== "video") {
          throw new Error("Ожидался видеофайл");
        }
        let posterUrl = PRODUCT_IMAGE_PLACEHOLDER_PATH;
        const thumbBlob = await captureVideoFrameAsJpegBlob(file);
        if (thumbBlob) {
          const thumbFile = new File([thumbBlob], "poster.jpg", { type: "image/jpeg" });
          const thumbErr = validateClientFile(thumbFile);
          if (!thumbErr) {
            const thumbResult = await postUpload(thumbFile);
            posterUrl = thumbResult.url;
          }
        }
        setMediaType("video");
        setMediaUrl(videoResult.url);
        setImageUrl(posterUrl);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ошибка загрузки";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }, []);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      void processFile(file);
    },
    [processFile]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      void processFile(file);
    },
    [processFile]
  );

  if (!open) {
    return null;
  }

  async function handleSubmitForm(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const payload: ProductFormPayload = {
        name,
        description,
        price,
        category,
        imageUrl,
        mediaUrl: mediaType === "video" ? mediaUrl : mediaUrl ?? imageUrl,
        mediaType,
        isSampleAvailable
      };
      await onSubmit(payload);
      onClose();
    } catch {
      /* ошибка уже показана в родителе */
    } finally {
      setPending(false);
    }
  }

  const previewSrc = imageUrl ?? PRODUCT_IMAGE_PLACEHOLDER_PATH;
  const showVideoPreview = mediaType === "video" && mediaUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-expoBlue/35 backdrop-blur-[2px]" aria-label="Закрыть" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-bold text-neutral-900">
            {initialProduct ? "Редактировать новинку" : "Новая новинка"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-[8px] p-2 text-slate-500 transition hover:bg-slate-100">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-slate-700">Медиа (изображение или видео)</span>
            <div
              className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-6 transition hover:border-expoBlue/40 hover:bg-neutral-50"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="presentation"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                className="sr-only"
                onChange={onInputChange}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-sm text-neutral-600">
                  <Loader2 className="h-8 w-8 animate-spin text-expoBlue" />
                  Загрузка…
                </div>
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-neutral-400" strokeWidth={1.25} />
                  <p className="mt-2 text-center text-sm text-neutral-600">
                    Перетащите файл сюда или нажмите для выбора
                  </p>
                  <p className="mt-1 text-center text-xs text-neutral-500">
                    Изображения до 5 МБ · видео MP4/WebM до 20 МБ
                  </p>
                </>
              )}
            </div>
            {uploadError ? <p className="mt-2 text-sm text-red-600">{uploadError}</p> : null}

            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
              {showVideoPreview ? (
                <video
                  src={mediaUrl ?? undefined}
                  poster={previewSrc}
                  className="h-full w-full object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc} alt="" className="h-full w-full object-cover" />
              )}
              {(imageUrl || mediaUrl) && !uploading ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearMedia();
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/55 p-2 text-white transition hover:bg-black/70"
                  aria-label="Удалить медиа"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="p-name" className="block text-sm font-medium text-slate-700">
              Название
            </label>
            <input
              id="p-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
            />
          </div>
          <div>
            <label htmlFor="p-desc" className="block text-sm font-medium text-slate-700">
              Описание
            </label>
            <textarea
              id="p-desc"
              required
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
            />
          </div>
          <div>
            <label htmlFor="p-price" className="block text-sm font-medium text-slate-700">
              Цена
            </label>
            <input
              id="p-price"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="от 1 000 ₽"
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
            />
          </div>
          <div>
            <label htmlFor="p-cat" className="block text-sm font-medium text-slate-700">
              Категория
            </label>
            <select
              id="p-cat"
              value={category}
              onChange={(event) => setCategory(event.target.value as ProductCategory)}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-neutral-900 focus:border-expoBlue focus:outline-none focus:ring-2 focus:ring-expoBlue/20"
            >
              {(Object.keys(PRODUCT_CATEGORY_LABEL_RU) as ProductCategory[]).map((key) => (
                <option key={key} value={key}>
                  {PRODUCT_CATEGORY_LABEL_RU[key]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isSampleAvailable}
              onChange={(event) => setIsSampleAvailable(event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-expoBlue focus:ring-expoBlue"
            />
            Доступен образец
          </label>
          <button
            type="submit"
            disabled={pending || uploading}
            className="w-full rounded-lg bg-expoBlue py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-expoBlue/90 disabled:opacity-60"
          >
            {pending ? "Сохранение…" : initialProduct ? "Сохранить" : "Добавить"}
          </button>
        </form>
      </div>
    </div>
  );
}
