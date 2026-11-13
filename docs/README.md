# Portfólio 3D Interativo — Documentação

**URL:** https://brunokobi.tech  
**Repo:** `/home/bruno/projeto-portifolio`  
**Status:** Em produção. Todas as camadas do globo ativas, exceto aviões (CORS do OpenSky).

## Índice Rápido

### 🚀 Para IAs / Novo Contexto
- **[AI_QUICKSTART.md](./AI_QUICKSTART.md)** ← **COMECE AQUI** (3 min, essencial)

### 📚 Documentação Completa
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) — Estrutura geral, fluxo de dados, renderização
- [**COMPONENTS.md**](./COMPONENTS.md) — Componentes React principais
- [**FEATURES.md**](./FEATURES.md) — Features em tempo real (status, detalhes técnicos)
- [**API.md**](./API.md) — APIs externas, data sources, rate limits
- [**STACK.md**](./STACK.md) — Dependências, versões, build config
- [**SETUP.md**](./SETUP.md) — Setup local, troubleshooting, deploy

## O Projeto

Portfólio técnico com **globo 3D interativo** (ArcGIS SceneView) mostrando dados em tempo real:

### 🌍 Globo 3D
- Renderização WebGL via ArcGIS JS SDK
- Canvas de partículas para o vento e canvas 2D para os pins das camadas
- Ícones diminuem conforme a câmera se afasta (`iconScale.ts`)
- Botões ON/OFF por camada na `WeatherBar`, que aparece junto com o globo

### 📡 Features em Tempo Real
Todas com dados reais. Detalhes em [FEATURES.md](./FEATURES.md).

| Feature | Fonte | Atualização | Status |
|---------|-------|-------------|--------|
| Satélites | CelesTrak (TLE) + SGP4 | Posição a cada 10s | ✅ |
| ISS | wheretheiss.at | 8s | ✅ |
| Cidades + AQI | Open-Meteo + OpenAQ | Clima com cache 2h | ✅ |
| Incêndios | NASA VIIRS (ArcGIS) | Ao carregar | ✅ |
| Alertas | CAP Alerts (ArcGIS) | Ao carregar | ✅ |
| Terremotos | USGS (M4.5+, 24h) | Ao carregar | ✅ |
| Vulcões | Smithsonian GVP (425) | Ao carregar | ✅ |
| Furacões | Active Hurricanes (ArcGIS, NHC + JTWC) | Ao carregar | ✅ |
| Vento | Grade GFS (`firestorm-wind-data`) | Ao carregar | ✅ |
| Aviões | OpenSky | — | ⛔ CORS bloqueado |

### 🤖 JARVIS
Chat com agente n8n que fala com voz neural (Piper) e ouve pelo microfone (Whisper), os três na VPS própria. Detalhes em [FEATURES.md](./FEATURES.md#-chat-ia-n8n).

### 📝 Blog Dev
- `/pages/DevBlog` — Posts técnicos em Markdown
- Post 1: "Oracle VPS Recovery" (~8000 palavras)
- Renderizador custom (sem lib externa)

### 🎨 Design System
- `DESIGN_SYSTEM.md` — Tokens visuais
- Cores: GREEN=#42c920 (brand principal)
- Tipografia: Poppins body + monospace HUD
- Componentes: Badge, Card, HudLabel, NavItem

## Restrições Importantes

⚠️ **Sem atribuição a Claude em:**
- Commits do GitHub
- Conteúdo público (posts, README, site)
- Isso aplica a TODOS os places públicos

## Contato & Setup

Veja `SETUP.md` pra rodar local e `CLAUDE.md` pra conventions.
