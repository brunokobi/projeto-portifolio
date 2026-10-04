# Componentes Principais

## `GlobeBackground` 
**Arquivo:** `src/components/GlobeBackground/index.tsx`  
**Responsabilidade:** Renderização do globo 3D + overlays

### Props
```typescript
// Nenhuma (self-contained)
```

### Estado
- `hoverInfo: { title: string; lines: string[]; x: number; y: number } | null`
- Refs: `sceneViewRef`, `quakeScreenPosRef`, `issScreenPosRef`, `volcanoScreenPosRef`
- Refs: `oceanEnabledRef`, `quakesEnabledRef`, `issEnabledRef`, `volcanoesEnabledRef`

### Ciclo de Vida
1. **useEffect (setup):** ArcGIS init, event listeners
2. **useEffect (data):** Load quakes/ISS/ocean/volcanoes in parallel
3. **useEffect (render loop):** requestAnimationFrame → draw particles + pins
4. **Cleanup:** AbortController, event listener removal

### Métodos Chave
- `drawPins()` — renderiza circles/ellipses/triangles pra todos os pontos
- `drawParticles()` — ocean + wind canvas layers com advection
- `handlePointerMove()` — hit detection pra hover tooltips

### Estrutura JSX
```jsx
<div ref={mapContainer}>
  <canvas ref={canvasRef} /> {/* Partículas */}
  {hoverInfo && <Tooltip />}
</div>
```

---

## `WeatherBar`
**Arquivo:** `src/components/WeatherBar/index.tsx`  
**Responsabilidade:** Toggles pra features do globo

### Buttons
| Emoji | Label | Event | Estado Ref |
|-------|-------|-------|-----------|
| 🌊 | CORRENTES | globeOceanToggle | oceanEnabledRef |
| 🛰 | ISS | globeIssToggle | issEnabledRef |
| 🌋 | VULCÕES | globoVolcanoesToggle | volcanoesEnabledRef |

O botão de terremotos (SISMOS) foi removido; o listener `globeQuakesToggle` ainda existe em `GlobeBackground`, mas nada o dispara.

### Behavior
- Dispara CustomEvent com `detail: { enabled: boolean }`
- Listener em GlobeBackground atualiza os Refs
- Render loop só desenha se enabled

---

## `DevBlog`
**Arquivo:** `src/pages/DevBlog/index.tsx`  
**Responsabilidade:** Página de blog com posts

### Sub-componentes
- `PostRenderer` — renderiza Block[] com markdown-lite
  - **bold:** `**text**` → `<span style="color: #42c920">`
  - **code:** `` `text` `` → `<code>` monospace
  - **italic:** `*text*` → `<em>`

### Estrutura
```typescript
interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  blocks: Block[];
}

type Block = 
  | { type: "heading"; level: 1|2|3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "hr" };
```

### Posts Existentes
- `oracle-vps-free-tier` — VPS recovery story (~8000 words)

---

## `About`
**Arquivo:** `src/pages/About/index.tsx`  
**Responsabilidade:** Página pessoal com AnimatedStars background

### Styling Template
DevBlog copia esse design:
- AnimatedStars background
- ScaleFade animations
- GREEN (#42c920) accent color
- text-shadow glow effect

---

## `Nav`
**Arquivo:** `src/components/Nav/index.tsx`  
**Responsabilidade:** Navegação principal

### Links
- `/` (Home)
- `/about` (About)
- `/blog` (DevBlog) ← adicionado recentemente

---

## Componentes UI (Chakra)

### Used Throughout
- `Button` — toggles, CTAs
- `Box` — layout containers
- `VStack`, `HStack` — flex layouts
- `Text` — typography
- `Link` — routing

### Custom Colors
- `greenAccent: #42c920` — brand primary
- Tema light/dark via Chakra provider

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── GlobeBackground/
│   │   ├── index.tsx
│   │   ├── quakes.ts
│   │   ├── iss.ts
│   │   ├── ocean.ts
│   │   ├── volcanoes.ts
│   │   ├── wind.ts (empty after removal)
│   │   └── __tests__/
│   ├── WeatherBar/
│   ├── Nav/
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── About.tsx
│   ├── DevBlog/
│   │   ├── index.tsx
│   │   ├── PostRenderer.tsx
│   │   └── posts.ts
│   └── ...
└── routes/
    └── index.tsx
```
