import type { InquiryStatus, InquiryType } from "@prisma/client";

export interface ExhibitorInquiryApiRow {
  id: string;
  productId: string | null;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  message: string | null;
  type: InquiryType;
  status: InquiryStatus;
  createdAt: string;
}
