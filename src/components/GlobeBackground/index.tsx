import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { loadModules, setDefaultOptions } from "esri-loader";
import {
  citySlug,
  COUNTRY_ISO,
  isFacing,
  slerpPoint,
  HOME,
  CITIES,
  type City,
  type UserLoc,
  type ArcState,
  type EsriAny,
} from "./geo";
import {
  loadWindGrid,
  advanceParticle,
  createRandomParticle,
  sampleWind,
  windSpeed,
  speedToColor,
  buildHeatmapPixels,
  type WindGrid,
  type WindParticle,
} from "./wind";

setDefaultOptions({ css: true });

// Partículas suficientes pra dar sensação de correntes contínuas sem pesar
// demais no toScreen() (projeção 3D→2D) chamado por partícula a cada frame.
const WIND_PARTICLE_COUNT = 700;
// Alpha do "destination-in" aplicado no canvas de vento a cada frame — abaixo
// de 1 multiplica a opacidade existente, criando o efeito de rastro que
// desbota (em vez de limpar tudo, como o canvas dos pins das cidades faz).
const WIND_TRAIL_FADE = 0.93;
// Acima disso (em pixels de tela) um salto entre frames é tratado como
// "partícula recém-nascida noutro lugar" e não desenha uma linha falsa
// ligando o ponto antigo ao novo.
const WIND_MAX_TRAIL_JUMP_PX = 80;

