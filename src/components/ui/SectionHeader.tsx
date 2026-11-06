interface SectionHeaderProps {
  title: string;
  description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm uppercase tracking-[0.28em] text-accent-300/80">Linha Tática</p>
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      <p className="max-w-3xl text-slate-400">{description}</p>
    </div>
  );
}
