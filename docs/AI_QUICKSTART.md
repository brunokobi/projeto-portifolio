# ⚡ AI Quickstart — Portfólio 3D

**Para IAs que entram no projeto pela primeira vez.** Leia isto (3 min), depois aprofunde nos arquivos específicos.

---

## 🎯 O Projeto em 30 segundos

Portfólio técnico com **globo 3D interativo** mostrando dados em tempo real:
- **Framework:** React 18 + TypeScript + Chakra UI
- **Mapa:** ArcGIS SceneView (WebGL)
- **Dados:** satélites, ISS, cidades, incêndios, alertas, terremotos, vulcões, furacões, vento (APIs públicas, só dados reais)
- **Deploy:** Netlify (automático via GitHub)
- **URL:** https://brunokobi.tech

---

## 📊 Status de Features

| Feature | Fonte | Status | Observação |
|---------|-------|--------|-----------|
| 🛰️ Satélites | CelesTrak (TLE) + SGP4 | ✅ Ativo | ~137 satélites; posição recalculada a cada 10s |
| 🛰 ISS | wheretheiss.at | ✅ Ativo | Polling a cada 8s |
| 🏙️ Cidades + AQI | `CITIES` + Open-Meteo + OpenAQ | ✅ Ativo | Hora local, clima, AQI no hover |
| 🔥 Incêndios | NASA VIIRS (ArcGIS) | ✅ Ativo | Últimas 6h, confiança alta |
| ⚠️ Alertas | CAP Alerts (ArcGIS) | ✅ Ativo | Avisos oficiais |
| 🌍 Terremotos | USGS GeoJSON | ✅ Ativo | M4.5+ das últimas 24h |
| 🌋 Vulcões | Smithsonian GVP | ✅ Ativo | 425 pontos |
| 🌀 Furacões | Active Hurricanes (ArcGIS) | ✅ Ativo | NHC + JTWC, globo inteiro |
| 💨 Vento | Grade GFS (`firestorm-wind-data`) | ✅ Ativo | Partículas com advecção |
| 🌙 Modo Noite | localStorage | ✅ Ativo | Botão na WeatherBar |
| ✈️ Aviões | OpenSky | ⛔ Desligado | CORS bloqueado |
| ✨ Aurora | NOAA Kp | ⛔ Removida | Tirada do globo a pedido |
| 💬 Chat IA (JARVIS) | n8n (via `netlify/functions/n8n-chat.ts`) | ✅ Ativo | Payload `{chatInput, sessionId}`, resposta em `data.output`; idioma da UI não afeta o n8n; UI "JARVIS Core" em canvas com o espectro real da voz do Piper (ver [FEATURES.md](./FEATURES.md#-chat-ia-n8n)) |
| 🔊 Voz do JARVIS | Piper (`tts.brunokobi.tech`) + Whisper (`whisper.brunokobi.tech`) | ✅ Ativo | Piper fala (pt, en, es, fr, de, ru, ar; senão voz do navegador); Whisper transcreve o microfone |

---

## 🏗️ Arquitetura (Resumida)

```
index.tsx (entry)
  └─ GlobeBackground/
      ├─ index.tsx (main component, renderização)
      ├─ satellites.ts (CelesTrak + SGP4, polling 10s)
      ├─ iss.ts (polling 8s)
      ├─ hazards.ts / capAlerts.ts (incêndios, AQI, alertas — ArcGIS)
      ├─ quakes.ts (USGS)
      ├─ volcanoes.ts (Smithsonian)
      ├─ hurricanes.ts (Active Hurricanes — ArcGIS)
      ├─ wind.ts (grade GFS + partículas)
      └─ iconScale.ts (tamanho dos ícones pelo zoom)
  └─ WeatherBar/
      └─ index.tsx (botões das camadas + clima; aparece com o globo)
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
| **Build** | Vite (minify esbuild sem renomear identificadores, para evitar o bug de TDZ) |
| **Test** | Vitest |
| **Deploy** | Netlify (auto via git push) |

---

## 🐛 Gotchas Críticos

### 1. **Minificação sem renomear identificadores**
```typescript
// vite.config.ts
build: { minify: "esbuild" },
esbuild: { /* ... */ minifyIdentifiers: false },  // ← IMPORTANTE
```
**Por quê?** a renomeação de identificadores do esbuild causava ReferenceError ao hover.  
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

### 3. **Tamanho dos Ícones**
Ao desenhar algo novo em `drawPins`, multiplique raios, offsets e fontes por `k` (`iconScaleForAltitude(cam.z)`) e use `fpx(px)` para fontes. Assim o ícone diminui quando a câmera se afasta, igual aos outros.

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
│  │  │  ├─ satellites.ts, iss.ts
│  │  │  ├─ hazards.ts, capAlerts.ts, cities.ts
│  │  │  ├─ quakes.ts, volcanoes.ts, hurricanes.ts
│  │  │  ├─ wind.ts, iconScale.ts
│  │  │  └─ __tests__/
│  │  ├─ WeatherBar/
│  │  └─ TextAudio/
│  ├─ pages/
│  │  └─ DevBlog/
│  ├─ routes/
│  ├─ utils/
│  └─ App.tsx
├─ docs/              ← Documentação (você está aqui)
├─ vite.config.ts     ← minifyIdentifiers: false aqui
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
   - Satélites usam polling (10s) que só recalcula posição; rede só a cada 2h
   - Demais camadas: carregam uma vez + renderização no loop + refs pra screenPos
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
→ Provavelmente bug de minificação (já resolvido: minifyIdentifiers: false). Se novo, check `screenPosRef` tá sendo setado.

**"Deploy não sobe?"**
→ `npm run build` passa local? Se não, fix. Se sim, git push e acompanha Netlify.

**"Qual cor usar?"**
→ GREEN = `#42c920`. Tudo mais vê `DESIGN_SYSTEM.md`.

---

**Última atualização:** 2026-11-02  
**Status:** todas as camadas do globo ativas com dados reais, exceto aviões (CORS)
