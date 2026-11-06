# Análise de UX/UI — Skillrush

Revisão sênior de design · 05/11/2026 · base: código e telas atuais do projeto

> **Estado:** a onda 1 descrita no item 6 já está implementada (ver seção 0). As ondas 2 e 3 seguem pendentes.

## 0. O que já foi implementado

- **Home virou ponto de partida** (`/`): busca, "continuar de onde parei", grid de mapas e últimas lineups.
- **`/maps/[slug]` virou a página de resultado**: mapa + chips de agente/habilidade/dificuldade/lado +
  lista + painel de detalhe, sem rolar. Modo rápido e "copiar link" inclusos.
- **Busca** (`/buscar`) por agente, mapa, habilidade e nome da lineup.
- **Recentes** em `localStorage` (3 últimos mapas/agentes) com atalho de um clique.
- **Hotspots de 44 px** com rótulo e tooltip.
- **Thumbnail do vídeo** nos cards.
- **Contraste e tipografia** revisados (texto mínimo 11–12 px, `slate-400` no lugar de `slate-500`).
- **Painel antigo preservado** em `/painel` (não quebrar o que funcionava).
- Lista completa abaixo do board em `/maps/[slug]` para manter conteúdo no HTML (SEO).

### Onda 2 (também implementada)

- **Arte dos mapas**: cards da home e seletor do painel usam o *splash* oficial (1280×720 WebP), não o mapa tático.
- **Vídeo em modal**: clicar no hotspot abre um overlay centralizado (até 3xl de largura) com vídeo grande,
  passos, "copiar link" e "página da lineup" — antes abria num painel de 380 px.
- **Loader animado** global (`loading.tsx`) + skeletons nas listas de agentes, mapas e lineups.
- **Microinterações**: fade-up com stagger nos cards, hover com elevação, `active` nos botões, anel pulsante
  no hotspot selecionado, `prefers-reduced-motion` respeitado.
- **Imagens sem espera**: `images.unoptimized` (o WebP já vem otimizado do `npm run assets`), eliminando o
  atraso do otimizador em dev.
- **Aviso de mapa sem conteúdo**: selo "Em breve" e texto "sem lineups" nos cards da home.
- **Banner do mapa** com a arte do mapa na página de resultado.


---

## 1. Qual é o trabalho do produto

O Skillrush não é um site de conteúdo para ler com calma. É uma **ferramenta de consulta com prazo**.
O usuário chega com uma pergunta específica e poucos segundos:

> "Sou Sova, vou jogar Bind ataque. Tenho lineup para o A?"

Três contextos de uso, com exigências diferentes:

| Contexto | Tempo | O que importa |
|---|---|---|
| **Antes da partida** (fila, agent select) | 30–120 s | achar rápido, no celular ou segunda tela |
| **Durante a partida** | 3–10 s | saber onde pisar e para onde olhar, sem ler |
| **Aprendizado** (fora do jogo) | minutos | entender a execução, ver o vídeo inteiro |

A interface atual foi desenhada como um **painel de controle**: tudo visível ao mesmo tempo, para explorar.
O produto precisa ser uma **ferramenta de busca**: um caminho curto até uma resposta.

Essa é a crítica central deste documento.

---

## 2. Diagnóstico da home

A home empilha cinco zonas: mapas (40%) + agentes (60%) → filtros → mapa interativo + lista → detalhes.
Funciona como demonstração de funcionalidades, mas cobra caro do objetivo principal.

### 2.1 Nenhum conteúdo na primeira dobra

Na primeira visita a tela mostra: seletores vazios, "Nenhuma lineup selecionada", "Selecione um mapa ou
lineup". O usuário precisa fazer **três escolhas** (mapa, agente, habilidade) antes de ver uma única lineup.
Para quem tem 40 segundos, isso é fricção pura.

### 2.2 O caminho é longo e não tem atalho

Fluxo atual: rolar até mapas → achar o mapa numa lista vertical → rolar até agentes → achar o agente num
grid de 29 ícones de 40 px → selecionar habilidade num painel de filtros → descer até o mapa → clicar num
hotspot → a página rola para os detalhes, **perdendo o mapa de vista**.

