import type { ProductCategory } from "@prisma/client";

export type ExhibitorProfileCompanyProps = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  expertiseCategories: ProductCategory[];
};
