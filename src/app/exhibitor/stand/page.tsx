import { StandManager } from "@/components/StandManager";

export default function ExhibitorStandPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-expoBlue">Управление виртуальным стендом</h1>
      <StandManager />
    </section>
  );
}
