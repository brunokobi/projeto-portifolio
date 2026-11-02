# APIs Externas

## 🌋 USGS Earthquake Hazards Program

> **Ativo:** carregado uma vez quando o globo termina de montar (`loadQuakes()` em `GlobeBackground/index.tsx`).

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

## ArcGIS Living Atlas (feeds ao vivo)

**Base:** `https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/<serviço>/FeatureServer/<camada>/query`  
**Autenticação:** nenhuma  
**CORS:** ✅ liberado (não precisa de proxy)

| Serviço | Uso | Arquivo | Filtro |
|---|---|---|---|
| `Active_Hurricanes_v1` (camada 1) | Furacões (NHC + JTWC) | `hurricanes.ts` | observação mais recente por `STORMID` |
| `Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity` (0) | Incêndios | `hazards.ts` | `hours_old<=6 AND confidence='high' AND frp>=10`, até 500 |
| `CAP_Alerts_Feed` (0) | Alertas de emergência | `capAlerts.ts` | centroide da área (`returnCentroid`) |
| `Air_Quality_PM25_Latest_Results` (0) | AQI das cidades | `cities.ts`, `hazards.ts` | estação a até 50 km; leituras das últimas 48h |

Os furacões têm cache em memória de 60s em `loadHurricanes()`. O RSS da NOAA deixou de ser usado em 08/10/2026 e o proxy `noaa.ts` / `/api/noaa/*` foi removido em 02/11/2026.

---

## CelesTrak (satélites)

**Endpoint:** `https://celestrak.org/NORAD/elements/gp.php?GROUP=<grupo>&FORMAT=tle`  
**Grupos usados:** `gps-ops`, `galileo`, `weather`  
**Autenticação:** nenhuma  
**CORS:** ✅ liberado  
**Formato:** TLE em texto (3 linhas por satélite)

- A posição é calculada no navegador com SGP4 (`satellite.js`).
- O CelesTrak atualiza os grupos a cada ~2h e pede para não consultar com mais frequência. Por isso o TLE fica em cache por 2h; o polling de 10s só recalcula a posição.
- Às vezes responde 200 com uma mensagem de texto em vez de TLE. Nesse caso o cache anterior é mantido.
- O grupo `starlink` foi retirado (o CelesTrak retornava 403).

---

## Vento (GFS)

**Endpoint:** `https://raw.githubusercontent.com/Deasus/firestorm-wind-data/main/data/current-wind-surface.json`  
**Formato:** duas grades 360×181 (componentes U e V do vento a 1°), mesmo formato do earth.nullschool  
**Atualização:** o repositório é atualizado periodicamente (último commit em 31/10/2026 quando conferido)

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
| Vasturiano (vulcões) | ~1000 req/min (inferido) | 1 min | Fallback: [] |
| ArcGIS Living Atlas | Não documentado | - | Fallback: [] (furacões: último cache) |
| CelesTrak | ~1 consulta por grupo a cada 2h | 2h | Mantém o TLE em cache |

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
