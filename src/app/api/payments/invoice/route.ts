import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { getUserFromRequest } from "@/lib/auth";

const invoiceSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("RUB"),
  description: z.string().min(3)
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const parsedBody = invoiceSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid invoice payload", 422);
    }

    const fakeGatewayResponse = {
      invoiceId: `inv_${Date.now()}`,
      paymentUrl: `https://payment-gateway.example/invoice/${Date.now()}`,
      status: "PENDING"
    };

    return apiSuccess(fakeGatewayResponse, 201);
  } catch (error) {
    return apiError(`Failed to create invoice: ${(error as Error).message}`, 500);
  }
}
