import { InquiryStatus } from "@prisma/client";

/** Статусы в теле PATCH `/api/inquiries/[id]` (согласованы с кабинетом экспонента). */
export type InquiryWireStatus = "new" | "in_progress" | "rejected" | "completed";

const WIRE_TO_PRISMA: Record<InquiryWireStatus, InquiryStatus> = {
  new: InquiryStatus.PENDING,
  in_progress: InquiryStatus.IN_PROGRESS,
  rejected: InquiryStatus.REJECTED,
  completed: InquiryStatus.DONE
};

export function parseWireInquiryStatus(value: unknown): InquiryStatus | null {
  if (typeof value !== "string") {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(WIRE_TO_PRISMA, value)) {
    return WIRE_TO_PRISMA[value as InquiryWireStatus];
  }
  return null;
}
