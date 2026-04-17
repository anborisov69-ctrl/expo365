import type { InquiryStatus, InquiryType } from "@prisma/client";

export interface ExhibitorInquiryApiRow {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  type: InquiryType;
  status: InquiryStatus;
  createdAt: string;
}
