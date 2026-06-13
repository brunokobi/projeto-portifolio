# 🛸 Bruno Kobi | Full Stack Developer & AI Systems Engineer 🛸

![Portfolio](portifolio.png)

<p align="center">

  <!-- Status -->
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-green?style=for-the-badge&logo=rocket&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />

  <!-- Frontend -->
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" />

  <!-- Backend -->
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/n8n-FF6D00?style=for-the-badge&logo=n8n&logoColor=white" />
  <img src="https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />

  <!-- AI -->
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />

  <!-- GIS -->
  <img src="https://img.shields.io/badge/ArcGIS-FF2D20?style=for-the-badge&logo=esri&logoColor=white" />

  <!-- Arquitetura -->
  <img src="https://img.shields.io/badge/Architecture-Event--Driven-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Security-RLS%20Enabled-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Serverless-Edge%20Runtime-purple?style=for-the-badge" />

</p>

---

## 🌌 Visão Estratégica

Este portfólio foi projetado como um **ecossistema digital inteligente**, integrando:

- ⚡ Engenharia Full Stack
- 🌍 Geoprocessamento (GIS)
- 🤖 Inteligência Artificial Conversacional
- 📰 Feed de Notícias de IA em tempo real
- 🌐 Internacionalização com detecção automática por IP (9 idiomas)
- 🌤️ Clima em tempo real com precisão GPS
- 🔁 Arquitetura orientada a eventos
- ♿ Acessibilidade extrema

Não é apenas uma interface visual — é uma demonstração prática de arquitetura moderna em produção.

---

## 🧠 Arquitetura de Alto Nível

Princípios adotados:

- Clean Architecture
- Event-Driven Design
- Backend-as-a-Service
- Serverless First
- Modularização por Domínio

```
Client (React 18)
   ↓
Supabase (Auth + PostgreSQL + Edge Functions)
   ↓
Postgres Trigger
   ↓
Webhook
   ↓
n8n (Orquestração)
   ↓
Google Gemini AI
   ↓
Resend (Email)
```

---

## 🛠️ Stack Tecnológica

### 🎨 Frontend

- React 18 (Hooks + Context API)
- Chakra UI (Design System acessível)
- Framer Motion (Animações fluidas)
- React-Intl (9 idiomas: PT, EN, ES, FR, DE, ZH, RU, AR, KL)
- Web Speech API (Text-to-Speech)
- Lazy Loading + Code Splitting

### 🧠 Backend & Infraestrutura

**Supabase** — PostgreSQL · JWT Authentication · Row Level Security (RLS) · Edge Functions (Deno Runtime) · Triggers automatizados

**n8n** — Workflows assíncronos · Integração com APIs externas · Orquestração desacoplada do frontend · Pipeline inteligente

**Netlify** — Deploy contínuo · Serverless Functions (TypeScript) · Proxy de feeds RSS

**Inteligência Artificial** — Google Gemini AI · Análise de sentimento · Classificação automática de mensagens · Respostas inteligentes · Fallback para atendimento humano

---

## 📰 Módulo de Notícias de IA (NewsPanel)

Painel lateral em tempo real que agrega **20 feeds RSS** de fontes globais de IA, com tradução automática para português, thumbnails extraídos dos feeds e animação de entrada bottom-to-top.

### Como funciona

1. O frontend solicita os feeds via `/.netlify/functions/news` (proxy serverless em TypeScript)
2. O proxy busca e retorna o XML de cada feed contornando restrições de CORS
3. O `parseRSS` extrai título, link, data e imagem (`media:thumbnail`, `media:content`, `enclosure` ou `<img>` na descrição)
4. Títulos em inglês são traduzidos automaticamente via Google Translate API (sem chave)
5. Os artigos são ordenados por data e exibidos com animação escalonada (stagger 50ms)
6. Cache in-memory de 5 minutos evita refetch desnecessário

### Fontes — Brasil 🇧🇷

| Nome | URL |
|------|-----|
| SWEN.AI | https://swen.ai/feed/ |
| AINEWS | https://ainews.com.br/feed/ |
| Exame IA | https://exame.com/inteligencia-artificial/feed/ |

### Fontes — Mundo 🌎

| Nome | URL |
|------|-----|
| AI Weekly | https://aiweekly.co/issues.rss |
| AI Insider | https://theaiinsider.tech/feed |
| MIT News AI | https://news.mit.edu/rss/topic/artificial-intelligence |
| AI News | https://www.artificialintelligence-news.com/feed/ |
| The Verge AI | https://www.theverge.com/ai-artificial-intelligence/rss/index.xml |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| Wired AI | https://www.wired.com/feed/tag/artificial-intelligence/ |
| MIT Tech Review | https://www.technologyreview.com/feed/ |
| Google Research | https://research.google/blog/rss/ |
| BAIR (Berkeley) | https://bair.berkeley.edu/blog/feed.xml |
| MIRI | https://intelligence.org/feed |
| Meta Engineering | https://engineering.fb.com/feed/ |
| Hugging Face Blog | https://huggingface.co/blog/feed.xml |
| KDnuggets | https://kdnuggets.com/feed |
| arXiv cs.AI | https://export.arxiv.org/rss/cs.AI |
| The Gradient | https://thegradient.pub/rss/ |
| IEEE Spectrum AI | https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss |
| Import AI | https://jack-clark.net/feed |
| Synced | https://syncedreview.com/feed |
| Analytics Vidhya | https://www.analyticsvidhya.com/feed/ |

---

## 🌐 Internacionalização com Detecção Automática de Idioma

O portfólio suporta **9 idiomas** com troca automática baseada na localização geográfica do visitante.

