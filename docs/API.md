# APIs Externas

## 🌋 USGS Earthquake Hazards Program

> **Desabilitado:** `loadQuakes()` está comentado em `GlobeBackground/index.tsx` (bug de minificação, ver [FEATURES.md](./FEATURES.md#bug-de-minificação-em-refs)). Esta API não é chamada atualmente.

**Endpoint:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson`  
**Método:** GET  
**Autenticação:** Nenhuma  
**Rate Limit:** Nenhum declarado (público)  
**CORS:** ✅ Habilitado  
**Timeout:** 10s  

### Response Format
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "properties": {
        "mag": 5.5,
        "place": "35 km NNE of Ruteng, Indonesia",
        "time": 1789954896315,
        "url": "https://earthquake.usgs.gov/..."
      },
      "geometry": {
        "type": "Point",
        "coordinates": [120.5793, -8.307, 10]
      }
    }
  ]
}
```

### Filtro
- Magnitude: ≥ 4.5
- Tempo: últimas 24h

### Uso no Código
```typescript
import { loadQuakes, parseQuakes } from './quakes';
const quakes = await loadQuakes();
```

---

## 🛰 wheretheiss.at

**Endpoint:** `https://api.wheretheiss.at/v1/satellites/25544`  
**Método:** GET  
**Autenticação:** Nenhuma  
**Rate Limit:** ~60 req/min (inferido)  
**CORS:** ✅ Habilitado  
**Timeout:** 10s  
**Polling:** 8s (custom interval)

### Response Format
```json
{
  "name": "ISS (ZARYA)",
  "id": 25544,
  "latitude": 51.6442,
  "longitude": -74.6961,
  "altitude": 408.75,
  "velocity": 27598.86,
  "visibility": "daylight",
  "footprint": 2388.72,
  "timestamp": 1790475000
}
```

### Uso no Código
```typescript
import { loadIssPosition, parseIssPosition } from './iss';
const iss = await loadIssPosition();
```

---

## 🌊 Open-Meteo Marine API

**Endpoint:** `https://marine-api.open-meteo.com/v1/marine`  
**Método:** GET (com query params)  
**Autenticação:** Nenhuma  
**Rate Limit:** 10k requests/dia (free tier)  
**CORS:** ✅ Habilitado  
**Timeout:** 10s

### Query Params
```
?latitude=0,10,20,...,90
&longitude=-180,-170,...,170
&current=ocean_surface_wave_significant_height,ocean_surface_wave_mean_wavelength,...
&hourly=u_component_of_current_10m,v_component_of_current_10m
```

### Response Format (Simplificado)
```json
{
  "latitude": [0, 10, 20, ...],
  "longitude": [-180, -170, ...],
  "hourly": {
    "time": ["2026-09-27T00:00", ...],
    "u_component_of_current_10m": [[...], ...],
    "v_component_of_current_10m": [[...], ...]
  }
}
```

### Grid
- Latitude: 0 to 90 (17 pontos, 10° spacing)
- Longitude: -180 to 170 (36 pontos, 10° spacing)
- Total: 612 pontos

### Response Size
- ~623 KB por request
- Tempo de resposta: ~2.6s

### Uso no Código
```typescript
import { loadOceanGrid, parseOceanResponse } from './ocean';
const oceanGrid = await loadOceanGrid();
```

---

## 🌋 Vasturiano Volcanoes Dataset

**URL:** `https://gist.githubusercontent.com/vasturiano/3c27138769a04d1780562ce04afbedf2/raw/.../world_volcanoes.json`  
**Autor:** Vasturiano (globe.gl creator)  
**Fonte:** Oregon State University volcano database  
**Total de Entries:** 425 vulcões  
**Autenticação:** Nenhuma  
**CORS:** ✅ Habilitado  
**Timeout:** 10s  
**Atualização:** Manual (não é live feed)

### Response Format
```json
[
  {
    "name": "Abu",
    "country": "Japan",
    "type": "Shield",
    "lat": 34.5,
    "lon": 131.6,
    "elevation": 641
  },
  ...
]
```

### Volcano Types
- Shield
- Cinder
- Composite
- Caldera
- Etc.

### Uso no Código
```typescript
import { loadVolcanoes, parseVolcanoes } from './volcanoes';
const volcanoes = await loadVolcanoes();
```

---

## NOAA NHC (ciclones tropicais)

**Feeds RSS:** `https://www.nhc.noaa.gov/index-{at,ep,cp,io,sh}.xml` (Atlântico, Pacífico Leste, Pacífico Central, Índico, Hemisfério Sul)  
**Autenticação:** Nenhuma  
**CORS:** ❌ Bloqueado — o browser usa o proxy `/api/noaa/<feed>.xml` (regra `/api/noaa/*` em `public/_redirects`)  
**Netlify Function:** `netlify/functions/noaa.ts` — proxy equivalente (User-Agent de browser, timeout 8s, `Cache-Control: public, max-age=300`, 404 pra feed fora da lista)  
**Formato:** XML com namespace `nhc:` (`nhc:Cyclone` → `nhc:center`, `nhc:name`, `nhc:wind` em mph, `nhc:pressure`)

### Uso no Código
```typescript
import { loadHurricanes } from './hurricanes';
const hurricanes = await loadHurricanes(); // cache em memória de 60s
```

---

## ArcGIS JavaScript SDK

**Importado via:** `<script>` tag no HTML (CDN)  
**Versão:** 4.x  
**Docs:** `https://developers.arcgis.com/javascript/latest/`

### Classes Usadas
- `esri/Map` — Mapa base
- `esri/views/SceneView` — Visualização 3D
- `esri/Graphic` — Pins/shapes renderizados
- `esri/layers/GraphicsLayer` — Container pra graphics

### Canvas Layers
- Custom canvas rendering via `View.layerId` system
- Não há classe específica; custom code com canvas context

---

## Resumo de Rate Limits

| API | Limit | Janela | Ação se Exceder |
|-----|-------|--------|-----------------|
| USGS | Ilimitado | - | N/A |
| wheretheiss | ~60 req/min | 1 min | Retry com backoff |
| Open-Meteo | 10k/dia | 24h | Fallback: [] |
| Vasturiano | ~1000 req/min (inferido) | 1 min | Fallback: [] |
| NOAA NHC | Não documentado (cache 5 min no proxy) | - | Fallback: último cache em memória |

---

## Error Handling

Todos os loaders implementam:
```typescript
try {
  const res = await fetch(URL, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return [];
  return parse(await res.json());
} catch {
  return []; // Silent fail
}
```

Nenhuma exception propaga; o globo continua renderizando mesmo se 1 API falhar.
