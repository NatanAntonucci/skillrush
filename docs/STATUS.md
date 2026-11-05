# Status do projeto

Atualizado em 05/11/2026 · branch `refactor/hostgator-static` · base `main` intocada (tag `pre-refactor`)

## Onde estamos

| Etapa | Escopo | Estado |
|---|---|---|
| 1 | Higiene do repositório e documentação | ✅ concluída |
| 2 | Segurança (RLS, fim das API routes, banco) | ✅ concluída e **aplicada em produção** |
| 3 | Correções funcionais e UX (bugs) | ⏳ próxima |
| 4 | URLs, navegação e SEO | ⏳ pendente |
| 5 | Export estático + deploy HostGator | ⏳ pendente |
| 6 | Comunidade (envio público + moderação) | ⏳ futura |

---

## O que foi feito

### Etapa 1 — higiene

- `.next` removido do controle de versão (150 arquivos de build); repo caiu de **254 para 60 arquivos**.
- `.gitignore` reescrito: passou a ignorar `.next/`, `out/` e a **não** esconder mais `*.md`.
- Removidas sobras do template: `src/assets/**` (25 imagens), types sem uso (`news`, `projects`, `events`,
  `documents`, `accounts`, `edits`, `training`, `partners`), `Footer.tsx`, `useScrollAnimation.ts`,
  `constants/ui.ts`, `utils/format.ts`, `vite-env.d.ts`, `netlify.toml` e os scripts de imagem do Vite.
- Lint funcional: `.eslintrc.json` (`next/core-web-vitals`) no lugar do flat config quebrado;
  devDependencies coerentes.
- Node 20 fixado (`.nvmrc` + `engines`), scripts `typecheck` e `sync`.
- Documentação em `docs/` (arquitetura, banco, admin, deploy) + README enxuto.

### Etapa 2 — segurança

- **Removidas as 3 API routes** que eram o furo: `/api/lineups`, `/api/admin/create-user`, `/api/valorant-sync`.
- Upload passa a gravar **direto no Supabase** com a sessão do usuário; quem autoriza é o RLS.
- `useAdmin()` lê `profiles.role` para a interface (a tela esconde; o banco proíbe).
- Service role key saiu do caminho do cliente — **0 ocorrências no build** (verificado).
- Sync do Valorant virou script Node: `npm run sync` (`scripts/sync-valorant.mjs`).
- Telas `admin/setup` e `admin/debug` apagadas (a primeira criava usuários sem autenticação).
- Utilitários novos: `utils/video.ts` (parser de vídeo + conversão clique→percentual considerando letterbox).

### Migrations aplicadas

| Arquivo | Conteúdo |
|---|---|
| `0001_profiles.sql` | `profiles(id, role, display_name)`, trigger de criação, `is_admin()`, `is_super_admin()` |
| `0002_lineups_model.sql` | `status`, `author_id`, `slug`, `reviewed_*`, checks, FKs condicionais, índices |
| `0003_rls.sql` | policies de leitura/escrita por papel |
| `0004_hardening.sql` | limite de 5 pendências por usuário, check de `video_url` |
| `0005_cleanup_legacy_policies.sql` | remove policies antigas do dashboard |

Rollbacks em `supabase/rollback/`.

### Modelo de permissão (validado no banco)

| Papel | `lineups` |
|---|---|
| `anon` | lê só `approved`; não escreve |
| `user` | lê `approved` + os próprios; insere **só** `pending` |
| `admin` / `moderator` | lê tudo, insere/edita/exclui |

### Incidentes encontrados ao aplicar (já corrigidos)

1. **Policy `public read lineups` com `USING (true)`** criada manualmente no dashboard — expunha lineups
   `pending` publicamente (policies se somam por OR). Removida em `0005`.
2. **FKs duplicadas** (`lineups_agent_fk` + `lineups_agent_id_fkey`) → PostgREST recusava o embed
   `agent:agents(*)` com `PGRST201`, ou seja, a home ficaria sem carregar lineups. Duplicatas removidas e
   `0002` reescrita para só criar FK se a coluna ainda não tiver nenhuma.

### Estado atual do banco

- `lineups`: 1 registro (a de teste), `status = approved`.
- `agents` 29 · `abilities` 121 · `maps` 23.
- Admin: `natanantonucci9@gmail.com`. `natanantonucci15@gmail.com` segue como `user`.

---

## Como testar

**Não precisa buildar para testar.** `npm run dev` compila sob demanda.

