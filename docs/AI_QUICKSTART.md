# ⚡ AI Quickstart — Portfólio 3D

**Para IAs que entram no projeto pela primeira vez.** Leia isto (3 min), depois aprofunde nos arquivos específicos.

---

## 🎯 O Projeto em 30 segundos

Portfólio técnico com **globo 3D interativo** mostrando dados em tempo real:
- **Framework:** React 18 + TypeScript + Chakra UI
- **Mapa:** ArcGIS SceneView (WebGL)
- **Dados:** ISS, terremotos, vulcões, vento, furacões (APIs públicas)
- **Deploy:** Netlify (automático via GitHub)
- **URL:** https://brunokobi.tech

---

## 📊 Status de Features

| Feature | Fonte | Status | Observação |
|---------|-------|--------|-----------|
| 🛰 ISS | wheretheiss.at | ✅ Ativo | Polling a cada 8s |
| 🌬 Vento | ERA5 (histórico) | ✅ Ativo | Partículas com advection |
| 🌍 Terremotos | USGS GeoJSON | ✅ Reativado | Círculos pulsantes, hover com info |
| 🌋 Vulcões | Vasturiano gist | ✅ Reativado | 425 pontos, triângulos, hover com info |
| 🌀 Furacões | NOAA NHC RSS | ✅ Ativo | 3 feeds (Atlântico, Pacífico E/C) |
| 🏙️ Cidades | Hardcoded | ✅ Ativo | Hora local, clima, AQI |
| 🌊 Correntes | Open-Meteo Marine | ❌ Removido | Retirado por taxa de API alta |
| 🌙 Modo Noite | Local storage | ✅ Ativo | Toggle na WeatherBar |
| 💬 Chat IA (JARVIS) | n8n (via `netlify/functions/n8n-chat.ts`) | ✅ Ativo | Payload `{chatInput, sessionId}`, resposta em `data.output`; idioma da UI não afeta o n8n; UI "JARVIS Core" em canvas com espectro simulado (ver [FEATURES.md](./FEATURES.md#-chat-ia-n8n)) |

---

## 🏗️ Arquitetura (Resumida)

```
index.tsx (entry)
  └─ GlobeBackground/
      ├─ index.tsx (main component, renderização)
      ├─ quakes.ts (USGS loader + parsing)
      ├─ volcanoes.ts (Smithsonian data + color/size)
      ├─ hurricanes.ts (NOAA RSS parser)
      ├─ wind.ts (ERA5 grid + particle physics)
      └─ iss.ts (position polling)
  └─ WeatherBar/
      └─ index.tsx (toggles, hora local, clima)
  └─ DevBlog/
      └─ index.tsx (renderizador de posts)
```

**Fluxo:**
1. Component monta → inicia listeners (globeQuakesToggle, etc)
2. Data loaders executam em paralelo → armazenam em variáveis locais
3. requestAnimationFrame loop → renderiza a cada frame
4. Mouse move → detecta hover em pontos → exibe tooltip

---

## 💻 Stack (Essencial)

| Layer | Tech |
|-------|------|
| **Language** | TypeScript + React 18 |
| **UI** | Chakra UI (componentes) |
| **Map** | ArcGIS JS SDK (SceneView WebGL) |
| **Build** | Vite (minify: false para evitar TDZ bug) |
| **Test** | Vitest |
| **Deploy** | Netlify (auto via git push) |

---

## 🐛 Gotchas Críticos

### 1. **Minificação Desabilitada**
```typescript
// vite.config.ts
build: {
  minify: false,  // ← IMPORTANTE
  // ...
}
```
**Por quê?** esbuild minify criava colisões de nomes em event handlers → ReferenceError ao hover.  
**Quando tocar:** Se alterar event handlers ou closures em terremotos/vulcões, retestar.

### 2. **Rendering Pattern para Features**
Todas as features que se movem com rotação do globo usam esse padrão:
```typescript
if (!isFacing(cam.latitude, cam.longitude, point.lat, point.lon)) continue; // Skip se de costas
const screenPos = view.toScreen(
  new Point({ longitude: point.lon, latitude: point.lat, z: 40000 })
);
// Draw...
```
**Copia esse padrão** ao adicionar nova feature.

### 3. **NOAA Não Cobre Pacífico Oeste**
- NOAA: até 180°W (Havaí)
- Typhoon 27 (Japão): fora da cobertura
- Solução futura: JMA API (não existe ainda pública)

### 4. **Sem Dados Mockados**
Regra firme do projeto: **ZERO mock data**.
- Se API falha → feature some (não simula)
- Se você quer testar: use dados reais ou pule a feature

### 5. **Atribuição a Claude = PROIBIDA**
```bash
# ❌ NUNCA
git commit -m "feat: Claude sugeriu melhor pattern"

# ✅ SIM
git commit -m "feat: melhorar performance no hover"
```

---

## 🔧 Comandos Essenciais

```bash
# Desenvolvimento
npm install
npm run build          # Production build
npm test              # Unit tests (watch mode)
npm run lint          # TypeScript + ESLint

# Deploy (automático no git push)
git push origin main  # Netlify auto-build
```

---

## 📂 Estrutura de Pastas

```
projeto-portifolio/
├─ src/
│  ├─ components/
│  │  ├─ GlobeBackground/       ← MAIN logic aqui
│  │  │  ├─ index.tsx (renderização)
│  │  │  ├─ quakes.ts
│  │  │  ├─ volcanoes.ts
│  │  │  ├─ hurricanes.ts
│  │  │  ├─ wind.ts
│  │  │  ├─ iss.ts
│  │  │  └─ __tests__/
│  │  ├─ WeatherBar/
│  │  └─ TextAudio/
│  ├─ pages/
│  │  └─ DevBlog/
│  ├─ routes/
│  ├─ utils/
│  └─ App.tsx
├─ docs/              ← Documentação (você está aqui)
├─ vite.config.ts     ← minify: false aqui
├─ CLAUDE.md          ← Conventions
└─ package.json
```

---

## 🎯 Antes de Tocar em Qualquer Coisa

1. **Leia o arquivo relevante em `docs/`:**
   - Novo componente → `COMPONENTS.md`
   - Feature com dados → `API.md`
   - Visual/colors → `DESIGN_SYSTEM.md`
   - Setup local → `SETUP.md`

2. **Entenda o padrão:**
   - ISS usa polling + local var
   - Vulcões/Terremotos usam renderização no loop + refs pra screenPos
   - Vento usa particle grid + advection

3. **Teste seu change:**
   ```bash
   npm run build        # Passa?
   npm run test         # Novo teste? Sim
   git push             # Triggers Netlify auto-deploy
   ```

4. **Sem mock data:**
   - API quebrou? Remove a feature
   - Quer teste? Use dados reais (CORS, proxy, etc)

---

## 🔗 Documentação Completa

| Arquivo | Para Quem |
|---------|-----------|
| **README.md** | Visão geral |
| **ARCHITECTURE.md** | Engenharia (fluxo, estado, rendering) |
| **COMPONENTS.md** | React devs (API dos componentes) |
| **FEATURES.md** | Detalhes de cada feature |
| **API.md** | Data sources (URLs, parsing, rate limits) |
| **STACK.md** | Dependências, versões |
| **SETUP.md** | Setup local + troubleshooting |
| **AI_QUICKSTART.md** | ← Você está aqui |

---

## ❓ FAQ Rápido

**"Quero adicionar nova feature de dados reais"**
→ Leia `API.md`, crie loader em `src/components/GlobeBackground/seu-loader.ts`, siga rendering pattern de vulcões/terremotos.

**"Hover de feature X não funciona?"**
→ Provavelmente bug de minificação (já resolvido: minify: false). Se novo, check `screenPosRef` tá sendo setado.

**"Deploy não sobe?"**
→ `npm run build` passa local? Se não, fix. Se sim, git push e acompanha Netlify.

**"Qual cor usar?"**
→ GREEN = `#42c920`. Tudo mais vê `DESIGN_SYSTEM.md`.

---

**Última atualização:** 2026-10-07  
**Status:** Vulcões ✅ Terremotos ✅ Furacões ✅ Hover ✅ Tooltips ✅
