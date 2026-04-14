import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = loginSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid login payload", 422);
    }

    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return apiError("Invalid email or password", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await setAuthCookie(token);

    return apiSuccess({
      userId: user.id,
      role: user.role
    });
  } catch (error) {
    return apiError(`Login failed: ${(error as Error).message}`, 500);
  }
}
