# 🛸 Bruno Kobi — Full Stack Developer & AI Systems Engineer

> **"Não é um portfólio. É um ecossistema digital inteligente em produção."**

![Portfolio](portifolio.png)

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20em%20Produção-brightgreen?style=for-the-badge&logo=netlify&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/n8n-FF6D00?style=for-the-badge&logo=n8n&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
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

Este portfólio foi construído como uma **plataforma de software completa**, integrando tecnologias de produção reais: banco de dados com Row Level Security, automação orientada a eventos com IA, mapa 3D geoespacial, feed de notícias em tempo real de 20 fontes globais, tradução automática, clima via GPS, internacionalização em 9 idiomas e acessibilidade com síntese de voz.

Cada feature foi pensada para demonstrar **profundidade técnica real** — não apenas que sei usar uma tecnologia, mas que sei arquitetá-la, integrá-la e colocá-la em produção.

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (React 18)                    │
│  i18n · WeatherBar · NewsPanel · ArcGIS · TextToSpeech  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
 Netlify Functions          Supabase (BaaS)
 (TypeScript/Deno)          PostgreSQL + RLS
 - Proxy RSS feeds          JWT Auth
 - CORS resolver            Edge Functions
        │                         │
        │                    Postgres Trigger
        │                         │
        │                    n8n Webhook
        │                         │
        │                    Google Gemini AI
        │                         │
        │                    Resend (Email)
        │
 Open-Meteo API (clima)
 ipapi.co (geolocalização)
 Google Translate API (tradução)
```

**Princípios adotados:** Clean Architecture · Event-Driven · Serverless First · BaaS · Modularização por domínio

---

## 🛠️ Stack Completa

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| Frontend | React 18 + Hooks | SPA com Context API |
| UI | Chakra UI | Design system responsivo |
| Animação | Framer Motion | Transições e stagger animations |
| i18n | React-Intl | 9 idiomas |
| Voz | Web Speech API | Text-to-Speech nativo |
| Backend | Supabase | PostgreSQL + Auth + RLS + Edge Functions |
| Automação | n8n (self-hosted) | Workflows event-driven |
| IA | Google Gemini AI | Análise e classificação de mensagens |
| Email | Resend | Transacional |
| Deploy | Netlify | CI/CD + Serverless Functions |
| GIS | ESRI ArcGIS | Mapas 3D interativos |
| Clima | Open-Meteo | API gratuita, sem chave |
| Geoloc. | ipapi.co | IP → país/cidade/coords |

---

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 18+
- Yarn
- Conta no [Supabase](https://supabase.com)
- Conta no [Netlify](https://netlify.com) (para as functions)
- Chave de API do [ESRI ArcGIS](https://developers.arcgis.com)

### Instalação

```bash
git clone https://github.com/brunokobi/projeto-portifolio.git
cd projeto-portifolio
yarn install
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# ESRI ArcGIS
REACT_APP_ESRI_API_KEY=AAPTxy8BH...

# n8n (webhook para o fluxo de contato)
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/contato

# Resend (email)
RESEND_API_KEY=re_xxxx
```

### Rodando

```bash
yarn start          # Desenvolvimento
yarn build          # Build de produção
```

> Para testar as Netlify Functions localmente instale `netlify-cli` e use `netlify dev` no lugar de `yarn start`.

---

## 📰 Feature: Painel de Notícias de IA em Tempo Real

> **Complexidade:** ⭐⭐⭐⭐⭐ — CORS proxy serverless + RSS parsing multi-formato + tradução automática sem chave + cache + animação escalonada

Este é um dos recursos tecnicamente mais densos do projeto. Um painel lateral (Drawer) que agrega **20 feeds RSS** de fontes globais de IA, traduz os títulos automaticamente para português e exibe thumbnails extraídos diretamente do XML dos feeds.

### Por que é complexo?

Feeds RSS não podem ser consumidos diretamente pelo browser por restrições de **CORS** — os servidores RSS não incluem os headers necessários. A solução foi criar uma **Netlify Function em TypeScript** que atua como proxy: o frontend chama `/.netlify/functions/news?url=<feed>`, a function busca o XML no servidor e o retorna com os headers corretos.

Além disso, feeds RSS possuem formatos diferentes (RSS 2.0, Atom, Media RSS) e guardam imagens em campos distintos: `media:thumbnail`, `media:content`, `enclosure` ou dentro do HTML da descrição. O parser foi escrito para cobrir todos os casos.

### Fluxo completo

```
Browser
  → /.netlify/functions/news?url=<encoded_feed_url>
  → Netlify Function busca XML do feed original
  → Retorna XML com headers CORS corretos
