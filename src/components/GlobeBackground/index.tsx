import { useEffect, useRef, useState } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";

// Checa se lat/lon está na metade visível do globo em relação à câmera
const isFacing = (camLat: number, camLon: number, ptLat: number, ptLon: number): boolean => {
  const r = Math.PI / 180;
  const cLat = camLat * r, cLon = camLon * r;
  const pLat = ptLat  * r, pLon = ptLon  * r;
  const dot =
    Math.cos(cLat) * Math.cos(cLon) * Math.cos(pLat) * Math.cos(pLon) +
    Math.cos(cLat) * Math.sin(cLon) * Math.cos(pLat) * Math.sin(pLon) +
    Math.sin(cLat) * Math.sin(pLat);
  return dot > 0.1; // margem para evitar flickering na borda
};

// Interpolação esférica entre dois pontos na superfície do globo
const slerpPoint = (
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  t: number
): { lat: number; lon: number } => {
  const r = Math.PI / 180;
  const φ1 = lat1 * r, λ1 = lon1 * r;
  const φ2 = lat2 * r, λ2 = lon2 * r;
  const x1 = Math.cos(φ1) * Math.cos(λ1), y1 = Math.cos(φ1) * Math.sin(λ1), z1 = Math.sin(φ1);
  const x2 = Math.cos(φ2) * Math.cos(λ2), y2 = Math.cos(φ2) * Math.sin(λ2), z2 = Math.sin(φ2);
  const dot = Math.max(-1, Math.min(1, x1*x2 + y1*y2 + z1*z2));
  const angle = Math.acos(dot);
  if (angle < 0.0001) return { lat: lat1, lon: lon1 };
  const s = Math.sin(angle);
  const w1 = Math.sin((1 - t) * angle) / s;
  const w2 = Math.sin(t * angle) / s;
  return {
    lat: Math.asin(Math.max(-1, Math.min(1, w1 * z1 + w2 * z2))) / r,
    lon: Math.atan2(w1 * y1 + w2 * y2, w1 * x1 + w2 * x2) / r,
  };
};

const HOME = { name: "Vitória-ES", lat: -20.3155, lon: -40.3128 };

interface ArcState {
  points: any[];
  fromName: string;
  fromLat: number;
  fromLon: number;
  progress: number;
  phase: "drawing" | "holding" | "fading";
  startTime: number;
  fadeStart: number;
  opacity: number;
}

