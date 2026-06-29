# 🛸 Bruno Kobi — Full Stack Developer & AI Systems Engineer

> **"Não é um portfólio. É um ecossistema digital inteligente em produção."**

![Portfolio](portifolio.png)

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20em%20Produção-brightgreen?style=for-the-badge&logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/Testes-62%20passando-brightgreen?style=for-the-badge&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript_strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion_11-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase_pgvector-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/n8n-FF6D00?style=for-the-badge&logo=n8n&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain_RAG-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/ArcGIS-FF2D20?style=for-the-badge&logo=esri&logoColor=white" />
</p>

<p align="center">
  <a href="https://brunokobi.netlify.app" target="_blank"><strong>🌐 Ver ao vivo</strong></a> ·
  <a href="https://www.linkedin.com/in/brunokobi/" target="_blank">LinkedIn</a> ·
  <a href="https://github.com/brunokobi" target="_blank">GitHub</a>
</p>

---

## 🌌 O que é este projeto?

A maioria dos portfólios é uma página estática com foto e lista de habilidades. Este é diferente.

Este portfólio foi construído como uma **plataforma de software completa**, integrando tecnologias de produção reais: banco de dados com Row Level Security, automação event-driven com IA, assistente virtual **Multi-Agente + RAG** hospedado em AWS EC2, mapa 3D geoespacial, feed de notícias em tempo real de **52 fontes globais** com scoring inteligente, tradução automática, clima via GPS, internacionalização em 9 idiomas e acessibilidade com síntese de voz.

Cada feature foi pensada para demonstrar **profundidade técnica real** — não apenas que sei usar uma tecnologia, mas que sei arquitetá-la, integrá-la e colocá-la em produção.

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│              Browser (React 18 + Vite 5)                │
│  i18n · WeatherBar · NewsPanel · ArcGIS · TextToSpeech  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS
      ┌────────────┼────────────────┐
      │            │                │
      ▼            ▼                ▼
Netlify Fn     Supabase (BaaS)   AWS EC2 (n8n self-hosted)
TypeScript     PostgreSQL + RLS  ┌──────────────────────┐
- Proxy RSS    JWT Auth          │  chatBruno           │
- CORS         Edge Functions    │  Multi-Agente + RAG  │
               │                 │  LangChain + Gemini  │
               Postgres Trigger  │  pgvector search     │
               │                 └──────────────────────┘
               n8n Webhook ──────────────────────────────┐
               │                                         │
               Google Gemini AI               Supabase pgvector
               │                              (base vetorial)
               Resend (Email)