const GlobeBackground = () => {
  const intl = useIntl();
  const mountedRef = useRef(true);

  const userLocRef = useRef<UserLoc | null>(null);
  const userPtRef = useRef<EsriAny>(null);
  const activeArcRef = useRef<ArcState | null>(null);
  const cityScreenPosRef = useRef<Array<{ x: number; y: number } | null>>(
    new Array(CITIES.length).fill(null)
  );
  const dayLayerRef = useRef<EsriAny>(null);
  const nightLayerRef = useRef<EsriAny>(null);
  const windEnabledRef = useRef(localStorage.getItem("globeWind") !== "0");
  const windHeatmapGraphicRef = useRef<EsriAny>(null);
  const rotationEnabledRef = useRef(localStorage.getItem("globeRotation") !== "0");
  const isHoveringRef = useRef(false);
  const hoveredNameRef = useRef<string | null>(null);
  const [hoverCity, setHoverCity] = useState<{ city: City; x: number; y: number } | null>(null);

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

  // Escuta evento globeWindToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      const enabled = (e as CustomEvent).detail.windEnabled as boolean;
      windEnabledRef.current = enabled;
      if (windHeatmapGraphicRef.current) windHeatmapGraphicRef.current.visible = enabled;
      if (!enabled) {
        const wc = document.getElementById("globeWindOverlay") as HTMLCanvasElement | null;
        const wctx = wc?.getContext("2d");
        wctx?.clearRect(0, 0, wc?.width ?? 0, wc?.height ?? 0);
      }
    };
    window.addEventListener("globeWindToggle", handler);
    return () => window.removeEventListener("globeWindToggle", handler);
  }, []);

  // Escuta evento globeRotationToggle disparado pelo WeatherBar
  useEffect(() => {
    const handler = (e: Event) => {
      rotationEnabledRef.current = (e as CustomEvent).detail.rotationEnabled as boolean;
    };
    window.addEventListener("globeRotationToggle", handler);
    return () => window.removeEventListener("globeRotationToggle", handler);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let cleanupResize = () => {};

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
            const NightLayer = BaseTileLayer.createSubclass({
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
                    const id = ctx.getImageData(0, 0, w, h);
                    const d = id.data;
                    for (let i = 0; i < d.length; i += 4) {
                      const b = d[i] / 255;
                      if (b < 0.11) {
                        // preto puro — elimina marrom de pixels oceânicos com brilho residual
                        d[i] = d[i+1] = d[i+2] = 0;
                      } else {
                        const t = (b - 0.11) / 0.89;
                        const e = Math.pow(t, 0.5);
                        d[i]   = Math.min(255, e * 255);
                        d[i+1] = Math.min(255, Math.pow(e, 1.8) * 210);
                        d[i+2] = Math.min(255, Math.pow(e, 5.5) * 80);
                      }
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
            const nightLayer = new NightLayer({
              copyright: "NASA Black Marble — VIIRS / NASA GIBS",
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
                starsEnabled: false,
                atmosphereEnabled: false,
                lighting: { type: "virtual" },
              },
              constraints: {
                altitude: { min: 4000000, max: 70000000 },
              },
              ui: { components: [] },
            });

            // Override CSS do ESRI que pode opacificar o container
            const esriOverride = document.createElement("style");
            esriOverride.id = "esri-bg-override";
            esriOverride.textContent =
              "#globeBgDiv,#globeBgDiv .esri-view,#globeBgDiv .esri-view-root," +
              "#globeBgDiv .esri-view-surface,#globeBgDiv .esri-display-object" +
              "{background:transparent!important;background-color:transparent!important;}";
            document.head.appendChild(esriOverride);

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

            // Camada de mapa de calor do vento — textura equiretangular gerada
            // a partir da grade de vento real, colada na esfera (mesma técnica
            // da camada de nuvens acima, só que a imagem é gerada em runtime
            // em vez de vir de uma URL fixa). Quase transparente onde o vento
            // é calmo, bem colorida onde é forte.
            const addWindHeatmapLayer = (grid: WindGrid) => {
              const W = 720, H = 360;
              const off = document.createElement("canvas");
              off.width = W; off.height = H;
              const octx = off.getContext("2d");
              if (!octx) return;
              const imgData = octx.createImageData(W, H);
              imgData.data.set(buildHeatmapPixels(grid, W, H));
              octx.putImageData(imgData, 0, 0);

              const heatMesh = Mesh.createSphere(
                new Point({ x: 0, y: -90, z: -(2 * R + offset * 0.5) }),
                {
                  size: 2 * (R + offset * 0.5),
                  densificationFactor: 3,
                  material: { colorTexture: off.toDataURL(), doubleSided: false },
                }
              );
              heatMesh.components[0].shading = "flat";
              const heatGraphic = new Graphic({
                geometry: heatMesh,
                symbol: { type: "mesh-3d", symbolLayers: [{ type: "fill" }] },
                visible: windEnabledRef.current,
              });
              view.graphics.add(heatGraphic);
              windHeatmapGraphicRef.current = heatGraphic;
            };

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

            // Clique → arco de voo para Vitória-ES
            view.on("click", (evt: { x: number; y: number }) => {
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
            });

            // Cursor pointer e hover modal ao passar sobre um pin
            view.on("pointer-move", (evt: { x: number; y: number }) => {
              const positions = cityScreenPosRef.current;
              let over = false;
              for (let i = 0; i < positions.length; i++) {
                const cp = positions[i];
                if (!cp) continue;
                const dx = evt.x - cp.x, dy = evt.y - cp.y;
                if (dx * dx + dy * dy < 18 * 18) {
                  over = true;
                  const city = CITIES[i];
                  if (hoveredNameRef.current !== city.name) {
                    hoveredNameRef.current = city.name;
                    setHoverCity({ city, x: evt.x, y: evt.y });
                  }
                  isHoveringRef.current = true;
                  break;
                }
              }
              if (!over && isHoveringRef.current) {
                isHoveringRef.current = false;
                hoveredNameRef.current = null;
                setHoverCity(null);
              }
              const el = document.getElementById("globeBgDiv");
              if (el) el.style.cursor = over ? "pointer" : "default";
            });

            view.when(() => {
              watchUtils.whenFalseOnce(view, "updating", () => {
                // Loop de rotação — só inicia após a animação de entrada
                const rotate = () => {
                  if (!mountedRef.current) return;
                  if (!userInteracting && !isHoveringRef.current) {
                    const arc = activeArcRef.current;
                    const arcActive = arc && (arc.phase === "drawing" || arc.phase === "holding");
                    if (arcActive || rotationEnabledRef.current) {
                      const cam = view.camera.clone();
                      if (arcActive) {
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

                // Canvas dedicado às correntes de vento — separado do canvas
                // dos pins porque usa "destination-in" pra desbotar o rastro
                // em vez de limpar tudo a cada frame (os pins precisam de
                // clearRect puro, senão o pulso deixaria rastro também).
                const windCanvas = document.getElementById(
                  "globeWindOverlay"
                ) as HTMLCanvasElement | null;
                const windCtx = windCanvas?.getContext("2d") ?? null;

                const dpr = window.devicePixelRatio || 1;
                const setupCanvas = () => {
                  canvas.width = window.innerWidth * dpr;
                  canvas.height = window.innerHeight * dpr;
                  const c = canvas.getContext("2d");
                  if (c) c.scale(dpr, dpr);
                  if (windCanvas) {
                    windCanvas.width = window.innerWidth * dpr;
                    windCanvas.height = window.innerHeight * dpr;
                    windCtx?.scale(dpr, dpr);
                  }
                };
                setupCanvas();

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const cityPoints = CITIES.map(
                  (c) => new Point({ longitude: c.lon, latitude: c.lat, z: 50000 })
                );

                // Vento real (GFS via firestorm-wind-data) — carrega em
                // paralelo, sem bloquear o resto do setup.
                let windGrid: WindGrid | null = null;
                let windParticles: WindParticle[] = [];
                let windPrevScreen: Array<{ x: number; y: number } | null> = [];
                loadWindGrid().then((grid) => {
                  if (!mountedRef.current || !grid) return;
                  windGrid = grid;
                  windParticles = Array.from({ length: WIND_PARTICLE_COUNT }, createRandomParticle);
                  windPrevScreen = new Array(WIND_PARTICLE_COUNT).fill(null);
                  addWindHeatmapLayer(grid);
                });

                // lon 0–360 (formato da grade) → -180..180 (formato do ArcGIS Point)
                const toArcgisLon = (lon: number) => (lon > 180 ? lon - 360 : lon);

                let frame = 0;
                const drawPins = () => {
                  if (!mountedRef.current) return;
                  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                  const cam = view.camera.position;

                  // Correntes de vento — cada partícula deixa uma linha curta
                  // da posição anterior pra atual, colorida pela velocidade;
                  // o canvas nunca é limpo de verdade, só desbotado
                  // (destination-in), dando a impressão de fluxo contínuo.
                  if (windEnabledRef.current && windGrid && windCtx && windCanvas) {
                    windCtx.save();
                    windCtx.globalCompositeOperation = "destination-in";
                    windCtx.fillStyle = `rgba(0,0,0,${WIND_TRAIL_FADE})`;
                    windCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                    windCtx.globalCompositeOperation = "source-over";
                    windCtx.lineWidth = 1.3;
                    windCtx.lineCap = "round";

                    for (let i = 0; i < windParticles.length; i++) {
                      const prevScreen = windPrevScreen[i];
                      windParticles[i] = advanceParticle(windParticles[i], windGrid);
                      const p = windParticles[i];
                      if (!isFacing(cam.latitude, cam.longitude, p.lat, toArcgisLon(p.lon))) {
                        windPrevScreen[i] = null;
                        continue;
                      }
                      try {
                        const sp = view.toScreen(
                          new Point({ longitude: toArcgisLon(p.lon), latitude: p.lat, z: 40000 })
                        );
                        if (!sp) { windPrevScreen[i] = null; continue; }
                        if (prevScreen) {
                          const dx = sp.x - prevScreen.x, dy = sp.y - prevScreen.y;
                          if (dx * dx + dy * dy < WIND_MAX_TRAIL_JUMP_PX * WIND_MAX_TRAIL_JUMP_PX) {
                            const { u, v } = sampleWind(windGrid, p.lat, p.lon);
                            windCtx.strokeStyle = speedToColor(windSpeed(u, v));
                            windCtx.beginPath();
                            windCtx.moveTo(prevScreen.x, prevScreen.y);
                            windCtx.lineTo(sp.x, sp.y);
                            windCtx.stroke();
                          }
                        }
                        windPrevScreen[i] = { x: sp.x, y: sp.y };
                      } catch {
                        windPrevScreen[i] = null;
                      }
                    }
                    windCtx.restore();
                  }

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

                const onResize = () => setupCanvas();
                window.addEventListener("resize", onResize);
                cleanupResize = () => window.removeEventListener("resize", onResize);
              });
            });
          }
        )
        .catch(console.error);
    }, 3000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      cleanupResize();
      document.getElementById("esri-bg-override")?.remove();
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
          zIndex: 2,
          pointerEvents: "auto",
          opacity: 1,
          background: "transparent",
        }}
      />

      {/* Canvas das correntes de vento — próprio pra poder desbotar o rastro
          em vez de limpar tudo a cada frame */}
      <canvas
        id="globeWindOverlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 3,
          pointerEvents: "none",
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
          zIndex: 4,
          pointerEvents: "none",
        }}
      />

      {hoverCity && hoverCity.city.desc && (
        <div
          style={{
            position: "fixed",
            left: Math.min(hoverCity.x + 22, window.innerWidth - 310),
            top: Math.max(hoverCity.y - 120, 8),
            zIndex: 20,
            width: "290px",
            background: "rgba(0, 10, 2, 0.96)",
            border: "1px solid #00ff41",
            borderRadius: "6px",
            padding: "12px 14px",
            fontFamily: "monospace",
            pointerEvents: "none",
            boxShadow: "0 0 24px rgba(0,255,65,0.25), inset 0 0 30px rgba(0,255,65,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", borderBottom: "1px solid rgba(0,255,65,0.25)", paddingBottom: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: "#42ff6b" }}>
              {hoverCity.city.name}
            </span>
            {COUNTRY_ISO[hoverCity.city.country] ? (
              <img
                src={`https://flagcdn.com/20x15/${COUNTRY_ISO[hoverCity.city.country]}.png`}
                alt={hoverCity.city.country}
                title={hoverCity.city.country}
                style={{ width: 20, height: 15, objectFit: "cover", borderRadius: 2, verticalAlign: "middle" }}
              />
            ) : (
              <span style={{ fontSize: "10px", color: "#00cc33" }}>{hoverCity.city.country}</span>
            )}
          </div>
          <div style={{ fontSize: "11px", color: "#00e055", lineHeight: "1.6" }}>
            {intl.formatMessage(
              { id: `city_${citySlug(hoverCity.city.name)}_desc`, defaultMessage: hoverCity.city.desc }
            )}
          </div>
          {hoverCity.city.tags.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {hoverCity.city.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(0,255,65,0.1)",
                    border: "1px solid rgba(0,255,65,0.35)",
                    borderRadius: "3px",
                    padding: "2px 7px",
                    fontSize: "10px",
                    color: "#00ff41",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

    </>
  );
};

export default GlobeBackground;
