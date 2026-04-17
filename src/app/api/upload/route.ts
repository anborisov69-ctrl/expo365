import { getCompanyIdForExhibitorSession } from "@/lib/exhibitor-company-server";
import { getSessionFromCookies } from "@/lib/session-server";
import {
  classifyUploadMime,
  extensionForMime,
  maxBytesForKind
} from "@/lib/upload-rules";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";

export const runtime = "nodejs";

const UPLOAD_SUBDIR = join("public", "uploads", "products");

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  const companyId = await getCompanyIdForExhibitorSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректные данные формы" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!(entry instanceof File)) {
    return NextResponse.json({ error: "Ожидается поле file" }, { status: 400 });
  }

  const mime = entry.type;
  const kind = classifyUploadMime(mime);
  if (!kind) {
    return NextResponse.json(
      { error: "Недопустимый тип файла. Разрешены JPEG, PNG, GIF, WebP, MP4, WebM." },
      { status: 400 }
    );
  }

  const maxBytes = maxBytesForKind(kind);
  const size = entry.size;
  if (size > maxBytes) {
    const mb = kind === "image" ? 5 : 20;
    return NextResponse.json(
      { error: `Файл слишком большой (максимум ${mb} МБ)` },
      { status: 400 }
    );
  }

  const ext = extensionForMime(mime);
  if (!ext) {
    return NextResponse.json({ error: "Не удалось определить расширение" }, { status: 400 });
  }

  const buffer = Buffer.from(await entry.arrayBuffer());

  const dir = join(process.cwd(), UPLOAD_SUBDIR);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const absolutePath = join(dir, filename);
  await writeFile(absolutePath, buffer);

  const url = `/uploads/products/${filename}`;
  return NextResponse.json({ url, type: kind });
}
