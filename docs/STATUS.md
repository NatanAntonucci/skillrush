# Status do projeto

Atualizado em 05/11/2026 · branch `refactor/hostgator-static` · base `main` intocada (tag `pre-refactor`)

## Onde estamos

| Etapa | Escopo | Estado |
|---|---|---|
| 1 | Higiene do repositório e documentação | ✅ concluída |
| 2 | Segurança (RLS, fim das API routes, banco) | ✅ concluída e **aplicada em produção** |
| 3 | Correções funcionais e UX (bugs) | ✅ concluída |
| 4 | URLs, navegação e SEO | 🟡 4 de 5 itens |
| 5 | Export estático + deploy HostGator | ✅ pronto para subir (execução manual) |
| 6 | Comunidade (envio público + moderação) | ⏳ futura |

---

## O que foi feito

### Etapa 1 — higiene

- `.next` removido do controle de versão (150 arquivos de build); repo caiu de **254 para 60 arquivos**.
- `.gitignore` reescrito: passou a ignorar `.next/`, `out/` e a **não** esconder mais `*.md`.
- Removidas sobras do template: `src/assets/**` (25 imagens), types sem uso, `Footer.tsx`,
  `useScrollAnimation.ts`, `constants/ui.ts`, `utils/format.ts`, `vite-env.d.ts`, `netlify.toml`
  e os scripts de imagem do Vite.
- Lint funcional: `.eslintrc.json` (`next/core-web-vitals`) no lugar do flat config quebrado.
- Node 20 fixado (`.nvmrc` + `engines`), scripts `typecheck` e `sync`.
- Documentação em `docs/` + README enxuto.

### Etapa 2 — segurança

- **Removidas as 3 API routes** que eram o furo: `/api/lineups`, `/api/admin/create-user`, `/api/valorant-sync`.
- Upload grava **direto no Supabase** com a sessão do usuário; quem autoriza é o RLS.
- `useAdmin()` lê `profiles.role` para a interface (a tela esconde; o banco proíbe).
- Service role key fora do caminho do cliente — **0 ocorrências no build**.
- Sync virou script Node: `npm run sync`.
- Telas `admin/setup` e `admin/debug` apagadas.

### Etapa 3 — correções funcionais (concluída)

- **3.1** Header não aponta mais para `/upload` (404): o item "Upload" só existe para admin e leva a
  `/admin/upload`; inclui botão **Sair** (desktop e mobile).
- **3.2** Filtro de habilidade passou de AND (`every`) para OR (`some`) — dois filtros não zeram mais a lista.
- **3.3** Mapa e lista usam a mesma função de filtro (`utils/filters.ts`): hotspot que a lista esconde
  também some do mapa.
- **3.4** `LineupProvider` centraliza a busca — uma requisição por seleção em vez de duas.
- **3.5/3.6** Competitividade vem do banco (`maps.is_competitive`), com Abyss e Corrode incluídos e os mapas
  de TDM (District, Kasbah, Piazza, Glitch, Drift) fora. `MapSelect`, página de mapas e upload de lineup
  usam o mesmo helper (`utils/maps.ts`), com deduplicação por nome (a API tem dois "The Range").
- **3.7** "Limpar filtros" limpa só filtros; não desmonta mapa/agente/lineup (`clearFilters` no store).
- **3.8** Hotspot na exibição agora é calculado sobre a área desenhada da imagem (fim do deslocamento por
  letterbox) — mesma matemática do upload.
- **3.9** Parser de vídeo compartilhado (`utils/video.ts`): YouTube (watch/shorts/embed/live/youtu.be),
  Twitch, Streamable e Medal, com fallback de link quando não dá para embutir.
- **3.10** Rótulos PT-BR para dificuldade e lado (`utils/labels.ts`).
- **3.11** Layout responsivo: grids 40/60 e `1fr/380px` só a partir de `lg`/`xl`; lista e mapa empilham no mobile.
- **3.12** `error.tsx` e `not-found.tsx` globais.
- **3.16** Item "Upload" do menu só aparece após login com papel admin/moderador.

- **3.13** `next/image` em logos, ícones de agente/habilidade/mapa, splash e minimapa (o preview de hotspot
  do formulário continua com `<img>` porque depende do `getBoundingClientRect` do elemento).
