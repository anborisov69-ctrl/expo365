import type { ProductCategory } from "@prisma/client";

export type ProductMediaType = "image" | "video";

export interface ProductApiRow {
  id: string;
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageUrl: string | null;
  mediaType: ProductMediaType;
  mediaUrl: string | null;
  isSampleAvailable: boolean;
  /** Участие в публичной ленте `/feed` */
  isPublished: boolean;
  companyId: string;
  company: {
    name: string;
    logo: string | null;
  };
}

export type ProductFormPayload = {
  name: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageUrl: string | null;
  mediaType: ProductMediaType;
  mediaUrl: string | null;
  isSampleAvailable: boolean;
  isPublished: boolean;
};

/** Новинка с числом запросов (кабинет экспонента) */
export type ProductApiRowWithStats = ProductApiRow & {
  inquiryCount: number;
};