Browser
  → parseRSS() extrai: título, link, data, imagem
  → translateArticles() traduz títulos EN→PT via Google Translate (sem chave)
  → Ordena por data decrescente
  → Exibe com animação stagger (50ms de delay por item)
  → Cache in-memory por 5 minutos
```

### Como reproduzir — Netlify Function

Crie `netlify/functions/news.ts`:

```typescript
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url) return { statusCode: 400, body: "url param required" };

  const res = await fetch(decodeURIComponent(url));
  const xml = await res.text();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
      "Access-Control-Allow-Origin": "*",
    },
    body: xml,
  };
};

export { handler };
```

### Extração de imagens do RSS

```javascript
const img =
  getAttr("media\\:thumbnail, thumbnail", "url") ||   // Media RSS
  getAttr("media\\:content, content", "url") ||        // Media Content
  getAttr("enclosure[type^='image']", "url") ||        // Enclosure
  (() => {
    // Fallback: extrai <img src> do HTML da descrição
    const raw = getText("description") || getText("content\\:encoded");
    const match = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  })();
```

### Tradução automática sem chave de API

```javascript
async function translateTitle(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0]?.map((d) => d[0]).join("") || text;
}
```

> Esta endpoint pública do Google Translate não requer chave de API e suporta textos curtos — ideal para títulos de artigos.

### 20 fontes ativas

**Brasil 🇧🇷**

| Nome | Feed RSS |
|------|----------|
| SWEN.AI | `https://swen.ai/feed/` |
| AINEWS | `https://ainews.com.br/feed/` |
| Exame IA | `https://exame.com/inteligencia-artificial/feed/` |

**Mundo 🌎**

| Nome | Feed RSS |
|------|----------|
| AI Weekly | `https://aiweekly.co/issues.rss` |
| AI Insider | `https://theaiinsider.tech/feed` |
| MIT News AI | `https://news.mit.edu/rss/topic/artificial-intelligence` |
| AI News | `https://www.artificialintelligence-news.com/feed/` |
| The Verge AI | `https://www.theverge.com/ai-artificial-intelligence/rss/index.xml` |
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| Wired AI | `https://www.wired.com/feed/tag/artificial-intelligence/` |
| MIT Tech Review | `https://www.technologyreview.com/feed/` |
| Google Research | `https://research.google/blog/rss/` |
| BAIR (Berkeley) | `https://bair.berkeley.edu/blog/feed.xml` |
| MIRI | `https://intelligence.org/feed` |
| Meta Engineering | `https://engineering.fb.com/feed/` |
| Hugging Face | `https://huggingface.co/blog/feed.xml` |
| KDnuggets | `https://kdnuggets.com/feed` |
| arXiv cs.AI | `https://export.arxiv.org/rss/cs.AI` |
| The Gradient | `https://thegradient.pub/rss/` |
| IEEE Spectrum | `https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss` |
| Import AI | `https://jack-clark.net/feed` |
| Synced | `https://syncedreview.com/feed` |
| Analytics Vidhya | `https://www.analyticsvidhya.com/feed/` |

---

## 🌐 Feature: Internacionalização com Detecção Automática por IP

> **Complexidade:** ⭐⭐⭐ — Geolocalização por IP + mapeamento país→idioma + persistência de preferência

Na primeira visita, sem nenhuma interação do usuário, o site já aparece **no idioma correto** para o país de origem do visitante. Isso é feito em 3 passos:

### Como funciona

**1. Detecta o país pelo IP** (via `ipapi.co`):

```javascript
// src/utils/geoip.js — singleton para não chamar a API mais de uma vez
let _promise = null;
export const getGeoIP = () => {
  if (!_promise) {
    _promise = fetch("https://ipapi.co/json/").then(r => r.json()).catch(() => ({}));
  }
  return _promise;
};
```

**2. Mapeia país → idioma** (cobre mais de 50 países):