- **3.14** CRUD no admin: `/admin/lineups` (lista com status, editar e excluir) e `/admin/lineups/[id]`
  (edição), com `LineupForm` compartilhado entre criar e editar e `AdminGuard` nas telas.
- **3.15** Vitest configurado (`vitest.config.ts`, alias `@`) com **15 testes**: filtros (incluindo OR de
  habilidades), parser de vídeo e curadoria de mapas.

### Etapa 4 — URLs e SEO (quase concluída)

- Rotas dinâmicas com Server Components e `generateStaticParams`: `/maps/[slug]`, `/maps/[slug]/[agent]`,
  `/agents/[slug]` e `/lineups/[slug]`; `/maps` e `/agents` passaram a ser renderizados no servidor.
- `generateMetadata` por página (título/descrição/OG), com `metadataBase` e template de título no layout.
- `sitemap.xml` e `robots.txt` gerados a partir do banco (mapas, agentes e lineups).
- Seleção da home espelhada na URL (`?mapa=bind&agente=sova`), com restauração ao carregar a página.
- Build gera 12 páginas de mapa, 29 de agente, as lineups publicadas e os pares mapa/agente existentes.
- Falta: imagem OG padrão (hoje usa splash do mapa/ícone do agente) e home como landing com destaques.

### Imagens locais e relatório do sync

- `npm run assets` baixa e otimiza (WebP) os ícones de agentes/habilidades e imagens de mapa para
  `public/assets/valorant/`, gerando `src/data/assets.json` (187 entradas, ~1,1 MB — antes 21 MB em PNG).
- `resolveImage()` prefere o arquivo local e cai na URL remota quando não houver, então o build funciona
  mesmo sem rodar o script.
- `npm run sync` agora imprime o que mudou (agentes/habilidades/mapas novos) e avisa quando aparece mapa
  sem curadoria de competitividade.

### Onda de UX/UI (implementada)

| Superfície | O que é |
|---|---|
| `/` | landing: busca, "continuar de onde parei", mapa grid e últimas lineups |
| `/buscar` | busca por agente, mapa, habilidade e título da lineup |
| `/maps/[slug]` | **página de resultado**: mapa + chips + lista + painel de detalhe (sem rolar), modo rápido e copiar link |
| `/maps/[slug]/[agent]` | página de SEO por agente no mapa |
| `/agents/[slug]`, `/lineups/[slug]` | perfis e detalhe da lineup |
| `/painel` | o painel interativo antigo, preservado |

Detalhes: hotspots de 44 px, thumbnails de vídeo, recentes em `localStorage`, contraste/tipografia
revisados e painel de detalhe em *bottom sheet* no mobile.

### Onda 3 — ajustes de UI e conteúdo

- Hotspot com alvo de 44 px e círculo visual de 28 px (não cobre lineups vizinhas).
- Botão **Compartilhar** nas lineups: WhatsApp, X/Twitter, Telegram, Facebook, copiar link e share nativo
  (com aviso de que o Instagram não aceita link direto).
- `/maps` voltou a usar as imagens locais (estava carregando o splash remoto em tamanho cheio).
- **Painel compacto**: mapa virou `<select>` e os agentes viraram uma faixa horizontal com busca —
  os controles saíram de ~meia tela para ~120 px.
- `/maps` e `/agents` reforçadas como páginas de conteúdo: arte, descrição tática ("A/B Sites"),
  contagem de lineups e link para a página interativa.
- `maps.tactical_description` (migration `0007`) preenchido pelo sync.
- **Cache de fetch do Next** entre builds impediria conteúdo novo de aparecer no HTML estático;
  `prebuild` limpa `.next/cache/fetch-cache` antes de cada build.
- Sync detectou **agente novo (Hush)** e mapas novos; **Summit** entrou como competitivo (`0008`).
- **Compartilhar** também no painel completo (detalhe da lineup).
- **Tema**: alternância entre ciano e vermelho da marca (`#E63A4B`) via `data-theme` + CSS variables,
  com botão no header e preferência salva em `localStorage`.
- **Habilidades em pt-BR**: o sync passou a consumir `?language=pt-BR` (habilidades e descrições);
  nomes de agente/mapa ficam em inglês; fallback em inglês quando a Riot ainda não traduziu
  (ex.: `Uncanny Marksman` do Sova). Migration `0009` atualizou o nome já gravado nas lineups.

### Migrations aplicadas

