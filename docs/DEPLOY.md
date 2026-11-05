# Deploy

Alvo: **hospedagem compartilhada (HostGator/cPanel)** servindo arquivos estáticos. Não há Node em produção.

## Como o build funciona

O site inteiro é exportado para `out/`:

```bash
npm run build:static   # gera out/ com HTML, JS, CSS e assets
```

Esse diretório é o site. Nada de processo rodando no servidor.

## Primeira publicação

1. Rode `npm run build:static` localmente.
2. No cPanel, envie o **conteúdo** de `out/` para `public_html` (não a pasta `out` em si).
3. Confirme que o `.htaccess` foi enviado junto (é um arquivo oculto — use o gerenciador com "mostrar
   ocultos" ou envie por FTP).

## Atualizações

Duas coisas mudam em ritmos diferentes:

| O que mudou | Precisa rebuildar? |
|---|---|
| Código, layout, página nova | sim |
| Lineup nova/ editada no admin | **não** — aparece na hora (o navegador lê do Supabase) |

O rebuild só serve para atualizar o **HTML pré-renderizado** (SEO). Ele roda sozinho numa GitHub Action
(agendada e/ou disparada pelo Supabase), então o fluxo normal é: publicar pelo admin e esquecer.

## GitHub Actions (quando configurado)

| Workflow | Quando roda | O que faz |
|---|---|---|
| `deploy.yml` | push na `main` ou manual | build estático + upload FTP para o cPanel |
| `rebuild.yml` | diário / webhook do Supabase | rebuild para atualizar o HTML de SEO |
| `sync.yml` | semanal | `npm run sync` (metadata do Valorant) |

Segredos necessários no repositório: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (apenas para o sync).

## Rollback

O deploy anterior fica em `public_html.old`. Para reverter, renomeie de volta pelo cPanel ou reenvie o
diretório anterior.
