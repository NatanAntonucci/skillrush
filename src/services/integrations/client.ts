import { supabase } from "@/services/supabase/client";
import type {
  PlayerMatch,
  EsportsMatch,
  Tournament,
  BracketNode,
  Team,
  normalizeRank,
} from "@/lib/integrations/domain";
export type { PlayerMatch, EsportsMatch, Tournament, BracketNode };
export interface TrackerResult {
  account: {
    name: string;
    tag: string;
    level: number | null;
    region: string;
    platform: string;
  };
  rank: ReturnType<typeof normalizeRank> | null;
  matches: PlayerMatch[];
  hasMore: boolean;
  fetchedAt: string;
  warnings: string[];
  scope: string;
}
export interface EsportsList {
  tournaments: Tournament[];
  matches: EsportsMatch[];
  moreTournaments: boolean;
  moreMatches: boolean;
  fetchedAt: string;
}
export interface TournamentResult {
  tournament: Tournament;
  matches: EsportsMatch[];
  brackets: BracketNode[];
  teams: Team[];
  standings: {
    rank: number | null;
    team: Team;
    wins: number | null;
    losses: number | null;
    ties: number | null;
  }[];
  warnings: string[];
  partial: boolean;
  fetchedAt: string;
}
export class IntegrationError extends Error {
  constructor(
    message: string,
    public status = 0,
    public retryAfter = 0,
  ) {
    super(message);
  }
}
export async function integration<T>(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base)
    throw new IntegrationError("A integração está aguardando ativação.", 503);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(cancel, 60000);
  try {
    const response = await fetch(`${base}/functions/v1/integrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new IntegrationError(
        "A integração ainda não está disponível. Tente novamente mais tarde.",
        response.status,
      );
    }
    if (!response.ok)
      throw new IntegrationError(
        data.error || "Não foi possível carregar os dados.",
        response.status,
        data.retryAfter || 0,
      );
    return data as T;
  } catch (error) {
    if (error instanceof IntegrationError) throw error;
    if (signal?.aborted) throw error;
    throw new IntegrationError(
      "Não foi possível conectar. Verifique sua conexão e tente novamente.",
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}
