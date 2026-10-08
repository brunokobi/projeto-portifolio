# 📖 Documentação — Índice Completo

**Guia de navegação para todos os tipos de dev.**

---

## 🚀 Entrada Rápida (Para IAs)

| Nível | Arquivo | Tempo | O Quê |
|-------|---------|-------|-------|
| **⚡ Básico** | [AI_QUICKSTART.md](./AI_QUICKSTART.md) | 3 min | Status de features, stack, gotchas críticos |
| **📊 Visão Geral** | [README.md](./README.md) | 5 min | Projeto, features, design system |

---

## 🛠️ Desenvolvimento

### Para Entender Arquitetura
| Arquivo | Foco | Público |
|---------|------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Fluxo de dados, rendering loop, estado | Engenheiros |
| [COMPONENTS.md](./COMPONENTS.md) | API dos componentes React, refs, hooks | React devs |
| [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) | Cores, tipografia, tokens, componentes UI | Designers + Devs |

### Para Tocar em Features
| Feature | Arquivo | Dataflow |
|---------|---------|----------|
| 🌍 Terremotos | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | USGS → quakes.ts → render loop |
| 🌋 Vulcões | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | Smithsonian → volcanoes.ts → triangles |
| 🌀 Furacões | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | NOAA RSS → hurricanes.ts → spirals |
| 🛰 ISS | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | wheretheiss → iss.ts → polling |
| 🌬 Vento | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | ERA5 grid → wind.ts → particles |
| 💬 Chat IA | [FEATURES.md](./FEATURES.md#-chat-ia-n8n) + [COMPONENTS.md](./COMPONENTS.md) | ChatWidget → n8n-chat.ts → n8n |

### Para Setup Local
| Tarefa | Arquivo | Commando |
|--------|---------|----------|
| Instalar deps | [SETUP.md](./SETUP.md) | `npm install` |
| Rodar dev | [SETUP.md](./SETUP.md) | `npm run build` |
| Testes | [SETUP.md](./SETUP.md) | `npm run test` |
| Deploy | [SETUP.md](./SETUP.md) | `git push origin main` |

---

## 📡 Data & APIs

| Source | Docs | Rate Limit | Cache |
|--------|------|-----------|-------|
| USGS Earthquakes | [API.md](./API.md) | 1 req/sec | 60s |
| Smithsonian Volcanoes | [API.md](./API.md) | None (gist) | Static (reboot) |
| NOAA NHC (Hurricanes) | [API.md](./API.md) | RSS, no limit | 60s |
| wheretheiss (ISS) | [API.md](./API.md) | None | Polling 8s |
| ERA5 (Wind grid) | [API.md](./API.md) | None (histórico) | In-memory |
| Vasturiano (data) | [API.md](./API.md) | Gist, no limit | Static (reboot) |

---

## 🐛 Troubleshooting

| Problema | Solução | Arquivo |
|----------|---------|---------|
| Hover em vulcões/terremotos falha | Minification bug (já resolvido: minify: false) | [AI_QUICKSTART.md](./AI_QUICKSTART.md) |
| Nova feature não renderiza com globo | Segue rendering pattern de ISS/vulcões? | [COMPONENTS.md](./COMPONENTS.md) |
| API retorna 429 | Cache aumentado ou feature removida | [API.md](./API.md) |
| Build falha | `npm run test`, `npm run lint` | [SETUP.md](./SETUP.md) |

---

## 📋 Checklists

### Antes de Editar Qualquer Coisa
- [ ] Leu [AI_QUICKSTART.md](./AI_QUICKSTART.md)?
- [ ] Entendeu o padrão de rendering (isFacing, screenPos)?
- [ ] Vai alterar dados? Check [API.md](./API.md) pra rate limits
- [ ] Vai alterar UI? Consulte [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)

### Antes de Commit
- [ ] `npm run build` passa?
- [ ] `npm run test` passa?
- [ ] Sem "Claude" na mensagem de commit?
- [ ] Sem console.log (ou tem TODO comment)?
- [ ] Sem dados mockados?

---

## 🔍 Busca Rápida

**"Como adiciono..."**
- Novo toggle na WeatherBar? → [COMPONENTS.md](./COMPONENTS.md)
- Dados de tempo real? → [API.md](./API.md)
- Novo componente React? → [COMPONENTS.md](./COMPONENTS.md)
- Novo post no blog? → [FEATURES.md](./FEATURES.md) (seção Blog)

**"Por que..."**
- Minify está desabilitado? → [AI_QUICKSTART.md](./AI_QUICKSTART.md) Gotchas #1
- NOAA não tem tufões? → [AI_QUICKSTART.md](./AI_QUICKSTART.md) Gotchas #3
- Sem dados mockados? → [AI_QUICKSTART.md](./AI_QUICKSTART.md) Gotchas #4

---

## 📊 Status de Features (Oct 2026)

✅ **Ativo:**
- ISS (polling 8s)
- Vento (partículas, advection)
- Terremotos (USGS, circles pulsantes, hover tooltips)
- Vulcões (425 Smithsonian, triangles, hover tooltips)
- Furacões (NOAA 3 feeds, spirals)
- Cidades (hardcoded, hora local + clima)
- Modo Noite (toggle)

❌ **Removido:**
- Correntes marítimas (Open-Meteo, taxa alta)

---

## 🎨 Refs Importantes

- **Color scheme:** [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Code patterns:** [COMPONENTS.md](./COMPONENTS.md)
- **Conventions:** [../CLAUDE.md](../CLAUDE.md)

---

**Última atualização:** 2026-10-07  
**Próximo dev que entra?** Leia AI_QUICKSTART.md primeiro (3 min), depois deepdive os arquivos específicos.
