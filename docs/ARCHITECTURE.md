# Arquitetura

## Visão Geral

```
┌──────────────────────────────────────────┐
│            React App (Vite)              │
│  ┌────────────────────────────────────┐  │
│  │ WeatherBar (botões das camadas)    │  │  ← aparece quando o globo fica pronto
│  ├────────────────────────────────────┤  │
│  │ Pages (Home, About, Blog, ...)     │  │
│  │  └─ Home → GlobeBackground (lazy)  │  │
│  │      ├─ ArcGIS SceneView (globo)   │  │
│  │      ├─ canvas de vento            │  │
│  │      └─ canvas de pins (drawPins)  │  │
│  ├────────────────────────────────────┤  │
│  │ Nav (menu fixo embaixo)            │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
        │                    │
        ▼                    ▼
  Loaders (*.ts)       CustomEvents
  CelesTrak, USGS,     globe<Camada>Toggle
  ArcGIS Living Atlas, (WeatherBar → Globe)
  Open-Meteo, ...
```

## Componentes Principais

### `GlobeBackground` (`src/components/GlobeBackground/index.tsx`)
- **Responsabilidade:** renderizar o globo 3D e todas as camadas.
- **Ciclo de vida:**
  1. Ao montar, dispara satélites, qualidade do ar e incêndios em paralelo e liga o polling de satélites (10s).
  2. Depois de 3s carrega o ArcGIS SDK e cria o `SceneView`.
  3. Quando a view fica pronta (`view.when`), chama `markGlobeReady()`, que libera a `WeatherBar` na Home. Quando o globo termina o primeiro carregamento (`whenFalseOnce(view, "updating")`), carrega terremotos, ISS (polling 8s), vulcões, furacões e alertas, e começa a rotação.
  4. Loop de desenho com `requestAnimationFrame` (`drawPins`).
  5. Ao desmontar: limpa timers e intervals e chama `resetGlobeReady()`.

### Loaders (`src/components/GlobeBackground/*.ts`)
- `satellites.ts` — TLEs do CelesTrak + SGP4 (cache de TLE 2h)
- `iss.ts` — wheretheiss.at
- `cities.ts`, `geo.ts` — cidades, AQI (OpenAQ via ArcGIS)
- `hazards.ts` — incêndios (NASA VIIRS via ArcGIS)
- `capAlerts.ts` — alertas CAP (ArcGIS)
- `quakes.ts` — USGS
- `volcanoes.ts` — Smithsonian GVP
- `hurricanes.ts` — Active Hurricanes (ArcGIS)
- `wind.ts` — grade de vento GFS
- `iconScale.ts` — fator de tamanho dos ícones pela altitude da câmera
- Sem uso no globo: `aircraft.ts` (OpenSky bloqueia CORS), `aurora.ts` (removida), `infrastructure.ts` (tech hubs não são desenhados), `ocean.ts` (legado)

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
Satélites: loadSatellites() a cada 10s → recalcula posição (TLE em cache 2h)
ISS:       loadIssPosition() a cada 8s
Demais:    carregadas uma vez quando o globo monta
```

### Renderização

#### Canvas de vento
- 700 partículas com advecção por interpolação bilinear; rastro com `destination-in`.

#### Canvas de pins (`drawPins`)
- Cada camada projeta lat/lon para a tela com `view.toScreen()` e só desenha o que está no lado visível (`isFacing`).
- Raios, offsets e fontes são multiplicados por `iconScaleForAltitude(cam.z)`: tamanho cheio até 8.000 km de altitude, metade a partir de 22.000 km.

#### Hover
- Cada camada guarda as posições de tela num ref (`satelliteScreenPosRef`, `quakeScreenPosRef`, `volcanoScreenPosRef`, ...).
- No `pointer-move`, a distância ao ponto < 16px mostra o tooltip.

## State Management

Refs (sem re-render):
- `<camada>ScreenPosRef` — posições projetadas para o hover
- `<camada>EnabledRef` — estado ON/OFF de cada camada
- `hoverInfo` — tooltip (useState)

Eventos (`window.dispatchEvent`, WeatherBar → GlobeBackground):
- `globeSatellitesToggle`, `globeIssToggle`, `globeWildfiresToggle`, `globeCapAlertsToggle`, `globeQuakesToggle`, `globeVolcanoesToggle`, `globeHurricanesToggle`, `globeWindToggle`, `globeNightToggle`, `globeRotationToggle`

Globo pronto:
- `src/utils/globeReady.ts` — `markGlobeReady()` / `resetGlobeReady()` no globo e `useGlobeReady()` na `WeatherBar`

## Performance

- **Canvas compositing:** `destination-in` para os rastros do vento
- **Polling barato dos satélites:** a cada 10s só recalcula a posição; rede só a cada 2h
- **Hover em espaço de tela:** só calcula quando o mouse se move

## Minificação desligada

`build.minify: false` em `vite.config.ts`. A minificação causava `Cannot access X before initialization` em event handlers que liam objetos guardados em refs, o que desligou terremotos e o hover dos vulcões no passado. Com a minificação desligada, as duas camadas voltaram. Não reative sem testar o hover no build de produção.
