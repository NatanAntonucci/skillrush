# Deploy — HostGator (cPanel)

Site 100% estático: `npm run build` gera a pasta `out/` e é isso que vai para o servidor.
Não existe Node em produção.

---

## 0. Antes do primeiro deploy

| Item | O que fazer |
|---|---|
| **Domínio** | Defina `NEXT_PUBLIC_SITE_URL` no `.env.local` (ex.: `https://skillrush.com.br`). É usado no sitemap, canonical e OG |
| **SSL** | cPanel → *SSL/TLS Status* → **Run AutoSSL** (o `https` precisa funcionar antes de testar login) |
| **Supabase Auth** | *Authentication → URL Configuration*: **Site URL** = `https://seudominio.com/` e em **Redirect URLs** adicione `https://seudominio.com/admin/reset-password/` |

> ⚠️ **Subpasta vs raiz**: o build referencia assets em `/_next/...` (caminho absoluto). Se for testar em
> `public_html/staging`, é preciso `basePath: '/staging'` no `next.config.mjs` e rebuildar. Para testar
> hoje sem mexer em config, use a **raiz do domínio** ou um **subdomínio** (`staging.seudominio.com`,
> que também é raiz).

---

## 0.1 Staging: impedir indexação

Build de staging deve sair com `NEXT_PUBLIC_NOINDEX=true` (no `.env.local` ou na linha de comando):

```bash
NEXT_PUBLIC_NOINDEX=true npm run build     # PowerShell: $env:NEXT_PUBLIC_NOINDEX="true"; npm run build
```

Isso injeta `<meta name="robots" content="noindex, nofollow, nocache">` em todas as páginas.
O build de produção **não** deve ter essa variável (ou deixá-la como `false`).

---

## 1. Gerar o build

```bash
cd D:\DEV-Projetos\SkillRush\desenv\skillrushFront
git branch --show-current          # refactor/hostgator-static
npm install                        # se ainda não instalou depois do último pull
npm run build                      # gera out/ (o prebuild limpa o cache de fetch)
```

Opcional — conferir localmente antes de subir:

```bash
npm run preview                    # http://localhost:4321
```

O que deve existir em `out/`:

```
index.html      404.html      .htaccess      sitemap.xml     robots.txt
maps/           agents/       lineups/       admin/          _next/     assets/
```

---

## 2. Empacotar

Abra `out/`, selecione **o conteúdo** (não a pasta `out` em si) e compacte em `.zip`.

> No Windows: `Compress-Archive -Path out\* -DestinationPath skillrush.zip`
> (o `.htaccess` começa com ponto e pode ficar de fora do `*` — confira antes de subir; se faltar,
> inclua com `-Path out\* -Force` ou copie o arquivo separadamente).

Tamanho esperado: ~2 MB comprimido, ~6,5 MB descomprimido, ~385 arquivos.

---

## 3. Subir no cPanel

1. **File Manager** → entre em `public_html`.
2. Se houver conteúdo antigo, mova para `public_html_old` (não apague — é o rollback).
3. **Upload** do `.zip` → botão direito → **Extract**.
4. Apague o `.zip`.
5. Ative **Settings → Show Hidden Files** e confirme que o **`.htaccess`** está lá (é ele que cuida de
   404, cache e compressão).
6. Confirme que `index.html` está na raiz de `public_html` (e não em `public_html/out/`).

---

## 4. Checklist de teste no ar

- [ ] `https://seudominio.com/` abre com a arte dos mapas
- [ ] `/maps/bind` (sem barra) redireciona para `/maps/bind/` e funciona
- [ ] `/maps/summit/` abre
- [ ] `/agents/sova/` mostra habilidades em português
- [ ] `/painel/` abre, seleciona mapa/agente e o F5 mantém
- [ ] `/lineups/<slug>/` abre com vídeo e botão Compartilhar
- [ ] `/admin` → login → `/admin/upload` publica uma lineup
- [ ] `/admin/lineups` lista, edita (`/admin/lineups/edit?id=...`) e exclui
- [ ] `/admin/equipe` lista a equipe
- [ ] `/404` (uma URL qualquer) mostra a página 404
- [ ] `/sitemap.xml` e `/robots.txt` abrem
- [ ] Console do navegador sem erros de 404 em `_next`

---

## 5. Atualizações depois

| O que mudou | Precisa rebuildar? |
|---|---|
| Lineup publicada/editada pelo admin | **Não** — aparece na hora (o navegador lê do Supabase) |
| Código, layout, página nova, agente/mapa novo | **Sim** — repetir passos 1–3 |

O rebuild só serve para atualizar o **HTML pré-renderizado** (SEO). Para o visitante, o conteúdo novo já
aparece antes disso.

Para conteúdo novo (agente/mapa), rode também:

```bash
npm run sync      # atualiza metadata + traduções
npm run assets    # baixa imagens novas
npm run build
```

---

## 6. Rollback

No cPanel, renomeie `public_html` para `public_html_broken` e `public_html_old` de volta.
O site volta ao estado anterior em segundos.

---

## 7. Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Página em branco, CSS não carrega | build feito para outra raiz (subpasta) — falta `basePath` |
| 404 em todas as rotas | `.htaccess` não subiu (arquivo oculto) |
| 500 ao abrir qualquer página | diretiva do `.htaccess` não suportada — comente o bloco `mod_rewrite` |
| Login funciona mas "Acesso restrito" | usuário sem papel — promover em `/admin/equipe` ou no SQL |
| Imagens antigas | cache do navegador/CDN — `Ctrl+Shift+R` |
| Conteúdo novo não aparece no HTML | build sem `prebuild` (cache de fetch) — rode `npm run build` de novo |
