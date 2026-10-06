# IBTrACS Integration Guide

## Overview
Adds historical + recent tropical cyclone data from IBTrACS to your globe, rendering alongside NOAA furacões. Covers Pacific Typhoons, Atlantic Hurricanes, and Indian Ocean Cyclones.

## Backend Setup (VPS)

### 1. Install dependencies
```bash
pip install flask pandas requests
```

### 2. Create API server
Copy `ibtracs_api.py` to VPS:
```bash
/opt/ibtracs/api.py
```

### 3. Create systemd service
```bash
sudo tee /etc/systemd/system/ibtracs.service << 'EOF'
[Unit]
Description=IBTrACS API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/ibtracs
ExecStart=/usr/bin/python3 /opt/ibtracs/api.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ibtracs
sudo systemctl start ibtracs
```

### 4. Verify API
```bash
curl http://localhost:3012/health
curl http://localhost:3012/api/ibtracs
```

## Frontend Integration

### 1. Copy loader file
Copy `ibtracs_loader.ts` to:
```
src/components/GlobeBackground/ibtracs.ts
```

### 2. Update GlobeBackground/index.tsx

**Add import:**
```typescript
import { loadIBTraCS, ibtracsColor, ibtracsRadius, drawIBTraCSIcon, type IBTraCS } from "./ibtracs";
```

**Add state:**
```typescript
const ibtracsEnabledRef = useRef(localStorage.getItem("globeIBTraCS") !== "0");
```

**Add listener (in useEffect):**
```typescript
globeIBTraCSToggle: (e: Event) => {
  ibtracsEnabledRef.current = (e as CustomEvent).detail.ibtracsEnabled as boolean;
},
```

**Add loading (Promise.all section):**
```typescript
let ibtracs: IBTraCS[] = [];
// Load IBTrACS
loadIBTraCS().then((d) => { ibtracs = d; });
```

**Add rendering (in drawPins function):**
```typescript
// IBTrACS cyclones
if (ibtracsScreenPosRef.current.length !== ibtracs.length) {
  ibtracsScreenPosRef.current = new Array(ibtracs.length).fill(null);
}
if (ibtracsEnabledRef.current) {
  for (let i = 0; i < ibtracs.length; i++) {
    ibtracsScreenPosRef.current[i] = null;
    const ibt = ibtracs[i];
    if (!isFacing(cam.latitude, cam.longitude, ibt.lat, ibt.lon)) continue;
    try {
      const sp = view.toScreen(
        new Point({ longitude: ibt.lon, latitude: ibt.lat, z: 100000 })
      );
      if (!sp) continue;
      ibtracsScreenPosRef.current[i] = { x: sp.x, y: sp.y, name: ibt.name, windSpeed: ibt.windSpeed };
      const color = ibtracsColor(ibt.type);
      const radius = ibtracsRadius(ibt.windSpeed);
      drawIBTraCSIcon(ctx, sp.x, sp.y, radius, color, ibt.name);
    } catch {
      // ponto fora do campo de visão
    }
  }
} else {
  ibtracsScreenPosRef.current.fill(null);
}
```

### 3. Update WeatherBar/index.tsx

**Add state:**
```typescript
const [ibtracsEnabled, setIBTraCSEnabled] = useState(() => localStorage.getItem("globeIBTraCS") !== "0");
```

**Add toggle handler:**
```typescript
const toggleIBTraCS = useCallback(() => {
  const next = !ibtracsEnabled;
  setIBTraCSEnabled(next);
  localStorage.setItem("globeIBTraCS", next ? "1" : "0");
  window.dispatchEvent(new CustomEvent("globeIBTraCSToggle", { detail: { ibtracsEnabled: next } }));
}, [ibtracsEnabled]);
```

**Add button:**
```typescript
<Text
  as="button"
  fontSize="xs"
  fontFamily="monospace"
  color={GREEN}
  cursor="pointer"
  onClick={toggleIBTraCS}
  title={ibtracsEnabled ? "Desativar IBTrACS" : "Ativar IBTrACS"}
  style={{ background: "none", border: "none", padding: 0 }}
  _hover={{ opacity: 0.7 }}
>
  {ibtracsEnabled ? "🌀 IBTRACS ON" : "🌀 IBTRACS OFF"}
</Text>
```

### 4. Add hover handler
Add to pointer-move event in GlobeBackground (alongside NOAA hover code):
```typescript
if (!over) {
  const ibtracsPositions = ibtracsScreenPosRef.current;
  for (let i = 0; i < ibtracsPositions.length; i++) {
    const ip = ibtracsPositions[i];
    if (!ip) continue;
    const dx = evt.x - ip.x, dy = evt.y - ip.y;
    if (dx * dx + dy * dy < 24 * 24) {
      over = true;
      const key = `ibtracs-${i}`;
      if (hoveredNameRef.current !== key) {
        hoveredNameRef.current = key;
        const lines = [`🌀 ${ip.name}`];
        if (ip.windSpeed) lines.push(`Vento: ${ip.windSpeed} km/h`);
        setHoverInfo({ x: evt.x, y: evt.y, lines });
        setHoverCity(null);
      }
      isHoveringRef.current = true;
      break;
    }
  }
}
```

## Testing

1. Start VPS service: `sudo systemctl start ibtracs`
2. Verify API: `curl http://localhost:3012/api/ibtracs | jq | head -20`
3. Build frontend: `npm run build`
4. Test toggle in browser
5. Check console for errors

## Expected Result
- Toggle "🌀 IBTRACS" in WeatherBar
- Cyclones render as spirals on globe
- Hover shows name + wind speed
- Covers typhoons, hurricanes, tropical storms globally
- Updates every hour from cache

## Troubleshooting

**API not responding:**
```bash
sudo systemctl status ibtracs
sudo journalctl -u ibtracs -f
```

**No cyclones showing:**
- Check if IBTrACS has recent data (API returns empty on slow data days)
- Verify frontend is calling correct port (3012)
- Check browser console for CORS errors

**Performance:**
- Caches for 1 hour to reduce API calls
- First load may take 10-20s (IBTrACS is large)
