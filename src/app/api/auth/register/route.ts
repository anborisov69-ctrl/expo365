import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.nativeEnum(UserRole),
  companyName: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = registrationSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiError(parsedBody.error.issues[0]?.message ?? "Invalid request body", 422);
    }

    const { email, password, fullName, role, companyName } = parsedBody.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return apiError("User with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const company =
      role === UserRole.EXHIBITOR
        ? await prisma.company.create({
            data: {
              name: companyName ?? `${fullName} Company`
            }
          })
        : null;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        companyId: company?.id
      }
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return apiSuccess({ userId: user.id, role: user.role }, 201);
  } catch (error) {
    return apiError(`Registration failed: ${(error as Error).message}`, 500);
  }
}
