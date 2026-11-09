# Tracker e campeonatos

Implementação na branch `feature/tracker-campeonatos`, baseada em `5035025bb43ba85c84da492ca644476b6c74341e`.

## O que está implementado

- `/tracker/`: acesso por link de e-mail do Supabase, autorização explícita por consulta, perfil privado, PC/console, região, competitivo/sem classificação/disputa rápida.
- Visão geral: K/D, vitória %, ACS, dano/round, delta de dano/round, headshot % por acertos, tempo jogado, vitórias e derrotas. Médias ponderadas por rounds/acertos, não médias de médias.
- Histórico paginado em lotes de 10, até 100 partidas por consulta; deduplicação, detalhes individuais, primeiras eliminações/mortes e rounds com multikill quando os eventos existem.
- Filtros por ato sobre a amostra recuperada, tabelas por agente/mapa e links para conteúdo do Skillrush. Os agentes/mapas novos só terão páginas após o sync/build normal do catálogo.
- Rank/RR, pico, resumos sazonais e alterações recentes de RR conforme disponibilidade. O campo `elo` do provedor não é mostrado nem chamado de MMR oculto.
- Revogação de autorização e remoção do cache privado, inclusive proteção de FK contra gravações após a revogação.
- `/campeonatos/`: agenda, resultados e eventos em andamento, paginação e filtro local por texto. Detalhe por `?id=...`, permitindo compartilhar novos eventos sem rebuild.
- Partidas, equipes, classificação e chaveamento em DAG, com linhas tracejadas para avanço de perdedores. Relações reais do provedor, sem inferir confrontos por posição na lista.
- Modal com escolha de transmissão/idioma e embed allowlisted de Twitch/YouTube; fallback para o canal. Eventos sem stream exibem um estado explícito.
- Atualização manual e periódica (2 minutos em evento/em andamento, 5 minutos nas demais listas), somente com aba visível e sem modal aberto. Cache compartilhado no backend e cotas atômicas no banco.
- `/privacidade/`: informação sobre consentimento, terceiros e retenção. Tracker marcado `noindex`.

## Pré-requisitos e ativação

O frontend continua sendo exportado para cPanel. A função Supabase é publicada separadamente; nenhuma chave de provedor é colocada no frontend.

1. Solicite chaves em <https://api.henrikdev.xyz/dashboard/> e <https://app.pandascore.co/>. Confirme com a HenrikDev a aceitação deste produto e do fluxo de consentimento antes de habilitar acesso público. A declaração desta versão **não verifica titularidade Riot e não substitui RSO**. Os resultados não são públicos.
2. Em um Supabase novo e sem tabelas base, execute `supabase/INSTALAR_SKILLRUSH_BANCO_NOVO.sql` inteiro no SQL Editor. Em uma instalação existente, aplique apenas as migrations pendentes. A migration `0000` fornece o schema base; a `0012` explicita privilégios, sem depender de default grants do dashboard. Depois rode `npm run sync` para popular o catálogo.
3. Em Authentication → URL Configuration, autorize `https://SEU_DOMINIO/tracker/` como redirect. Habilite login por e-mail/magic link e criação de usuários, configure SMTP para envio real. Usuários novos recebem papel `user` pelo trigger existente; entrar no tracker não concede acesso de admin.
4. Configure os segredos da função (Dashboard → Edge Functions → Secrets, ou CLI):

```bash
supabase secrets set HENRIKDEV_API_KEY=SEU_SEGREDO
supabase secrets set PANDASCORE_API_KEY=SEU_SEGREDO
supabase secrets set ALLOWED_ORIGINS=https://SEU_DOMINIO,https://SEU_STAGING
node scripts/sync-integration-domain.mjs
supabase functions deploy integrations --project-ref SEU_PROJECT_REF --no-verify-jwt
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são fornecidos pelo runtime Supabase. Não copie segredos para variáveis `NEXT_PUBLIC_*`. As origens são exatas, sem barra final; para desenvolvimento inclua `http://localhost:3000`.

`verify_jwt = false` é intencional para permitir consulta pública de campeonatos e chaves públicas modernas. O endpoint tracker valida o bearer token com `auth.getUser()` **antes de qualquer consulta privada**. CORS não é usado como autenticação.

5. O frontend usa as variáveis Supabase já existentes em `.env.local`. Rode `npm ci`, `npm run build` e publique `out/` conforme `docs/DEPLOY.md`. Não publique um build de testes com URLs de fixture.
6. Teste login/retorno por e-mail, consulta consentida, revogação, agenda, detalhe do evento, chaveamento e streams em desktop/mobile. O player Twitch exige HTTPS e recebe `parent` do domínio em execução.

Sem chave, função ou migrations, as telas mostram indisponibilidade/aguardando ativação; não há estatísticas inventadas como fallback.

## Rotas externas utilizadas

HenrikDev (contratos consultados na documentação em 07/11/2026):

```text
GET /valorant/v2/account/{name}/{tag}
GET /valorant/v4/matches/{region}/{platform}/{name}/{tag}?mode=...&size=10&start=...
GET /valorant/v3/mmr/{region}/{platform}/{name}/{tag}
GET /valorant/v2/mmr-history/{region}/{platform}/{name}/{tag}
```

PandaScore:

```text
GET /valorant/tournaments/{running|upcoming|past}
GET /valorant/matches/{running|upcoming|past}
GET /tournaments/{id}
GET /tournaments/{id}/matches
GET /tournaments/{id}/brackets
GET /tournaments/{id}/standings
```

Detalhes paginados em até 10 páginas de 100; caso exceda, a interface informa amostra parcial. IDs de outros jogos são recusados. Rodadas de grupos não são convertidas artificialmente em eliminatória. Classificação pode ter apenas colocação, sem vitórias/derrotas, dependendo da fonte.

## Cache, acesso e limites

- `integration_cache`, `tracker_consents` e `integration_limits` têm RLS habilitado e nenhum acesso concedido a `anon`/`authenticated`. Somente a função com service role acessa esses objetos.
- Chaves de cache do tracker incluem UUID do usuário, conta, região, plataforma, modo e página. O payload enviado ao navegador contém somente estatísticas normalizadas da conta consultada, sem PUUID ou dados pessoais dos demais jogadores.
- Cache: perfil 1h, rank 10min, consulta 5min; campeonatos em andamento 1min, outras listas 5min, detalhe 2min.
- Cotas: usuário tracker 6 operações/min, chamadas HenrikDev com orçamento conservador de 28 unidades/min, PandaScore 900 chamadas/h, serviço 1.200 operações/min. Falha de banco bloqueia chamadas. A HenrikDev também cobra requisições internas à Riot: a reserva de custo é conservadora, não garantia de capacidade. Respeitamos 429 e devolvemos Retry-After ao cliente.
- Revogar remove autorização/cache. Os caches vencidos há mais de 1 dia e contadores antigos são removidos nas reservas de cota. Sem tráfego, a remoção aguarda nova consulta. Para retenção independente de tráfego, agende diariamente via Supabase Cron `delete from public.integration_cache where expires_at < now() - interval '1 day'; delete from public.integration_limits where window_start < extract(epoch from now()) - 86400;` com papel administrativo.
- As funções não são um proxy genérico: hosts fixos, ações allowlisted, IDs numéricos e validação de região/plataforma/modo. Somente HTTPS Twitch/YouTube pode gerar iframe.

## Limitações que devem ficar claras no produto

- Não é réplica integral do Tracker.gg. Não promete o mesmo histórico, percentis globais, Tracker Score, MMR oculto, KAST/clutches ou análises por arma nesta versão.
- Os resumos do tracker consideram apenas as partidas recuperadas. Não há importação retroativa garantida nem armazenamento permanente de toda a carreira.
- O consentimento declaratório não prova que o usuário é o dono do Riot ID. Para vinculação verificada, a evolução prevista é Riot Sign On com acesso aprovado.
- O plano gratuito da PandaScore cobre contexto, agenda e resultados conforme cobertura. Não há feed round a round ao vivo de Valorant nesta integração. Stats detalhadas, resultados por mapa e telemetria dependem de acesso/planos específicos.
- Sem credenciais dos provedores, os testes usam respostas sintéticas alinhadas aos contratos documentados. Validação de cobertura real (VCT/Challengers/Game Changers), quotas do plano, entregabilidade de e-mail e autorização do produto é necessária antes de produção.
- Nesta versão, não existe editor de campeonatos/transmissões manuais no admin.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
# Deno 2, sem alterar o package.json para resolver o runtime Edge:
deno check --no-config --node-modules-dir=manual supabase/functions/integrations/index.ts
deno test --no-config --node-modules-dir=manual --allow-env supabase/functions/integrations/index_test.ts
```

O `npm test` inclui testes de interação em DOM (login, consentimento, paginação, abas, revogação, descarte de resposta após logout, chaveamento e player), além de testes SQL reais em PostgreSQL WASM (PGlite): cotas concorrentes, permissões anon/authenticated, cascata de revogação e rollback. Os testes Deno exercitam o handler real com transportes simulados: auth, cache isolado, erros, quotas, allowlist e segredos ausentes. Nenhuma chamada real é feita com chave do usuário nos testes.

O build estático foi validado com um Supabase simulado para o catálogo existente. O navegador Chromium não conseguiu iniciar neste ambiente, portanto a conferência visual em desktop/celular e a reprodução real dos embeds permanecem na validação de staging.

Rollback: remova os links/páginas novos ao voltar o código anterior, despublique a função `integrations` e aplique `supabase/rollback/0011_integrations.sql` se quiser remover os dados novos. As tabelas anteriores não são alteradas.

## Referências

- <https://docs.henrikdev.xyz/llms.txt>
- <https://docs.henrikdev.xyz/general/rate-limiting>
- <https://github.com/Henrik-3/unofficial-valorant-api>
- <https://developers.pandascore.co/docs/plan-reference>
- <https://developers.pandascore.co/docs/tournaments-in-depth>
- <https://www.pandascore.co/pricing>
- <https://dev.twitch.tv/docs/embed/>

## Módulo compartilhado

O frontend importa `src/lib/integrations/domain.ts` via alias `@/lib/integrations/domain`.
A função Edge mantém uma cópia para deploy independente em `supabase/functions/_shared/domain.ts`.
Depois de editar o módulo canônico em src, execute `node scripts/sync-integration-domain.mjs` antes de publicar a função; o teste de paridade detecta cópias divergentes.