Open-Meteo API (clima)
ipapi.co (geolocalização)
Google Translate API (tradução automática)
```

**Princípios adotados:** Clean Architecture · Event-Driven · Serverless First · BaaS · Modularização por domínio

---

## 🛠️ Stack Completa

| Camada          | Tecnologia                   | Uso                                                |
| --------------- | ---------------------------- | -------------------------------------------------- |
| Frontend        | React 18 + Hooks             | SPA com Context API                                |
| Build           | Vite 5                       | Dev server HMR instantâneo, bundle otimizado       |
| UI              | Chakra UI v2                 | Design system responsivo                           |
| Animação        | Framer Motion v11            | Transições e stagger animations                    |
| i18n            | React-Intl                   | 9 idiomas + auto-detect por IP                     |
| Voz             | Web Speech API               | Text-to-Speech nativo                              |
| Qualidade       | TypeScript strict + ESLint 9 | Zero erros, regras de pureza React, Prettier       |
| Testes          | Vitest + Playwright          | 62 testes unitários + E2E Chromium                 |
| Backend         | Supabase                     | PostgreSQL + Auth + RLS + Edge Functions           |
| Automação       | n8n (self-hosted, AWS EC2)   | Workflows event-driven + orquestração Multi-Agente |
| IA — LLM        | Google Gemini 2.5 Flash Lite | chatBruno + análise de contato                     |
| IA — Embeddings | Google Gemini Embedding 001  | Vetorização base de conhecimento (768 dim)         |
| RAG Pipeline    | LangChain Tools (via n8n)    | Busca semântica autônoma por agente                |
| Banco Vetorial  | Supabase pgvector (ivfflat)  | Similaridade cosseno em 22 chunks                  |
| Email           | Resend                       | Transacional                                       |
| Infra           | AWS EC2                      | Hospedagem self-hosted do n8n                      |
| Deploy          | Netlify                      | CI/CD + Serverless Functions                       |
| GIS             | ESRI ArcGIS                  | Mapas 3D interativos                               |
| Clima           | Open-Meteo                   | API gratuita, sem chave                            |
| Geoloc.         | ipapi.co                     | IP → país/cidade/coords                            |

---

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com)
- Conta no [Netlify](https://netlify.com) (para as functions)
- Chave de API do [ESRI ArcGIS](https://developers.arcgis.com)

### Instalação

```bash
git clone https://github.com/brunokobi/projeto-portifolio.git
cd projeto-portifolio
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz (veja `.env.example` para referência completa):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_ESRI_API_KEY=AAPTxy8BH...
VITE_HUGGING_FACE_API_KEY=hf_xxxx
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/contato
```

### Comandos

```bash
npm start          # Desenvolvimento (Vite dev server, porta 3000)
npm run build      # Build de produção (saída em /dist)
npm run preview    # Pré-visualizar build de produção localmente
npm test           # Testes em modo watch
npm run test:run   # Testes CI (execução única)
npm run coverage   # Cobertura de testes (relatório HTML)
npx playwright test  # Testes E2E (requer Playwright instalado)
```

> Para testar as Netlify Functions localmente, use `netlify dev` no lugar de `npm start`.

---

## 🤖 Feature: chatBruno — Assistente Virtual Multi-Agente com RAG

> **Complexidade:** ⭐⭐⭐⭐⭐ — Multi-Agent Architecture + RAG Pipeline + pgvector + LangChain Tools + AWS EC2 Self-Hosted

Assistente virtual que demonstra arquitetura de IA de produção: **8 agentes especializados** orquestrados por um Agente Roteador, base de conhecimento vetorial em **Supabase pgvector** e interface de chat nativa do n8n — zero frontend customizado.

### Por que Multi-Agente + RAG?

| Abordagem                 | Limitação                                                                    |
| ------------------------- | ---------------------------------------------------------------------------- |
| System prompt estático    | Contexto fixo, sem atualização dinâmica, tokens desperdiçados                |
| Agente único com RAG      | Responde tudo sem especialização por domínio                                 |
| **Multi-Agente + RAG** ✅ | Cada agente busca autonomamente apenas o contexto relevante para seu domínio |

### Fluxo completo

```
Usuário
  → n8n Chat UI (frontend nativo via URL pública do workflow — zero config)
  → Agente Roteador (Gemini 2.5 Flash Lite) classifica intenção
  → Switch → 7 rotas: PERFIL | SKILLS | EXPERIENCIA | EDUCACAO | PROJETOS | CONTATO | GERAL
  → Agente Especialista aciona Tool "buscar_conhecimento_bruno"
  → Supabase pgvector vetoriza query + busca semântica por cosseno
  → 5 chunks mais relevantes injetados como contexto
  → Resposta contextualizada + memória de sessão (Window Buffer, 10 trocas)
```

### Agentes Especializados (7 + Roteador)

| Agente         | Domínio                                              |
| -------------- | ---------------------------------------------------- |
| 🧑 Perfil      | História, filosofia, transição de carreira           |
| ⚙️ Skills      | Stack tecnológico completo                           |
| 💼 Experiência | Empresas, cargos, períodos, responsabilidades        |
| 🎓 Educação    | Formação, mestrado em computação aplicada, pesquisas |
| 🚀 Projetos    | Portfólio, detalhes técnicos, impacto                |
| 📬 Contato     | Links, e-mail, redes sociais                         |
| 🔄 Geral       | Fallback para questões transversais                  |

### Base de Conhecimento Vetorial

22 chunks semânticos (identidade, skills, 5 experiências, 6 projetos, 5 formações, certificações, contato) — vetorizados com `gemini-embedding-001` (768 dimensões) e indexados com `ivfflat` para busca eficiente por cosseno.

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(768),
  match_count     INT DEFAULT 5
) RETURNS TABLE (id BIGINT, content TEXT, metadata JSONB, similarity FLOAT) AS $$
  SELECT id, content, metadata,
         1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql;
```

### Infraestrutura

