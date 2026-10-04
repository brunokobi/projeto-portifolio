# Features em Tempo Real

## 🌋 Terremotos (Earthquakes)

**Arquivo:** `src/components/GlobeBackground/quakes.ts`  
**Fonte:** USGS Earthquake Hazards Program  
**URL:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson`  
**Atualização:** Live (últimas 24h)  
**Status:** ✅ Completo

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

## 🌊 Correntes Marítimas (Ocean Currents)

**Arquivo:** `src/components/GlobeBackground/ocean.ts`  
**Fonte:** Open-Meteo Marine API  
**URL:** `https://marine-api.open-meteo.com/v1/marine`  
**Grid:** 36×17 points (10° spacing, global)  
**Atualização:** 1x load (static)  
**Status:** ✅ Completo

### Data Structure
```typescript
interface OceanGrid {
  lat: number[];
  lon: number[];
  u: number[][]; // velocidade zonal (E-W)
  v: number[][]; // velocidade meridional (N-S)
  mag: number[][]; // magnitude
}

interface OceanParticle {
  lat: number;
  lon: number;
  age: number;
}
```

### Rendering
- **Lines:** traço dashed (3px solid, 4px gap)
  - Diferencia visualmente do vento (solid)
- **Color:** magnitude → gradiente azul→verde→vermelho
  - Lento: azul (#0066ff)
  - Médio: verde (#00ff00)
  - Rápido: vermelho (#ff0000)

### Physics
- **Z-altitude:** 400km (bem acima do oceano visível)
- **Time step:** 30000s (simulação lenta/fluida)
- **Advection:** bilinear interpolation no grid U/V

### Testing
- 14 test cases em `__tests__/ocean.test.ts`
- Cobertura: grid parsing, color interpolation, particle lifecycle

---

## 🌋 Vulcões (Volcanoes)

**Arquivo:** `src/components/GlobeBackground/volcanoes.ts`  
**Fonte:** Vasturiano gist (OSU dataset)  
**URL:** `https://gist.githubusercontent.com/vasturiano/.../world_volcanoes.json`  
**Total:** 425 vulcões  
**Atualização:** Static (carregado 1x)  
**Status:** 🚧 Em Progresso

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

### Renderização (Pendente)
- **Pin:** triângulo ou marcador vulcânico
- **Color:** tipo de vulcão (Shield/Cinder/etc)
- **Size:** elevação (maior = mais alto)

### Hover Tooltip (Pendente)
```
🌋 Mount Fuji
Japão (Japan)
Tipo: Stratocone
Elevação: 3,776m
```

### Testing
- 4 test cases em `__tests__/volcanoes.test.ts`
- Cobertura: parsing, default handling

### Next Steps
1. Adicionar `volcanoColor()` helper (type → color)
2. Renderizar triangles em `drawPins()`
3. Hit detection + tooltips
4. Commit final

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
const [quakes, iss, ocean, volcanoes] = await Promise.all([
  loadQuakes(),
  loadIssPosition(),
  loadOceanGrid(),
  loadVolcanoes()
]);
```

### Error Handling
- Timeout: 10s por request (AbortSignal.timeout)
- Fallback: retorna `[]` se falhar
- Silent fail: não interrompe outras features

### Caching
- Quakes: recarrega periodicamente (globeQuakesToggle event)
- ISS: polling contínuo (8s)
- Ocean: load once (static)
- Volcanoes: load once (static)