Cada etapa exige rolagem. O mapa interativo — que é o diferencial — fica abaixo do painel de filtros.

### 2.3 Duas listas para a mesma informação

Os hotspots no mapa e a lista "Disponíveis" mostram o mesmo conjunto. Duplicação que aumenta a carga
cognitiva sem adicionar informação.

### 2.4 Detalhes longe do contexto

Ao clicar num hotspot, a página faz `scrollIntoView` para o painel de detalhes. O usuário perde o mapa
exatamente no momento em que precisa comparar "onde é" com "como é".

### 2.5 Sem memória de uso

Nada de "última lineup", "recentes" ou "favoritas". O usuário recorrente — o público que mais retorna —
refaz os mesmos três cliques toda partida. É a lacuna mais cara para o objetivo do produto.

### 2.6 Sem busca

29 agentes e 12 mapas só por navegação visual. Quem digita "sova" ou "bind" não tem para onde ir.

---

## 3. Diagnóstico de componentes

| Componente | Problema | Severidade |
|---|---|---|
| **Seletor de mapas** | lista vertical de 12 itens com 48 px cada; ocupa meia tela e é navegação, não conteúdo | alta |
| **Seletor de agentes** | grid de ícones 40 px sem nome legível (só tooltip), sem busca, sem "recentes" | alta |
| **Filtro de habilidade** | depende do agente selecionado; se nenhum agente está escolhido, mostra categorias genéricas (Smoke, Flash…) que não filtram nada de verdade | média |
| **Hotspots** | 24 px de diâmetro (alvo pequeno no celular), sem indicação de qual lineup é, sem agrupamento quando há vários no mesmo ponto | alta |
| **Detalhe da lineup** | texto corrido, sem passos numerados, sem posição no mapa, sem "copiar", sem autor/data | média |
| **Cabeçalho** | três links + Upload; sem busca global; sem indicar onde estou | média |
| **Admin** | funcional, mas separado do produto (não há link de volta para o site após salvar) | baixa |

---

## 4. Problemas visuais e de acessibilidade

1. **Contraste insuficiente**: `text-slate-500` sobre `slate-950` fica em ~4.2:1 em textos pequenos
   (mínimo recomendado 4.5:1); `text-[9px]` e `text-[10px]` são ilegíveis em telas densas e em mobile.
2. **Alvos de toque**: hotspots de 24 px e botões de filtro com `py-1` ficam abaixo dos 44×44 px
   recomendados.
3. **Hierarquia tipográfica fraca**: quase tudo em `text-sm`; títulos de seção competem com labels.
4. **Cores semânticas inconsistentes**: ciano é a cor de ação, mas o mapa usa violeta para mapa selecionado
   e o hover dos cards usa `bg-white/5` (baixo contraste no escuro).
5. **Estados**: não há skeleton; o carregamento aparece como texto solto ("Carregando táticas...").
6. **Mobile**: grids fixos (`40%/60%`, `1fr/380px`) só se resolvem em `lg/xl`; no celular a página vira
   quatro blocos longos, com o mapa empurrado para baixo.

---

## 5. Proposta de arquitetura de informação

Três superfícies, cada uma com um trabalho:

### 5.1 Home = ponto de partida, não console

```
┌──────────────────────────────────────────────────────────┐
│  [ Buscar agente, mapa ou lineup…            ⌘K ]        │
├──────────────────────────────────────────────────────────┤
│  Continuar:  Sova · Bind            [abrir]              │
│  Recentes:   Omen · Ascent · Viper · Icebox               │
├──────────────────────────────────────────────────────────┤
│  Mapas                                                   │
│  [Bind] [Haven] [Ascent] [Split] [Lotus] …               │
├──────────────────────────────────────────────────────────┤
│  Lineups em destaque (6 cards com thumbnail do vídeo)    │
└──────────────────────────────────────────────────────────┘
```

- Busca no topo (agente, mapa, lineup) — resolve o caso "sei o que quero".
- "Continuar" e "Recentes" — resolve o caso "jogo sempre de Sova/Bind" em **um clique**.
- Grid de mapas — resolve o caso "vou explorar".
- Destaques — mostra que o site tem conteúdo (hoje a home não mostra nenhuma lineup).