- **AWS EC2 (self-hosted)** — controle total, sem limites de plano SaaS
- **Keep-alive automático** — n8n Schedule a cada 3 dias previne congelamento do Supabase Free Tier

---

## 📰 Feature: Painel de Notícias de IA em Tempo Real

> **Complexidade:** ⭐⭐⭐⭐⭐ — CORS proxy serverless + RSS multi-formato + scoring tiered + hero carousel + tradução automática com prioridade + anti-spam

Um painel completo que agrega **52 feeds RSS** de fontes globais de IA (incluindo OpenAI, Anthropic, DeepMind, NVIDIA), com sistema de pontuação por relevância, filtro de artigos anteriores a 2025, tradução automática para português e carrossel principal com seleção das melhores notícias do momento.

### Fluxo completo

```
Browser
  → /.netlify/functions/news?url=<encoded_feed_url>
  → Netlify Function busca XML com User-Agent e timeout 8s
  → Retorna XML com headers CORS + Cache-Control 5min
Browser
  → parseRSS() — extrai título, link, data, imagem (RSS 2.0 / Atom / Media RSS)
  → cleanDesc() — remove boilerplate legal com regex patterns
  → Pré-score heroScore() — identifica candidatos ao carrossel antes da tradução
  → translateArticles(raw, heroLinkSet)
      · Candidatos do hero entram no 1º lote (título + desc traduzidos)
      · Demais artigos não-BR: até 80 por ciclo (batches de 5)
      · sl=auto — detecta inglês, chinês, japonês etc.
  → scoreArticle() — pontua todos os artigos
  → isTooOld() — rejeita artigos anteriores a 2025-01-01
  → isSpam() — filtra promoções e eletrônicos de consumo
  → isRelevant() — fontes mistas exigem keyword de IA/dev
  → heroSlides: artigos < 7 dias, ordenados por heroScore()
  → sorted: todos filtrados, por importância ou data (escolha do usuário)
  → Cache in-memory por 5 minutos
```

### Sistema de scoring do carrossel (heroScore)

O hero carousel usa um scoring independente, focado em **recência + impacto**, com bônus tiered por fonte e keywords com cap para evitar inflação artificial:

```typescript
// Bônus por fonte — labs primários lideram
const HERO_SOURCE_BONUS = {
  Anthropic: 32, OpenAI: 32,       // primários
  DeepMind: 28,  "Google Res.": 24, "NVIDIA Blog": 22,  // grandes players
  "MIT Tech Rev": 18, HuggingFace: 16, TechCrunch: 13,  // jornalismo especializado
};

function heroScore(article) {
  let s = HERO_SOURCE_BONUS[source] ?? SOURCE_PRESTIGE[source] ?? 3;

  // Keywords de lançamento (cap 2 = máx +44)
  // "launch", "release", "gpt-5", "claude 4", "gemini 2"...
  s += launchKeywords (até 2 matches × +22);

  // Spotlight empresa/modelo (cap 2 = máx +28)
  // "openai", "anthropic", "deepseek", "grok", "nvidia"...
  s += spotlightKeywords (até 2 matches × +14);

  // Recência dominante — breaking news sempre vence
  const h = horasDesdePublicação;
  s += h < 2 ? 55 : h < 6 ? 44 : h < 12 ? 33 : h < 24 ? 20 : h < 48 ? 8 : 0;

  if (article.desc?.length > 40) s += 4; // qualidade visual no slide
  return s;
}

// Exemplo: OpenAI anuncia GPT-5, publicado há 1h
// 32 (base) + 22 (launch) + 22 (gpt-5) + 14 (openai) + 14 (gpt) + 55 (< 2h) + 4 = 163 pts
```

### Filtro de relevância por fonte

Fontes mistas (Tecnoblog, NeoFeed, SCMP, ETH Zurich etc.) só exibem artigos que contenham ao menos uma keyword de IA/dev: `inteligência artificial`, `machine learning`, `llm`, `openai`, `kubernetes`, `cibersegurança`...

### Netlify Function (proxy RSS)

```typescript
export const handler: Handler = async (event) => {
  const feedUrl = event.queryStringParameters?.url;
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/rss+xml, */*" },
    signal: AbortSignal.timeout(8000),
  });
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
    body: await res.text(),
  };
};
```

