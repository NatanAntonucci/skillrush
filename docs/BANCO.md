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

Índices: `(map_id, agent_id, status)`, `(status, created_at desc)`, `slug`, `video_url` (unique).

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
