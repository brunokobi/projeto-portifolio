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
| 🌀 Furacões | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | ArcGIS Active Hurricanes → hurricanes.ts → spirals |
| 🛰 ISS | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | wheretheiss → iss.ts → polling |
| 🌬 Vento | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | Grade GFS → wind.ts → particles |
| 🛰️ Satélites | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | CelesTrak TLE → satellites.ts (SGP4) → polling 10s |
| 🔥 Incêndios / ⚠️ Alertas | [FEATURES.md](./FEATURES.md) + [API.md](./API.md) | ArcGIS Living Atlas → hazards.ts / capAlerts.ts |
| 📏 Tamanho dos ícones | [FEATURES.md](./FEATURES.md) | altitude da câmera → iconScale.ts → drawPins |
| 💬 Chat IA | [FEATURES.md](./FEATURES.md#-chat-ia-n8n) + [COMPONENTS.md](./COMPONENTS.md) | ChatWidget → n8n-chat.ts → n8n |

### Para Setup Local
| Tarefa | Arquivo | Commando |
|--------|---------|----------|
| Instalar deps | [SETUP.md](./SETUP.md) | `npm install` |
| Rodar dev | [SETUP.md](./SETUP.md) | `npm start` |
| Testes | [SETUP.md](./SETUP.md) | `npm run test` |
| Deploy | [SETUP.md](./SETUP.md) | `git push origin main` |

---

## 📡 Data & APIs

| Source | Docs | Rate Limit | Cache |
|--------|------|-----------|-------|
| USGS Earthquakes | [API.md](./API.md) | 1 req/sec | 60s |
| Smithsonian Volcanoes | [API.md](./API.md) | None (gist) | Static (reboot) |
| ArcGIS Living Atlas (furacões, incêndios, alertas, AQI) | [API.md](./API.md) | Não documentado | Furacões 60s; demais carregam 1x |
| CelesTrak (satélites) | [API.md](./API.md) | ~1 consulta/grupo a cada 2h | TLE 2h, posição a cada 10s |
| wheretheiss (ISS) | [API.md](./API.md) | None | Polling 8s |
| firestorm-wind-data (grade GFS) | [API.md](./API.md) | GitHub raw | Carrega 1x |
| Vasturiano (data) | [API.md](./API.md) | Gist, no limit | Static (reboot) |

---

## 🐛 Troubleshooting

| Problema | Solução | Arquivo |
|----------|---------|---------|
| Hover em vulcões/terremotos falha | Minification bug (já resolvido: minifyIdentifiers: false) | [AI_QUICKSTART.md](./AI_QUICKSTART.md) |
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
- Ícone novo no globo não diminui com o zoom? → [AI_QUICKSTART.md](./AI_QUICKSTART.md) Gotchas #3
- Sem dados mockados? → [AI_QUICKSTART.md](./AI_QUICKSTART.md) Gotchas #4

---

## 📊 Status de Features (Nov 2026)

✅ **Ativo (todos com dados reais):**
- Satélites (CelesTrak + SGP4, posição a cada 10s)
- ISS (polling 8s)
- Cidades (hora local, clima, AQI no hover)
- Incêndios (NASA VIIRS)
- Alertas de emergência (CAP)
- Terremotos (USGS, hover)
- Vulcões (425, Smithsonian, hover)
- Furacões (Active Hurricanes — NHC + JTWC)
- Vento (grade GFS, partículas)
- Modo Noite e rotação (botões na WeatherBar)
- Ícones diminuem conforme o zoom (`iconScale.ts`)

⛔ **Desligado ou removido:**
- Aviões (OpenSky bloqueia CORS)
- Aurora boreal (removida do globo)
- Correntes marítimas (Open-Meteo, taxa alta)

---

## 🎨 Refs Importantes

- **Color scheme:** [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- **Code patterns:** [COMPONENTS.md](./COMPONENTS.md)
- **Conventions:** [../CLAUDE.md](../CLAUDE.md)

---

**Última atualização:** 2026-11-02  
**Próximo dev que entra?** Leia AI_QUICKSTART.md primeiro (3 min), depois deepdive os arquivos específicos.
