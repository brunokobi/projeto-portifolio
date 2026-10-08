# Features em Tempo Real

## 🌋 Terremotos (Earthquakes)

**Arquivo:** `src/components/GlobeBackground/quakes.ts`  
**Fonte:** USGS Earthquake Hazards Program  
**URL:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson`  
**Atualização:** Live (últimas 24h)  
**Status:** ⛔ Desabilitado

> **Desabilitado completamente.** `loadQuakes()` está comentado em `GlobeBackground/index.tsx`, então nenhum dado é carregado e nada é renderizado nem aparece no hover. O botão de terremotos foi removido da `WeatherBar`. `quakes.ts` e os testes continuam no repositório.
> **Motivo:** bug de minificação (Vite/esbuild) em nomes de propriedades de objetos armazenados em refs, que gera `Cannot access X before initialization` em event handlers. Ver [Bug de minificação](#bug-de-minificação-em-refs) abaixo.
> As seções abaixo descrevem o comportamento original, para quando a feature for reativada.

### Data Structure
```typescript
interface Quake {
  lat: number;
  lon: number;
  mag: number;
  place: string;
  time: number; // epoch ms
}
```

### Parsing
- GeoJSON features → extract coords, magnitude, place, time
- Ignora: features sem magnitude ou sem coordenadas válidas

### Renderização
- **Ring:** círculo com raio baseado em magnitude
  - `baseRadius + (mag - 4.5) * 6px`
  - Pulsing animation (fade in/out)
- **Cor:** magnitude → amarelo/laranja/vermelho
  - `M4.6: #ffdc00` (amarelo)
  - `M5.2: #ffa300` (laranja)
  - `M5.7: #ff6a00` (laranja escuro)
  - `M6.0+: #ff2d2d` (vermelho)

### Hover Tooltip
```
🌋 Terremoto
M5.2 (escala Richter) — 35 km NNE of Ruteng, Indonesia
há 2h
```

### Testing
- 4 test cases em `__tests__/quakes.test.ts`
- Cobertura: parsing, color scaling, radius calculation

---

## 🛰 ISS (International Space Station)

**Arquivo:** `src/components/GlobeBackground/iss.ts`  
**Fonte:** wheretheiss.at API  
**URL:** `https://api.wheretheiss.at/v1/satellites/25544`  
**Polling:** 8 segundos  
**Status:** ✅ Completo

### Data Structure
```typescript
interface IssPosition {
  lat: number;
  lon: number;
  altitude?: number; // km acima da Terra
  velocity?: number; // km/s
}
```

### Polling
```typescript
const ISS_POLL_INTERVAL_MS = 8000;
setInterval(() => loadIssPosition(), ISS_POLL_INTERVAL_MS);
```

### Renderização
- **Ellipse:** 20x15px, color #00f (azul brilhante)
- **Blink effect:** opacity oscila (0.5 → 1.0)
  - Indica movimento rápido/ativo

### Hover Tooltip
```
🛰 ISS
40,000 km de altitude
27,600 km/h
```

### Testing
- 4 test cases em `__tests__/iss.test.ts`
- Cobertura: parsing, NaN validation

---

## 🌋 Vulcões (Volcanoes)

**Arquivo:** `src/components/GlobeBackground/volcanoes.ts`  
**Fonte:** Vasturiano gist (OSU dataset)  
**URL:** `https://gist.githubusercontent.com/vasturiano/.../world_volcanoes.json`  
**Total:** 425 vulcões  
**Atualização:** Static (carregado 1x)  
**Status:** ⛔ Hover desabilitado (pins ainda são desenhados)

