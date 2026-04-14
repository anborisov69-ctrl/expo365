import { FeedClient } from "@/components/FeedClient";

export default function FeedPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-expoBlue">Лента новинок</h1>
      <FeedClient />
    </section>
  );
}