```javascript
const COUNTRY_TO_LANG = {
  BR: "pt", PT: "pt",
  US: "en", GB: "en", AU: "en", CA: "en",
  ES: "es", MX: "es", AR: "es", // + 14 países hispanófonos
  FR: "fr", BE: "fr", CH: "fr",
  DE: "de", AT: "de",
  CN: "zh", TW: "zh", HK: "zh",
  RU: "ru", BY: "ru",
  SA: "ar", AE: "ar", EG: "ar", // + 12 países árabes
};
```

**3. Salva no `localStorage`** — na segunda visita, a preferência é respeitada sem nova chamada à API.

### Idiomas suportados

| Idioma | Código | Cobertura |
|--------|--------|-----------|
| Português | `pt` | Brasil, Portugal |
| Inglês | `en` | EUA, UK, Austrália, Canadá + outros |
| Espanhol | `es` | 17 países |
| Francês | `fr` | França, Bélgica, Suíça + outros |
| Alemão | `de` | Alemanha, Áustria |
| Chinês | `zh` | China, Taiwan, HK, Macau, Singapura |
| Russo | `ru` | Rússia, Bielorrússia, Cazaquistão |
| Árabe | `ar` | 14 países do Oriente Médio e Norte da África |
| Klingon | `kl` | 🖖 |

---

## 🌤️ Feature: Clima em Tempo Real com Fallback GPS → IP

> **Complexidade:** ⭐⭐⭐⭐ — Dual-source geolocation + API meteorológica + mapeamento de 22 códigos WMO

O widget de clima exibido no canto superior direito usa uma estratégia de **dupla fonte de localização** para garantir a maior precisão possível:

### Hierarquia de precisão

```
1ª tentativa: navigator.geolocation (GPS do browser)
    → precisão de metros
    → requer permissão do usuário

Fallback: ipapi.co (IP geolocation)
    → precisão de 1–10 km (nível de cidade)
    → sem necessidade de permissão
```

### Fonte meteorológica

