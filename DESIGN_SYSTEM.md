# Identidade visual — Bruno Kobi Portfolio

Extraído do código real do projeto (não é aspiracional — é o que já existe).
Fonte: `main@d937133`.

## Voz

Primeira pessoa, português informal por padrão (o site detecta o país do
visitante e troca entre 9 idiomas via `react-intl`, mas a voz do autor —
status, posts do blog — é sempre casual e direta). Labels de seção com toque
"nerd-divertido" ("Fale com a IA", "Portfolio 3D", "Blog Dev"). Emoji usados
com moderação e propósito específico (📍 pin do visitante, ✈ arco de voo, 👽
mascote fixo no canto) — nunca como marcador genérico de lista.

## Cores

Um "terminal hacker em órbita": fundo preto, verde neon como assinatura. Não
existe modo claro.

| Token | Valor | Uso |
|---|---|---|
| `surface` | `#000000` | Fundo de página, em toda rota. |
| `surface-raised` | `rgba(0,20,5,0.4)` | Cards e painéis (posts do Blog Dev). |
| `surface-code` | `rgba(0,20,5,0.6)` | Fundo de bloco de código. |
| `ink` | `rgb(196,196,196)` | Texto padrão (definido uma vez no root). |
| `ink-muted` | `rgba(255,255,255,0.64)` | Texto secundário (datas, legendas). |
| `brand` | `#42c920` | **A cor de assinatura.** Nav ativo, headings, links, badges, botões. ~90 usos no código — nada chega perto disso. |
| `brand-fill` | `rgba(66,201,32,0.12)` | Fundo translúcido de badges/pills. |
| `brand-border` | `rgba(66,201,32,0.25)` | Borda padrão de cards/divisores. |
| `brand-border-strong` | `rgba(66,201,32,0.4)` | Borda de badges e hover de elementos clicáveis. |
| `terminal-green` | `#00ff41` | Acento CRT/HUD — pins do globo 3D, contador de visitas. Mais saturado que `brand`, reservado pra leituras de terminal simulado. |
| `status-visitor` | `#ffdc00` | Pin da geolocalização do visitante no globo. |
| `status-flight` | `#ff9900` | Arco de voo animado no globo; também marca itens prioritários no carrossel de Notícias IA. |
| `cyan-news` | `#00c8ff` | Acento próprio da página de Notícias IA — não usar em outras páginas. |

**Inconsistência conhecida (não corrigida ainda):** alguns widgets (chat
flutuante, texto de hover) usam verdes próximos mas não idênticos ao
`terminal-green` — `#39ff14` e `#00e055`. Vale padronizar pro `terminal-green`
em algum momento; documentado aqui pra não se perder de vista.

## Tipografia

| Grupo | Família | Tamanho | Peso | Uso |
|---|---|---|---|---|
| Display (hero) | Poppins | 36px | 700 | Nome "Bruno Kobi" na Home, títulos de página. |
| Heading (section) | Poppins | 24px | 700 | Títulos de seção — sempre com glow `glow-brand`. |
| Heading (subsection) | Poppins | 18px | 600 | Títulos de card/post. |
| Text (body) | Poppins | 15px / 27px | 400 | Parágrafo corrido (line-height solto pros posts longos). |
| Text (caption) | Poppins | 12px | 400 | Datas, tags, letra pequena. |
| Terminal (hud-label) | monospace | 11px | 400, uppercase, `letter-spacing: 0.06em` | Botões de toggle (dia/noite, vento, giro), contador de visitas, labels de pin no globo. |

## Espaçamento e raio

Escala padrão do Chakra (base 4px). Passos realmente usados: **8, 12, 16, 20,
24, 32px**. Não introduzir valor fora da escala (ex: 15px, 18px).

Raio: `radius-full` (pill) é o idioma **dominante** — badges, pills, avatares,
botões circulares. `radius-md` (8px) pra cards/código. `radius-sm` (4px) só
pra hover de elementos inline pequenos. Cantos quadrados praticamente não
aparecem no sistema.

## Glow (sombra)

| Token | Valor | Uso |
|---|---|---|
| `glow-brand` | `0 0 10px #42c920` | Glow de assinatura sob headings e ícones de nav ativos. |
| `glow-terminal` | `0 0 7px #00ff41` | Glow sob elementos HUD terminal-green. |

## Iconografia

`react-icons`, misturando famílias livremente (`fa`, `bs`, `ai`, `md`, `ri`,
`bi`, `io` — não é um único icon set). `RiAliensFill` e um avatar alien
flutuante são o motivo "mascote" recorrente — usar pra algo lúdico/sci-fi,
nunca como decoração genérica. Bandeiras do seletor de idioma são imagens PNG
reais, não ícone de fonte. Não existe logo/wordmark — o nome é sempre
tipografia pura (Poppins).

## Layout

Páginas full-viewport (Home, Sobre, Projetos, Blog Dev) são uma coluna `Flex`
rolável, com scrollbar customizada fina na cor `brand`, conteúdo centralizado
com até 700px no desktop, e um botão "voltar ao topo" fixo flutuante no
canto inferior direito. Nav inferior fixa em toda rota exceto Notícias; o
seletor de idioma fica na ponta direita dela.

## Componentes

- **Badge**: pill (`radius-full`), fundo `brand-fill`, borda
  `brand-border-strong`, texto `brand` em `hud-label`. Não existe variante
  sólida/preenchida — todo badge do sistema é outline + fill translúcido.
- **Card**: repouso = `surface-raised` + `brand-border` + `radius-lg`. Hover =
  borda vira `brand` sólido + `glow-brand`. Esse par (borda + glow) é o
  padrão de "isso é clicável" em todo o site.
- **HudLabel**: label monospace maiúsculo pros toggles (dia/noite, vento,
  giro) e pro contador de visitas. Sem fundo, sem borda no botão; divisor
  vertical de 1px `brand-border` entre toggles numa mesma barra.
- **NavItem**: ícone + label. Ativo = cor `brand`, `drop-shadow` de 8px na
  cor `brand`, `scale(1.1)`. Label some abaixo do breakpoint `md`.

---

Também existe como [Design System](https://claude.ai/artifact/NtMnBHTHEmvuDqoBDQFPKi)
navegável (tokens + previews ao vivo dos componentes acima).