### Como funciona

1. Na primeira visita (sem preferência salva), o sistema consulta `ipapi.co` para obter o **código do país** do IP do visitante
2. Um mapeamento interno converte o país para o idioma correspondente (ex: `BR` → `pt`, `DE` → `de`, `SA` → `ar`)
3. O idioma é salvo no `localStorage` — nas visitas seguintes, a preferência do usuário é sempre respeitada
4. O visitante pode trocar o idioma manualmente a qualquer momento pelo seletor de bandeiras no menu

### Idiomas suportados e cobertura geográfica

| Idioma | Código | Países cobertos |
|--------|--------|-----------------|
| Português | `pt` | Brasil, Portugal |
| Inglês | `en` | EUA, Reino Unido, Austrália, Canadá, Nova Zelândia, Irlanda, África do Sul + outros |
| Espanhol | `es` | Espanha, México, Argentina, Chile, Colômbia, Peru, Venezuela + 14 países |
| Francês | `fr` | França, Bélgica, Suíça, Luxemburgo, Mônaco, Senegal, Costa do Marfim |
| Alemão | `de` | Alemanha, Áustria |
| Chinês | `zh` | China, Taiwan, Hong Kong, Macau, Singapura |
| Russo | `ru` | Rússia, Bielorrússia, Cazaquistão |
| Árabe | `ar` | Arábia Saudita, EAU, Egito, Marrocos, Argélia + 12 países |
| Klingon | `kl` | Galáxia inteira 🖖 |

---

## 🌤️ Barra de Clima em Tempo Real (WeatherBar)

Widget fixo no canto superior direito que exibe as **condições climáticas atuais** do visitante com máxima precisão.

### Como funciona

1. **Prioridade 1 — GPS do navegador**: solicita `navigator.geolocation` para obter coordenadas exatas (precisão de metros)
2. **Fallback — IP Geolocation**: se o usuário negar permissão ou o browser não suportar, usa `ipapi.co` para obter latitude/longitude aproximada pela rede
3. As coordenadas são enviadas à **Open-Meteo API** (gratuita, sem chave) para buscar temperatura e código de condição meteorológica em tempo real
4. O nome da cidade é exibido junto à temperatura quando disponível

### Dados exibidos

- 🌡️ Temperatura atual em °C (arredondada)
- Ícone da condição meteorológica (22 códigos WMO mapeados)
- Nome da cidade e país
- Descrição textual da condição (ex: "Chuva leve", "Tempestade")

### Precisão

| Fonte | Precisão da localização |
|-------|------------------------|
| GPS do navegador | Metros (alta precisão) |
| IP via ipapi.co | Cidade (precisão de ~1–10 km) |

---

## 🌍 Módulo Geoespacial (GIS)

- ESRI ArcGIS API
- Mapas 3D interativos com pontos turísticos globais
- Geolocalização dinâmica
- Fotos locais nos marcadores (imagens próprias do autor)
- Visualização espacial estratégica

---

## 🛰️ Fluxo de Comunicação (Uplink)

1. Validação e envio via Supabase SDK
2. Persistência na tabela `contato`
3. Trigger PostgreSQL ativa Edge Function
4. Webhook dispara fluxo no n8n
5. IA classifica mensagem
6. Notificação via Resend

---

## 📱 Responsividade Mobile

Todas as páginas foram otimizadas para dispositivos móveis:

- **Página de Projetos** — cards com largura fluida (`95vw` no mobile), tags com wrap automático
- **Modal de Contato** — `scrollBehavior="inside"`, tamanho full-screen no mobile
- **Menu de navegação** — scroll horizontal suave em telas pequenas
- **NewsPanel** — drawer full-width no mobile com scroll interno

---

## 🔐 Segurança

- JWT Authentication
- Row Level Security (RLS)
- Sanitização de inputs
- Rate limiting
- Variáveis de ambiente isoladas

---

## ⚙️ Execução Local

```bash
git clone https://github.com/brunokobi/projeto-portifolio.git
yarn install
cp .env.example .env.local
yarn start
```

---

## 🌐 Variáveis de Ambiente

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_ESRI_API_KEY=
N8N_WEBHOOK_URL=
GOOGLE_AI_KEY=
RESEND_API_KEY=
```

---

## 📈 Roadmap

- Sistema de fila inteligente com IA
- Dashboard administrativo
- Observabilidade (Sentry / OpenTelemetry)
- CI/CD automatizado
- Deploy multi-região
- Filtro por categoria no NewsPanel
- Notificações push de breaking news

---

## 🧬 Diferenciais Técnicos

✔ Arquitetura orientada a eventos  
✔ Serverless real (Netlify Functions)  
✔ Integração IA + Automação  
✔ Geoprocessamento 3D  
✔ Sistema multilíngue (9 idiomas + detecção automática por IP)  
✔ Clima em tempo real com fallback GPS → IP (Open-Meteo API)  
✔ Acessibilidade com síntese de voz  
✔ Feed de notícias de IA em tempo real com 20 fontes globais  
✔ Tradução automática de títulos (EN → PT-BR)  
✔ Thumbnails dinâmicos extraídos dos feeds RSS  

---

## 🛸 Sobre Bruno Kobi

Full Stack Developer especializado em:

- Sistemas escaláveis
- Inteligência Artificial aplicada
- Automação inteligente
- Arquitetura moderna (Serverless & Event Driven)

Construindo sistemas que não apenas funcionam — mas pensam, automatizam e evoluem.

🔗 [Portfolio](https://brunokobi.netlify.app) · [LinkedIn](https://www.linkedin.com/in/brunokobi/) · [GitHub](https://github.com/brunokobi)
