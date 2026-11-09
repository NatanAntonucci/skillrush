import type { Metadata } from "next";
import { Tracker } from "@/features/tracker/Tracker";
export const metadata: Metadata = {
  title: "Tracker de Valorant",
  description: "Seu desempenho por partida, agente e mapa no Skillrush.",
  robots: { index: false, follow: true },
};
export default function TrackerPage() {
  return <Tracker />;
}