### Fontes ativas (52)

**Brasil 🇧🇷** — SWEN.AI · AINEWS · Exame IA · NeoFeed · Tecnoblog · Olhar Digital · TabNews · Manual Usuário · MIT Tech BR · Brazil Journal

**Labs primários 🌎** — OpenAI · Anthropic · DeepMind · Google Research · NVIDIA Blog

**Pesquisa 🔬** — MIT News · MIT Tech Rev · BAIR · The Gradient · IEEE Spectrum · IEEE TV AI · arXiv cs.AI · Apple ML · Stanford AI · ScienceDaily · ETH Zurich · TUM

**Indústria 🌎** — The Verge · TechCrunch · Wired AI · AI News · AI Insider · AI Weekly · MarkTechPost · AWS ML · Reuters Inst. Oxford

**Modelos & Tools** — HuggingFace · KDnuggets · fast.ai · TensorFlow · Towards AI · LangChain

**Ásia & China 🌏** — AI Singapore · RIKEN AIP · Synced · ChinAI Newsletter · SCMP Tech

**Engenharia 💻** — Pragmatic Eng. · Martin Fowler · Netflix Tech · n8n Blog · Supabase

---

## ⚡ Feature: Pipeline Event-Driven — Contato com Automação IA

> **Complexidade:** ⭐⭐⭐⭐⭐ — SQL Trigger → n8n → Gemini → Resend, sem polling

Quando um visitante envia uma mensagem pelo formulário de contato, um **Postgres Trigger** dispara automaticamente um webhook no n8n. O workflow classifica a mensagem com Gemini, gera uma resposta personalizada e envia o e-mail transacional via Resend — tudo sem polling, sem cron job, sem intervenção manual.

```
Formulário (React)
  → Supabase INSERT (tabela contatos, RLS ativo)
  → Postgres Trigger dispara webhook n8n
  → n8n Workflow:
      1. Recebe payload com nome, e-mail, mensagem
      2. Gemini analisa intenção e tom da mensagem
      3. Gera resposta contextualizada em PT-BR
      4. Resend envia e-mail transacional com resposta
```

### Por que Event-Driven e não polling?

| Abordagem    | Custo                            | Latência  |
| ------------ | -------------------------------- | --------- |
| Polling      | Requisições constantes, CPU wake | Alta      |
| **Trigger** ✅ | Zero overhead quando inativo   | Imediata  |

---

## 🌍 Feature: Mapa 3D Geoespacial (ESRI ArcGIS)

> **Complexidade:** ⭐⭐⭐⭐ — ArcGIS API + lazy loading + WebGL 3D + fotos próprias nos marcadores

Módulo de mapa com a **ESRI ArcGIS Maps SDK** em WebGL:

- Terreno 3D interativo com globo animado e nuvens (NASA textures)
- Marcadores customizados com **fotos próprias** nos pontos turísticos
- Geolocalização dinâmica do usuário
- Lazy loading via `React.lazy` — zero impacto no bundle inicial

---

## 🌤️ Feature: Clima em Tempo Real com Fallback GPS → IP

> **Complexidade:** ⭐⭐⭐⭐ — Dual-source geolocation + Open-Meteo API + 22 códigos WMO

```
1ª tentativa: navigator.geolocation (GPS do browser) → precisão de metros
Fallback:      ipapi.co (IP geolocation) → precisão de 1–10 km, sem permissão
```

Coordenadas enviadas à **Open-Meteo API** — gratuita, sem chave de API. 22 condições WMO mapeadas para ícones e descrições em português.

---

## 🧪 Feature: Testes Automatizados + CI/CD

> **Complexidade:** ⭐⭐⭐⭐ — 62 testes Vitest + Playwright E2E + GitHub Actions + Lighthouse CI

### Suítes de teste (62 testes unitários)

