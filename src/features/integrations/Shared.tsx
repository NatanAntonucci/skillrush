"use client";
import type { ReactNode } from "react";
export const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-accent-400";
export const buttonClass =
  "rounded-xl bg-accent-500 px-5 py-3 font-semibold text-slate-950 hover:bg-accent-400 disabled:cursor-wait disabled:opacity-50";
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-2xl border p-4 text-sm ${error ? "border-rose-800 bg-rose-950/30 text-rose-200" : "border-slate-700 bg-slate-900/60 text-slate-300"}`}
    >
      {children}
    </div>
  );
}
export function Timestamp({ value }: { value: string }) {
  return (
    <p className="text-xs text-slate-500">
      Atualizado em {formatDate(value)} · Pode haver atraso em relação ao jogo.
    </p>
  );
}
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Horário a definir"
    : dateFormat.format(date);
}
export function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: string | number | null;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">
        {value ?? "—"}
        {value !== null && suffix}
      </p>
    </div>
  );
}
export function fixed(value: number | null, digits = 1) {
  return value === null
    ? null
    : value.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
}