> **Hover/tooltip desabilitado:** o bloco de detecção de hover dos vulcões está comentado em `GlobeBackground/index.tsx` (marcado `TEMP`). O campo `elevation` foi removido de `volcanoScreenPosRef`, então o tooltip não exibe mais elevação. Os pins triangulares continuam sendo desenhados quando o toggle VULCÕES está ligado.
> **Motivo:** bug de minificação (Vite/esbuild) em nomes de propriedades de objetos armazenados em refs. Ver [Bug de minificação](#bug-de-minificação-em-refs) abaixo.

### Data Structure
```typescript
interface Volcano {
  name: string;
  country: string;
  type: string; // Shield, Cinder, Composite, etc
  lat: number;
  lon: number;
  elevation: number; // metros
}
```

### Parsing
- JSON array → extract name/country/type/lat/lon/elevation
- Ignora: entries sem name ou lat/lon numérico
- Defaults: country/type="" se ausente, elevation=0

### Renderização
- **Pin:** triângulo desenhado no canvas
- **Color:** `volcanoColor(type)`
- **Size:** `volcanoRadius(elevation)`

### Hover Tooltip (desabilitado)
```
🌋 Mount Fuji
Japão (Japan)
Tipo: Stratocone
Elevação: 3,776m
```

### Testing
- 4 test cases em `__tests__/volcanoes.test.ts`
- Cobertura: parsing, default handling

### Para reativar
1. Resolver o bug de minificação (ver abaixo)
2. Descomentar o bloco de hover dos vulcões e restaurar `elevation` em `volcanoScreenPosRef`

---

## 🌀 Furacões (Hurricanes)

**Arquivo:** `src/components/GlobeBackground/hurricanes.ts`  
**Fonte:** NOAA National Hurricane Center (5 feeds RSS, ver [API.md](./API.md))  
**Atualização:** Load único ao entrar na página (cache 60s)  
**Status:** ✅ Completo

- Parsing: `nhc:Cyclone` → nome, lat/lon, vento (mph → km/h), pressão, categoria Saffir-Simpson
- Renderização: espiral colorida por categoria (`hurricaneColor`), raio por vento (`hurricaneRadius`)
- Hover: nome, vento (km/h), pressão (mb), categoria
- Toggle: `globeHurricanesToggle` (localStorage `globeHurricanes`)

---

## 🏙️ Cidades e AQI

**Arquivos:** `src/components/GlobeBackground/geo.ts` (`CITIES`, 42 cidades), `index.tsx`  
**Clima/hora local:** Open-Meteo (`timezone=auto`), cache de 2h

- Cada cidade é um anel verde pulsante; o card de hover mostra hora local, temperatura, clima e tags
- AQI aparece só no card de hover, com classificação (`getAQILabel`): Bom, Moderado, Insalubre (Sensíveis), Insalubre, Muito Insalubre, Perigoso
- Não há mais pontos de AQI separados no mapa nem renderização de `TOP_CITIES`

---

## 💬 Chat IA (n8n)

**Arquivos:** `src/components/ChatWidget/index.tsx`, `src/components/ChatButton/index.tsx`, `netlify/functions/n8n-chat.ts`  
**Backend:** workflow "chatBruno - Multi-Agente RAG" no n8n (self-hosted), acessado via proxy Netlify  
**Status:** ✅ Ativo

- Envio: `POST /.netlify/functions/n8n-chat` com `{ chatInput, sessionId }` (formato do Chat Trigger do n8n; o formato antigo `{ message, language }` faz o workflow retornar 500)
- Resposta: o texto vem em `data.output`; se vier vazio, o widget mostra mensagem de fallback; erro de rede/HTTP mostra mensagem de erro
- `sessionId`: UUID gerado uma vez por carregamento da página (variável de módulo `chatSessionId`, `crypto.randomUUID()` com fallback). Mantém a Memória de Conversa do n8n entre mensagens da mesma visita; recarregar a página inicia conversa nova
- Idioma: o seletor de idioma da UI **não tem efeito** no n8n (o workflow é fixo em português e o payload não leva idioma). Ele só afeta a voz do áudio (TTS)
- Config: variável `N8N_WEBHOOK_URL` no Netlify (obrigatória; ausente → function retorna 500)
- Pontos de entrada: botão flutuante global (`ChatButton`, abre o widget num Drawer; oculto em `/news`) e rota `/chat`

---

## 🌬 Vento (Wind) — REMOVIDO

**Arquivo:** `src/components/GlobeBackground/wind.ts`  
**Status:** ❌ Removido (heatmap removido, partículas ainda rodando)

### O que foi removido
- `buildHeatmapPixels()` — Uint8ClampedArray RGBA generator
- `addWindHeatmapLayer()` — heatmap graphic creation
- Heatmap layer toggle

### O que permanece
- Particle advection (solid lines)
- Grid-based vector field sampling
- Renderização via canvas

---

## Data Loading Strategy

### Parallel Loading
```javascript
// loadQuakes() está desabilitado (ver Terremotos)
const [quakes, iss, volcanoes] = await Promise.all([
  loadQuakes(),
  loadIssPosition(),
  loadVolcanoes()
]);
```

### Error Handling
- Timeout: 10s por request (AbortSignal.timeout)
- Fallback: retorna `[]` se falhar
- Silent fail: não interrompe outras features

### Caching
- Quakes: desabilitado (não carrega)
- ISS: polling contínuo (8s)
- Volcanoes: load once (static)

---

## Bug de minificação em refs

Terremotos e vulcões (hover) foram desabilitados por um bug de minificação no build de produção (Vite/esbuild): ao acessar propriedades de objetos guardados em refs (`quakeScreenPosRef`, `volcanoScreenPosRef`) dentro de event handlers, ocorre `Cannot access X before initialization`. Tentativas anteriores (remover `elevation` do ref de vulcões) não resolveram. A causa raiz não está documentada no repositório.

**Estado atual:** terremotos desabilitados por completo; vulcões sem hover. Reativação pendente de correção.