const CITIES = [
  // América do Sul
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Vitória-ES", lat: -20.3155, lon: -40.3128 },
  { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
  // América do Norte
  { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  // Europa
  { name: "Madrid", lat: 40.4168, lon: -3.7038 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Berlin", lat: 52.52, lon: 13.405 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  // Oriente Médio / África
  { name: "Istanbul", lat: 41.0151, lon: 28.9795 },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708 },
  // Ásia
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Seoul", lat: 37.5665, lon: 126.978 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  // Oceania / Pacífico
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Auckland", lat: -36.8485, lon: 174.7633 },
  { name: "Honolulu", lat: 21.3069, lon: -157.8583 },
];

interface ClickInfo {
  x: number;
  y: number;
  text: string;
}

interface UserLoc {
  name: string;
  lat: number;
  lon: number;
}

const GlobeBackground = () => {
  setDefaultOptions({ css: true });
  const mountedRef = useRef(true);
  const viewRef = useRef<any>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userLocRef = useRef<UserLoc | null>(null);
  const userPtRef = useRef<any>(null);
  const activeArcRef = useRef<ArcState | null>(null);
  const cityScreenPosRef = useRef<Array<{ x: number; y: number } | null>>(
    new Array(CITIES.length).fill(null)
  );
  const dayLayerRef = useRef<any>(null);
  const nightLayerRef = useRef<any>(null);
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);

  // Geolocalização do visitante → pin especial no globo
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "pt-BR,pt;q=0.9" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Você";
          userLocRef.current = { name: city, lat: latitude, lon: longitude };
        } catch {
          userLocRef.current = { name: "Você", lat: latitude, lon: longitude };
        }
      },
      () => {
        // permissão negada — sem pin
      }
    );
  }, []);

  // Escuta evento globeNightToggle disparado pelo WeatherBar
  useEffect(() => {
    const applyNight = (isNight: boolean) => {
      const dayL = dayLayerRef.current;
      const nightL = nightLayerRef.current;
      if (dayL && nightL) {
        dayL.visible = !isNight;
        nightL.visible = isNight;
      }
      const el = document.getElementById("globeBgDiv");
      if (el) el.style.filter = isNight ? "brightness(0.6)" : "";
    };

    const handler = (e: Event) => applyNight((e as CustomEvent).detail.nightMode);
    window.addEventListener("globeNightToggle", handler);
    return () => window.removeEventListener("globeNightToggle", handler);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      loadModules([
        "esri/config",
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/layers/BaseTileLayer",
        "esri/Basemap",
        "esri/layers/ElevationLayer",
        "esri/layers/BaseElevationLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/geometry/Mesh",
        "esri/core/watchUtils",
      ])
        .then(
          ([
            esriConfig,
            Map,
            SceneView,
            TileLayer,
            BaseTileLayer,
            Basemap,
            ElevationLayer,
            BaseElevationLayer,
            Graphic,
            Point,
            Mesh,
            watchUtils,
          ]) => {
            if (!mountedRef.current) return;

            esriConfig.apiKey = import.meta.env.VITE_ESRI_API_KEY;

            const R = 6358137;
            const offset = 300000;

            const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
              properties: { exaggerationTopography: null, exaggerationBathymetry: null },
              load() {
                this._elevation = new ElevationLayer({
                  url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer",
                });
                this.addResolvingPromise(this._elevation.load());
              },
              fetchTile(level: unknown, row: unknown, col: unknown) {
                return this._elevation
                  .fetchTile(level, row, col)
                  .then((data: { values: number[] }) => {
                    for (let i = 0; i < data.values.length; i++) {
                      data.values[i] =
                        data.values[i] >= 0
                          ? data.values[i] * this.exaggerationTopography
                          : data.values[i] * this.exaggerationBathymetry;
                    }
                    return data;
                  });
              },
            });

            const isNightSaved = localStorage.getItem("globeNight") === "1";

            const dayLayer = new TileLayer({
              url: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
              copyright: "Tiles © Esri",
              visible: true,
            });
            // BaseTileLayer personalizado: coloriza cada tile via Canvas 2D
            // antes do ESRI renderizar — só afeta os tiles, não estrelas/atmosfera
            const GoldenNightLayer = BaseTileLayer.createSubclass({
              fetchTile(level: number, row: number, col: number) {
                const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/${level}/${row}/${col}.png`;
                return new Promise<HTMLCanvasElement>((resolve) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  const sz = 256;
                  img.onload = () => {
                    const w = img.width || sz, h = img.height || sz;
                    const canvas = document.createElement("canvas");
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) { resolve(canvas); return; }
                    ctx.drawImage(img, 0, 0);

                    // Mapeamento pixel a pixel: transforma cinza em paleta de luzes quentes
                    // preto → preto | baixo brilho → âmbar | alto brilho → ouro/branco-dourado
                    const id = ctx.getImageData(0, 0, w, h);
                    const d = id.data;
                    for (let i = 0; i < d.length; i += 4) {
                      const b = d[i] / 255;              // brightness 0–1 (grayscale)
                      const e = Math.pow(b, 0.65);       // realça midtones
                      d[i]   = Math.min(255, e * 255);               // R: pleno
                      d[i+1] = Math.min(255, e * e * 230);           // G: quadrático → âmbar/ouro
                      d[i+2] = Math.min(255, Math.pow(e, 3.5) * 120); // B: cúbico → toque azul só no núcleo
                    }
                    ctx.putImageData(id, 0, 0);
                    resolve(canvas);
                  };
                  img.onerror = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = sz; canvas.height = sz;
                    resolve(canvas);
                  };
                  img.src = url;
                });
              },
            });

            const nightLayer = new GoldenNightLayer({
              copyright: "NASA Black Marble — VIIRS 2016 / NASA GIBS",
              visible: false,
            });
            dayLayerRef.current = dayLayer;
            nightLayerRef.current = nightLayer;

            const basemap = new Basemap({
              baseLayers: [dayLayer, nightLayer],
            });

            const map = new Map({
              basemap,
              ground: {
                layers: [
                  new ExaggeratedElevationLayer({
                    exaggerationBathymetry: 60,
                    exaggerationTopography: 40,
                  }),
                ],
              },
            });

            const view = new SceneView({
              container: "globeBgDiv",
              map,
              alphaCompositingEnabled: true,
              qualityProfile: "medium",
              camera: {
                position: [-55.03975781, 14.94826384, 65000000],
                heading: 0,
                tilt: 0,
              },
              environment: {
                background: { type: "color", color: [0, 0, 0, 0] },
                starsEnabled: true,
                atmosphereEnabled: true,
                atmosphere: { quality: "high" },
                lighting: { type: "virtual" },
              },
              constraints: {
                altitude: { min: 4000000, max: 70000000 },
              },
              ui: { components: [] },
            });

            viewRef.current = view;

            if (isNightSaved) {
              dayLayer.visible = false;
              nightLayer.visible = true;
              const el = document.getElementById("globeBgDiv");
              if (el) el.style.filter = "brightness(0.6)";
            }

            // Camada oceano
            const oceanMesh = Mesh.createSphere(new Point({ x: 0, y: -90, z: -(2 * R) }), {
              size: { width: 2 * R, depth: 2 * R, height: 2 * R },
              densificationFactor: 4,
              material: {
                color: [0, 140, 180, 1],
                metallic: 0.9,
                roughness: 0.8,
                doubleSided: false,
              },
            });
            view.graphics.add(
              new Graphic({
                geometry: oceanMesh,
                symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
              })
            );

            // Camada nuvens
            const cloudsMesh = Mesh.createSphere(
              new Point({ x: 0, y: -90, z: -(2 * R + offset) }),
              {
                size: 2 * (R + offset),
                densificationFactor: 3,
                material: {
                  colorTexture:
                    "https://raw.githubusercontent.com/RalucaNicola/the-globe-of-extremes/master/clouds-nasa.png",
                  doubleSided: false,
                },
              }
            );
            cloudsMesh.components[0].shading = "flat";
            view.graphics.add(
              new Graphic({
                geometry: cloudsMesh,
                symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
              })
            );

            // Rotação automática — pausa quando o usuário arrasta
            let userInteracting = false;
            let resumeTimer: ReturnType<typeof setTimeout> | null = null;

            view.on("drag", () => {
              userInteracting = true;
              clearTimeout(resumeTimer ?? undefined);
              resumeTimer = setTimeout(() => {
                userInteracting = false;
              }, 3000);
            });

            // Clique → arco de voo para Vitória-ES (ou coordenadas se não for pin)
            view.on("click", (evt: any) => {
              const RADIUS = 18;
              const positions = cityScreenPosRef.current;
              for (let i = 0; i < positions.length; i++) {
                const cp = positions[i];
                if (!cp) continue;
                const dx = evt.x - cp.x, dy = evt.y - cp.y;
                if (Math.sqrt(dx * dx + dy * dy) < RADIUS) {
                  const city = CITIES[i];
                  if (city.name === HOME.name) return;
                  const N = 80;
                  const arcPts = Array.from({ length: N + 1 }, (_, j) => {
                    const t = j / N;
                    const mid = slerpPoint(city.lat, city.lon, HOME.lat, HOME.lon, t);
                    const alt = Math.sin(t * Math.PI) * 1200000;
                    return new Point({ longitude: mid.lon, latitude: mid.lat, z: alt });
                  });
                  activeArcRef.current = {
                    points: arcPts,
                    fromName: city.name,
                    fromLat: city.lat,
                    fromLon: city.lon,
                    progress: 0,
                    phase: "drawing",
                    startTime: performance.now(),
                    fadeStart: 0,
                    opacity: 1,
                  };
                  return;
                }
              }
              if (!evt.mapPoint) return;
              const lat = evt.mapPoint.latitude.toFixed(3);
              const lon = evt.mapPoint.longitude.toFixed(3);
              clearTimeout(clickTimerRef.current ?? undefined);
              setClickInfo({ x: evt.x, y: evt.y, text: `${lat}°, ${lon}°` });
              clickTimerRef.current = setTimeout(() => setClickInfo(null), 3500);
            });

            // Cursor pointer ao passar sobre um pin
            view.on("pointer-move", (evt: any) => {
              const positions = cityScreenPosRef.current;
              let over = false;
              for (let i = 0; i < positions.length; i++) {
                const cp = positions[i];
                if (!cp) continue;
                const dx = evt.x - cp.x, dy = evt.y - cp.y;
                if (dx * dx + dy * dy < 18 * 18) { over = true; break; }
              }
              const el = document.getElementById("globeBgDiv");
              if (el) el.style.cursor = over ? "pointer" : "default";
            });

            view.when(() => {
              watchUtils.whenFalseOnce(view, "updating", () => {
                // Loop de rotação — só inicia após a animação de entrada
                const rotate = () => {
                  if (!mountedRef.current) return;
                  if (!userInteracting) {
                    const cam = view.camera.clone();
                    const arc = activeArcRef.current;
                    if (arc && (arc.phase === "drawing" || arc.phase === "holding")) {
                      const t = arc.phase === "drawing" ? arc.progress : 1;
                      const tip = slerpPoint(arc.fromLat, arc.fromLon, HOME.lat, HOME.lon, t);
                      const diff = ((tip.lon - cam.position.longitude + 540) % 360) - 180;
                      cam.position.longitude += diff * 0.025;
                      cam.position.latitude += (tip.lat - cam.position.latitude) * 0.015;
                    } else {
                      cam.position.longitude -= 0.15;
                    }
                    view.goTo(cam, { animate: false });
                  }
                  requestAnimationFrame(rotate);
                };

                // Animação de entrada: zoom dramático do espaço até posição final
                view
                  .goTo(
                    {
                      position: { longitude: -55.03975781, latitude: 14.94826384, z: 19921223.30821 },
                      heading: 2.03,
                      tilt: 0.13,
                    },
                    { animate: true, duration: 4000, easing: "out-expo" }
                  )
                  .then(() => {
                    if (!mountedRef.current) return;
                    view.constraints.altitude.max = 25000000;
                    rotate();
                  })
                  .catch(() => {
                    if (mountedRef.current) {
                      view.constraints.altitude.max = 25000000;
                      rotate();
                    }
                  });

                // Canvas overlay — pins das cidades com pulso
                const canvas = document.getElementById(
                  "globeOverlay"
                ) as HTMLCanvasElement | null;
                if (!canvas) return;

                const dpr = window.devicePixelRatio || 1;
                const setupCanvas = () => {
                  canvas.width = window.innerWidth * dpr;
                  canvas.height = window.innerHeight * dpr;
                  const c = canvas.getContext("2d");
                  if (c) c.scale(dpr, dpr);
                };
                setupCanvas();

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const cityPoints = CITIES.map(
                  (c) => new Point({ longitude: c.lon, latitude: c.lat, z: 50000 })
                );

                let frame = 0;
                const drawPins = () => {
                  if (!mountedRef.current) return;
                  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                  const cam = view.camera.position;
                  cityPoints.forEach((pt, i) => {
                    cityScreenPosRef.current[i] = null;
                    try {
                      if (!isFacing(cam.latitude, cam.longitude, CITIES[i].lat, CITIES[i].lon)) return;
                      const sp = view.toScreen(pt);
                      if (!sp) return;
                      cityScreenPosRef.current[i] = { x: sp.x, y: sp.y };

                      const pulse = (Math.sin(frame * 0.04 + i * 2.1) + 1) / 2;

                      // Anel externo pulsante
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 6 + pulse * 10, 0, Math.PI * 2);
                      ctx.strokeStyle = `rgba(0,255,65,${0.5 - pulse * 0.38})`;
                      ctx.lineWidth = 1.5;
                      ctx.stroke();

                      // Anel interno fixo
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
                      ctx.strokeStyle = "rgba(0,255,65,0.7)";
                      ctx.lineWidth = 1;
                      ctx.stroke();

                      // Ponto central com glow
                      ctx.beginPath();
                      ctx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
                      ctx.fillStyle = "#00ff41";
                      ctx.shadowBlur = 7;
                      ctx.shadowColor = "#00ff41";
                      ctx.fill();
                      ctx.shadowBlur = 0;

                      // Label
                      ctx.font = "11px monospace";
                      ctx.fillStyle = "rgba(0,255,65,0.85)";
                      ctx.fillText(CITIES[i].name, sp.x + 9, sp.y + 4);
                    } catch {
                      // ponto fora do campo de visão
                    }
                  });

                  // Pin do visitante (geolocalização)
                  const userLoc = userLocRef.current;
                  if (userLoc && isFacing(cam.latitude, cam.longitude, userLoc.lat, userLoc.lon)) {
                    if (!userPtRef.current) {
                      userPtRef.current = new Point({
                        longitude: userLoc.lon,
                        latitude: userLoc.lat,
                        z: 50000,
                      });
                    }
                    try {
                      const sp = view.toScreen(userPtRef.current);
                      if (sp) {
                        const blink = (Math.sin(frame * 0.08) + 1) / 2;

                        // Anel pulsante amarelo
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 7 + blink * 9, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255,220,0,${0.55 - blink * 0.42})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // Anel fixo
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
                        ctx.strokeStyle = "rgba(255,220,0,0.8)";
                        ctx.lineWidth = 1.5;
                        ctx.stroke();

                        // Core
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = "#ffdc00";
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#ffdc00";
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Label
                        ctx.font = "bold 11px monospace";
                        ctx.fillStyle = "#ffdc00";
                        ctx.fillText(`📍 ${userLoc.name}`, sp.x + 10, sp.y + 4);
                      }
                    } catch {
                      // ponto fora do campo de visão
                    }
                  }

                  // Arco de voo animado
                  const arc = activeArcRef.current;
                  if (arc) {
                    const now = performance.now();
                    const elapsed = now - arc.startTime;
                    const DRAW_MS = 2800, HOLD_MS = 1800, FADE_MS = 900;

                    if (arc.phase === "drawing") {
                      arc.progress = Math.min(1, elapsed / DRAW_MS);
                      if (arc.progress >= 1) arc.phase = "holding";
                    } else if (arc.phase === "holding") {
                      if (elapsed - DRAW_MS > HOLD_MS) { arc.phase = "fading"; arc.fadeStart = now; }
                    } else {
                      arc.opacity = Math.max(0, 1 - (now - arc.fadeStart) / FADE_MS);
                      if (arc.opacity <= 0) { activeArcRef.current = null; }
                    }

                    if (arc.opacity > 0) {
                      const count = Math.floor(arc.progress * arc.points.length);
                      const spts: Array<{ x: number; y: number }> = [];
                      for (let j = 0; j <= count && j < arc.points.length; j++) {
                        try {
                          const sp = view.toScreen(arc.points[j]);
                          if (sp) spts.push({ x: sp.x, y: sp.y });
                        } catch { /* fora do campo */ }
                      }

                      if (spts.length > 1) {
                        ctx.save();
                        ctx.globalAlpha = arc.opacity;
                        ctx.strokeStyle = "#ff9900";
                        ctx.lineWidth = 2;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = "#ff9900";
                        ctx.beginPath();
                        ctx.moveTo(spts[0].x, spts[0].y);
                        for (let j = 1; j < spts.length; j++) ctx.lineTo(spts[j].x, spts[j].y);
                        ctx.stroke();
                        ctx.shadowBlur = 0;

                        // Ponta do "avião"
                        const tip = spts[spts.length - 1];
                        ctx.beginPath();
                        ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
                        ctx.fillStyle = "#ff9900";
                        ctx.shadowBlur = 12;
                        ctx.shadowColor = "#ff9900";
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        // Label no meio do arco
                        const mid = spts[Math.floor(spts.length / 2)];
                        if (mid) {
                          ctx.font = "bold 11px monospace";
                          ctx.fillStyle = "#ff9900";
                          ctx.fillText(`✈ ${arc.fromName} → Vitória-ES`, mid.x + 10, mid.y - 8);
                        }
                        ctx.restore();
                      }
                    }
                  }

                  frame++;
                  requestAnimationFrame(drawPins);
                };
                drawPins();

                window.addEventListener("resize", () => {
                  setupCanvas();
                });
              });
            });
          }
        )
        .catch(console.error);
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      clearTimeout(clickTimerRef.current ?? undefined);
    };
  }, []);

  return (
    <>
      <div
        id="globeBgDiv"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "auto",
          opacity: 1,
        }}
      />

      {/* Canvas para pins das cidades */}
      <canvas
        id="globeOverlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Popup de coordenadas ao clicar */}
      {clickInfo && (
        <div
          style={{
            position: "fixed",
            left: Math.min(clickInfo.x + 14, window.innerWidth - 210),
            top: Math.max(clickInfo.y - 34, 8),
            zIndex: 20,
            background: "rgba(0,0,0,0.88)",
            border: "1px solid #00ff41",
            borderRadius: "4px",
            padding: "5px 10px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#00ff41",
            pointerEvents: "none",
            boxShadow: "0 0 10px rgba(0,255,65,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          📍 {clickInfo.text}
        </div>
      )}
    </>
  );
};

export default GlobeBackground;