### 5.2 Página de resultado = o coração do produto

`/maps/bind/sova` — mapa e lineup no mesmo campo de visão, sem rolagem:

```
┌───────────────────────────────┬──────────────────────────┐
│  Bind · Sova        [Ataque][Defesa]   [Fácil][Médio]…  │
│                               │  Lineups (3)             │
│   ┌───────────────────────┐   │  ▸ Smoke A — 0:42        │
│   │        MAPA           │   │  ▸ Recon B — 1:10        │
│   │    ●  hotspots        │   │  ▸ One-way A — 0:28      │
│   └───────────────────────┘   │                          │
│                               │  ┌────────────────────┐  │
│   mini-mapa da posição        │  │  vídeo + passos    │  │
│                               │  └────────────────────┘  │
└───────────────────────────────┴──────────────────────────┘
```

- Selecionar uma lineup **não navega**: abre o painel lateral (vídeo + passos numerados + posição).
- Filtros viram **chips no topo**, sempre visíveis, com contagem.
- No mobile: mapa fixo no topo, lista embaixo, detalhe em **bottom sheet**.

### 5.3 Modo rápido (o diferencial para "durante a partida")

Uma visão "cheat sheet" da lineup: uma imagem grande do posicionamento + uma frase de execução +
"copiar". Sem vídeo, sem scroll, pensada para segunda tela ou celular apoiado no teclado.

---

## 6. Prioridades (impacto no objetivo × esforço)

| # | Iniciativa | Impacto | Esforço | Onda |
|---|---|---|---|---|
| 1 | Página de resultado com mapa + lista + painel (sem scroll) | alto | médio | 1 |
| 2 | "Continuar de onde parei" + recentes (localStorage) | alto | baixo | 1 |
| 3 | Busca por agente/mapa/lineup | alto | baixo | 1 |
| 4 | Mobile: mapa fixo + bottom sheet | alto | médio | 1 |
| 5 | Hotspots com 44 px, agrupados por proximidade e com tooltip | alto | baixo | 1 |
| 6 | Contraste e tipografia (mínimo 14 px, `slate-300` em texto) | médio | baixo | 1 |
| 7 | Thumbnail do vídeo nos cards + duração | médio | baixo | 2 |
| 8 | Passos numerados na lineup + mini-mapa da posição | médio | médio | 2 |
| 9 | Modo rápido / "copiar lineup" | alto | médio | 2 |
| 10 | Home como landing (destaques, mapas, recentes) | médio | médio | 2 |
| 11 | Skeleton loading e estados vazios que sugerem conteúdo | médio | baixo | 2 |
| 12 | Favoritos (localStorage → conta depois) | médio | médio | 3 |

---

## 7. Métricas para acompanhar

- **TTFL** (time to first lineup): da chegada até o primeiro vídeo aberto — meta < 10 s
- **Cliques até a lineup**: meta ≤ 3 (hoje: 4–6, contando rolagem)
- **% de sessões com "Recentes"** — mede o valor da memória de uso
- **% de sessões mobile** e conclusão de tarefa no mobile
- **Profundidade de exploração**: mapas distintos visitados por sessão

Sem analytics, a proxy é tempo de sessão + páginas de lineup abertas.

---

## 8. O que eu faria primeiro

Se for para escolher **uma** mudança para começar: a **página de resultado** (item 1).
Ela resolve simultaneamente o problema de contexto (mapa + lineup juntos), o de navegação (URL própria),
o de duplicação (uma lista só) e o de mobile (layout empilhável). As demais melhorias penduram nela.

Em seguida, o trio barato de alto impacto: **recentes**, **busca** e **hotspots maiores** — cada um é
meio dia de trabalho e ataca direto a fricção de quem usa antes da partida.

---

## 9. Notas de execução

- A base técnica já sustenta isso: rotas com slug, dados no servidor, imagens locais em WebP (~1,1 MB),
  filtros em uma fonte única.
- O que falta é **rearranjar a informação**, não reescrever o app.
- Recomendo manter o painel interativo atual como está até a nova página estar pronta, para não quebrar
  o que já funciona.
