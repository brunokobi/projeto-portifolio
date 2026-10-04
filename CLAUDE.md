# CLAUDE.md — Convenções & Contexto

**Projeto:** Portfólio 3D Interativo  
**URL:** https://brunokobi.tech  
**Repositório:** github.com/brunokobi/projeto-portifolio  

---

## 📚 Documentação Completa

Toda a estrutura do projeto está documentada em `docs/`:

- **[docs/README.md](docs/README.md)** — Índice e overview
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitetura, fluxo de dados, renderização
- **[docs/COMPONENTS.md](docs/COMPONENTS.md)** — Componentes React principais
- **[docs/FEATURES.md](docs/FEATURES.md)** — Features em tempo real (terremotos, ISS, oceano, vulcões)
- **[docs/API.md](docs/API.md)** — APIs externas (USGS, wheretheiss, Open-Meteo, vasturiano)
- **[docs/STACK.md](docs/STACK.md)** — Stack técnico, dependências, versões
- **[docs/SETUP.md](docs/SETUP.md)** — Setup local, troubleshooting, deploy

**QUALQUER IA (Continue, Claude, etc) deve ler esses arquivos primeiro.**

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
| `src/components/GlobeBackground/*.ts` | Data loaders (quakes, iss, ocean, volcanoes) |
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
- ✅ Terremotos (USGS, M4.5+, últimas 24h)
- ✅ ISS (wheretheiss, 8s polling)
- ✅ Correntes marítimas (Open-Meteo, grid global)
- 🚧 Vulcões (425 vulcões, parsing OK, rendering pendente)
- ✅ Vento (partículas com advection)
- ✅ Furacões/ciclones (NOAA NHC, 5 feeds via proxy `/api/noaa/*`)
- ✅ Cidades (`CITIES`, anéis pulsantes) com hora local, clima e AQI classificado no card de hover

### Próximas Prioridades
1. **Vulcões:** Finish rendering + tooltips
2. **Performance:** Otimizar se detectar drop em FPS
3. **Blog:** Adicionar mais posts técnicos

---

## 🛠️ Setup Local

```bash
git clone ...
cd projeto-portifolio
npm install
npm run dev          # http://localhost:5173
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
npm run test:ui      # Browser UI
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
