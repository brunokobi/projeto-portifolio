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
  2. Na montagem já baixa os módulos do ArcGIS SDK (com `preconnect` no `index.html`); depois de 3s (fim da animação de abertura) cria o `SceneView`. Ao desmontar, chama `view.destroy()` para liberar o contexto WebGL.
  3. Quando a view fica pronta (`view.when`), chama `markGlobeReady()`, que libera a `WeatherBar` na Home. Quando o globo termina o primeiro carregamento (`whenFalseOnce(view, "updating")`), carrega terremotos, ISS (polling 8s), vulcões, furacões e alertas, e começa a rotação.
  4. Loop de desenho com `requestAnimationFrame` (`drawPins`).
  5. Ao desmontar: limpa timers e intervals e chama `resetGlobeReady()`.

### Loaders (`src/components/GlobeBackground/*.ts`)
- `satellites.ts` — TLEs do CelesTrak + SGP4 (cache de TLE 2h)
- `iss.ts` — wheretheiss.at
- `geo.ts` — cidades (`CITIES`); `cities.ts` — AQI real (OpenAQ via ArcGIS), buscado no primeiro hover de cada cidade
- `hazards.ts` — incêndios (NASA VIIRS via ArcGIS)
- `capAlerts.ts` — alertas CAP (ArcGIS)
- `quakes.ts` — USGS
- `volcanoes.ts` — Smithsonian GVP
- `hurricanes.ts` — Active Hurricanes (ArcGIS)
- `wind.ts` — grade de vento GFS
- `iconScale.ts` — fator de tamanho dos ícones pela altitude da câmera
- Removidos em 02/11/2026 por não estarem em uso: `aircraft.ts` (OpenSky bloqueia CORS), `aurora.ts`, `infrastructure.ts`, `ocean.ts`

## Fluxo de Dados

### Chat (n8n)
```
ChatWidget → POST /.netlify/functions/n8n-chat { chatInput, sessionId }
          → n8n-chat.ts (proxy; URL real em N8N_WEBHOOK_URL, timeout 55s)
          → webhook n8n (Chat Trigger → baixa /jarvis/perfil.md → agente único JARVIS)
          ← { output } → ChatWidget exibe (e fala, se áudio ativo)
```

### Voz do JARVIS (Whisper e Piper, na VPS)
```
Microfone → useWhisperRecorder (MediaRecorder + AnalyserNode, para após 1,5s de silêncio)
          → POST https://whisper.brunokobi.tech/inference (multipart, language=pt)
          ← { text } → vira a pergunta do chat
Resposta  → speak() → playPiper(): texto sem markdown, dividido em trechos (1º ≤120, demais ≤400)
          → GET https://tts.brunokobi.tech/tts.mp3?text&lang&speed, um <audio> por trecho
          → falha antes de tocar → Web Speech API (voz do navegador)
```
- Os dois serviços liberam CORS só para o site; não há proxy na Netlify
- Leituras do hover (`TextAudio`) usam o mesmo Piper
- `sessionId` único por visita (gerado no frontend) → Memória de Conversa do n8n
- Idioma da UI não é enviado; workflow fixo em português
- Detalhes: [FEATURES.md](./FEATURES.md#-chat-ia-n8n)

### Status da infra (página Projetos)
```
ServiceStatus → <img> de ping em n8n.brunokobi.tech e empresas.brunokobi.tech (status + latência, a cada 60s)
              → GET /.netlify/functions/infra-stats
              → infra-stats.ts → GET https://empresas.brunokobi.tech/estatisticas (cache 5 min)
              ← { empresas, municipios, processosJudiciais, socios, empresasComPendencia, fetchedAt }
```

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

## Minificação sem renomear identificadores

`build.minify: "esbuild"` com `esbuild.minifyIdentifiers: false` em `vite.config.ts` (desde 02/11/2026): minifica espaços e sintaxe, mas não renomeia identificadores. A renomeação causava `Cannot access X before initialization` em event handlers que liam objetos guardados em refs (foi o que desligou terremotos e o hover dos vulcões no passado). Não ligue `minifyIdentifiers` sem testar o hover no build de produção num navegador com GPU (o Chromium headless usa SwiftShader e o ArcGIS não renderiza o globo nele).