```bash
cd D:\DEV-Projetos\SkillRush\desenv\skillrushFront
git branch --show-current        # deve ser refactor/hostgator-static
npm run dev                      # http://localhost:3000
```

Se algo reclamar de dependência, rode `npm install` uma vez.

Checklist manual:

1. `/` carrega mapa + agentes sem erro no console.
2. Selecionar mapa + agente mostra hotspots e lista.
3. `/admin` → login com a conta admin.
4. `/admin/upload` → publicar uma lineup clicando no mapa.
5. Voltar para `/` e confirmar que ela aparece **na hora** (sem rebuild).
6. Conferir no Supabase (Table editor → `lineups`) que a linha entrou com `status = approved` e `slug`.

---

## Pendências

### Etapa 3 — correções funcionais (próxima)

- [ ] 3.1 Header: link `/upload` → `/admin/upload` (hoje 404)
- [ ] 3.2 Filtro de habilidade com `every()` (AND) → `some()` (OR)
- [ ] 3.3 Hotspots do mapa ignoram dificuldade/lado/habilidade — usar um `applyFilters` único
- [ ] 3.4 `useLineups` chamado duas vezes por seleção (mapa + lista) — buscar uma vez e distribuir
- [ ] 3.5 Competitividade de mapa vinda do banco (`maps.is_competitive`) em vez de lista fixa no código
- [ ] 3.6 Abyss/Corrode fora do seletor; `maps` mostra Skirmish/Range e duplicata "The Range"
- [ ] 3.7 Botão "Limpar" apaga agente/mapa/lineup — deve limpar só filtros
- [ ] 3.8 Coordenada do hotspot na exibição ainda usa a caixa do container (upload já corrigido)
- [ ] 3.9 Parser de vídeo integrado ao `LineupDetails` (hoje só usa regex de YouTube inline)
- [ ] 3.10 Rótulos PT-BR para `easy/medium/hard` e `attack/defense`
- [ ] 3.11 Layout mobile-first (grid 40/60 + 380px fixo quebra no celular)
- [ ] 3.12 `error.tsx`, `not-found.tsx`, estados de loading consistentes
- [ ] 3.13 `next/image` nas imagens externas (agente/mapa)
- [ ] 3.14 CRUD no admin: editar/excluir lineup (hoje só cria)
- [ ] 3.15 Testes unitários (Vitest) para `applyFilters`, parser de vídeo e clamp de coordenadas

### Etapa 4 — URLs e SEO

- [ ] `/mapas/[map]`, `/mapas/[map]/[agent]`, `/lineups/[slug]`, `/agentes/[agent]`
- [ ] Server Components + `generateStaticParams` + `generateMetadata`
- [ ] Estado de seleção na URL (searchParams) em vez de só Zustand
- [ ] `sitemap.ts`, `robots.txt`, OG image
- [ ] Home como landing com mapas em destaque

### Etapa 5 — estático e deploy

- [ ] `output: 'export'`, `images.unoptimized`, `trailingSlash`
- [ ] `.htaccess` (fallback de rotas, cache, segurança)
- [ ] `npm run build:static` → `out/`
- [ ] Deploy manual em `/staging` no cPanel
- [ ] GitHub Actions: deploy por push + rebuild agendado + `sync` semanal

### Etapa 6 — comunidade

- [ ] `/admin/moderacao` (fila de `pending`, aprovar/rejeitar)
- [ ] `/enviar` para usuários autenticados
- [ ] Login com Discord (OAuth)
- [ ] Painel do autor, favoritos, busca (FTS)

---

## Runbook

**Promover admin**

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'pessoa@email.com');
```

**Sincronizar metadata do Valorant** (precisa de `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`)

```bash
npm run sync
```

**Rollback de código**

```bash
git checkout main          # volta para a versão anterior
git tag -l                 # a tag pre-refactor marca o ponto de partida
```

**Rollback de banco**: rodar `supabase/rollback/000X_*.sql` na ordem inversa (0004 → 0001).

**Backup dos dados anterior às migrations**: `backup-pre-migrations.json` (fora do repo).

**Se o PostgREST reclamar de relação duplicada após mexer em FK**

```sql
notify pgrst, 'reload schema';
```

## Decisões pendentes

- Login com Discord já na Etapa 6 (ou só e-mail/senha)?
- Staging em subdiretório (`/staging`) antes de apontar o domínio?
- Usar GitHub Actions (FTP) ou subir `out/` manualmente no começo?
- Limpar o histórico do git (hoje com ~300 MB por causa dos antigos `.next`)? Exige `git filter-repo`.