As coordenadas são enviadas à [Open-Meteo API](https://open-meteo.com/) — **completamente gratuita e sem necessidade de chave de API**:

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,weather_code
  &timezone=auto
```

### 22 condições meteorológicas mapeadas (padrão WMO)

Todos os códigos WMO (World Meteorological Organization) de 0 a 99 estão mapeados para ícones e descrições em português — de "☀️ Limpo" a "⛈️ Tempestade com granizo".

---

## 🛰️ Feature: Contato com Automação IA (Event-Driven)

> **Complexidade:** ⭐⭐⭐⭐⭐ — Trigger PostgreSQL → Edge Function → Webhook → n8n → Gemini AI → Email

O formulário de contato não apenas salva a mensagem — ela dispara um **pipeline completo de automação inteligente**:

### Fluxo detalhado

```
1. Usuário preenche o formulário e clica em "Iniciar Transmissão"
2. Frontend valida e chama supabase.from('contato').insert({...})
3. PostgreSQL persiste o registro com segurança (RLS ativo)
4. Trigger automático no banco ativa uma Edge Function (Deno)
5. Edge Function dispara webhook para o n8n
6. n8n orquestra o pipeline:
   a. Recebe os dados da mensagem
   b. Envia para Google Gemini AI para análise de sentimento e classificação
   c. IA retorna: categoria, urgência e resumo
   d. n8n formata e-mail personalizado com os insights da IA
   e. Resend entrega o e-mail ao destinatário
```

### Como reproduzir — Supabase

**Tabela `contato`:**

```sql
create table contato (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  mensagem text not null,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table contato enable row level security;

-- Permitir apenas insert anônimo
create policy "allow_insert" on contato for insert with check (true);
```

**Trigger que ativa o n8n:**

```sql
create or replace function notify_n8n()
returns trigger language plpgsql as $$
begin
  perform net.http_post(
    url := current_setting('app.n8n_webhook_url'),
    body := row_to_json(new)::text,
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return new;
end;
$$;

create trigger on_contato_insert
  after insert on contato
  for each row execute function notify_n8n();
```

---

## 📊 Feature: Contador de Visitas Atômico

> **Complexidade:** ⭐⭐⭐ — RPC PostgreSQL com incremento atômico + visual de placa enferrujada

O contador usa uma **função RPC no Supabase** para garantir que o incremento seja atômico, evitando race conditions com múltiplos visitantes simultâneos:

### Como reproduzir — Supabase

```sql
-- Tabela de contagem
create table page_views (
  id int primary key default 1,
  count bigint default 0,
  check (id = 1)  -- garante apenas uma linha
);

insert into page_views (id, count) values (1, 0);

-- Função RPC atômica
create or replace function increment_views()
returns bigint language sql as $$
  update page_views set count = count + 1 where id = 1
  returning count;
$$;
```

**Chamada no frontend:**

```javascript
const { data } = await supabase.rpc("increment_views");
setVisits(data); // retorna o novo total
```

---

## 🌍 Feature: Mapa 3D Geoespacial (ESRI ArcGIS)

> **Complexidade:** ⭐⭐⭐⭐ — ArcGIS API + lazy loading de módulos + WebGL 3D + fotos próprias nos marcadores

O módulo de mapa utiliza a **ESRI ArcGIS Maps SDK** carregada via `esri-loader` (lazy loading) para evitar impacto no bundle inicial. O mapa renderiza em WebGL com:

- Terreno 3D interativo
- Globo animado com nuvens (NASA textures)
- Marcadores customizados com **fotos próprias** nos pontos turísticos
- Geolocalização dinâmica do usuário

### Como reproduzir

1. Crie uma chave de API gratuita em [developers.arcgis.com](https://developers.arcgis.com)
2. Adicione `REACT_APP_ESRI_API_KEY=sua_chave` no `.env`
3. Instale: `yarn add esri-loader esri-loader-hooks`

---

## ♿ Feature: Acessibilidade com Síntese de Voz

O portfólio implementa Text-to-Speech nativo via **Web Speech API** do browser — sem dependências externas, sem custos. Ao passar o mouse sobre qualquer texto (títulos, descrições, habilidades), o conteúdo é lido em voz alta no idioma selecionado.

```javascript
// src/components/TextAudio/index.jsx
const falar = (texto) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  window.speechSynthesis.speak(utterance);
};
```

---

## 📱 Responsividade Mobile

Todas as páginas foram otimizadas para dispositivos móveis com breakpoints do Chakra UI:

| Componente | Ajuste |
|-----------|--------|
| ProjectCard | Largura fluida `95vw` no mobile, tags com `wrap` automático |
| Modal de Contato | `size="full"` no mobile + `scrollBehavior="inside"` |
| Menu de navegação | Scroll horizontal sem scrollbar visível |
| NewsPanel | Drawer full-width com scroll interno |

---

## 🔐 Segurança

| Camada | Mecanismo |
|--------|-----------|
| Banco de dados | Row Level Security (RLS) no Supabase |
| Autenticação | JWT via Supabase Auth |
| Inputs | Sanitização no frontend + validação no banco |
| Segredos | Variáveis de ambiente isoladas (nunca no bundle) |
| CORS | Controlado pelas Netlify Functions |

---

## 🧬 Diferenciais que fazem diferença

| Feature | Por que impressiona |
|---------|-------------------|
| 🔄 Pipeline Event-Driven | Trigger SQL → n8n → Gemini → Email, sem polling |
| 📰 20 RSS Feeds + tradução | CORS proxy serverless + parser multi-formato + Google Translate sem chave |
| 🌐 9 idiomas + auto-detect | Cobre 50+ países com detecção transparente por IP |
| 🌤️ Clima GPS → IP fallback | Máxima precisão sem degradar UX |
| 🗺️ Mapa 3D WebGL | ArcGIS em produção com lazy loading |
| ♿ Text-to-Speech | Zero dependências, Web API nativa |
| 🔒 RLS + JWT | Segurança no nível do banco, não só da aplicação |
| ⚛️ RPC atômica | Contador sem race conditions |

---

## 📈 Roadmap

- [ ] Filtros por categoria no NewsPanel (Brasil / Mundo / Pesquisa / Produto)
- [ ] Notificações push de breaking news (Service Worker)
- [ ] Dashboard de analytics com métricas de visitas
- [ ] CI/CD automatizado com testes
- [ ] Observabilidade com Sentry
- [ ] Deploy multi-região

---

## 🛸 Sobre Bruno Kobi

Full Stack Developer & AI Systems Engineer especializado em transformar complexidade técnica em produtos que funcionam em produção.

Não apenas sei usar as ferramentas — sei **quando usá-las, como integrá-las e o que acontece quando algo falha**.

🔗 [brunokobi.netlify.app](https://brunokobi.netlify.app) · [LinkedIn](https://www.linkedin.com/in/brunokobi/) · [GitHub](https://github.com/brunokobi)
