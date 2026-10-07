# Portfólio 3D Interativo — Documentação

**URL:** https://brunokobi.tech  
**Repo:** `/home/bruno/projeto-portifolio`  
**Status:** Em desenvolvimento (terremotos desabilitados; hover de vulcões desabilitado — bug de minificação, ver FEATURES.md)

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
- Canvas layers pra partículas (vento)
- Pins pra pontos de interesse (ISS, vulcões)

### 📡 Features em Tempo Real
| Feature | Fonte | Atualização | Status |
|---------|-------|-------------|--------|
| Terremotos | USGS GeoJSON | Live (24h) | ⛔ Desabilitado |
| ISS | wheretheiss.at | 8s polling | ✅ |
| Vulcões | Vasturiano gist | Static (425) | ⚠️ Pins sim, hover desabilitado |
| Vento | ERA5 (histórico) | Grid particle | ✅ |

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
