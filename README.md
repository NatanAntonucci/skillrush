# SkillRush

Plataforma de consulta de lineups e jogadas de Valorant: escolha mapa + agente + habilidade, veja os
hotspots no mapa e assista à execução.

Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Zustand.

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev
```

Abre em http://localhost:3000.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | serve o build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | checagem de tipos (`tsc --noEmit`) |
| `npm run sync` | sincroniza agentes/mapas/habilidades da API pública do Valorant |

## Documentação

- [Arquitetura](docs/ARQUITETURA.md) — stack, fluxo de dados e princípios
- [Banco de dados](docs/BANCO.md) — schema, RLS e migrations
- [Admin](docs/ADMIN.md) — como publicar uma lineup
- [Deploy](docs/DEPLOY.md) — export estático e HostGator