| Arquivo | Conteúdo |
|---|---|
| `0001_profiles.sql` | `profiles(id, role, display_name)`, trigger de criação, `is_admin()`, `is_super_admin()` |
| `0002_lineups_model.sql` | `status`, `author_id`, `slug`, `reviewed_*`, checks, FKs condicionais, índices |
| `0003_rls.sql` | policies de leitura/escrita por papel |
| `0004_hardening.sql` | limite de 5 pendências por usuário, check de `video_url` |
| `0005_cleanup_legacy_policies.sql` | remove policies antigas do dashboard |
| `0006_map_competitiveness.sql` | curadoria de `maps.is_competitive` (Abyss/Corrode dentro, TDM fora) |

Rollbacks em `supabase/rollback/` (0005 e 0006 são de limpeza/curadoria, sem rollback).

### Modelo de permissão (validado no banco)

| Papel | `lineups` |
|---|---|
| `anon` | lê só `approved`; não escreve |
| `user` | lê `approved` + os próprios; insere **só** `pending` |
| `admin` / `moderator` | lê tudo, insere/edita/exclui |

### Incidentes encontrados ao aplicar (já corrigidos)

1. **Policy `public read lineups` com `USING (true)`** criada no dashboard — expunha lineups `pending`
   (policies se somam por OR). Removida em `0005`.
2. **FKs duplicadas** (`lineups_agent_fk` + `lineups_agent_id_fkey`) → PostgREST recusava o embed
   `agent:agents(*)` com `PGRST201` e a home ficaria sem lineups. Duplicatas removidas e `0002` reescrita
   para só criar FK se a coluna ainda não tiver nenhuma.

### Estado atual do banco

- `lineups`: 1 registro (a de teste), `status = approved`.
- `agents` 29 · `abilities` 121 · `maps` 23 (12 marcados como competitivos).
- Admin: `natanantonucci9@gmail.com`. `natanantonucci15@gmail.com` segue como `user`.

---

## Como testar

**Não precisa buildar para testar.** `npm run dev` compila sob demanda.

```bash
cd D:\DEV-Projetos\SkillRush\desenv\skillrushFront
git branch --show-current        # deve ser refactor/hostgator-static
npm run dev                      # http://localhost:3000
```

Checklist manual:

1. `/` carrega mapa + agentes sem erro no console.
2. Só mapas competitivos aparecem (sem Range, Skirmish, District…); Abyss e Corrode aparecem.
3. Selecionar mapa + agente mostra hotspots e lista coerentes entre si.
4. Marcar dois filtros de habilidade mostra a união, não lista vazia.
5. Selecionar um mapa e clicar em "Limpar filtros" mantém o mapa.
6. `/admin` → login com a conta admin; o menu passa a mostrar "Upload" e "Sair".
7. `/admin/upload`: o seletor de mapas mostra só competitivos.
8. Publicar uma lineup → aparece na hora na home.

---

## Pendências

### Etapa 4 (restante)

- [ ] Imagem OG padrão do site (hoje cai no splash do mapa / ícone do agente)
- [ ] Home como landing com mapas em destaque e atalho para o painel interativo

### Etapa 5 — estático e deploy (pronta)

- `output: 'export'` + `trailingSlash: true`; `next build` gera `out/` (6,3 MB, 385 arquivos).
- `/admin/lineups/[id]` virou `/admin/lineups/edit?id=...` (rota dinâmica não existe no export).
- `public/.htaccess`: 404 customizado, barra final, cache de assets, compressão e headers.
- `npm run preview` serve o `out/` localmente simulando o Apache.
- `docs/DEPLOY.md` com passo a passo do cPanel, checklist no ar, rollback e problemas comuns.
- Falta apenas a execução (subir o zip) e configurar `NEXT_PUBLIC_SITE_URL` + URLs do Supabase Auth.

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

**Backup anterior às migrations**: `backup-pre-migrations.json` (fora do repo).

**Se o PostgREST reclamar de relação duplicada após mexer em FK**

```sql
notify pgrst, 'reload schema';
```

## Decisões pendentes

- Login com Discord já na Etapa 6 (ou só e-mail/senha)?
- Staging em subdiretório (`/staging`) antes de apontar o domínio?
- Usar GitHub Actions (FTP) ou subir `out/` manualmente no começo?
- Limpar o histórico do git (hoje com ~300 MB por causa dos antigos `.next`)? Exige `git filter-repo`.
