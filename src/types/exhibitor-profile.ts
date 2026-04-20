import type { CompanyContactsPayload } from "@/lib/company-contacts";
import type { ProductCategory } from "@prisma/client";

export type ExhibitorProfileCompanyProps = {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  contacts: CompanyContactsPayload;
  expertiseCategories: ProductCategory[];
};
