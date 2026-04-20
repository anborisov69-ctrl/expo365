import { getPublicCompanyPayload } from "@/lib/public-company-data";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;
  if (!companyId) {
    return NextResponse.json({ error: "Не указан идентификатор" }, { status: 400 });
  }

  try {
    const payload = await getPublicCompanyPayload(companyId);
    if (!payload) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/public/companies/[companyId]", error);
    return NextResponse.json({ error: "Не удалось загрузить данные" }, { status: 500 });
  }
}
