# Portfólio 3D Interativo — Documentação

**URL:** https://brunokobi.tech  
**Repo:** `/home/bruno/projeto-portifolio`  
**Status:** Em desenvolvimento (vulcões em progresso)

## Índice Rápido

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) — Estrutura geral, fluxo de dados, renderização
- [**COMPONENTS.md**](./COMPONENTS.md) — Componentes React principais
- [**FEATURES.md**](./FEATURES.md) — Features em tempo real (terremotos, ISS, oceano, vulcões)
- [**API.md**](./API.md) — APIs externas e data sources
- [**STACK.md**](./STACK.md) — Dependências e versões
- [**SETUP.md**](./SETUP.md) — Como rodar localmente

## O Projeto

Portfólio técnico com **globo 3D interativo** (ArcGIS SceneView) mostrando dados em tempo real:

### 🌍 Globo 3D
- Renderização WebGL via ArcGIS JS SDK
- Canvas layers pra partículas (vento, oceano)
- Pins pra pontos de interesse (terremotos, ISS, vulcões)

### 📡 Features em Tempo Real
| Feature | Fonte | Atualização | Status |
|---------|-------|-------------|--------|
| Terremotos | USGS GeoJSON | Live (24h) | ✅ |
| ISS | wheretheiss.at | 8s polling | ✅ |
| Correntes Marítimas | Open-Meteo Marine | Load once | ✅ |
| Vulcões | Vasturiano gist | Static (425) | 🚧 |
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
