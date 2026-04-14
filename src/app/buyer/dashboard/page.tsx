import { BuyerRequestsHistory } from "@/components/BuyerRequestsHistory";

export default function BuyerDashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-expoBlue">Кабинет посетителя</h1>
      <p className="text-slate-600">История запросов КП и взаимодействия с экспонентами.</p>
      <BuyerRequestsHistory />
    </section>
  );
}
