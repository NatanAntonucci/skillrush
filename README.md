# Skillrush

Plataforma de consulta rápida de lineups de Valorant: escolha mapa e agente, veja os hotspots no mapa
tático, o vídeo e a execução passo a passo — no desktop ou no celular, antes da partida.

**No ar (staging):** https://skillrush.natanantonucci.com.br
**Repositório:** https://github.com/NatanAntonucci/skillrush

---

## Stack

| Camada | Escolha |
|---|---|
| Front-end | Next.js 14 (App Router) + React 18 + TypeScript estrito |
| Estilo | Tailwind CSS com tema por CSS variables |
| Estado | Zustand (painel) + URL (`?mapa=&agente=`) |
| Dados | Supabase (Postgres + RLS + Auth) |
| Conteúdo oficial | API pública valorant-api.com (pt-BR) |
| Vídeos | YouTube (embed) |
| Deploy | Export estático (`out/`) em hospedagem compartilhada (cPanel) |

## Arquitetura em uma frase

O site é **estático** (HTML pré-renderizado); o conteúdo é **dinâmico** (lido do Supabase pelo navegador).
Não existe servidor Node em produção: a autorização vive no Postgres, via RLS.

```
valorant-api.com ──(npm run sync)──> Supabase: agents / maps / abilities
                                          │
admin (navegador) ──insert RLS admin────> lineups
                                          │
visitante <──select RLS público──────────┘
```

## Status

| Etapa | Escopo | Estado |
|---|---|---|
| 1 | Higiene do repositório e documentação | ✅ |
| 2 | Segurança (RLS, fim das API routes, banco) | ✅ |
| 3 | Correções funcionais e UX | ✅ |
| 4 | URLs, navegação e SEO | ✅ |
| 5 | Export estático + deploy cPanel | ✅ |
| 6 | Comunidade (envio público + moderação) | ⏳ |

Detalhes em [docs/STATUS.md](docs/STATUS.md).

## Funcionalidades

- **Home** como ponto de partida: busca, "continuar de onde parei", mapas e últimas lineups
- **Página de resultado** (`/maps/[mapa]`): mapa interativo + chips de agente/habilidade/dificuldade/lado,
  lista de lineups e detalhe em modal (vídeo, passos, compartilhar)
- **Painel completo** (`/painel`): modo avançado com seletor de mapa, agente em popover e filtros
- **Busca** (`/buscar`) por agente, mapa e lineup
- **Páginas de conteúdo**: `/maps`, `/agents`, `/agents/[slug]`, `/lineups/[slug]`
- **Admin** (`/admin`): login, upload com marcação de hotspot, edição/exclusão e gestão de equipe
- **Compartilhar**: WhatsApp, X, Telegram, Facebook, copiar link e share nativo
- **Tema**: alternância entre ciano (padrão) e vermelho da marca, com preferência salva
- **SEO**: `sitemap.xml`, `robots.txt`, metadata/OG por página

## Rodando local

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev                  # http://localhost:3000
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera `out/` (export estático) |
| `npm run preview` | serve `out/` em `localhost:4321` simulando o Apache |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (filtros, parser de vídeo, mapas) |
| `npm run sync` | sincroniza agentes/mapas/habilidades (pt-BR) |
| `npm run assets` | baixa e otimiza as imagens do jogo em WebP |

## Estrutura

```
src/app          rotas (páginas e layouts)
src/components   UI compartilhada (Header, mapa, lineup, tema)
src/features     módulos de domínio (agents, maps, lineups, admin, home)
src/services     acesso a dados (supabase, queries de servidor)
src/stores       estado de UI (Zustand)
src/utils        filtros, labels, slug, imagens, vídeo
supabase         migrations e rollbacks SQL
scripts          sync, assets, preview estático
docs             arquitetura, banco, admin, deploy, UX, status
```

## Infraestrutura

| Item | Onde |
|---|---|
| Banco/Auth | Supabase (projeto `ffidraqobvdaynddecvv`) |
| Hospedagem | HostGator (cPanel), `public_html/skillrush`, subdomínio `skillrush.natanantonucci.com.br` |
| Build | local (`npm run build` → zip → File Manager) |
| Imagens | `public/assets/valorant` (WebP, ~3,7 MB, 225 arquivos) |

Variáveis de ambiente (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # apenas scripts (sync); nunca no cliente
NEXT_PUBLIC_SITE_URL=          # sitemap/canonical/OG
NEXT_PUBLIC_NOINDEX=false      # true em staging
```

## Admin

Login em `/admin`. Papéis: `user` (envia pendente), `moderator` (publica/edita/exclui) e
`admin` (tudo + equipe). Criar conta: dashboard do Supabase → *Authentication → Users*; promover:
`/admin/equipe`. Ver [docs/ADMIN.md](docs/ADMIN.md).

## Deploy

Passo a passo do cPanel, checklist no ar e rollback em [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação

- [Arquitetura](docs/ARQUITETURA.md) — stack, fluxo de dados e decisões
- [Banco de dados](docs/BANCO.md) — schema, RLS, migrations, sync, imagens
- [Admin](docs/ADMIN.md) — publicar lineup e gerenciar equipe
- [Deploy](docs/DEPLOY.md) — export estático e cPanel
- [Status](docs/STATUS.md) — o que está pronto e o que falta
- [Revisão de UX/UI](docs/UX-REVIEW.md) — diagnóstico e prioridades

## Próximos passos

- **Etapa 6**: envio pela comunidade + moderação (`/admin/moderacao`), login com Discord, favoritos e busca full-text
- Descrições ricas por mapa (campo editável no admin)
- Domínio final e virada de chave do staging

## Tracker e campeonatos

Novas áreas: `/tracker/` (estatísticas privadas consentidas via HenrikDev) e `/campeonatos/`
(agenda, resultados, chaveamento e transmissões via PandaScore). A ativação exige uma Edge Function,
a migration `0011` e as chaves dos provedores configuradas como segredos no Supabase.
Veja [configuração, limites e validação](docs/TRACKER-ESPORTS.md).
