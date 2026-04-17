import { BuyerRequestDetailContent } from "@/components/visitor/BuyerRequestDetailContent";

type PageProps = { params: Promise<{ id: string }> };

export default async function BuyerRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BuyerRequestDetailContent id={id} />;
}
