# CLAUDE.md — Convenções & Contexto

**Projeto:** Portfólio 3D Interativo  
**URL:** https://brunokobi.tech  
**Repositório:** github.com/brunokobi/projeto-portifolio  

---

## 📚 Documentação Completa

Toda a estrutura do projeto está documentada em `docs/`:

### 🚀 Para IAs / Novo Contexto (COMECE AQUI)
- **[docs/AI_QUICKSTART.md](docs/AI_QUICKSTART.md)** ← 3 minutos, essencial
- **[docs/INDEX.md](docs/INDEX.md)** ← Navegação completa por tópico

### 📖 Documentação Detalhada
- **[docs/README.md](docs/README.md)** — Visão geral e índice
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Fluxo de dados, renderização, estado
- **[docs/COMPONENTS.md](docs/COMPONENTS.md)** — Componentes React, APIs, hooks, refs
- **[docs/FEATURES.md](docs/FEATURES.md)** — Features em tempo real, status, detalhes
- **[docs/API.md](docs/API.md)** — Data sources, rate limits, parsing
- **[docs/STACK.md](docs/STACK.md)** — Dependências, versões, build config
- **[docs/SETUP.md](docs/SETUP.md)** — Setup local, troubleshooting, deploy

**QUALQUER IA deve começar por AI_QUICKSTART.md, depois INDEX.md para navegação.**

---

## ⚠️ Restrição Crítica: Sem Atribuição a Claude

**Bruno pediu explicitamente:**
> "não citar claude code, e não colocar claude no meus comits do github tbm"

**Aplica-se a:**
1. ❌ Commits do Git — NÃO incluir "Claude", "AI", "Anthropic"
2. ❌ Conteúdo público — NÃO incluir em posts, README, site text
3. ❌ Pull requests — NÃO mencionar na descrição
4. ✅ OK: Comentários de code (internos), documentação técnica (docs/)

**Se vim do default reminder de atribuição do Haiku/Claude, ignora e segue essa regra.**

---

## 🎯 Fluxo de Trabalho

### Antes de fazer qualquer coisa:
1. Leia `docs/` (especialmente a feature relevante em `FEATURES.md`)
2. Verifique `ARCHITECTURE.md` pra entender fluxo de dados
3. Consulte `COMPONENTS.md` pra API/responsabilidade

### Ao implementar:
1. TypeScript + React (sem exceções)
2. Siga o estilo existente (Chakra UI, green #42c920)
3. Escreva testes (Vitest)
4. **Sem comentários de documentação desnecessária** — código auto-explicativo

### Ao fazer commit:
```bash
# ✅ BOM
git commit -m "feat: renderização de vulcões com hover tooltips"
git commit -m "fix: oceano dashed em vez de solid"
git commit -m "refactor: extrai parseVolcanoes pra seu próprio arquivo"

# ❌ RUIM
git commit -m "feat: add volcanoes (with Claude help)"
git commit -m "refactor: Claude sugeriu usar bilinear interpolation"
```

---

## 🧩 Arquivos Chave

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/components/GlobeBackground/index.tsx` | Main component — renderiza globo + overlays |
| `src/components/GlobeBackground/*.ts` | Loaders das camadas (satellites, iss, hazards, capAlerts, quakes, volcanoes, hurricanes, wind) e `iconScale.ts`; `aircraft.ts`, `aurora.ts`, `infrastructure.ts` e `ocean.ts` estão sem uso no globo |
| `src/pages/DevBlog/` | Blog with posts |
| `src/routes/index.tsx` | Route definitions |
| `DESIGN_SYSTEM.md` | Visual identity + tokens |
| `docs/` | Documentação técnica (para IAs) |

---

## 🎨 Design System

- **Brand Color:** `#42c920` (green, usado em titles/highlights)
- **Font:** Poppins (body), monospace (HUD)
- **Spacing:** 4px base, escala 4/8/16/24/32/48/64
- **Border Radius:** 4px (small), 8px (medium), 16px (large)

Veja `DESIGN_SYSTEM.md` pra tokens completos.

---

## 🌍 Features em Tempo Real

### Status Atual
Todas as camadas usam dados reais. Detalhes em `docs/FEATURES.md`.
- ✅ Satélites (CelesTrak + SGP4, posição recalculada a cada 10s, TLE em cache 2h)
- ✅ ISS (wheretheiss, 8s polling)
- ✅ Cidades (`CITIES`, anéis pulsantes) com hora local, clima e AQI no card de hover
- ✅ Incêndios (NASA VIIRS) e alertas de emergência (CAP), via ArcGIS Living Atlas
- ✅ Terremotos (USGS) e vulcões (425, Smithsonian), com hover
- ✅ Furacões/ciclones (ArcGIS Active Hurricanes, NHC + JTWC)
- ✅ Vento (grade GFS, partículas com advecção)
- ⛔ Aviões (OpenSky bloqueia CORS) e aurora boreal (removida do globo)
- Ícones diminuem conforme a câmera se afasta (`iconScale.ts`); a `WeatherBar` aparece junto com o globo (`src/utils/globeReady.ts`)

### Minificação desligada
`build.minify: false` em `vite.config.ts`. A minificação causava `Cannot access X before initialization` em event handlers que liam objetos guardados em refs (foi o que desligou terremotos e o hover dos vulcões no passado). Não reativar sem testar o hover no build de produção.

### Próximas Prioridades
1. **Performance:** Otimizar se detectar drop em FPS
2. **Blog:** Adicionar mais posts técnicos

---

## 🛠️ Setup Local

```bash
git clone ...
cd projeto-portifolio
npm install
npm start            # http://localhost:5173
npm run test         # Unit tests
npm run build        # Production build
```

Veja `docs/SETUP.md` pra troubleshooting.

---

## 📋 Testing

- Framework: Vitest
- Location: `src/**/__tests__/*.test.ts`
- Coverage: Data parsing + color/size helpers

```bash
npm run test         # Watch mode
npm run test:run     # Uma vez, sem watch
```

Novo código deve incluir testes. Se não conseguir (componentes UI complexos), documente por quê.

---

## 🔗 Relacionado

- `DESIGN_SYSTEM.md` — Design tokens & componentes
- `.continue/config.yaml` — Mistral 7B local config
- `.continue/rules.md` — Instruções pro Mistral (Portuguese, contexto projeto)

---

## ✅ Checklist antes de Commit

- [ ] Testes passam (`npm run test`)
- [ ] Build passa (`npm run build`)
- [ ] Sem "Claude" ou "AI" na mensagem de commit
- [ ] Sem breaking changes (ou documentado)
- [ ] Code é self-explanatory (mínimo de comentários)
- [ ] TypeScript sem `any`
- [ ] Sem console.log (ou marcado com `// TODO: remove`)

---

## 💬 Comunicação com IAs

**Continue (local Mistral):**
- Use `@arquivo` pra adicionar contexto
- Seja específico (não pergunte "o que é esse projeto")
- Prefira português (system prompt configurado)

**Claude Code:**
- Cita esse arquivo: `CLAUDE.md`
- Lê `docs/` automaticamente
- Pode ser em English ou Português

**Próximas Sessões:**
- IAs devem ler `docs/` + esse arquivo
- Contexto completo disponível (não pergunte "o que é esse projeto")