| Suite                  | O que cobre                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `ErrorBoundary`        | Render normal, captura de erro, botão de retry, reset de estado                          |
| `LanguageContext`      | Locale padrão, leitura do localStorage, `setLanguage`, persistência, erro fora do Provider |
| `useTypewriter`        | Digitação com fake timers, múltiplas strings, array vazio                                |
| `useInView`            | IntersectionObserver mock, threshold padrão/customizado, disconnect após intersecção     |
| `newsFunctions`        | `isSpam`, `isRelevant`, `scoreArticle`, `isTooOld`, `importanceLevel`                    |
| `utils/rss`            | `timeAgo`, `cleanDesc`, `parseRSS` (RSS 2.0, Atom, inválido), `translationCache`        |
| `utils/geoip`          | Fetch com cache, erro retorna `{}`, reutilização de promise                              |
| `WeatherBar`           | Fetch pendente, temperatura, cidade, erro, WMO 63 (chuva), `temperature_2m` ausente     |
| `ContactForm`          | 3 campos, submit, toast de erro, prop `onClose`, heading UPLINK                         |

### E2E com Playwright

```bash
npx playwright test   # 5 testes Chromium
```

| Teste                         | Verifica                                           |
| ----------------------------- | -------------------------------------------------- |
| Carrega sem erros críticos    | Zero JS errors no `pageerror`                      |
| Nav de navegação visível      | `<nav>` principal presente e visível               |
| `/about` renderiza conteúdo   | body.textContent > 50 chars após Suspense resolver |
| `/projects` renderiza conteúdo| body.textContent > 50 chars                        |
| Rota inexistente não quebra   | App ainda renderiza a nav (React Router SPA)       |

### CI/CD — GitHub Actions

A cada push ou Pull Request para `main`:

1. `npx tsc --noEmit` — TypeScript sem erros
2. `npm run lint` — ESLint 9 zero erros
3. `vitest run` — 62 testes unitários
4. `vite build` — bundle de produção sem quebrar
5. `playwright test` — 5 testes E2E Chromium
6. Lighthouse CI — audita performance, a11y e SEO em produção

---

## 🌐 Feature: Internacionalização com Detecção Automática por IP

> **Complexidade:** ⭐⭐⭐ — Geolocalização por IP + mapeamento país→idioma + Context API sem reload

Na primeira visita, o site já aparece **no idioma correto** para o país de origem do visitante. A troca de idioma ocorre via **React Context** — sem `window.location.reload()`, apenas um re-render imediato.

### Idiomas suportados (9)

| Idioma    | Código | Cobertura                                    |
| --------- | ------ | -------------------------------------------- |
| Português | `pt`   | Brasil, Portugal                             |
| Inglês    | `en`   | EUA, UK, Austrália, Canadá + outros          |
| Espanhol  | `es`   | 17 países                                    |
| Francês   | `fr`   | França, Bélgica, Suíça + outros              |
| Alemão    | `de`   | Alemanha, Áustria                            |
| Chinês    | `zh`   | China, Taiwan, HK, Macau, Singapura          |
| Russo     | `ru`   | Rússia, Bielorrússia, Cazaquistão            |
| Árabe     | `ar`   | 14 países do Oriente Médio e Norte da África |
| Klingon   | `kl`   | 🖖                                           |

---

## 📊 Feature: Contador de Visitas Atômico

> **Complexidade:** ⭐⭐⭐ — Supabase RPC atômica + visual de placa enferrujada + Text-to-Speech

Contador persistido em PostgreSQL com incremento via **RPC atômica** — sem race conditions entre visitantes simultâneos. Visual de placar industrial com ferrugem, rebites, dígitos em verde matrix e scanlines em CSS puro.

```sql
create or replace function increment_views()
returns bigint language sql as $$
  update page_views set count = count + 1 where id = 1
  returning count;
$$;
```

---

## ♿ Feature: Acessibilidade com Síntese de Voz

> **Complexidade:** ⭐⭐ — Web Speech API nativa, zero dependências

Text-to-Speech via **Web Speech API** — hover em qualquer texto lê o conteúdo em voz alta no idioma selecionado. Atributos ARIA em todos os elementos interativos (`aria-label`, `aria-pressed`, `aria-live` no carrossel).

---

## 📱 Responsividade Mobile

> **Complexidade:** ⭐⭐ — Breakpoints Chakra UI + layouts adaptativos por componente

| Componente                | Ajuste                                               |
| ------------------------- | ---------------------------------------------------- |
| Carrossel hero (News)     | Imagem como fundo com overlay — sem overflow         |
| Categorias de notícias    | Layout compacto com scroll horizontal drag-to-scroll |
| Carrossel de certificados | CSS nativo com dots e botões anterior/próximo        |
| ProjectCard               | Largura fluida `95vw`, tags com `wrap` automático    |
| Modal de Contato          | `size="full"` + `scrollBehavior="inside"`            |
| Menu de navegação         | Scroll horizontal sem scrollbar visível              |

