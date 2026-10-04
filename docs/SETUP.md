# Setup Local

## Pré-requisitos

- **Node.js:** 18+ (recomendado: 20 LTS)
- **npm/yarn:** Latest
- **Git:** Latest
- **Browser:** Chrome/Firefox/Edge (WebGL suportado)

## Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/brunokobi/projeto-portifolio.git
cd projeto-portifolio
```

### 2. Instale dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure variáveis de ambiente (se necessário)
Crie um arquivo `.env.local`:
```env
VITE_API_KEY_ARCGIS=your_key_if_needed
# Nenhuma key obrigatória no dev
```

Nota: Todos os dados são públicos (USGS, Open-Meteo, wheretheiss, Vasturiano gist).

### 4. Inicie o dev server
```bash
npm run dev
```

Acesse: `http://localhost:5173`

## Comandos Principais

### Desenvolvimento
```bash
npm run dev       # Dev server com HMR
npm run build     # Build production
npm run preview   # Preview da build
npm run test      # Unit tests (watch mode)
npm run test:ui   # Vitest UI
```

### Linting & Formatting
```bash
npm run lint      # ESLint
npm run format    # Prettier
```

## Troubleshooting

### Dev Server não inicia
```bash
# Limpar cache
rm -rf node_modules/.vite
npm run dev
```

### Globo 3D não renderiza
- Verificar console pra erros WebGL
- Garantir WebGL habilitado no browser
- Testar em outro browser

### CORS errors nos dados
- Todos os APIs têm CORS habilitado
- Se falhar, verificar internet connection
- Dados fallback pra `[]` (globo continua rodando)

### Estilo Chakra não carrega
```bash
# Reinstalar Chakra
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

## Estrutura de Arquivos Importantes

```
projeto-portifolio/
├── src/
│   ├── components/
│   │   ├── GlobeBackground/
│   │   │   ├── index.tsx          ← Main globe component
│   │   │   ├── quakes.ts          ← Earthquake data
│   │   │   ├── iss.ts             ← ISS tracking
│   │   │   ├── ocean.ts           ← Ocean currents
│   │   │   ├── volcanoes.ts       ← Volcano data
│   │   │   └── __tests__/         ← Unit tests
│   │   ├── WeatherBar/            ← Feature toggles
│   │   ├── Nav/                   ← Navigation
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── DevBlog/               ← Blog page
│   │   │   ├── index.tsx
│   │   │   ├── PostRenderer.tsx
│   │   │   └── posts.ts           ← Blog content
│   │   └── ...
│   ├── routes/
│   │   └── index.tsx              ← Route definitions
│   ├── App.tsx                    ← Main app component
│   └── main.tsx                   ← Entry point
├── docs/
│   ├── README.md                  ← Você está aqui
│   ├── ARCHITECTURE.md
│   ├── COMPONENTS.md
│   ├── FEATURES.md
│   ├── API.md
│   ├── STACK.md
│   └── SETUP.md
├── public/
│   └── index.html                 ← ArcGIS script tag
├── package.json
├── vite.config.ts
├── tsconfig.json
├── DESIGN_SYSTEM.md               ← Design tokens
├── CLAUDE.md                      ← Conventions
└── .gitignore
```

## Workflow de Desenvolvimento

### Criar nova feature
1. Criar branch: `git checkout -b feat/volcano-rendering`
2. Implementar em `src/components/GlobeBackground/volcanoes.ts`
3. Testar com `npm run test`
4. Verificar no browser: `http://localhost:5173`
5. Commit (sem "Claude" na mensagem):
   ```bash
   git commit -m "feat: renderização de vulcões com hover tooltips"
   ```
6. Push e abrir PR

### Adicionar novo post ao blog
1. Edit `src/pages/DevBlog/posts.ts`
2. Adicionar novo Post object ao array `posts`
3. Usar Block[] type pra estrutura (heading, paragraph, code, etc)
4. Testar em `http://localhost:5173/blog`

### Atualizar Design System
1. Edit `DESIGN_SYSTEM.md`
2. Atualizar cores/tokens conforme necessário
3. Refletir mudanças em `src/theme` ou Chakra config

## Debug & Profiling

### React DevTools
```bash
# Install extension
# Components tab → Inspect component tree
# Profiler tab → Benchmark renderização
```

### Chrome DevTools
- **Network:** Verificar chamadas de API (USGS, Open-Meteo, etc)
- **Performance:** Timeline de renderização (globo 3D)
- **Console:** Logs e errors

### Vite Inspector
```
Alt+Shift+D  # No dev server
# Visualizar estrutura de módulos
```

## Deploy

### Preview production build
```bash
npm run build
npm run preview
# Acesse http://localhost:4173
```

### Deploy to Netlify
```bash
# Conectado via GitHub
# Qualquer push em `main` dispara deploy automático
# Status em https://app.netlify.com/sites/brunokobi
```

### Verificar site ao vivo
```bash
https://brunokobi.tech
```

## Maintainance

### Atualizar dependências
```bash
npm update                # Update within version ranges
npm outdated             # Ver o que pode ser atualizado
npm install pkg@latest   # Update specific package
```

### Cleanup
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

## Documentação Adicional

Veja:
- `ARCHITECTURE.md` — Estrutura geral + data flow
- `COMPONENTS.md` — Componentes React
- `FEATURES.md` — Features em tempo real (ISS, oceano, vulcões; terremotos desabilitados)
- `API.md` — Endpoints externos
- `STACK.md` — Dependências + tech choices
- `CLAUDE.md` — Conventions (commits, code style, etc)
- `DESIGN_SYSTEM.md` — Design tokens + componentes
