# Arquitetura

## Visão Geral

```
┌─────────────────────────────────────┐
│         React App (Vite)            │
│  ┌──────────────────────────────┐   │
│  │   Pages (Home, About, Blog)  │   │
│  ├──────────────────────────────┤   │
│  │   GlobeBackground            │   │
│  │  ┌────────────────────────┐  │   │
│  │  │  ArcGIS SceneView      │  │   │
│  │  │  ┌──────────────────┐  │  │   │
│  │  │  │ Canvas Layers    │  │  │   │
│  │  │  │ (wind)           │  │  │   │
│  │  │  ├──────────────────┤  │  │   │
│  │  │  │ Graphics (pins)  │  │  │   │
│  │  │  │ quakes/ISS/vol   │  │  │   │
│  │  │  └──────────────────┘  │  │   │
│  │  └────────────────────────┘  │   │
│  ├──────────────────────────────┤   │
│  │   WeatherBar (toggles)       │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
        │              │
        ▼              ▼
    Data Loaders  Event System
    ┌────────┐    ┌────────────┐
    │ APIs   │    │ Custom     │
    │ (USGS, │    │ Events     │
    │ Open-  │    │ globeXxxxx │
    │ Meteo) │    │ Toggle     │
    └────────┘    └────────────┘
```

## Componentes Principais

### `GlobeBackground` (`src/components/GlobeBackground/index.tsx`)
- **Responsabilidade:** Renderizar globo 3D + all overlays
- **Ciclo de vida:** 
  1. Load (ArcGIS SDK setup)
  2. Fetch data (ISS, volcanoes; quakes desabilitado)
  3. Render loop (requestAnimationFrame)
  4. Cleanup

### Data Loaders (`src/components/GlobeBackground/*.ts`)
Arquivos de dados/parsing:
- `quakes.ts` — USGS parsing + color/radius helpers
- `iss.ts` — wheretheiss.at parsing
- `ocean.ts` — legado: correntes marítimas removidas, arquivo sem uso
- `volcanoes.ts` — Vasturiano gist parsing
- `wind.ts` — removed (heatmap removido)

## Fluxo de Dados

### Chat (n8n)
```
ChatWidget → POST /.netlify/functions/n8n-chat { chatInput, sessionId }
          → n8n-chat.ts (proxy; URL real em N8N_WEBHOOK_URL, timeout 55s)
          → webhook n8n (Chat Trigger → agentes + RAG)
          ← { output } → ChatWidget exibe (e fala, se áudio ativo)
```
- `sessionId` único por visita (gerado no frontend) → Memória de Conversa do n8n
- Idioma da UI não é enviado; workflow fixo em português
- Detalhes: [FEATURES.md](./FEATURES.md#-chat-ia-n8n)

### Tempo Real (Polling)
```
ISS:      load() → parseIssPosition() → 8s poll → update tooltips
Quakes:   [desabilitado] loadQuakes() comentado — nada é carregado
Volcanoes: load() → parseVolcanoes() → 1x load (static)
```

### Renderização

#### Canvas Layers (Particles)
- **Wind:** drawLine() solid (removido heatmap)
- Advection via bilinear interpolation

#### Graphics (Pins)
```
Quakes:    [desabilitado] circle + pulsing ring, magnitude→size/color
ISS:       ellipse + blink effect, altitude/velocity tooltip
Volcanoes: triangular pin; hover/tooltip [desabilitado] (minificação)
```

#### Hover Detection
- `quakeScreenPosRef`, `issScreenPosRef`, `volcanoScreenPosRef` arrays
- Pointermove listener → distance check < 16px → show tooltip

## State Management

Refs (não precisa rerender):
- `sceneViewRef` — ArcGIS SceneView instance
- `quakeScreenPosRef` — projected screen positions
- `hoverInfo` — tooltip state (useState)

Event Listeners:
- `globeIssToggle`, `globoVolcanoesToggle` (`globeQuakesToggle` sem emissor: terremotos desabilitados)
- CustomEvent via window dispatchEvent (WeatherBar → GlobeBackground)

## Performance

- **Canvas compositing:** destination-in pra motion trails
- **Bilinear interpolation:** smooth particle advection sem resampling
- **Parallel fetches:** Promise.all pra ISS/volcanoes
- **Screen-space hover:** só calcula quando mouse move

## Limitação conhecida: minificação em refs

Hover de terremotos e vulcões está desabilitado por bug de minificação (Vite/esbuild) em propriedades de objetos guardados em refs (`Cannot access X before initialization`). Detalhes em [FEATURES.md](./FEATURES.md#bug-de-minificação-em-refs).