---

## 🔐 Segurança

| Camada         | Mecanismo                                                 |
| -------------- | --------------------------------------------------------- |
| Banco de dados | Row Level Security (RLS) no Supabase                      |
| Autenticação   | JWT via Supabase Auth                                     |
| Segredos       | Variáveis `VITE_*` — nunca expostas no bundle de produção |
| CORS           | Controlado pelas Netlify Functions                        |
| Error handling | ErrorBoundary global com tela de recuperação em PT        |

---

## 🧬 Diferenciais que fazem diferença

| Feature                         | Por que impressiona                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| 🤖 chatBruno Multi-Agente + RAG | 8 agentes + pgvector + LangChain Tools + n8n + AWS EC2 em produção real               |
| 📰 52 RSS Feeds + heroScore     | Proxy serverless + scoring tiered por fonte + keywords com cap + recência dominante   |
| ⚡ Pipeline Event-Driven        | SQL Trigger → n8n → Gemini → Email, zero polling, latência imediata                  |
| 🌐 9 idiomas + auto-detect      | Cobre 50+ países, troca sem reload via Context API                                    |
| 🗺️ Mapa 3D WebGL               | ArcGIS em produção com lazy loading e marcadores customizados                         |
| 🌤️ Clima GPS → IP fallback     | Máxima precisão sem degradar UX                                                       |
| 🧪 62 testes + E2E              | Vitest + Playwright + CI/CD GitHub Actions + Lighthouse CI                            |
| 🔷 TypeScript strict            | `strict: true` — zero erros em 22 arquivos, tipos precisos end-to-end                 |
| 🔒 RLS + JWT                    | Segurança no nível do banco, não só da aplicação                                      |
| ⚛️ RPC atômica                  | Contador sem race conditions entre visitantes simultâneos                             |
| ♿ Text-to-Speech               | Zero dependências, Web API nativa, ARIA completo                                      |

---

## 📈 Roadmap

- [x] Filtros interativos por categoria no painel de notícias
- [x] Carrossel principal com scoring tiered (heroScore refatorado)
- [x] Filtro de relevância por fonte (MIXED_SOURCES + AI_DEV_KEYWORDS)
- [x] Feed Anthropic adicionado (52 fontes)
- [x] Filtro de artigos anteriores a 2025 em todas as seções
- [x] Tradução com prioridade para candidatos do hero (título + desc)
- [x] TypeScript `strict: true` — 108 erros corrigidos em 22 arquivos
- [x] chatBruno — Multi-Agente + RAG (n8n + LangChain + pgvector + Gemini + AWS EC2)
- [x] Refactoring News/index.tsx: 1317 → ~250 linhas (HeroCarousel, CategorySection, newsConstants, newsFunctions)
- [x] 62 testes automatizados — Vitest + Testing Library + Playwright E2E
- [x] CI/CD — GitHub Actions (tsc + lint + vitest + build + playwright + lighthouse)
- [x] ESLint 9 flat config + Prettier — zero erros, regras react-hooks/purity
- [x] Bundle otimizado — manualChunks: 753kB → 195kB
- [x] SEO: sitemap.xml + robots.txt + JSON-LD Schema.org Person
- [x] Acessibilidade: aria-pressed, aria-label, aria-live no carrossel
- [ ] Notificações push de breaking news (Service Worker + PWA)
- [ ] Dashboard de analytics com métricas de visitas
- [ ] Observabilidade com Sentry
- [ ] Migração esri-loader → @arcgis/map-components

---

## 🛸 Sobre Bruno Kobi

Full Stack Developer & AI Systems Engineer especializado em transformar complexidade técnica em produtos que funcionam em produção.

Não apenas sei usar as ferramentas — sei **quando usá-las, como integrá-las e o que acontece quando algo falha**.

🔗 [brunokobi.netlify.app](https://brunokobi.netlify.app) · [LinkedIn](https://www.linkedin.com/in/brunokobi/) · [GitHub](https://github.com/brunokobi)
