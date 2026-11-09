import type { Metadata } from "next";
import { Championships } from "@/features/esports/Championships";
export const metadata: Metadata = {
  title: "Campeonatos de Valorant",
  description:
    "Agenda, resultados, chaveamentos e transmissões dos campeonatos de Valorant no Skillrush.",
};
export default function ChampionshipsPage() {
  return <Championships />;
}
