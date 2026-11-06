# Banco de dados

Postgres no Supabase. O schema é versionado em `supabase/migrations/` — **o dashboard não é a fonte de
verdade**, os arquivos `.sql` são.

## Tabelas

### `agents`, `maps`, `abilities`
Metadata oficial do Valorant, populada por `npm run sync` (valorant-api.com). Somente leitura pública.

| Tabela | Colunas principais |
|---|---|
| `agents` | `id` (uuid da API), `display_name`, `display_icon`, `description`, `role_display_name`, `role_display_icon` |
| `abilities` | `id` (`<agent_id>-<slot>`), `agent_id`, `slot`, `display_name`, `display_icon` |
| `maps` | `id`, `display_name`, `display_icon` (minimapa), `list_view_icon`, `splash`, `is_competitive` |

### `profiles`
Espelho de `auth.users` com o papel do usuário. Criado por trigger no cadastro.

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | FK → `auth.users(id)` |
| `role` | text | `user` \| `moderator` \| `admin` (default `user`) |
| `display_name` | text | opcional |
| `created_at` | timestamptz | |

### `lineups`

| Coluna | Tipo | Nota |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | text unique | usado na URL pública |
| `title`, `description` | text | |
| `agent_id`, `map_id`, `ability_id` | uuid | FKs para as tabelas de metadata |
| `ability_name` | text | desnormalizado para filtro rápido |
| `video_url` | text | YouTube/Twitch/Streamable |
| `difficulty` | text | `easy` \| `medium` \| `hard` |
| `side` | text | `attack` \| `defense` |
| `hotspot_x`, `hotspot_y` | float | 0–100, relativo à imagem do mapa |
| `hotspot_label` | text | A, B, C… |
| `status` | text | `approved` \| `pending` \| `rejected` |
| `author_id` | uuid | quem enviou (`auth.uid()`) |
| `reviewed_by`, `reviewed_at` | uuid / timestamptz | moderação |
| `created_at`, `updated_at` | timestamptz | |

Índices: `slug` (unique), `(map_id, agent_id, status)`, `(status, created_at desc)`, `author_id`, `video_url`
(“video_url” não é unique — o mesmo vídeo pode servir para mais de uma lineup; a moderação evita duplicata).

## Row Level Security

| Papel | `lineups` |
|---|---|
| `anon` | SELECT apenas `status = 'approved'` |
| `authenticated` (user) | SELECT `approved` + os próprios envios; INSERT como `pending` com `author_id = auth.uid()` |
| `moderator` / `admin` | tudo (SELECT, INSERT, UPDATE, DELETE) |

`agents`, `maps`, `abilities`: SELECT público; escrita só por service role (sync).
`profiles`: cada um lê o próprio; admin lê todos.

A função `is_admin()` é `security definer` para evitar recursão de policy em `profiles`.

## Aplicando migrations

1. Abra o **SQL Editor** do projeto no Supabase.
2. Rode os arquivos de `supabase/migrations/` em ordem numérica (`0001`, `0002`, …).
3. Cada arquivo tem o rollback correspondente em `supabase/rollback/`.

Depois de aplicar, promova sua conta a admin:

```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'SEU_EMAIL');
```

## Regenerar a metadata oficial

```bash
npm run sync
```

Requer `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (nunca no bundle do cliente).
O script faz *upsert* de agentes, habilidades e mapas e imprime um resumo com o que é novo:

```
Resumo:
  agentes: 29 (novos: Tejo)
  habilidades: 121 (novas: 4)
  mapas: 23 (novos: Kasbah)
⚠ Mapas novos sem curadoria de competitividade:
   Kasbah → ajuste maps.is_competitive
```

Fluxo sugerido a cada patch da Riot (ou 1×/mês): `npm run sync` → ler o resumo → se aparecer mapa novo,
decidir se é competitivo (`update maps set is_competitive = ...`) → `npm run assets` → rebuild.

**Idioma:** o sync busca também `?language=pt-BR`. Descrições de agente e nomes de habilidade vêm
traduzidos (`Flecha Rastreadora`, `Fúria do Caçador`); nomes de agente e de mapa permanecem em inglês
(igual ao jogo e às URLs). Se a Riot ainda não traduziu uma habilidade nova, o script mantém o nome em
inglês como fallback. Agentes novos entram já traduzidos na próxima execução — sem trabalho manual.

## Imagens do jogo

`npm run assets` baixa ícones de agentes/habilidades e imagens de mapa, otimiza para **WebP** (160 px para
agente, 96 px habilidade, 1024/320 px mapa) em `public/assets/valorant/` e gera `src/data/assets.json`.
O app usa `resolveImage()`: prefere o arquivo local e cai na URL remota se não existir.

- `npm run assets` — baixa só o que falta
- `npm run assets -- --force` — reprocessa tudo

Tamanho atual: ~1,1 MB para 187 imagens (antes: ~21 MB em PNG).
