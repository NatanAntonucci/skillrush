# Arquitetura

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| UI | Next.js 14 (App Router) + React 18 + TypeScript | páginas pré-renderizadas por mapa/agente (SEO) e ilhas interativas para o mapa |
| Estilo | Tailwind CSS | velocidade de UI, sem runtime extra |
| Estado | Zustand (UI) + URL (navegação) | seleção precisa ser compartilhável e sobreviver a F5 |
| Dados | Supabase (Postgres + RLS + Auth) | banco, autenticação e autorização sem servidor próprio |
| Conteúdo oficial | API pública valorant-api.com | agentes, habilidades, mapas e ícones sem cadastro manual |
| Vídeos | YouTube (embed) | banda e armazenamento zero |

## Princípio central: site estático, conteúdo dinâmico

O site é publicado como arquivos estáticos (`out/`) em hospedagem compartilhada. O **conteúdo** (lineups)
mora no Supabase e é lido pelo navegador. Não existe servidor Node em produção.

Consequências:

- **Escrita:** feita pelo navegador autenticado, direto no Supabase, autorizada por **RLS**. Não há API
  routes nem service role key no bundle.
- **Leitura:** pública, filtrada por `status = 'approved'`.
- **SEO:** as páginas são geradas em build com um snapshot do banco; o cliente atualiza com os dados
  mais recentes. Um rebuild automático (GitHub Action) mantém o HTML alinhado.
- **Sem ISR/SSR:** não há regeneração por requisição — é o preço de rodar em hospedagem compartilhada.

## Fluxo de dados

```
valorant-api.com ──(npm run sync)──> Supabase: agents / maps / abilities
                                          │
admin (navegador) ──insert (RLS admin)──> lineups (status approved|pending|rejected)
                                          │
visitante (navegador) <──select (RLS público approved)──┘
```

## Estrutura de pastas

```
src/app          rotas (páginas e layouts)
src/components   UI compartilhada (Header, mapa, detalhe)
src/features     módulos de domínio (agents, maps, lineups)
src/services     acesso a dados (supabase, valorant-api)
src/stores       estado de UI (Zustand)
src/types        tipos do domínio
supabase/        migrations SQL versionadas
scripts/         utilitários de linha de comando (sync)
docs/            documentação
```

## Decisões

- **Sem servidor**: qualquer lógica de autorização vive no Postgres (RLS), não em código de front.
- **Uma tabela de lineups** com `status` e `author_id` em vez de "publicadas" + "submissões": permite abrir
  para a comunidade depois sem migrar dados.
- **Hotspots em percentual (0–100)** relativos à imagem do mapa, normalizados sobre a área desenhada.
- **Português** como idioma da interface e dos dados de exibição.
